import builder = require("botbuilder");
import botbuilder_azure = require("botbuilder-azure");

export class MemetypeExtractor {
    getMemeFromEntityList(entitylist): number {
        var memetype;

        // is this how every works?
        this.keys.every(function (val: string, ind: number) {
            memetype = builder.EntityRecognizer.findEntity(entitylist, val);
            if (memetype) {
                return false;
            }
            else {
                return true;
            }
        });

        if (memetype) {
            let test = this.dict[memetype.type] as number;
            return test;
        }
        else {
            // we didn't find anything declared in the entity list so we're going to give back something random
            // WHO KNOWS WHAT WE'LL MAKE
            return this.getRandomMemeType();
        }
    }

    getRandomMemeType(): number {
        var randomKey = this.keys[Math.floor(Math.random() * this.keys.length)];
        let test = this.dict[<any>randomKey] as number;
        return test;
    }

    getTextElementArrayFromRegExMeme(session: any, parser: RegExp): Array<string> {
        var textElements = parser.exec(session.message.text);
        return textElements;
    }



    // this object represents a shitty performing dictionary ish thing
    // is there a fastesr way to do this?  yes, there is.
    // am i too lazy right now to write it out?  also yes.
    // <HackathonQualityCode>
    private dict: MemeEntityLookupMap<PopularMemeTypes> = {};
    private keys: String[];
    // </HackathonQualityCode> 

    // AM I JAVASCRIPTING RIGHT YET?
    constructor() {
        this.dict["meme.creation1.type::grumpy_cat"] = PopularMemeTypes.GrumpyCat;
        this.dict["meme.creation1.type::dos_equis_guy"] = PopularMemeTypes.DosEquisGuy;
        this.dict["meme.creation1.type::one_does_not_simply"] = PopularMemeTypes.OneDoesNotSimply;
        this.dict["meme.creation1.type::batman_robin"] = PopularMemeTypes.Batman;
        this.dict["meme.creation1.type::ancient_aliens"] = PopularMemeTypes.AliensGuy;
        this.dict["meme.creation1.type::futurama_fry"] = PopularMemeTypes.FuturamaFry;
        this.dict["meme.creation1.type::x_everywhere"] = PopularMemeTypes.XEverywhere;
        this.dict["meme.creation1.type::first_world_problems"] = PopularMemeTypes.FirstWorldProblems;
        this.dict["meme.creation1.type::brace_yourselves"] = PopularMemeTypes.NedStarkBrace;
        this.dict["meme.creation1.type::doge"] = PopularMemeTypes.Doge;
        this.dict["meme.creation2.type::what_if_i_told_you"] = PopularMemeTypes.WhatIfIToldYou;
        this.dict["meme.creation2.type::that_would_be_great"] = PopularMemeTypes.ThatWouldBeGreat;
        this.dict["meme.creation2.type::picard_facepalm"] = PopularMemeTypes.PicardFacepalm;
        this.dict["meme.creation2.type::oprah_you_get_a"] = PopularMemeTypes.Oprah;
        this.dict["meme.creation2.type::yo_dawg"] = PopularMemeTypes.YoDawg;
        this.dict["meme.creation2.type::aint_nobody_got_time"] = PopularMemeTypes.AintNobodyGotTime;
        this.dict["meme.creation2.type::success_kid"] = PopularMemeTypes.SuccessKid;
        this.dict["meme.creation2.type::grandma_internet"] = PopularMemeTypes.GrandmaInternet;
        this.dict["meme.creation2.type::y_u_no"] = PopularMemeTypes.Y_U_NO;
        this.dict["meme.creation2.type::its_gone"] = PopularMemeTypes.ItsGone;
        this.dict["meme.creation3.type::confession_bear"] = PopularMemeTypes.ConfessionBear;
        this.dict["meme.creation3.type::socially_awkward_awesome"] = PopularMemeTypes.SociallyAwkwardAwesomePenguin;
        // yes i know its mispelled, but its also mispelled in my LUIS model and that's way too much work to re-train and spell right.
        this.dict["meme.creation3.type::philosopraptor"] = PopularMemeTypes.Philosoraptor;
        this.dict["meme.creation3.type::clarity_clarence"] = PopularMemeTypes.ClarityClarence;
        this.dict["meme.creation4.type::all_the_things"] = PopularMemeTypes.AllTheThings;
        this.dict["meme.creation4.type::its_gone"] = PopularMemeTypes.ItsGone;
        this.dict["meme.creation4.type::no_patrick"] = PopularMemeTypes.NoPatrick;
        this.dict["meme.creation4.type::sparta_leonidas"] = PopularMemeTypes.SpartaLeonidas;
        this.dict["meme.creation4.type::skeptical_baby"] = PopularMemeTypes.SkepticalBaby;
        this.dict["meme.creation4.type::dont_you_squidward"] = PopularMemeTypes.DontYouSquidward;
        this.dict["meme.creation4.type::ryan_gosling"] = PopularMemeTypes.RyanGosling;
        this.dict["meme.creation4.type::spiderman_computer"] = PopularMemeTypes.SpidermanComputer;
        this.dict["meme.creation5.type::darth_vader"] = PopularMemeTypes.DarthVader;
        this.dict["meme.creation5.type::embarassed_bunny"] = PopularMemeTypes.EmbarassedBunny;
        this.dict["meme.creation5.type::clippy"] = PopularMemeTypes.Clippy;
        this.dict["meme.creation5.type::i_am_disappoint"] = PopularMemeTypes.IAmDisappoint;
        this.dict["meme.creation5.type::trump"] = PopularMemeTypes.Trump;
        this.dict["meme.creation5.type::hillary"] = PopularMemeTypes.Hillary;
        this.dict["meme.creation5.type::ermergerd"] = PopularMemeTypes.Ermergerd;

        this.keys = ["meme.creation1.type::grumpy_cat",
            "meme.creation1.type::dos_equis_guy",
            "meme.creation1.type::one_does_not_simply",
            "meme.creation1.type::batman_robin",
            "meme.creation1.type::ancient_aliens",
            "meme.creation1.type::futurama_fry",
            "meme.creation1.type::x_everywhere",
            "meme.creation1.type::first_world_problems",
            "meme.creation1.type::brace_yourselves",
            "meme.creation1.type::doge",
            "meme.creation2.type::what_if_i_told_you",
            "meme.creation2.type::that_would_be_great",
            "meme.creation2.type::picard_facepalm",
            "meme.creation2.type::oprah_you_get_a",
            "meme.creation2.type::yo_dawg",
            "meme.creation2.type::aint_nobody_got_time",
            "meme.creation2.type::success_kid",
            "meme.creation2.type::grandma_internet",
            "meme.creation2.type::y_u_no",
            "meme.creation2.type::its_gone",
            "meme.creation3.type::confession_bear",
            "meme.creation3.type::socially_awkward_awesome",
            "meme.creation3.type::philosopraptor",
            "meme.creation3.type::clarity_clarence",
            "meme.creation4.type::all_the_things",
            "meme.creation4.type::its_gone",
            "meme.creation4.type::no_patrick",
            "meme.creation4.type::sparta_leonidas",
            "meme.creation4.type::skeptical_baby",
            "meme.creation4.type::dont_you_squidward",
            "meme.creation4.type::ryan_gosling",
            "meme.creation4.type::spiderman_computer",
            "meme.creation5.type::darth_vader",
            "meme.creation5.type::embarassed_bunny",
            "meme.creation5.type::clippy",
            "meme.creation5.type::i_am_disappoint",
            "meme.creation5.type::trump",
            "meme.creation5.type::hillary",
            "meme.creation5.type::ermergerd"
        ];
    }

}

