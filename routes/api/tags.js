const router = require('express').Router();
const mongoose = require('mongoose');
const Activity = mongoose.model('Activity');
var auth = require('../auth');

router.get('/', auth.required, function(req, res, next) {
	Activity.find({'author': req.payload.id})
		.distinct('tagList').then((tags) => {
			return res.json({tags: tags});
	}).catch(next);
});

module.exports = router;
