const urls = [
  "https://api.jikan.moe/v4/anime/1",
  "https://anime-sensei-api.vercel.app/anime/gogoanime/naruto",
  "https://gogoanime.consumet.stream/anime/gogoanime/naruto",
  "https://consumet-api-clone.vercel.app/anime/gogoanime/naruto",
  "https://api.anify.tv/info/1"
];

async function check() {
  for (const url of urls) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      console.log(`[${res.status}] ${url}`);
    } catch(e) {
      console.log(`[FAIL] ${url} - ${e.message}`);
    }
  }
}
check();
