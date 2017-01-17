import builder = require("botbuilder");
import botbuilder_azure = require("botbuilder-azure");
import appInsights = require("applicationinsights");
appInsights.setup(process.env['BotDevAppInsightKey']).start();

import { MemetypeExtractor } from '../services/memetypeextractor';
import { PopularMemeTypes } from '../services/memetypeextractor';
var MemeExtractor = new MemetypeExtractor();

import { MemeCaptionService } from '../services/memecreator';
import { MemeCardCreationService } from '../services/memecardcreator';
var captionService = new MemeCaptionService();

export var memecreationdialog =
    [
        function (session, args, next) {
            session.sendTyping();
            var toptext;
            var alternatetextsuggestion;

            // Three things to extract from our arguments, type, bottomtext, and toptext
            // Strateg(ER)y - determine if the arguments were passed as part of a direct meme type,
            // if not, then look in the entities to see if anything is there

            /// -- EXTRACT FROM REGEX
            // coming from a reg ex intent that we know about.  In those instances this field will be
            // filled in so it's a good indicator
            if (args.directmemetype) {
                session.privateConversationData["memetypeentity"] = args.directmemetype;
                session.privateConversationData["bottomtextentity"] = args.bottomtext;
                toptext = args.toptext;
            }

            /// -- NO REGEX, EXTRACT FROM ENTITY RECCOMENDATIONS
            else if (args.entities) {
                    session.privateConversationData["memetypeentity"] = MemeExtractor.getMemeFromEntityList(args.entities);
                    session.privateConversationData["bottomtextentity"] = builder.EntityRecognizer.findEntity(args.entities, 'meme.creation.text::bottomtext').entity;
                    var toptextentity = builder.EntityRecognizer.findEntity(args.entities, 'meme.creation.text::toptext').entity;
                }

            /// -- TYPE NOT FOUND, GENERATE RANDOM ONE
            if (!session.privateConversationData["memetypeentity"]) {
                session.privateConversationData["memetypeentity"] = MemeExtractor.getRandomMemeType();
            }

            /// -- NO TEXT FOUND, CHECK OTHER FIELD
            if (!toptext && !session.privateConversationData["bottomtextentity"]) {
                // The entity recognizer to find entities only will find things if you match the type EXACTLY.  That's right,
                // it won't match sub-classed entities if you specify the top level.  Anyway, pertinent info here because we
                // look at the text field in case bottomtext and top text are not filled in.  If it is, we'll just make the meme
                // with that text.
                session.privateConversationData["bottomtextentity"] = builder.EntityRecognizer.findEntity(args.entities, 'meme.creation.text');
                alternatetextsuggestion = "";
                toptext = "";
            }

            if (!toptext && !alternatetextsuggestion) {
                builder.Prompts.text(session, "On the top of the meme?  Say SKIP to skip this part.");
            } else {
                next({ response: toptext });
            }

        },
        // Extract top text entity
        function (session, results, next) {
            if (results.response) {
                if (results.response == 'SKIP') {
                    // we tell the user that typing 'c' will skip captioning this part
                    session.privateConversationData["toptext"] = "";
                }
                else {
                    session.privateConversationData["toptext"] = results.response;
                }
            } else {
                session.send("Ok");
            }

            // check if user entered a bottom text prediction, if no, prompt for it
            if (!session.privateConversationData["bottomtextentity"]) {
                builder.Prompts.text(session, "On the bottom of the meme? BTW, you can respond with the word SKIP to ignore this section");
            } else {
                next({ response: session.privateConversationData["bottomtextentity"] });
            }
        },
        // Extract bottom text entity
        function (session, results) {
            session.sendTyping();
            if (results.response) {
                if (results.response == 'SKIP') {
                    // we tell the user that typing 'c' will skip captioning this part
                    session.privateConversationData["bottomtext"] = "";
                }
                else {
                    session.privateConversationData["bottomtext"] = results.response;
                }

                var memetype;
                memetype = session.privateConversationData["memetypeentity"] as number;

                captionService.GenerateResultForMemeCreate(memetype, session.privateConversationData["toptext"], session.privateConversationData["bottomtext"], (url) => {
                    if (url) {
                        appInsights.getClient().trackEvent("MemeCreated", { id: memetype, toptext: session.privateConversationData["toptext"], bottomtext: session.privateConversationData["bottomtext"] });
                        var cardCreation = new MemeCardCreationService(session, url);
                        var msg = new builder.Message(session).addAttachment(cardCreation.createThumbnailCard());
                        session.send(msg);
                    }
                    else {
                        appInsights.getClient().trackEvent("MemeCreationFailure");
                        session.send("Ugh, I'm having a rough day working with all these memes today.  Give me a bit maybe and try again later?  Sorry about that.");
                    }
                })
            } else {
                session.send("Ok");
            }
            session.endConversation();
        }

    ];