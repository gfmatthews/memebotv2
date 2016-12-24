/*-----------------------------------------------------------------------------
This template demonstrates how to use Waterfalls to collect input from a user using a sequence of steps.
For a complete walkthrough of creating this type of bot see the article at
https://docs.botframework.com/en-us/node/builder/chat/dialogs/#waterfall
-----------------------------------------------------------------------------*/
"use strict";
import builder = require("botbuilder");
import botbuilder_azure = require("botbuilder-azure");
var restify = require('restify');

import { MemeCaptionService } from './services/memecreator';
var captionService = new MemeCaptionService();

import { chitchatgreetingdialog } from './dialogs/chitchat';
import { chitchathelpdialog } from './dialogs/chitchat';
import { chitchatdimissdialog } from './dialogs/chitchat';

import { MemetypeExtractor } from './services/memetypeextractor';
import { PopularMemeTypes } from './services/memetypeextractor';
var MemeExtractor = new MemetypeExtractor();

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
    .matches('meme.create', [
        async function (session, args, next) {
            session.sendTyping();

            session.privateConversationData["memetypeentity"] = await MemeExtractor.getMemeFromEntityList(args.entities);
            session.privateConversationData["bottomtextentity"] = builder.EntityRecognizer.findEntity(args.entities, 'meme.creation.text::bottomtext');
            var toptext = builder.EntityRecognizer.findEntity(args.entities, 'meme.creation.text::toptext');

            if (!toptext) {
                builder.Prompts.text(session, "On the top of the meme?");
            } else {
                next({ response: toptext.entity });
            }

        },
        // Extract top text entity
        function (session, results, next) {
            if (results.response) {
                session.privateConversationData["toptext"] = results.response;
            } else {
                session.send("Ok");
            }

            // check if user entered a bottom text prediction, if no, prompt for it
            if (!session.privateConversationData["bottomtextentity"]) {
                builder.Prompts.text(session, "On the bottom of the meme?");
            } else {
                next({ response: session.privateConversationData["bottomtextentity"].entity });
            }
        },
        // Extract bottom text entity
        function (session, results) {
            if (results.response) {
                session.privateConversationData["bottomtext"] = results.response;

                var memetype;
                if (session.privateConversationData["memetypeentity"] == -1) {
                    memetype = PopularMemeTypes[Math.floor(Math.random() * Object.keys(PopularMemeTypes).length)];
                }
                else {
                    memetype = session.privateConversationData["memetypeentity"] as number;
                }
                captionService.GenerateResultForMemeCreate(memetype, session.privateConversationData["toptext"], session.privateConversationData["bottomtext"], (url) => {
                    session.send("Meme:" + url);
                })
            } else {
                session.send("Ok");
            }
            session.endConversation();
        }

    ])
    .onDefault((session) => {
        session.send('Sorry, I did not understand \'%s\'.', session.message.text);
    });

bot.dialog('/', intents);
bot.dialog('/chitchat/greeting', chitchatgreetingdialog);
bot.dialog('/chitchat/help', chitchathelpdialog);
bot.dialog('/chitchat/dismiss', chitchatdimissdialog);



if (useEmulator) {
    var server = restify.createServer();
    server.listen(3978, function () {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());
} else {
    module.exports = { default: connector.listen() }
}
