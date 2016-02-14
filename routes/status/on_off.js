var Boom = require('boom');
var Joi = require('joi');

module.exports = exports = function (server, options) {

    // alias
    var sbgc = server.plugins['simplebgc-api-lib'].sbgc;
    var statusInterval = null;
    var realtimeConfig = {
        interval: 30,
        version: 3,
        channel: 'realtime-data'
    };

    // version 4 data is available as well
    // requestRealTimeData4
    var updateCommand = function () {

        // which version?
        var method = sbgc.requestRealTimeData3;
        if (statusVersion === 4) {
            method = sbgc.requestRealTimeData4;
        }

        // request the data!
        return method();
    };

    // function to call when our event hits
    // either realtime_data_3 or realtime_data_4
    var notify = function (err, data) {

        // extend our data and add the current timestamp
        data.ts = Date.now();

        // push payload to redis
        server.plugins['hapi-redis'].client.publish(realtimeConfig.channel, data);
    };

    var swaggerNickname = 'statusUpdates';
    var handler = function (request, reply) {

        // reset all listeners and timers
        clearInterval(statusInterval);
        sbgc.removeListener('realtime_data_3', notify);
        sbgc.removeListener('realtime_data_4', notify);

        // default to turning off (feel like this is safer)
        if (request.params.state === 'off') {

            // done!
            return reply( { ok: 1 } );
        }

        // update the config
        realtimeConfig = request.payload;

        // subscribe to events from sbgc so we can push to redis
        sbgc.on('realtime_data_' + realtimeConfig.version, notify);

        // must be turning status updates on
        setInterval(updateCommand, realtimeConfig.interval);

        // wait for the next tick
        process.nextTick(function () {

            return reply( { ok: 1 } );
        });
    };

    server.route({
        path: '/status/{state}',
        method: 'PUT',
        config: {
            id: 'status-updates',
            tags: ['api', 'api-simplebgc'],
            description: 'Enable or disable status updates.',
            validate: {
                params: {
                    state: Joi.string()
                        .valid(['on', 'off'])
                        .default('off')
                        .required()
                        .description('On will turn the motors on and off will power them down. This will not turn off the controller.')
                },
                payload: {
                    interval: Joi.number()
                        .default(30)
                        .min(20)
                        .max(5000)
                        .unit('milliseconds')
                        .description('Fetch the status every N milliseconds and publish to redis.'),
                    version: Joi.number()
                        .default(3)
                        .min(3)
                        .max(4)
                        .description('Which version of real-time updates would you like?'),
                    channel: Joi.string()
                        .default('realtime-data')
                        .min(3)
                        .description('What channel would you like to publish to?')
                },
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
};
