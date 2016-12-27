import builder = require("botbuilder");
import botbuilder_azure = require("botbuilder-azure");

import { MemetypeExtractor } from '../services/memetypeextractor';
import { PopularMemeTypes } from '../services/memetypeextractor';
var MemeExtractor = new MemetypeExtractor();

import { MemeCaptionService } from '../services/memecreator';
var captionService = new MemeCaptionService();

export var memecreationdialog = 
[
        async function (session, args, next) {
            session.sendTyping();

            session.privateConversationData["memetypeentity"] = await MemeExtractor.getMemeFromEntityList(args.entities);
            session.privateConversationData["bottomtextentity"] = builder.EntityRecognizer.findEntity(args.entities, 'meme.creation.text::bottomtext');
            var toptext = builder.EntityRecognizer.findEntity(args.entities, 'meme.creation.text::toptext');
            var alternatetextsuggestion;

            // 
            if (!toptext && !session.privateConversationData["bottomtextentity"])
            {
                session.privateConversationData["bottomtextentity"] = builder.EntityRecognizer.findEntity(args.entities, 'meme.creation.text');
                alternatetextsuggestion = "";
            }

            if (!toptext && !alternatetextsuggestion) {
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

];