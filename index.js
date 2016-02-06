// # Ghost Startup
// Orchestrates the startup of Ghost when run from command line.
var express,
    ghost,
	parentApp,
	appInsights,
    errors;

// Make sure dependencies are installed and file system permissions are correct.
require('./core/server/utils/startup-check').check();

// Proceed with startup
express = require('express');
ghost = require('./core');
errors = require('./core/server/errors');

// Azure App Insights
// ------------------------------------------------------------------------
// If the App Setting 'websiteUrl' is set, Ghost will use that URL as base.
// If it isn't set, we'll go with the default sitename.
var instrumentationKey = process.env.instrumentationKey;
if (instrumentationKey || instrumentationKey != '' || instrumentationKey.length > 0) {
    appInsights = require("applicationinsights");
	console.log('instrumentationKey');
	console.log(instrumentationKey);
	appInsights.setup(instrumentationKey).start();
}


// Create our parent express app instance.
parentApp = express();

// Call Ghost to get an instance of GhostServer
ghost().then(function (ghostServer) {
    // Mount our Ghost instance on our desired subdirectory path if it exists.
    parentApp.use(ghostServer.config.paths.subdir, ghostServer.rootApp);

    // Let Ghost handle starting our server instance.
	ghostServer.start(parentApp);

}).catch(function (err) {
    errors.logErrorAndExit(err, err.context, err.help);
});
