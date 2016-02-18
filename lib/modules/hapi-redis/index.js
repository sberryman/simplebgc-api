var redis = require('redis');

exports.register = function (server, options, next) {

    options = options || {};

    var redisOpts = options.connection;
    var redisClient = redis.createClient(redisOpts);
    var redisClientSubscribe = redis.createClient(redisOpts);

    /**
     * error handler for errors after initial connection has been established
     * @param {Error} err is the error thrown
     * @return {null}
     */
    var defaultErrorHandler = function (err) {

        server.log([ 'hapi-redis', 'error' ], err.message);
    };

    var initialErrorHandler = function (err) {

        server.log([ 'hapi-redis', 'error' ], err.message);
        next(err);
        redisClient.end();
    };

    redisClient.on('error', initialErrorHandler);

    redisClient.on('ready', function (){

        server.log([ 'hapi-redis', 'info' ], 'redisClient connection created');

        // change the error handler to simply log errors
        redisClient.removeListener('error', initialErrorHandler);
        redisClient.on('error', defaultErrorHandler);
        next();
    });

    server.expose('client', redisClient);
    server.expose('clientSubscribe', redisClientSubscribe);
};

exports.register.attributes = {
    pkg: require('./package.json'),
    multiple: true
};
