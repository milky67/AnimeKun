const urls = [
  "https://aniwatch-api-v1-0.onrender.com/api/v2/hianime/home",
  "https://api.consumet.org/meta/anilist/trending",
  "https://api.enime.moe/popular",
  "https://api.kamyroll.tech/",
  "https://api.jikan.moe/v4/top/anime"
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
