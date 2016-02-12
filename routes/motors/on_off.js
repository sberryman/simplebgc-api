var Boom = require('boom');
var Joi = require('joi');

module.exports = exports = function (server, options) {

    // alias
    var sbgc = server.plugins['simplebgc-api-lib'].sbgc;

    var swaggerNickname = 'updateCustomer';
    var handler = function (request, reply) {

        // default to turning them off (feel like this is safer)
        var method = sbgc.motorsOff;
        if (request.params.motorState === 'on') {
            method = sbgc.motorsOn;
        }

        // execute the method and return success!
        method();

        // wait for the next tick
        process.nextTick(function () {

            return reply( { ok: 1 } );
        });
    };

    server.route({
        path: '/motors/{motorState}',
        method: 'PUT',
        config: {
            id: 'update-motor-state',
            tags: ['api', 'api-simplebgc'],
            description: 'Change the state of the gimbal motors.',
            validate: {
                params: {
                    motorState: Joi.string()
                        .valid(['on', 'off'])
                        .description('On will turn the motors on and off will power them down. This will not turn off the controller.')
                },
                payload: Joi.any().empty(),
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
