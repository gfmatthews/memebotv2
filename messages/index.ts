"use strict";
// -- IMPORTS FROM EXTERNAL MODULES
import builder = require("botbuilder");
import botbuilder_azure = require("botbuilder-azure");
var restify = require('restify');
import appInsights = require("applicationinsights");

// -- IMPORTS FROM INTERNAL MODULES
import { chitchatgreetingdialog } from './dialogs/chitchat';
import { chitchathelpdialog } from './dialogs/chitchat';
import { chitchatdimissdialog } from './dialogs/chitchat';

import { memecreationdialog } from './dialogs/memecreate';
import { PopularMemeTypes } from './services/memetypeextractor';
import { MemetypeExtractor } from './services/memetypeextractor';

// -- RUNTIME SYSTEM SETUP WORK
// Configure Application Insights
appInsights.setup(process.env['BotDevAppInsightKey']).start();
var insightsKey = process.env['BotDevAppInsightKey'];

// Instantiate Meme Extractor Object
var MemeExtractor = new MemetypeExtractor();

// Setup Bot Builder and connect to our bot instance 
var useEmulator = (process.env.NODE_ENV == 'development');

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector(<any>{
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});


var bot = new builder.UniversalBot(connector);

// Dialog versioning makes sure that users who get caught in bug'ed conversations (e.g. what would previously happen
// when users interacted with the memecreate dialog) get unstuck when the bugs get resolved.
var dialogVersionOptions = {
    version: 2.0,
    message: 'My apologies but my brain has just been updated. I need to restart our conversation.',
    resetCommand: /^reset/i
};
bot.use(builder.Middleware.dialogVersion(dialogVersionOptions));

