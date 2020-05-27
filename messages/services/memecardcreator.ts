import * as builder from "botbuilder";
import * as botbuilder_azure from "botbuilder-azure";

export class MemeCardCreationService {

    private CreatedMemeResponses: string[];

    constructor() {
;

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

    public createThumbnailCard(session, imgurl) {
        return new builder.ThumbnailCard(session)
            .title(this.CreatedMemeResponses[Math.floor(Math.random() * this.CreatedMemeResponses.length)])
            .subtitle(imgurl)
            .text("")
            .images(this.getCardImages(session, imgurl))
            .buttons(this.getCardActions(session, imgurl));
    }

    private getCardImages(session, imgurl) {
        return [
            builder.CardImage.create(session, imgurl)
        ];
    }

    private getCardActions(session, imgurl) {
        return [
            builder.CardAction.openUrl(session, imgurl, 'Open in Browser')
        ];
    }


}