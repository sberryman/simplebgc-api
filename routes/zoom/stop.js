var Boom = require('boom');
var Joi = require('joi');

module.exports = exports = function (server, options) {

    // alias
    var arduinoLib = server.plugins['arduino-lib'].client;

    var swaggerNickname = 'stopZoomMotor';
    var handler = function (request, reply) {

        // very simple
        arduinoLib.setServoSpeed( arduinoLib.position.servoNeutralPos );

        // wait for the next tick
        process.nextTick(function () {

            return reply( { ok: 1 } );
        });
    };


    server.route({
        path: '/zoom/stop',
        method: 'PUT',
        config: {
            id: 'zoom-stop',
            tags: ['api', 'api-simplebgc'],
            description: 'Stop the zoom motor.',
            validate: {
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
