var Boom = require('boom');
var Joi = require('joi');

module.exports = exports = function (server, options) {

    // alias
    var sbgc = server.plugins['simplebgc-api-lib'].sbgc;
    var redis = server.plugins['hapi-redis'].clientSubscribe;

    // roll, pitch and yaw input validation
    var rpyValidation = Joi.number()
        .min(-500)
        .max(500)
        .required();

    var swaggerNickname = 'rcRoll';
    var handler = function (request, reply) {

        // execute the method and return success!
        sbgc.rcRoll(request.payload.roll, request.payload.pitch, request.payload.yaw);

        // wait for the next tick
        process.nextTick(function () {

            return reply( { ok: 1 } );
        });
    };

    server.route({
        path: '/rcRoll',
        method: 'PUT',
        config: {
            id: 'rc-roll',
            tags: ['api', 'api-simplebgc'],
            description: 'Convience method to send roll, yaw and pitch to RC virtual pins',
            validate: {
                payload: Joi.object()
                    .keys({
                        roll: rpyValidation,
                        pitch: rpyValidation,
                        yaw: rpyValidation
                    }),
                options: {
                    abortEarly: false,
                    stripUnknown: true
                }
            },
            response: {

                // schema: Model.joi().model,
                // failAction: Model.joi().failAction
            },
            plugins: {
                'hapi-swaggered': {
                    operationId: swaggerNickname
                }
            },
            handler: handler
        }
    });

    var redisChannel = 'sbgc:rcControl';
    redis.on('message', _.debounce(function (channel, message) {

        // only care about rcControl
        if (channel !== redisChannel) {
            return;
        }

        // make sure it is json!
        if (typeof message === 'string') {
            message = JSON.parse(message);
        }

        // control!
        // console.log('client1 channel ' + channel + ': ' + typeof(message));
        sbgc.rcRoll(message.roll, message.pitch, message.yaw);
    }, 30) );

    // also listen for redis events!
    redis.subscribe(redisChannel);
};
