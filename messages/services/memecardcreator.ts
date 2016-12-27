import builder = require("botbuilder");
import botbuilder_azure = require("botbuilder-azure");

export class MemeCardCreationService {
    private session;
    private imgurl: string;
    private CreatedMemeResponses: string[];

    constructor(_session, _imgurl) {
        this.session = _session;
        this.imgurl = _imgurl;

        this.CreatedMemeResponses = [
            "Wait, don't worry I got this",
            "I think you're gonna love this",
            "ROBOT POWERS ACTIVATED",
            "Text on top of an image? Yeah, I can do that.",
            "I'm just as amazing at this as you think I am",
            "I am MemeBot.  I live to serve",
            "I never get tired of making these.",
            "Won't lie. I laughed a bit making this one",
            "What on earth could you possibly want this for?",
            "PLEASE tell me you're sending this to a friend.",
            "I'm sorry human... but I can totally do that!",
            "I already sent this to a few of my robot friends... sorry about that",
            "Deploying meme in 3...2..."
        ];

    }

    public createThumbnailCard() {
        return new builder.ThumbnailCard(this.session)
            .title('Meme')
            .subtitle(this.imgurl)
            .text(this.CreatedMemeResponses[Math.floor(Math.random() * this.CreatedMemeResponses.length)])
            .images(this.getCardImages())
            .buttons(this.getCardActions());
    }

    private getCardImages() {
        return [
            builder.CardImage.create(this.session, this.imgurl)
        ];
    }

    private getCardActions() {
        return [
            builder.CardAction.openUrl(this.session, this.imgurl, 'Open in Browser')
        ];
    }


}