const express = require('express');
const app = express();
const jwt = require('jwt-express');

const userDetails = {
    'userId': 100,
    'email': 'adnan@itslearning.com'
};

app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).json({'message': 'Something broke!'})
})

app.use(jwt.init('secret', {
    'cookies': false,
    'stales': 900000 // 15 minutes
}));

app.use(function (req, res, next) {
    if (!req.jwt.payload) {
        next();
    }

    // Very useful to add this to the req.user for use later in the middleware chain.
    req.user = {
        // @NOTE: the jwt library works in snakecase.
        'userId' : req.jwt.payload.user_id,
        'email'  : req.jwt.payload.email
    };

    next();
});

app.post('/login', function (req, res) {
    const userJwt = res.jwt(userDetails);

    res.status(200).json({'token': userJwt.token});
});

app.get('/check', jwt.active(), function (req, res, next) {
    // @NOTE: The header key you must use is `authorization`,
    // and the value must be prefixed with `Bearer` and a single whitespace.
    // req.headers.authorization
    // Bearer <your-token>
    res.status(200).json(req.user);
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
});
