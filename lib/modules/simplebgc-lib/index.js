var SBGC = require('simplebgc');

exports.register = function (server, options, next) {

    // we are connecting via UART to what port?
    server.log('Connecting to SimpleBGC Controller on Port: %s', typeof options.port === 'string' ? options.port : 'default' );

    // load sbgc library
    var library = new SBGC(options);

    // event listeners
    library.events.on('open', function (){

        server.log([ 'simplebgc-lib', 'info' ], 'Connected');

        // ready!
        next();
    });
    library.events.on('error', function (err) {

        // bad error!
        server.log([ 'simplebgc-lib', 'error' ], 'Connection Error', err);
        throw err;
    });

    // expose the library
    server.expose('sbgc', library);
};

exports.register.attributes = {
    pkg: require('./package.json')
};
