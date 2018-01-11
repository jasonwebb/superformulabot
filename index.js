var twit = require('twit');
// var T = new Twit(require('./config.js'));
// var stream = T.stream('user');
// var tweet;

var fs = require('fs');
var exec = require('child_process').exec;

// var processingPath = 'processing_3.3.6_linux64/processing-java';
var processingPath = '"processing_3.3.6_win64/processing-java.exe"';
var sketchPath = '../superformula_generator_sketch';
var params = {};

// Extend the Number prototype to include a Processing-like map function
// - See this response from August Miller - https://stackoverflow.com/a/23202637
Number.prototype.map = function (in_min, in_max, out_min, out_max) {
    return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

// Reply when anyone has Tweeted parameters directly to bot
// stream.on('tweet', captureTweet);

tweeter('DATE');

// Generate and tweet a new image every hour, +/- 10 minutes or so
// setInterval(tweeter('DATE'), 1000*60*60);

function tweeter(mode) {

    // Obtain parameters either based on current datetime or Tweet
    switch(mode) {
        case 'DATE':
            params = getParamsFromDate();
            break;
        case 'REPLY':
            // params = getParamsFromTweet();

            // if(params == -1) {
            //     // No parameters found - reply with error and guide image
            // } else if(params == -2) {
            //     // Must have a minimum of m, n1, n2, n3 - reply with error and guide image
            // }

            break;
        default:
            console.log('Invalid mode.');
            process.exit(1);
            break;
    }

    // Convert params object into string for to pass to Processing sketch via CLI
    var paramString = getParamsAsArgs(params);
    console.log(paramString);

    // Construct the CLI command to run Processing
    var cmd = processingPath + ' --sketch=' + sketchPath + ' --run ' + paramString;

    // Run the Processing sketch, call function in the second parameter as callback
    exec(cmd, generatorDoneHandler);

    function generatorDoneHandler(err, stdout, stderr) {
        var paramString = getParamsAsString();
        
        switch(mode) {
            case 'DATE':
                // Tweet with image attached and params
                // twit.post('statuses/update', { 
                //     status: getParamsAsString()
                // }, tweeted);

                break;
            case 'REPLY':
                // Tweet a reply (message, params, and image attached) to the username in tweet.reply_to
                break;
        }
    }
}


//=========================================================================
//  Get superformula parameters using current date/time
//=========================================================================
function getParamsFromDate() {
    var params = {};

    var today  = new Date();
    var day    = today.getDate();       // [0-6] + 1
    var month  = today.getMonth();      // [0-11] + 1
    var year   = today.getFullYear();   // [1000-9999]
    var hour   = today.getHours();      // [0-23]
    var minute = today.getMinutes();    // [0-59]
    var second = today.getSeconds();    // [0-59]

    params.a = day.map(1, 31, 1.0, 8.0).toFixed(2);
    params.b = month.map(0, 11, 1.0, 8.0).toFixed(2);
    params.m = parseInt(hour.map(0, 59, 1, 20));
    params.n1 = hour.map(0, 23, .01, 40.0).toFixed(2);
    params.n2 = minute.map(0, 59, .01, 20.0).toFixed(2);
    params.n3 = second.map(0, 59, .01, 40.0).toFixed(2);

    params.iterations = Math.floor(Math.random() * 9 + 1);
    params.decay = params.iterations.map(1, 10, .05, .2).toFixed(3);

    // Set color scheme based on current hour of the day
    if(hour > 6 && hour < 20) {
        params.invert = false;
    } else {
        params.invert = true;
    }

    return params;
}


//=========================================================================
//  Convert params object into flat, space-seperated string for CLI args
//=========================================================================
function getParamsAsArgs(params) {
    var paramString;

    if(typeof params != "undefined") {
        paramString = params.a + ' ';
        paramString += params.b + ' ';

        paramString += params.m + ' ';
        paramString += params.n1 + ' ';
        paramString += params.n2 + ' ';
        paramString += params.n3 + ' ';

        paramString += params.iterations + ' ';
        paramString += params.decay + ' ';

        if(params.invert == true) {
            paramString += 'true';
        } else {
            paramString += 'false';
        }

        return paramString;
    }

    return paramString;
}

//=========================================================================
//  Convert param object into flat string with key/value pairs
//  - This string should match the input expected from users
//=========================================================================
function getParamsAsString() {
    var paramString;

    paramString = '[';

    paramString += 'a:' + params.a + ' ';
    paramString += 'b:' + params.b + ' ';

    paramString += 'm:' + params.m + ' ';
    paramString += 'n1:' + params.n1 + ' ';
    paramString += 'n2:' + params.n2 + ' ';
    paramString += 'n3:' + params.n3 + ' ';

    paramString += 'iterations:' + params.iterations + ' ';
    paramString += 'decay:' + params.decay + ' ';

    if(params.invert) {
        paramString += 'invert:true';
    } else {
        paramString += 'invert:false';
    }

    paramString += ']';

    return paramString;
}

//=========================================================================
//  Capture the tweet passed by stream event handler to global object
//  since tweeter() can't handle it directly.
//=========================================================================
function captureTweet(tweet) {
    tweet = tweet;
    tweeter();
}

function getParamsFromTweet() {
    var params;

    var sentParams = tweet.text;
    // Find and extract string contained by []
        // if not found, return -1

    // Split string on spaces to get key/value pairs

    // Split key/value pairs to create associative array

    // Verify that m, n1, n2, n3 are present
        // if not, return -2

    // Check datatypes of m, n1, n2, n3
        // if bad, return -3

    // Check for optional a and b parameters

    // Check for optional invert parameter

    // Capture all parameters in params object for return

    return params;
}