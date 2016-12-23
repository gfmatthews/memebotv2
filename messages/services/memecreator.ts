import imgflipperapi = require('imgflipper');

export class MemeCaptionService {
    private username: string;
    private password: string;
    private imgflipper;

    constructor()
    {
        this.username = "GeorgeMatthews";
        this.password = "aoX8rZfIk27869v";
        this.imgflipper = new imgflipperapi(this.username, this.password);
    }

    /// wrapper for meme creation
    public GenerateResultForMemeCreate(memetype: number, toptext: string, bottomtext: string, callback: (return_url)=> void)
    {
        this.imgflipper.generateMeme(memetype, toptext, bottomtext, (err, url) => {
          callback(url);
        });
    }

    
}