import * as cheerio from 'cheerio';
import * as fs from 'fs';

const html = fs.readFileSync('gogo.html', 'utf8');
const $ = cheerio.load(html);
let episodes = [];
$('#episode_related li a').each((_, el) => {
  const epHref = $(el).attr('href')?.trim();
  const epNum = $(el).find('.name').text().replace('EP', '').trim();
  if (epHref) {
    episodes.push({
      number: parseFloat(epNum),
      id: epHref.replace('/', '')
    });
  }
});
episodes.sort((a, b) => (a.number || 0) - (b.number || 0));
console.log("Found eps:", episodes.length);
if (episodes.length) console.log("First:", episodes[0], "Last:", episodes[episodes.length-1]);
