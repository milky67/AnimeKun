import axios from 'axios';
import * as fs from 'fs';

(async () => {
    try {
        const res = await axios.get('https://anitaku.to/category/naruto');
        fs.writeFileSync('gogo.html', res.data);
    } catch(e) {
        console.error(e.message);
    }
})();
