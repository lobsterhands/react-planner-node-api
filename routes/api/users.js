var mongoose = require('mongoose');
var router = require('express').Router();
var passport = require('passport');
var User = mongoose.model('User');
var auth = require('../auth');

/*
	Registering users. As long the email and username haven't been taken,
	and a valid password is provided, we'll create that user in our database
	and respond with the user's auth JSON.
*/
router.post('/users', function(req, res, next) {
	var user = new User();

	user.username = req.body.user.username;
	user.email = req.body.user.email;
	user.setPassword(req.body.user.password);

	user.save().then(function() {
		return res.json({user: user.toAuthJSON()});
	}).catch(next);
});

/*
	logging in users. A valid email/password combination will give a user's
	auth JSON response.
*/
router.post('/users/login', function (req, res, next) {
	if (!req.body.user.email) {
		return res.status(422).json({errors: {email: "can't be blank"}});
	}

	if (!req.body.user.password) {
		return res.status(422).json({errors: {password: "can't be blank"}});
	}

	passport.authenticate('local', {session: false}, function (err, user, info) {
		if (err) {
			return next(err);
		}

		if (user) {
			// user.token = user.generateJWT()
			return res.json({user: user.toAuthJSON()});
		} else {
			return res.status(422).json(info);
		}
	})(req, res, next);
});

/*
	Will require authentication (a valid JWT token must be present in the
	Authorization header) and respond with the user's auth JSON.
	This is used for the front-end to identify the user that's logged in
	and to refresh the JWT token.
*/
router.get('/user', auth.required, function (req, res, next) {
	User.findById(req.payload.id).then(function (user) {
		if (!user) {
			return res.sendStatus(401);
		}

		return res.json({user: user.toAuthJSON()});
	}).catch(next);
});

/*
	Will require authentication and will be used to update user information.
*/
router.put('/user', auth.required, function(req, res, next) {
	User.findById(req.payload.id).then(function (user) {
		if (!user) {
			return res.sendStatus(401);
		}

		// only update fields that were actually passed
		if (typeof req.body.user.username !== 'undefined') {
			user.username = req.body.user.username;
		}

		if (typeof req.body.user.email !== 'undefined') {
			user.email = req.body.user.email;
		}

    if (typeof req.body.user.password !== 'undefined') {
      user.setPassword(req.body.user.password);
		}

		return user.save().then(function() {
			return res.json({
				user: user.toAuthJSON()});
			});
	}).catch(next);
});

module.exports = router;
