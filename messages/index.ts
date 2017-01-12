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
var bot = new builder.UniversalBot(connector);

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector(<any>{
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

// Dialog versioning makes sure that users who get caught in bug'ed conversations (e.g. what would previously happen
// when users interacted with the memecreate dialog) get unstuck when the bugs get resolved.
var dialogVersionOptions = {
    version: 2.0,
    message: 'My apologies but my brain has just been updated. I need to restart our conversation.',
    resetCommand: /^reset/i
};
bot.use(builder.Middleware.dialogVersion(dialogVersionOptions));

// Dialog Listing
bot.dialog('/', RegExpRecognizerIntentDialog);
bot.dialog('/luis', LuisIntentRecognizerDialog);
bot.dialog('/chitchat/greeting', chitchatgreetingdialog);
bot.dialog('/chitchat/help', chitchathelpdialog);
bot.dialog('/chitchat/dismiss', chitchatdimissdialog);
bot.dialog('/memes/create', memecreationdialog);

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
// This uses a two-pass dialog system.  Why?  Well, even though the docs for bot builder
// claim that local RegEx intents will get evaluated first, that doesn't appear to match the behavior.
// So, pass #1 ("the root dialog at /") will use the RegExpRecognizer object.  If pass #1 doesn't 
// find anything and ends up in the none intent handler, it will get passed to the LUIS recognizer 
// ("the dialog at /luis")

// -- REGEXP DIALOG (ROOT DIALOG at /)
var MemeRegExList = new Map;
MemeRegExList[PopularMemeTypes.DosEquisGuy] = new RegExp('(i don\'?t always .*) (but when i do,? .*)');
MemeRegExList[PopularMemeTypes.OneDoesNotSimply] = new RegExp('(one does not simply) (.*)');
MemeRegExList[PopularMemeTypes.XEverywhere] = new RegExp('(.*),? (\\1 everywhere)');
MemeRegExList[PopularMemeTypes.NedStarkBrace] = new RegExp('(brace yoursel[^\s]+) (.*)');
MemeRegExList[PopularMemeTypes.AllTheThings] = new RegExp('(.*) (all the .*)');
MemeRegExList[PopularMemeTypes.ThatWouldBeGreat] = new RegExp('(.*) (that would be great|that\'?d be great)');
MemeRegExList[PopularMemeTypes.WhatIfIToldYou] = new RegExp('(what if i told you) (.*)');
MemeRegExList[PopularMemeTypes.Trump] = new RegExp('(we\'re going to.*) (and.*)');

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
];

// Helper function to pull in the MemeType and redirect the session to the meme creation dialog
function createMemeRegex(session: any, type: PopularMemeTypes) {
        appInsights.getClient().trackEvent("MemeCreated-REGEX");
        var textElements = MemeExtractor.getTextElementArrayFromRegExMeme(session, MemeRegExList[type]);
        session.beginDialog('/memes/create', { directmemetype: type as number, toptext: textElements[1], bottomtext: textElements[2] });
}

var RegExpRecognizerIntentDialog = new builder.IntentDialog({ recognizers: recognizerSet, 
    recognizeOrder: builder.RecognizeOrder.parallel, })
    /*
    .matches('<yourIntent>')... See details at http://docs.botframework.com/builder/node/guides/understanding-natural-language/
    */
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
        session.beginDialog('/luis');
    });

// LUIS INTENT RECOGNIZER DIALOG (DIALOG AT /LUIS)
// Make sure you add code to validate these fields
var luisAppId = process.env.LuisAppId;
var luisAPIKey = process.env.LuisAPIKey;
var luisAPIHostName = process.env.LuisAPIHostName || 'api.projectoxford.ai';

const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v1/application?id=' + luisAppId + '&subscription-key=' + luisAPIKey;

// Main dialog with LUIS
var LUISRecognizer = new builder.LuisRecognizer(LuisModelUrl);

var LuisIntentRecognizerDialog = new builder.IntentDialog({ recognizers: [LUISRecognizer], 
    recognizeOrder: builder.RecognizeOrder.parallel, })
    /*
    .matches('<yourIntent>')... See details at http://docs.botframework.com/builder/node/guides/understanding-natural-language/
    */
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
        session.beginDialog('/luis');
    });



