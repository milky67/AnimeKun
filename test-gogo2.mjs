import axios from 'axios';
import * as cheerio from 'cheerio';

(async () => {
    try {
        const res = await axios.get('https://anitaku.pe/category/naruto');
        const $ = cheerio.load(res.data);
        const movie_id = $('#movie_id').val();
        const alias = $('#alias_anime').val();
        const default_ep = $('#default_ep').val();
        
        console.log("Movie_id:", movie_id);
        console.log("Alias:", alias);
        
        // Let's print out scripts in the page to find where it loads episodes
        let epLoadUrl = null;
        $('script').each((i, el) => {
            const html = $(el).html();
            if (html && html.includes('load-list-episode')) {
                const match = html.match(/(https?:\/\/[^\/]+\/ajax\/load-list-episode)/);
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
