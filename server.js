const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const app = express();
const passport = require('passport');
const TwitterStrategy =  require('passport-twitter');
const indexRouter = require('./routes');
const twitterRouter = require('./routes/auth');
const index = require('./model/index')

const {Users, connect} = index

app.use(cookieParser());
app.use(require('express-session')({
	secret: 'rich session',
	resave: true,
	saveUninitialized: true
  }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

//passport related
passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_API_KEY,
    consumerSecret: process.env.TWITTER_API_SECRET,
    callbackURL: "http://127.0.0.1:9090/auth/twitter/callback"
  },
	function(token, tokenSecret, profile, cb) {
		//console.log(profile)
		/* Users.findOne({username : profile.username}).then((existingUser) => {
			if (existingUser) {
				cb(null, existingUser)
			} else {
				new Users({
					username : profile.username
				}).save()
				.then((user) => {
					cb(null, user)
				})
			}
		}) */
		return cb(null, {profile, token, tokenSecret})
	}
))

app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function(user, done) {
	done(null, user);
  });
  
passport.deserializeUser(function(user, done) {
	/* Users.findById(id, function(err, user) {
	  done(err, user);
	}); */
	done(null, user)
  });

//routes
app.use('/', indexRouter);
app.use('/auth', twitterRouter);

// Start the app on pre defined port number
const env = process.env.NODE_ENV || 'default';
const PORT = process.env.PORT || 9090;


if(process.env.NODE_ENV === 'production') {
	app.use(express.static('client/build'))
	app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
    })
}

//connect to db and start server
connect()
.then(function () {
	app.listen(PORT, function () {
		console.log("Application has started in environment " + env + " and running on port: ", PORT);
		//console.log(process.env);
	}).on('error', function (error) {
		console.log("Unable to start app. Error >>>>", error);
	});
}).catch(function (error) {
	console.log("Failed to setup connecton with database.", error);
});
