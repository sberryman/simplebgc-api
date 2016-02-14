var Glue = require('glue');
var Manifest = require('./manifest.json');
var Url = require('url');
var HapiSwaggeredUi = require('hapi-swaggered-ui');
var Hoek = require('hoek');
var PackageJSON = require('./package.json');
var glueOptions = {
    relativeTo: process.cwd() + '/lib/modules'
};

Glue.compose(Manifest, glueOptions, function (err, server) {

    // routes
    require('./routes/motors/on_off')(server);
    require('./routes/rcRoll')(server);
    require('./routes/zoom/position')(server);
    require('./routes/zoom/stop')(server);

    if (err) {
        console.log(err.stack || err);
        throw err;
    }

    // do we have a username and password?
    // if so then enable auth
    if (typeof process.env.AUTH_USERNAME === 'string' &&
        typeof process.env.AUTH_PASSWORD === 'string') {

        // this needs to be changed!!!
        var credentials = {};
        credentials[process.env.AUTH_USERNAME] = {
            key: process.env.AUTH_PASSWORD,
            algorithm: 'sha256'
        };
        var getCredentials = function (id, callback) {

            return callback(null, credentials[id]);
        };

        // add our strategy
        var hawkConfig = {
            getCredentialsFunc: getCredentials,
            hawk: {
                port: 443
            }
        };

        server.auth.strategy('default', 'hawk', hawkConfig);

        // log that we are setting up a default auth
        server.log(['server', 'info'], 'Set default auth strategy to hawk');

        // set the default
        server.auth.default('default');
    }

    // register the swagger ui
    if (process.env.NODE_ENV !== 'production' && Hoek.contain(Manifest.registrations, { plugin: { register: 'hapi-swaggered' } }, { deep: true, part: true })) {
        server.register({
            register: HapiSwaggeredUi,
            options: {
                title: PackageJSON.name + ' - v' + PackageJSON.version,
                swaggerEndpoint: '/docs',
                swaggerOptions: {
                    supportedSubmitMethods: ['head', 'get', 'put', 'del']
                }
            }
        }, {
            select: 'api',
            routes: {
                prefix: '/documentation'
            }
        }, function (err) {

            if (err) {
                throw err;
            }
        });
    }

    // start the server!
    server.start(function (err) {

        if (err) {
            throw err;
        }

        // API running on port XXXX
        server.log(['server', 'info'], 'Server started at: ' + server.info.uri);

    });

});
