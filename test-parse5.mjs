import * as fs from 'fs';
const html = fs.readFileSync('gogo.html', 'utf8');
const movieMatch = html.match(/movie_id[^\w]([A-Za-z0-9_]+)/i) || html.match(/id:\s*['"]?(\d+)['"]?/);
const idMatch = html.match(/['"]\d+['"]/g);
console.log("matches:", html.match(/id\s*[=:]\s*["']?\d+["']?/ig));
