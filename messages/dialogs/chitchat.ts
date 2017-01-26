import builder = require("botbuilder");
import botbuilder_azure = require("botbuilder-azure");
var restify = require('restify');

export var chitchatgreetingdialog = new builder.SimpleDialog(function (session, results) {
    session.sendTyping();
    var GreetingResponses = [
        "HI THERE! I AM THE AMAZING MEMEBOT AND I LOVE TYPING IN ALL CAPS!",
        "Wow! I've been browsing the internet all week and boy are there a lot of memes out there.",
        "It's awesome to see you!  I am back and boy have I gotten some upgrades!",
        "It's a wonderful day to sports isn't it?",
        "Greetings Meme-human, what can I do for you?",
        "Howdy! My master has been really busy tweaking me, I've gotten exposed to a lot more memes lately. What can I make for you?"
    ];
    ChooseAndSendResponse(GreetingResponses, session);
});

export var chitchathelpdialog = new builder.SimpleDialog(function (session, results) {
    session.sendTyping();
    var HelpResponses = [
        "You can say things like: make a meme of grumpy cat saying i tried to make a meme once it was awful",
        "Try searching for common memes by saying: find me a meme of batman",
        "Just want to see a meme? Try saying: show me doge",
        "Want a protip? Try saying: make a meme of shut up and take my money with new Surface Book? on top and shut up and take my money on the bottom"
    ];
    ChooseAndSendResponse(HelpResponses, session);
});

export var chitchatdimissdialog = new builder.SimpleDialog(function (session, results) {
    session.sendTyping();
    var DismissResponses = [
        "Want me to stop listening? Send me a message with just the word Goodbye",
        "Am I unwanted? Send me a Goodbye to tell me to go away",
        "I get it.  You hate me.  *sniff*.  Send me a Goodbye and I'll go away... I guess...",
        " ¯\(°_o)/¯"
    ];
    ChooseAndSendResponse(DismissResponses, session);
});

export var chitchatdetailsdialog = new builder.SimpleDialog(function (session, results) {
    session.sendTyping();
    var DetailsResponses = [
        "A meme is magic",
        "Memes are things that you put on Reddit to get karma and self-worth",
        "Funfact: Memes were first created by Richard Dawkins in the book the Selfish Gene"
    ];
    ChooseAndSendResponse(DetailsResponses, session);
});

export var chitchatnaughtydialog = new builder.SimpleDialog(function (session, results) {
    session.sendTyping();
    var DetailsResponses = [
        "whoa there, that's umm... that's not...",
        "wow. not interested",
        "i think that would go against my programming or something",
        "Look, I'm on the clock here and that's a bit NSFW if you get my drift",
        "Uhhhhhhh...",
        "(╯°□°）╯︵ ┻━┻)",
        "ಠ_ಠ"
    ];
    ChooseAndSendResponse(DetailsResponses, session);
});

export var chitchatthanksdialog = new builder.SimpleDialog(function (session, results) {
    session.sendTyping();
    var DetailsResponses = [
        "As long as I can make you laugh",
        "just remember to give me credit",
        "anytime",
        "i did good eh?",
        "great!",
        "( ͡° ͜ʖ ͡°)"
    ];
    ChooseAndSendResponse(DetailsResponses, session);
});

function ChooseAndSendResponse(array, session) {
    var response = array[Math.floor(Math.random() * array.length)];
    session.send(response);
    session.endDialog();
}

