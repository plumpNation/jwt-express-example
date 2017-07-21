const Log        = require('./lib/log');
const request    = require('request-promise');
const promise    = require('bluebird');

const serviceUrl = 'http://localhost:3000';

const log = new Log({'level': 'info', 'prefix': 'client'});

log.info('simple scenario :: started');
const scenario1running = login()
    .then(token => getUser(token))
    .then(response => log.log(response))
    .finally(() => log.info('simple scenario :: ended\n'));

// Quite simply, we wait long enough for the JWT to become stale
const scenario2running = scenario1running
    .then(() => log.info('invalid JWT scenario :: started'))
    .then(() => login())
    .then(token => promise.delay(1000, token))
    .then(token => getUser(token))
    .then(response => log.log(response))
    .catch(err => handleError(err))
    .finally(() => log.info('fail scenario :: ended\n'));

// In this scenario we catch the stale JWT error, login, and try again.
scenario2running
    .then(() => log.info('refresh JWT scenario :: started'))
    .then(() => login())
    .then(token => promise.delay(1000, token))
    .then(token => getUser(token))
    .catch(err => {
        handleError(err);

        return login();
    }) // refresh the token
    .then(token => getUser(token))
    .then(response => log.log(response))
    .finally(() => log.info('refresh scenario :: ended\n'));

function login() {
    log.info('logging in');

    return request.post(serviceUrl + '/login')
        .then(response => JSON.parse(response).token);
}

function getUser(token) {
    log.info('get my user data from server');

    return request.get({
        'url': serviceUrl + '/user',
        'headers': {
            'Authorization': `Bearer ${token}`
        }
    });
}

function handleError(err) {
    const message = JSON.parse(err.error);

    log.warn(message);
}
