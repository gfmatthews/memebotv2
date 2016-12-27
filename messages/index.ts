/*-----------------------------------------------------------------------------
This template demonstrates how to use Waterfalls to collect input from a user using a sequence of steps.
For a complete walkthrough of creating this type of bot see the article at
https://docs.botframework.com/en-us/node/builder/chat/dialogs/#waterfall
-----------------------------------------------------------------------------*/
"use strict";
import builder = require("botbuilder");
import botbuilder_azure = require("botbuilder-azure");
var restify = require('restify');

import { chitchatgreetingdialog } from './dialogs/chitchat';
import { chitchathelpdialog } from './dialogs/chitchat';
import { chitchatdimissdialog } from './dialogs/chitchat';

import { memecreationdialog } from './dialogs/memecreate';

var useEmulator = (process.env.NODE_ENV == 'development');

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector(<any>{
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector);

// Make sure you add code to validate these fields
var luisAppId = process.env.LuisAppId;
var luisAPIKey = process.env.LuisAPIKey;
var luisAPIHostName = process.env.LuisAPIHostName || 'api.projectoxford.ai';

const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v1/application?id=' + luisAppId + '&subscription-key=' + luisAPIKey;

// Main dialog with LUIS
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
var intents = new builder.IntentDialog({ recognizers: [recognizer] })
    /*
    .matches('<yourIntent>')... See details at http://docs.botframework.com/builder/node/guides/understanding-natural-language/
    */
    .matches('None', (session, args) => {
        session.send('Hi! This is the None intent handler. You said: \'%s\'.', session.message.text);
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
    } )
    .onDefault((session) => {
        session.send('Sorry, I did not understand \'%s\'.', session.message.text);
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
