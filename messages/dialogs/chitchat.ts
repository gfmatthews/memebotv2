import builder = require("botbuilder");
import botbuilder_azure = require("botbuilder-azure");
var restify = require('restify');

export var chitchatgreetingdialog = new builder.SimpleDialog(function (session, results) {
    var GreetingResponses = [
        "HI THERE! I AM THE AMAZING MEMEBOT AND I LOVE TYPING IN ALL CAPS!",
        "Wow! I've been browsing the internet all week and boy are there a lot of memes out there.",
        "It's awesome to see you!  I am back and boy have I gotten some upgrades!",
        "It's a wonderful day to sports isn't it?",
        "Greetings Meme-human, what can I do for you?",
        "Howdy! My master has been really busy tweaking me, I've gotten exposed to a lot more memes lately. What can I make for you?"
    ];
    var response = GreetingResponses[Math.floor(Math.random()*GreetingResponses.length)];
    session.send(response);
    session.endDialog();
});

export var chitchathelpdialog = new builder.SimpleDialog(function (session, results) {
    var HelpResponses = [
                "You can say things like: make a meme of grumpy cat saying i tried to make a meme once it was awful",
                "Try searching for common memes by saying: find me a meme of batman",
                "Just want to see a meme? Try saying: show me doge",
                "Want a protip? Try saying: make a meme of shut up and take my money with new Surface Book? on top and shut up and take my money on the bottom"
    ];
    var response = HelpResponses[Math.floor(Math.random()*HelpResponses.length)];
    session.send(response);
    session.endDialog();
});

export var chitchatdimissdialog = new builder.SimpleDialog(function (session, results) {
    var DismissResponses = [
                "Want me to stop listening? Send me a message with just the word Goodbye",
                "Am I unwanted? Send me a Goodbye to tell me to go away",
                "I get it.  You hate me.  *sniff*.  Send me a Goodbye and I'll go away... I guess...",
                "Done with me so soon? Send me a Goodbye to stop the conversation."
    ];
    var response = DismissResponses[Math.floor(Math.random()*DismissResponses.length)];
    session.send(response);
    session.endDialog();
});

