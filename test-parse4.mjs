import * as cheerio from 'cheerio';
import * as fs from 'fs';
const html = fs.readFileSync('gogo.html', 'utf8');
const $ = cheerio.load(html);
console.log($('#episode_page').html());
console.log("Anime info:", $('.anime_info_episodes_next').html());
console.log("Movie id input:", $('#movie_id').val());
console.log("Class movie_id:", $('.movie_id').val());
