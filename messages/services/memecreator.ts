import imgflipperapi = require('imgflipper');

export class MemeCaptionService {
    username: string;
    password: string;

    constructor()
    {
        this.username = "GeorgeMatthews";
        this.password = "aoX8rZfIk27869v";
    }

    GenerateResultForMemeCreate(memetype: number, toptext: string, bottomtext: string)
    {
        var imgflipper = new imgflipperapi("username", "pass");
        var imgurl: string;
        imgflipper.generateMeme(memetype, toptext, bottomtext, function (err, url) {
            imgurl = url;
        });
        return imgurl;
    }
}