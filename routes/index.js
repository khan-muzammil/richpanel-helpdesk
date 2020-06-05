const express = require("express");
const router = express.Router();
const Twit = require('twit')
require("dotenv").config();
const Pusher = require("pusher");

const createPusherChannelClient = () => {
    return new Pusher({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.PUSHER_APP_KEY,
      secret: process.env.PUSHER_APP_SECRET,
      cluster: "ap2"
    });
};

const createTwitClient = (key, secret) => {
    return new Twit({
      consumer_key: process.env.TWITTER_CONSUMER_KEY,
      consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
      access_token: key,
      access_token_secret: secret
    });
};

router.get("/", function(req, res, next) {
  console.log("home route", req.user)
    res.send("Express app running");
  });

router.post("/twitter/tweets", async (req, res) => {
    const { key, secret } = req.body;
    const T = createTwitClient(key, secret);
    const params = {
        exclude_replies: false,
        count: 100
    };
    T.get("statuses/mentions_timeline", params, (error, mentionedTweets, response) => {
        if (error) console.log(error);
        T.get(
            "statuses/user_timeline",
            { count: 100 },
            (err, tweets, response) => {
            const userTweets = tweets.filter(tweet => tweet.in_reply_to_status_id !== null);
            if (err) console.log(err);
            res.json(userTweets.concat(mentionedTweets));
            });
        }
    );
});

router.post("/twitter/reply", async (req, res) => {
    const { key, secret, statusID, status, keywords, username, streamConnected } = req.body;
    const T = createTwitClient(key, secret);
    const channelsClient = createPusherChannelClient();
    const params = {
      in_reply_to_status_id: statusID,
      status
    }
    const stream = T.stream('statuses/filter', {track: keywords})
    stream.on('tweet', (tweet) => {
    console.log(tweet)
    channelsClient.trigger('chat', username, tweet);
    })
  
    T.post('/statuses/update', params , (error, tweet, response) => {
      if(error) res.sendStatus(500);
      res.json(tweet);
    })
});

module.exports = router;