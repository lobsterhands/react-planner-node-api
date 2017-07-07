var router = require('express').Router();
var passport = require('passport');
var mongoose = require('mongoose');
var Activity = mongoose.model('Activity');
var User = mongoose.model('User');
var auth = require('../auth');

router.post('/', auth.required, function(req, res, next) {
  User.findById(req.payload.id).then(function(user){
    if (!user) { return res.sendStatus(401); }

    var activity = new Activity(req.body.activity);

    activity.author = user;

    return activity.save().then(function(){
      return res.json({activity: activity.toJSON()});
    });
  }).catch(next);
});

// TODO: Does the current setup allow any logged in user to find any activity by id?
// If so, I need to someone ensure that the author === current user before returning
// the activity
router.param('activity', auth.required, function(req, res, next, id) {
  console.log('\nID: %s', id);
  activity.findOne({ _id: id})
    .populate('author') // TODO: Do I really need to populate the author if the activity is just for a specific user?
    // Or is the author used for the router.get and router.put actions?
    .then(function (activity) {
      if (!activity) { return res.sendStatus(404); }

      req.activity = activity;

      return next();
    }).catch(next);
});

router.get('/:activity', auth.required, function(req, res, next) {
  Promise.all([
    req.payload ? User.findById(req.payload.id) : null,
    req.activity.populate('author').execPopulate()
  ]).then(function(results){
    var user = results[0];

    return res.json({activity: req.activity.toJSONFor(user)});
  }).catch(next);
});

router.put('/:activity', auth.required, function(req, res, next) {
  User.findById(req.payload.id).then(function(user){
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
        return res.json({activity: activity.toJSONFor()});
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

module.exports = router;
