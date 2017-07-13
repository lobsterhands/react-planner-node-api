var router = require('express').Router();
var passport = require('passport');
var mongoose = require('mongoose');
var Activity = mongoose.model('Activity');
var User = mongoose.model('User');
var auth = require('../auth');

// TODO: Does the current setup allow any logged in user to find any activity by id?
// If so, I need to someone ensure that the author === current user before returning
// the activity
router.param('activity', function(req, res, next, id) {
	Activity.findOne({_id: id})
		.populate('author')
		.then(function (activity) {
		if (!activity) { return res.sendStatus(404); }

		req.activity = activity;

		return next();
	}).catch(next);
});


router.post('/', auth.required, function(req, res, next) {
  User.findById(req.payload.id).then(function(user) {
    if (!user) { return res.sendStatus(401); }

    var activity = new Activity(req.body.activity);

    activity.author = user;
		activity.completed = false;

    return activity.save().then(function(){
      return res.json({activity: activity.toJSON()});
    });
  }).catch(next);
});

router.get('/:activity', auth.required, function(req, res, next) {
  Promise.all([
    req.payload ? User.findById(req.payload.id) : null,
    req.activity.populate('author').execPopulate()
  ]).then(function(results) {
    var user = results[0];

    if (req.activity.author._id.toString() === user._id.toString()) {
      return res.json({activity: req.activity.toJSON()});
    } else {
      return res.sendStatus(401);
    }
  }).catch(next);
});

router.put('/:activity', auth.required, function(req, res, next) {
  User.findById(req.payload.id).then(function(user) {

    if(req.activity.author._id.toString() === req.payload.id.toString()){

      if(typeof req.body.activity.title !== 'undefined'){
        req.activity.title = req.body.activity.title;
      }

      if(typeof req.body.activity.body !== 'undefined'){
        req.activity.body = req.body.activity.body;
      }

      if(typeof req.body.activity.dateStart !== 'undefined'){
        req.activity.dateStart = req.body.activity.dateStart;
      }

      if(typeof req.body.activity.dateEnd !== 'undefined'){
        req.activity.dateEnd = req.body.activity.dateEnd;
      }

      // TODO: Taglist is currently completely replace.
      // I suppose front-end will allow for adding/removing from the set
      // before the tagList is updated.
      if(typeof req.body.activity.tagList !== 'undefined'){
        req.activity.tagList = req.body.activity.tagList;
      }

      if(typeof req.body.activity.completed !== 'undefined'){
        req.activity.completed = req.body.activity.completed;
      }


      req.activity.save().then(function(activity){
        return res.json({activity: activity.toJSON()});
      }).catch(next);
    } else {
      return res.sendStatus(403);
    }
  });
});

router.delete('/:activity', auth.required, function(req, res, next) {
  User.findById(req.payload.id).then(function(){
    if(req.activity.author._id.toString() === req.payload.id.toString()){
      return req.activity.remove().then(function(){
        return res.sendStatus(204);
      });
    } else {
      return res.sendStatus(403);
    }
  });
});

/*
	Endpoint to list all articles for the current User
*/
router.get('/', auth.required, function(req, res, next) {
  var query = {};
  var limit = 20;
  var offset = 0;

  if(typeof req.query.limit !== 'undefined') {
    limit = req.query.limit;
  }

  if(typeof req.query.offset !== 'undefined') {
    offset = req.query.offset;
  }

  if( typeof req.query.tag !== 'undefined' ) {
    query.tagList = {"$in" : [req.query.tag]};
  }

  return Promise.all([
		Activity.find({
			$and: [
				{'author': req.payload.id}, // Find where User matches author
				query // AND search based on query parameters (tagList, etc)
			]
		}),
    req.payload ? User.findById(req.payload.id) : null,
  ]).then(function(results) {
    var activities = results[0];
    var activitiesCount = activities.length;
    var user = results[1];

    return res.json({
      activities: activities.map(function(activity) {
        return activity.toJSON();
      }),
      activitiesCount: activitiesCount,
			user: user
    });
  }).catch(next);
});


module.exports = router;
