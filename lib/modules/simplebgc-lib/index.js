var SBGC = require('simplebgc');

exports.register = function (server, options, next) {

    // load sbgc library
    var sbgc = new SBGC(options);

    // expose the library
    server.expose('sbgc', sbgc);

    // we are connecting via UART to what port?
    server.log('Connecting to SimpleBGC Controller on Port: %s', typeof options.port === 'string' ? options.port : 'default' );

    next();
    // Q.nfcall(ServerMethods, server, options)
    // .then(function () {

    //     // customer (create, get, update & delete)
    //     require('../../../routes/customer/post')(server, options);
    //     require('../../../routes/customer/list')(server, options);
    //     require('../../../routes/customer/stream')(server, options);
    //     require('../../../routes/customer/find-by-gn-customer-number')(server, options);
    //     require('../../../routes/customer/{customerId}/get')(server, options);
    //     require('../../../routes/customer/{customerId}/put')(server, options);
    //     require('../../../routes/customer/{customerId}/delete')(server, options);

    //     // customer maintenance
    //     require('../../../routes/customer/{customerId}/maintenance/opt-out-all-facilities')(server, options);

    //     // facility specific customer information!
    //     require('../../../routes/customer/{customerId}/facility/{facilityId}/get')(server, options);
    //     require('../../../routes/customer/{customerId}/facility/{facilityId}/put')(server, options);
    //     require('../../../routes/customer/{customerId}/facility/{facilityId}/delete')(server, options);
    //     require('../../../routes/customer/find-by-customer-facility-id')(server, options);

    //     next();
    // })
    // .fail(function (err) {

    //     next(err);
    // });
};

exports.register.attributes = {
    pkg: require('./package.json')
};
