import axios from 'axios';
import * as cheerio from 'cheerio';

(async () => {
    try {
        const res = await axios.get('https://anitaku.to/category/naruto');
        const $ = cheerio.load(res.data);
        const movie_id = $('#movie_id').val();
        const alias = $('#alias_anime').val();
        console.log({ movie_id, alias });
        
        let epLoadUrl = null;
        $('script').each((i, el) => {
            const html = $(el).html();
            if (html && html.includes('load-list-episode')) {
                const match = html.match(/(https?:\/\/[^\/"]+\/ajax\/load-list-[^"'\s]+)/);
                if (match) {
                    epLoadUrl = match[1];
                }
            }
        });
        console.log("Found load URL:", epLoadUrl);
    } catch(e) {
        console.error(e.message);
    }
})();
