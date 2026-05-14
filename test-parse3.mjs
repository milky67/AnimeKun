import * as cheerio from 'cheerio';
import * as fs from 'fs';
const html = fs.readFileSync('gogo.html', 'utf8');
const $ = cheerio.load(html);
console.log("Anime details size:", $('.anime_info_body_bg').length);
console.log("Episode page size:", $('#episode_page').length);
console.log("Any data-id:", $('[data-id]').length);
console.log("A tags with eps:", $('a.active').attr('ep_start'));
console.log("Look in script tags:");
$('script').each((i, el) => {
    const text = $(el).text();
    if (text.includes('episode')) {
        console.log(text.substring(0, 50));
    }
});
console.log("Look for hidden elements:", $('input[type="hidden"]').length);

let idMatch = html.match(/id\s*=\s*['"]?(\d+)['"]?/);
console.log("ID match digits:", idMatch ? idMatch[1] : null);
