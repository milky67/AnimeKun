import * as cheerio from 'cheerio';
import * as fs from 'fs';
const html = fs.readFileSync('gogo.html', 'utf8');
const $ = cheerio.load(html);
console.log($('#episode_related').html());
