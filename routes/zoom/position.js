var Boom = require('boom');
var Joi = require('joi');

module.exports = exports = function (server, options) {

    // alias
    var arduinoLib = server.plugins['arduino-lib'].client;

    var swaggerNickname = 'updateZoomPosition';
    var handler = function (request, reply) {

        // what method are we going to use? (default to standard write)
        var method = arduinoLib.setServoSpeed;
        if (request.query.micro === true) {
            method = arduinoLib.setServoSpeedMicro;
        }

        // write our new position
        method(request.params.position);

        // wait for the next tick
        process.nextTick(function () {

            return reply( { ok: 1 } );
        });
    };


    server.route({
        path: '/zoom/{position}',
        method: 'PUT',
        config: {
            id: 'update-zoom-position',
            tags: ['api', 'api-simplebgc'],
            description: 'Control the zoom position.',
            validate: {
                params: {
                    position: Joi.number()
                        .optional()
                        .default(arduinoLib.position.servoNeutralPos)
                        .description('Pulse time, add query string of micro=true to send micro pulses. Default value is neutral position.')
                },
                query: {
                    micro: Joi.boolean()
                        .default(false)
                        .description('Send pulses in microseconds')
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
