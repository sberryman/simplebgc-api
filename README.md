# API: Customers

Lead Maintainer [Shaun Berryman](https://github.com/sberryman)

<!-- [![Build Status](https://img.shields.io/codeship/5b598470-817a-0132-3cd0-269513d618dd/master.svg?style=flat)](https://codeship.com/projects/57644)
[![Coverage Status](https://coveralls.io/repos/teeleader/gn-api-crm/badge.svg?branch=master)](https://coveralls.io/r/teeleader/gn-api-crm?branch=master)
[![Dependency Status](https://gemnasium.com/5a86063c261e026536f338931be393a8.svg)](https://gemnasium.com/teeleader/gn-api-crm)
 -->
##Installation: 
Install packages
``` 
npm install
```

#### Engines:
Minimum versions
```json
{
    "node": ">=4",
    "npm": ">=3.3.0"
}
```

##Usage:

Debugging the application (this uses [nodemon](https://www.npmjs.com/package/nodemon) to monitor for file changes and automatically re-run the script)
```sh
npm run debug
```

##Testing:

Basic command line testing
```sh
npm test
```

Build coverage.html use lab html reporter
```sh
make test-cov-html
```

Automatically run `make test-cov-html` when file(s) change (this uses [nodemon](https://www.npmjs.com/package/nodemon) to monitor for file changes and automatically re-run the script)
```sh
npm run test-watch
```

Sending code coverage data to coveralls (you shouldn't need to do this as codeship handles it as part of its build)
```sh
npm run coveralls
```

## Contributing

I generally don't accept pull requests that are untested, or break the build, because I'd like to keep the quality high (this is a coverage tool afterall!).

I also don't care for "soft-versioning" or "optimistic versioning" (dependencies that have ^, x, > in them, or anything other than numbers and dots).  There have been too many problems with bad semantic versioning in dependencies, and I'd rather have a solid library than a bleeding edge one.
