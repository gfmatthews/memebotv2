"use strict";
// -- IMPORTS FROM EXTERNAL MODULES
import builder = require("botbuilder");
import botbuilder_azure = require("botbuilder-azure");
var restify = require('restify');
import appInsights = require("applicationinsights");

// -- IMPORTS FROM INTERNAL MODULES
import * as chitchatdialogs from './dialogs/chitchat';
import { chitchathelpdialog } from './dialogs/chitchat';
import { chitchatdimissdialog } from './dialogs/chitchat';
import { chitchatdetailsdialog } from './dialogs/chitchat';

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
    version: 3.0,
    message: 'My apologies but my brain has just been updated. I umm... I forgot where we were. Let\'s start again.',
    resetCommand: /^reset/i
};
bot.use(builder.Middleware.dialogVersion(dialogVersionOptions));

// bot emulator support
if (useEmulator) {
    var server = restify.createServer();
    server.listen(3978, function () {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());
} else {
    module.exports = { default: connector.listen() }
}

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
MemeRegExList[PopularMemeTypes.IGuaranteeIt] = new RegExp('(.*) (i gua?rantee it)');
MemeRegExList[PopularMemeTypes.YouAreFakeNews] = new RegExp('(.*)( is fake news|you are fake news)');

// LUIS INTENT RECOGNIZER SETUP
var luisAppId = process.env.LuisAppId;
var luisAPIKey = process.env.LuisAPIKey;
var luisAPIHostName = 'westus.api.cognitive.microsoft.com';

//const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v1/application?id=' + luisAppId + '&subscription-key=' + luisAPIKey;
const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v2.0/apps/' + luisAppId + '?subscription-key=' + luisAPIKey + '&verbose=true';


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
    new builder.RegExpRecognizer('meme.create.iguaranteeit', MemeRegExList[PopularMemeTypes.IGuaranteeIt]),
    new builder.RegExpRecognizer('meme.create.youarefakenews', MemeRegExList[PopularMemeTypes.YouAreFakeNews]),
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
    recognizeOrder: builder.RecognizeOrder.parallel
})
    /*
    .matches('<yourIntent>')... See details at http://docs.botframework.com/builder/node/guides/understanding-natural-language/
    */
    .onBegin(((function (session, args, next) {
        session.message.text = session.message.text.toLowerCase();
        // noticed that our RegEx list up there only does stuff in lower case?  converting the human 
        // message to lower case ensures consistent recognition.
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
    .matches('meme.create.iguaranteeit', (session, args) => {
        createMemeRegex(session, PopularMemeTypes.IGuaranteeIt);
    })
    .matches('meme.create.youarefakenews', (session, args) => {
        createMemeRegex(session, PopularMemeTypes.YouAreFakeNews);
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
    .matches('chitchat.details', (session, args) => {
        session.beginDialog('/chitchat/details');
    })
    .matches('chitchat.naughty', (session, args) => {
        session.beginDialog('/chitchat/naughty');
    })
    .matches('chitchat.thanks', (session, args) => {
        session.beginDialog('/chitchat/thanks');
    })
    .matches('meme.create', (session, args) => {
        session.beginDialog('/memes/create', args);
    })
    .onDefault((session, args) => {
        appInsights.getClient().trackEvent("Intent Failure", { message: session.message.text });
        session.send("Not quite sure what you meant there...");
        session.beginDialog('/chitchat/help');
    });

// Dialog Listing
bot.dialog('/', intentRecognizerDialog);
bot.dialog('/chitchat/greeting', chitchatdialogs.chitchatgreetingdialog);
bot.dialog('/chitchat/help', chitchatdialogs.chitchathelpdialog);
bot.dialog('/chitchat/dismiss', chitchatdialogs.chitchatdimissdialog);
bot.dialog('/chitchat/details', chitchatdialogs.chitchatdetailsdialog);
bot.dialog('/chitchat/naughty', chitchatdialogs.chitchatnaughtydialog);
bot.dialog('/chitchat/thanks', chitchatdialogs.chitchatthanksdialog);
bot.dialog('/memes/create', memecreationdialog);