export enum PopularMemeTypes {
    OneDoesNotSimply = 61579,
    DosEquisGuy = 61532,
    GrumpyCat = 405658,
    AliensGuy = 101470,
    XEverywhere = 347390,
    FuturamaFry = 61520,
    Y_U_NO = 61527,
    NedStarkBrace = 61546,
    PizzaFrenchFry = 100951,
    YoDawg = 101716,
    AmITheOnlyOneAroundHere = 259680,
    WhatIfIToldYou = 100947,
    Doge = 8072285,
    Batman = 438680,
    FirstWorldProblems = 61539,
    ThatWouldBeGreat = 563423,
    PicardFacepalm = 1509839,
    Oprah = 28251713,
    AintNobodyGotTime = 442575,
    SuccessKid = 61544,
    GrandmaInternet = 61556,
    ItsGone = 766986,
    ConfessionBear = 100955,
    SociallyAwkwardAwesomePenguin = 61584,
    Philosoraptor = 61516,
    ClarityClarence = 100948,
    AllTheThings = 61533,
    NoPatrick = 22751625,
    SpartaLeonidas = 195389,
    SkepticalBaby = 101288,
    DontYouSquidward = 101511,
    RyanGosling = 389834,
    SpidermanComputer = 1366993,
    EmbarassedBunny = 33105543,
    DarthVader = 6742540,
    Clippy = 60759575,
    IAmDisappoint = 42752910,
    Trump = 40181531,
    Hillary = 5153844,
    Ermergerd = 7590469,
    NyanCat = 32104452
};

interface MemeEntityLookupMap<T> {
    [K: string]: T;
}


