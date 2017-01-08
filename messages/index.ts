/*-----------------------------------------------------------------------------
This template demonstrates how to use Waterfalls to collect input from a user using a sequence of steps.
For a complete walkthrough of creating this type of bot see the article at
https://docs.botframework.com/en-us/node/builder/chat/dialogs/#waterfall
-----------------------------------------------------------------------------*/
"use strict";
import builder = require("botbuilder");
import botbuilder_azure = require("botbuilder-azure");
var restify = require('restify');

// Configure appInsights
import appInsights = require("applicationinsights");
appInsights.setup(process.env['BotDevAppInsightKey']).start();

import { chitchatgreetingdialog } from './dialogs/chitchat';
import { chitchathelpdialog } from './dialogs/chitchat';
import { chitchatdimissdialog } from './dialogs/chitchat';

import { memecreationdialog } from './dialogs/memecreate';
import { PopularMemeTypes } from './services/memetypeextractor';
import { MemetypeExtractor } from './services/memetypeextractor';
var MemeExtractor = new MemetypeExtractor();

var insightsKey = process.env['BotDevAppInsightKey'];

var useEmulator = (process.env.NODE_ENV == 'development');

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector(<any>{
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

var MemeRegExList = new Map;
MemeRegExList[PopularMemeTypes.DosEquisGuy] = new RegExp('(i don\'?t always .*) (but when i do,? .*)');
MemeRegExList[PopularMemeTypes.OneDoesNotSimply] = new RegExp('(one does not simply) (.*)');
MemeRegExList[PopularMemeTypes.XEverywhere] = new RegExp('(.*),? (\\1 everywhere)');
MemeRegExList[PopularMemeTypes.NedStarkBrace] = new RegExp('(brace yoursel[^\s]+) (.*)');
MemeRegExList[PopularMemeTypes.AllTheThings] = new RegExp('(.*) (all the .*)');
MemeRegExList[PopularMemeTypes.ThatWouldBeGreat] = new RegExp('(.*) (that would be great|that\'?d be great)');
MemeRegExList[PopularMemeTypes.WhatIfIToldYou] = new RegExp('(what if i told you) (.*)');
MemeRegExList[PopularMemeTypes.Trump] = new RegExp('(we\'re going to.*) (and.*)');

var bot = new builder.UniversalBot(connector);

// Make sure you add code to validate these fields
var luisAppId = process.env.LuisAppId;
var luisAPIKey = process.env.LuisAPIKey;
var luisAPIHostName = process.env.LuisAPIHostName || 'api.projectoxford.ai';

const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v1/application?id=' + luisAppId + '&subscription-key=' + luisAPIKey;

// Main dialog with LUIS
var LUISRecognizer = new builder.LuisRecognizer(LuisModelUrl);
var recognizerSet = [
    new builder.RegExpRecognizer('chitchat.greeting', new RegExp("^hi*")),
    new builder.RegExpRecognizer('chitchat.greeting', new RegExp('^hello*')),
    new builder.RegExpRecognizer('meme.create', new RegExp('(make .*) (meme.*)')),
    new builder.RegExpRecognizer('meme.create.dosequis', MemeRegExList[PopularMemeTypes.DosEquisGuy]),
    new builder.RegExpRecognizer('meme.create.onedoesnotsimply', MemeRegExList[PopularMemeTypes.OneDoesNotSimply]),
    new builder.RegExpRecognizer('meme.create.xeverywhere', MemeRegExList[PopularMemeTypes.XEverywhere]),
    new builder.RegExpRecognizer('meme.create.nedstark', MemeRegExList[PopularMemeTypes.NedStarkBrace]),
    new builder.RegExpRecognizer('meme.create.allthethings', MemeRegExList[PopularMemeTypes.AllTheThings]),
    new builder.RegExpRecognizer('meme.create.thatwouldbegreat', MemeRegExList[PopularMemeTypes.ThatWouldBeGreat]),
    new builder.RegExpRecognizer('meme.create.whatifitoldyou', MemeRegExList[PopularMemeTypes.WhatIfIToldYou]),
    new builder.RegExpRecognizer('meme.create.trump', MemeRegExList[PopularMemeTypes.Trump]),
    LUISRecognizer];

var intents = new builder.IntentDialog({ recognizers: recognizerSet, 
    recognizeOrder: builder.RecognizeOrder.series,
    stopIfExactMatch: true })
    /*
    .matches('<yourIntent>')... See details at http://docs.botframework.com/builder/node/guides/understanding-natural-language/
    */
    .matches('meme.create.dosequis', (session, args) => {
        appInsights.getClient().trackEvent("MemeCreated-REGEX");
        var textElements = MemeExtractor.getTextElementArrayFromRegExMeme(session, MemeRegExList[PopularMemeTypes.DosEquisGuy]);
        session.beginDialog('/memes/create', { directmemetype: PopularMemeTypes.DosEquisGuy as number, toptext: textElements[1], bottomtext: textElements[2] });
    })
    .matches('meme.create.onedoesnotsimply', (session, args) => {
        appInsights.getClient().trackEvent("MemeCreated-REGEX");
        var textElements = MemeExtractor.getTextElementArrayFromRegExMeme(session, MemeRegExList[PopularMemeTypes.OneDoesNotSimply]);
        session.beginDialog('/memes/create', { directmemetype: PopularMemeTypes.OneDoesNotSimply as number, toptext: textElements[1], bottomtext: textElements[2] });
    })
    .matches('meme.create.xeverywhere', (session, args) => {
        appInsights.getClient().trackEvent("MemeCreated-REGEX");
        var textElements = MemeExtractor.getTextElementArrayFromRegExMeme(session, MemeRegExList[PopularMemeTypes.XEverywhere]);
        session.beginDialog('/memes/create', { directmemetype: PopularMemeTypes.XEverywhere as number, toptext: textElements[1], bottomtext: textElements[2] });
    })
    .matches('meme.create.nedstark', (session, args) => {
        appInsights.getClient().trackEvent("MemeCreated-REGEX");
        var textElements = MemeExtractor.getTextElementArrayFromRegExMeme(session, MemeRegExList[PopularMemeTypes.NedStarkBrace]);
        session.beginDialog('/memes/create', { directmemetype: PopularMemeTypes.NedStarkBrace as number, toptext: textElements[1], bottomtext: textElements[2] });
    })
    .matches('meme.create.allthethings', (session, args) => {
        appInsights.getClient().trackEvent("MemeCreated-REGEX");
        var textElements = MemeExtractor.getTextElementArrayFromRegExMeme(session, MemeRegExList[PopularMemeTypes.AllTheThings]);
        session.beginDialog('/memes/create', { directmemetype: PopularMemeTypes.AllTheThings as number, toptext: textElements[1], bottomtext: textElements[2] });
    })
    .matches('meme.create.thatwouldbegreat', (session, args) => {
        appInsights.getClient().trackEvent("MemeCreated-REGEX");
        var textElements = MemeExtractor.getTextElementArrayFromRegExMeme(session, MemeRegExList[PopularMemeTypes.ThatWouldBeGreat]);
        session.beginDialog('/memes/create', { directmemetype: PopularMemeTypes.ThatWouldBeGreat as number, toptext: textElements[1], bottomtext: textElements[2] });
    })
    .matches('meme.create.whatifitoldyou', (session, args) => {
        appInsights.getClient().trackEvent("MemeCreated-REGEX");
        var textElements = MemeExtractor.getTextElementArrayFromRegExMeme(session, MemeRegExList[PopularMemeTypes.WhatIfIToldYou]);
        session.beginDialog('/memes/create', { directmemetype: PopularMemeTypes.WhatIfIToldYou as number, toptext: textElements[1], bottomtext: textElements[2] });
    })
    .matches('meme.create.trump', (session, args) => {
        appInsights.getClient().trackEvent("MemeCreated-REGEX");
        var textElements = MemeExtractor.getTextElementArrayFromRegExMeme(session, MemeRegExList[PopularMemeTypes.Trump]);
        session.beginDialog('/memes/create', { directmemetype: PopularMemeTypes.Trump as number, toptext: textElements[1], bottomtext: textElements[2] });
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
        appInsights.getClient().trackEvent("Intent Failure", {message: session.message.text});
        session.send("Not quite sure what you meant there...");
        session.beginDialog('/chitchat/help');
    });


bot.dialog('/', intents);
bot.dialog('/chitchat/greeting', chitchatgreetingdialog);
bot.dialog('/chitchat/help', chitchathelpdialog);
bot.dialog('/chitchat/dismiss', chitchatdimissdialog);
bot.dialog('/memes/create', memecreationdialog);

if (useEmulator) {
    var server = restify.createServer();
    server.listen(3978, function () {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());
} else {
    module.exports = { default: connector.listen() }
}

