// Twitter packages and vars
var Twit = require('twit');
var T = new Twit(require('./config.js'));
var stream;
var tweet;

// Packages for working with server OS
var fs = require('fs');
var exec = require('child_process').exec;

// Environment-specific path variables
var paths = {
    'processing': {
        'win': '"processing_3.3.6_win64/processing-java.exe"',
        'linux64': 'processing_3.3.6_linux64/processing-java'
    },
    'sketch': {
        'win': '../superformula_generator_sketch',
        'linux64': process.cwd() + '/superformula_generator_sketch'
    },
    'outputImage': {
        'win': 'superformula_generator_sketch/superformula_output.jpg',
        'linux64': process.cwd() + '/superformula_generator_sketch/superformula_output.jpg'
    },
    'log': {
        'win': 'activity.log',
        'linux64': process.cwd() + '/activity.log'
    }
}

// Set working paths to Win by default for easier dev
var processingPath  = paths.processing.win;
var sketchPath      = paths.sketch.win;
var outputImagePath = paths.outputImage.win;
var logFilePath     = paths.log.win;

// Switch to linux64 paths when ENV=PROD environment variable is passed (see 'deploy' script in package.json)
if(typeof process.env.ENV != 'undefined' && process.env.ENV == 'PROD') {
    processingPath  = paths.processing.linux64;
    sketchPath      = paths.sketch.linux64;
    outputImagePath = paths.outputImage.linux64;
    logFilePath     = paths.log.linux64;
}

// Logging via Winston - https://github.com/winstonjs/winston
var winston = require('winston');
winston.loggers.add('transports', {
    file: {
        filename: logFilePath
    },
    console: {
        colorize: true
    }
});

// Superformula parameters and limits
var params = {};
var paramLimits = require('./param-limits.js');

// Extend the Number prototype to include a Processing-like map function
// - See this response from August Miller - https://stackoverflow.com/a/23202637
Number.prototype.map = function (in_min, in_max, out_min, out_max) {
    return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}


//====================================================================================================
//  TRIGGERS
//====================================================================================================
// Manually kickoff a new tweet at startup
tweeter('DATE');

// Watch for 'tweet' events on user timeline, which include @mentions
stream = T.stream('user');
stream.on('tweet', captureTweet);

// Schedule a DATE tweet for one hour from now, +/- 15 minutes
var scheduledTime = scheduleTweet();
winston.info('SCHEDULED tweet for ' + scheduledTime/60/1000 + ' minutes from now.');
//====================================================================================================


