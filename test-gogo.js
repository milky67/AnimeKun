const axios = require('axios');
const cheerio = require('cheerio');

(async () => {
    try {
        const res = await axios.get('https://anitaku.pe/category/naruto');
        const $ = cheerio.load(res.data);
        const movie_id = $('#movie_id').val();
        const alias = $('#alias_anime').val();
        console.log({ movie_id, alias });
        
        const epData = await axios.get(`https://ajax.gogocdn.net/ajax/load-list-episode?ep_start=0&ep_end=3000&id=${movie_id}&default_ep=0&alias=${alias}`);
        const ep$ = cheerio.load(epData.data);
        console.log("Episodes found:", ep$('li a').length);
    } catch(e) {
        console.error(e.message);
    }
})();
