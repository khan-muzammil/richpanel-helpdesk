const express = require('express')
const router = express.Router()
const passport =  require('passport')

router.get('/twitter', passport.authenticate('twitter'));
router.get('/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/login' }),
  function(req, res) {
	// Successful authentication, redirect home.
    res.redirect('/');
});

module.exports = router