//=============================================================
//  All main bot functionality comes through here
//=============================================================
function tweeter(mode) {

    // Obtain parameters either based on current datetime or Tweet
    switch(mode) {
        case 'DATE':
        case 'INTERVAL':
            params = getParamsFromDate();
            break;
        case 'REPLY':
            params = getParamsFromTweet();
            break;
        default:
            winston.error('Invalid mode supplied - ' + mode);
            return;
            break;
    }

    // Convert params object into string for to pass to Processing sketch via CLI
    var paramString = getParamsAsArgs(params);

    // Construct the CLI command to run Processing
    var cmd = processingPath + ' --sketch=' + sketchPath + ' --run ' + paramString;

    if(typeof process.env.ENV != 'undefined' && process.env.ENV == 'PROD') {
        cmd = 'xvfb-run ' + processingPath + ' --sketch=' + sketchPath + ' --run ' + paramString;
    }

    // Run the Processing sketch, call function in the second parameter as callback
    exec(cmd, generatorDoneHandler);

    // Handle the creation and posting of a new tweet/reply with newly generated image attached
    function generatorDoneHandler(err, stdout, stderr) {
        if(err) {
            winston.error('exec() failed: ' + err);
            console.log("stdout: " + stdout);
            console.log("stderr: " + stderr);
            return;
        }

        var paramString = getParamsAsString();
        var image = fs.readFileSync(outputImagePath, { encoding: 'base64' } );
        var status;
        
        // Create appropriate status text
        switch(mode) {
            case 'DATE':
            case 'INTERVAL':
                status = paramString;
                break;
            case 'REPLY':
                status = '@' + tweet.user.screen_name + ' ' + paramString;
                break;
        }

        // First upload the image to Twitter's servers
        T.post('media/upload', { media_data: image }, function(err, data, response) {
            var mediaIdStr = data.media_id_string;
            var altText = paramString;
            var meta_params = { 
                media_id: mediaIdStr, 
                altText: { 
                    text: altText
                } 
            };

            // Create metadata on Twitter servers for uploaded media
            T.post('media/metadata/create', meta_params, function(err, data, response) {
                if(!err) {
                    var status_params = { 
                        status: status, 
                        media_ids: [mediaIdStr] 
                    };

                    if(mode == 'REPLY') {
                        status_params.in_reply_to_status_id = tweet.id_str;
                    }

                    // Post status update with media attached
                    T.post('statuses/update', status_params, function(err, data, response) {
                        if(mode == 'DATE') {
                            winston.info('DATE tweet posted - ' + paramString);
                        } else if(mode == 'REPLY') {
                            winston.info('REPLY sent to @' + tweet.user.screen_name + ' - ' + paramString)
                        }

                        if(mode == 'INTERVAL') {
                            var scheduledTime = scheduleTweet();
                            winston.info('SCHEDULED tweet for ' + scheduledTime/60/1000 + ' minutes from now.');
                        }
                    });
                }
            });
        });
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
    var hour   = today.getHours() + 6;      // [0-23]
    var minute = today.getMinutes();    // [0-59]
    var second = today.getSeconds();    // [0-59]

    params.a  = day.map(1, 31, paramLimits.a.min, paramLimits.a.max).toFixed(2);
    params.b  = month.map(0, 11, paramLimits.b.min, paramLimits.b.max).toFixed(2);
    params.m  = parseInt(hour.map(0, 23, paramLimits.m.min, paramLimits.m.max));
    params.n1 = hour.map(0, 23, paramLimits.n1.min, paramLimits.n1.max).toFixed(2);
    params.n2 = minute.map(0, 59, paramLimits.n2.min, paramLimits.n2.max).toFixed(2);
    params.n3 = second.map(0, 59, paramLimits.n3.min, paramLimits.n3.max).toFixed(2);

    params.iterations = parseInt(random(paramLimits.iterations.min, paramLimits.iterations.max));
    params.decay      = random(paramLimits.decay.min, paramLimits.decay.max).toFixed(2);

    // Ensure that m is an even integer for closed (prettier) paths
    if(params.m % 2 != 0) {
        params.m += 1;
    }

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
function captureTweet(incomingTweet) {
    if(incomingTweet.in_reply_to_screen_name == 'superformulabot') {
        if(incomingTweet.text.indexOf('[') >= 0 && incomingTweet.text.indexOf(']') >= 0) {
            winston.info('Mention received from @' + incomingTweet.user.screen_name + " - '" + incomingTweet.text + "'");
            tweet = incomingTweet;
            tweeter('REPLY');
        } else {
            winston.info('Mentioned by @' + incomingTweet.user.screen_name + ", but no param string found so ignoring - " + "'" + incomingTweet.text + "'");
        }
    }
}


//=========================================================================
//  Extract user-supplied parameters from Tweet directed at bot
//=========================================================================
function getParamsFromTweet() {
    var userParams = {};
    var userParamString;
    var userParamArray;

    // Find and extract string contained by []
    userParamString = tweet.text.substring(tweet.text.indexOf('[') + 1, tweet.text.indexOf(']'));

    // Extract key/value pair(s), even if only one exists
    if(userParamString.indexOf(' ') > 0) {
        userParamArray = userParamString.split(' ');
    } else if(userParamString.indexOf(':') >= 0) {
        userParamArray = [];
        userParamArray[0] = userParamString;
    }

    if(Array.isArray(userParamArray) && userParamArray.length > 0) {
        // Split key/value pairs and capture them in userParams object
        userParamArray.forEach(paramToken => {
            var paramPair = paramToken.split(':');

            // There must be a more elegant way of doing this...
            switch(paramPair[0]) {
                case 'a':
                    userParams.a = parseFloat(paramPair[1]).toFixed(2);
                    break;
                case 'b':
                    userParams.b = parseFloat(paramPair[1]).toFixed(2);
                    break;
                case 'm':
                    userParams.m = parseFloat(paramPair[1]).toFixed(2);
                    break;
                case 'n1':
                    userParams.n1 = parseFloat(paramPair[1]).toFixed(2);
                    break;
                case 'n2':
                    userParams.n2 = parseFloat(paramPair[1]).toFixed(2);
                    break;
                case 'n3':
                    userParams.n3 = parseFloat(paramPair[1]).toFixed(2);
                    break;
                case 'iterations':
                    userParams.iterations = parseInt(paramPair[1]);
                    break;
                case 'decay':
                    userParams.decay = parseFloat(paramPair[1]).toFixed(2);
                    break;
                case 'invert':
                    userParams.invert = (paramPair[1] == 'true');
                    break;   
            }
        });
    }

    var randomParams = {};
    randomParams.a = random(paramLimits.a.min, paramLimits.a.max).toFixed(2);
    randomParams.b = random(paramLimits.b.min, paramLimits.b.max).toFixed(2);
    randomParams.m = parseInt(random(paramLimits.m.min, paramLimits.m.max));
    randomParams.n1 = random(paramLimits.n1.min, paramLimits.n1.max).toFixed(2);
    randomParams.n2 = random(paramLimits.n2.min, paramLimits.n2.max).toFixed(2);
    randomParams.n3 = random(paramLimits.n3.min, paramLimits.n2.max).toFixed(2);
    randomParams.iterations = parseInt(random(paramLimits.iterations.min, paramLimits.iterations.max));
    randomParams.decay = random(paramLimits.decay.min, paramLimits.decay.max).toFixed(2);

    // Ensure that m is an even integer for closed (prettier) paths
    if(randomParams.m % 2 != 0) {
        randomParams.m += 1;
    }

    // Merge defaults with any users' params (or randomized params)
    var params = Object.assign({}, randomParams, userParams);

    return params;
}

//=========================================================================
//  Schedule a new tweet in about an hour (+/- 15min)
//=========================================================================
function scheduleTweet() {
    var ONE_HOUR = 1000*60*60;
    var timeOffset = ONE_HOUR + 1000*60*parseInt(random(-15,15));

    setTimeout(tweeter, timeOffset, 'INTERVAL');

    return timeOffset;
}


// Small utility function to generate random within range, a la Processing
function random(min, max) {
    return Math.random() * (max-min) + min
}

// Keep a number within bounds
function clamp(input, min, max) {
    return Math.min(Math.max(input,max),max);
}