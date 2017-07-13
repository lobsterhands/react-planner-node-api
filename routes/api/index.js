var router = require('express').Router();

router.use('/', require('./users'));
router.use('/activities', require('./activities'));
router.use('/tags', require('./tags'));

router.use(function(err, req, res, next) {
  if(err.name === 'ValidationError') {
    return res.status(422).json({
      errors: Object.keys(err.errors).reduce(function(errors, key) {

        errors[key] = err.errors[key].message;

        return errors;
      }, {}) // this syntax allows for returning a cumulative object, how?
    });
  }

	return next(err);
});

module.exports = router;
