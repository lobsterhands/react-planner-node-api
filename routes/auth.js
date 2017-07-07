var jwt = require('express-jwt');
var secret = require('../config').secret;

// Helper function that both auth middlewares (required and optional, see below)
// use to extract the JWT from the authorization header
function getTokenFromHeader(req) {
	if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token') {
		return req.headers.authorization.split(' ')[1];
	}

	return null;
}

var auth = {
	required: jwt({
		secret: secret,
		userProperty: 'payload',
		getToken: getTokenFromHeader
	}),
	optional: jwt({
		secret: secret,
		userProperty: 'payload',
		credentialsRequired: false,
		getToken: getTokenFromHeader
	})
};

module.exports = auth;
