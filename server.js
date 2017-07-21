const express = require('express');
const app = express();
const jwt = require('jwt-express');

const userDetails = {
    'userId': 100,
    'email': 'adnan@itslearning.com'
};

app.use(jwt.init('secret', {
    'cookies': false,
    'stales': 500 // 20 seconds
}));

app.use(function (req, res, next) {
    if (!req.jwt.payload) {
        next();
    }

    // Very useful to add this to the req.user for use later in the middleware chain.
    req.user = {
        'userId' : req.jwt.payload.userId,
        'email'  : req.jwt.payload.email
    };

    next();
});

app.post('/login', function (req, res) {
    const userJwt = res.jwt(userDetails);

    res.status(200).json({'token': userJwt.token});
});

app.get('/user', jwt.active(), function (req, res, next) {
    // @NOTE: The header key you must use is `authorization`,
    // and the value must be prefixed with `Bearer` and a single whitespace.
    // req.headers.authorization
    // Bearer <your-token>
    res.status(200).json(req.user);
});

app.use(function (err, req, res, next) {
    res.status(401).json(err);
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
});