// Add in bot emulator support
if (useEmulator) {
    var server = restify.createServer();
    server.listen(3978, function () {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());
} else {
    module.exports = { default: connector.listen() }
}

// -- ROOT DIALOG SETUP

// -- REGEXP SETUP
var MemeRegExList = new Map;
MemeRegExList[PopularMemeTypes.DosEquisGuy] = new RegExp('(i don\'?t always .*) (but when i do,? .*)');
MemeRegExList[PopularMemeTypes.OneDoesNotSimply] = new RegExp('(one does not simply) (.*)');
MemeRegExList[PopularMemeTypes.XEverywhere] = new RegExp('(.*),? (\\1 everywhere)');
MemeRegExList[PopularMemeTypes.NedStarkBrace] = new RegExp('(brace yoursel[^\s]+) (.*)');
MemeRegExList[PopularMemeTypes.AllTheThings] = new RegExp('(.*) (all the .*)');
MemeRegExList[PopularMemeTypes.ThatWouldBeGreat] = new RegExp('(.*) (that would be great|that\'?d be great)');
MemeRegExList[PopularMemeTypes.WhatIfIToldYou] = new RegExp('(what if i told you) (.*)');
MemeRegExList[PopularMemeTypes.Trump] = new RegExp('(we\'re going to.*) (and.*)');
MemeRegExList[PopularMemeTypes.ThisIsFine] = new RegExp('(.*) (this is just fine|this is fine|it\'s fine)');

// LUIS INTENT RECOGNIZER SETUP
var luisAppId = process.env.LuisAppId;
var luisAPIKey = process.env.LuisAPIKey;
var luisAPIHostName = process.env.LuisAPIHostName || 'api.projectoxford.ai';

const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v1/application?id=' + luisAppId + '&subscription-key=' + luisAPIKey;

// Main dialog with LUIS
var LUISRecognizer = new builder.LuisRecognizer(LuisModelUrl);

var recognizerSet = [
    new builder.RegExpRecognizer('chitchat.greeting', new RegExp("^hi*")),
    new builder.RegExpRecognizer('chitchat.greeting', new RegExp('^hello*')),
    new builder.RegExpRecognizer('meme.create', new RegExp('(create meme)')),
    new builder.RegExpRecognizer('meme.create.dosequis', MemeRegExList[PopularMemeTypes.DosEquisGuy]),
    new builder.RegExpRecognizer('meme.create.onedoesnotsimply', MemeRegExList[PopularMemeTypes.OneDoesNotSimply]),
    new builder.RegExpRecognizer('meme.create.xeverywhere', MemeRegExList[PopularMemeTypes.XEverywhere]),
    new builder.RegExpRecognizer('meme.create.nedstark', MemeRegExList[PopularMemeTypes.NedStarkBrace]),
    new builder.RegExpRecognizer('meme.create.allthethings', MemeRegExList[PopularMemeTypes.AllTheThings]),
    new builder.RegExpRecognizer('meme.create.thatwouldbegreat', MemeRegExList[PopularMemeTypes.ThatWouldBeGreat]),
    new builder.RegExpRecognizer('meme.create.whatifitoldyou', MemeRegExList[PopularMemeTypes.WhatIfIToldYou]),
    new builder.RegExpRecognizer('meme.create.trump', MemeRegExList[PopularMemeTypes.Trump]),
    new builder.RegExpRecognizer('meme.create.thisisfine', MemeRegExList[PopularMemeTypes.ThisIsFine]),
    LUISRecognizer
];

// Helper function to pull in the MemeType and redirect the session to the meme creation dialog
function createMemeRegex(session: any, type: PopularMemeTypes) {
    appInsights.getClient().trackEvent("MemeCreated-REGEX");
    var textElements = MemeExtractor.getTextElementArrayFromRegExMeme(session, MemeRegExList[type]);
    session.beginDialog('/memes/create', { directmemetype: type as number, toptext: textElements[1], bottomtext: textElements[2] });
}

var intentRecognizerDialog = new builder.IntentDialog({
    recognizers: recognizerSet,
    recognizeOrder: builder.RecognizeOrder.parallel,
})
    /*
    .matches('<yourIntent>')... See details at http://docs.botframework.com/builder/node/guides/understanding-natural-language/
    */
    .onBegin(((function (session, args, next) {
        session.message.text = session.message.text.toLowerCase();
        session.routeToActiveDialog();
    })))
    .matches('meme.create.dosequis', (session, args) => {
        createMemeRegex(session, PopularMemeTypes.DosEquisGuy);
    })
    .matches('meme.create.onedoesnotsimply', (session, args) => {
        createMemeRegex(session, PopularMemeTypes.OneDoesNotSimply);
    })
    .matches('meme.create.xeverywhere', (session, args) => {
        createMemeRegex(session, PopularMemeTypes.XEverywhere);
    })
    .matches('meme.create.nedstark', (session, args) => {
        createMemeRegex(session, PopularMemeTypes.NedStarkBrace);
    })
    .matches('meme.create.allthethings', (session, args) => {
        createMemeRegex(session, PopularMemeTypes.AllTheThings);
    })
    .matches('meme.create.thatwouldbegreat', (session, args) => {
        createMemeRegex(session, PopularMemeTypes.ThatWouldBeGreat);
    })
    .matches('meme.create.whatifitoldyou', (session, args) => {
        createMemeRegex(session, PopularMemeTypes.WhatIfIToldYou);
    })
    .matches('meme.create.trump', (session, args) => {
        createMemeRegex(session, PopularMemeTypes.Trump);
    })
    .matches('meme.create.thisisfine', (session, args) => {
        createMemeRegex(session, PopularMemeTypes.ThisIsFine);
    })
    .matches('chitchat.greeting', (session, args) => {
        session.beginDialog('/chitchat/greeting');
    })
    .matches('chitchat.help', (session, args) => {
        session.beginDialog('/chitchat/help');
    })
    .matches('chitchat.dismiss', (session, args) => {
        session.beginDialog('/chitchat/dismiss');
    })
    .matches('meme.create', (session, args) => {
        session.beginDialog('/memes/create', args);
    })
    .onDefault((session) => {
        appInsights.getClient().trackEvent("Intent Failure", { message: session.message.text });
        session.send("Not quite sure what you meant there...");
        session.beginDialog('/chitchat/help');
    });

// Dialog Listing
bot.dialog('/', intentRecognizerDialog);
bot.dialog('/chitchat/greeting', chitchatgreetingdialog);
bot.dialog('/chitchat/help', chitchathelpdialog);
bot.dialog('/chitchat/dismiss', chitchatdimissdialog);
bot.dialog('/memes/create', memecreationdialog);



