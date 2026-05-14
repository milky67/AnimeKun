import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';

(async () => {
    try {
        const res = await axios.get('https://anitaku.pe/category/naruto');
        fs.writeFileSync('gogo.html', res.data);
        console.log("Wrote HTML");
    } catch(e) {
        console.error(e.message);
    }
})();
