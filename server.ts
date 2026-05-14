import express from "express";
import path from "path";
import axios from "axios";
import * as cheerio from "cheerio";

axios.defaults.headers.common['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36';
axios.defaults.headers.common['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8';
axios.defaults.headers.common['Accept-Language'] = 'en-US,en;q=0.5';

// Use a working gogoanime proxy or URL
process.env.BASE_URL = process.env.BASE_URL || "https://anitaku.to";

function patchAxios(instance) {
  if (!instance || !instance.interceptors) return;
  instance.interceptors.response.use(
    async (response) => {
      const data = response.data;
      if (typeof data === "string" && data.includes("window.location.replace(")) {
        const match = data.match(/window\.location\.replace\(['"]([^'"]+)['"]\)/);
        if (match && match[1]) {
          console.log(`[Redirect] Following JS redirect to ${match[1]}`);
          return await instance.get(match[1], { ...response.config });
        }
      }
      return response;
    },
    (error) => Promise.reject(error)
  );
}

// Patch main axios
patchAxios(axios);

const app = express();
const PORT = Number(process.env.PORT || 3000);

const apiRouter = express.Router();

// Custom Scraper API
// Scraper for Recent Episodes (Home Page)
apiRouter.get("/anime/recent", async (req, res) => {
    try {
      const page = req.query.page || 1;
      const type = req.query.type || 1; // 1: Recent, 2: Popular
      const targetUrl = `${process.env.BASE_URL}/?page=${page}&type=${type}`;
      const response = await axios.get(targetUrl);
      const $ = cheerio.load(response.data);
      const results: any[] = [];
      
      $('.last_episodes ul.items li').each((_, el) => {
        const title = $(el).find('.name a').attr('title') || $(el).find('.name a').text();
        const href = $(el).find('.name a').attr('href') || "";
        const id = href.split('-episode-')[0].replace('/', '');
        const episode = $(el).find('.episode').text().replace('Episode ', '').trim();
        const img = $(el).find('.img a img').attr('src');
        if (id) results.push({ id, title, img, episode });
      });
      
      res.json(results);
    } catch (err: any) {
      console.error("Recent Error:", err.message);
      res.status(500).json({ error: "Failed to fetch recent anime" });
    }
  });

  // Scraper for Search & Directory
  apiRouter.get("/anime/search", async (req, res) => {
    try {
      const q = req.query.q;
      const page = req.query.page || 1;
      const type = req.query.type;
      const genre = req.query.genre; // using genreName
      
      let targetUrl = `${process.env.BASE_URL}/search.html?keyword=${encodeURIComponent(q as string)}&page=${page}`;
      
      if (genre) {
        // e.g., /genre/action?page=1
        targetUrl = `${process.env.BASE_URL}/genre/${encodeURIComponent(String(genre).toLowerCase().replace(/\s+/g, '-'))}?page=${page}`;
      } else if (type === 'movie') {
        targetUrl = `${process.env.BASE_URL}/anime-movies.html?page=${page}`;
      } else if (type === 'seasonal') {
        targetUrl = `${process.env.BASE_URL}/new-season.html?page=${page}`;
      } else if (!q) {
        // Fallback to popular if no query so UI isn't empty
        targetUrl = `${process.env.BASE_URL}/popular.html?page=${page}`;
      }
      
      const response = await axios.get(targetUrl);
      const $ = cheerio.load(response.data);
      const results: any[] = [];
      
      $('.last_episodes ul.items li').each((_, el) => {
        const title = $(el).find('.name a').attr('title') || $(el).find('.name a').text();
        const href = $(el).find('.name a').attr('href') || "";
        const id = href.replace('/category/', '');
        const img = $(el).find('.img a img').attr('src');
        const released = $(el).find('.released').text().replace('Released:', '').trim();
        if (id) results.push({ id, title, img, released });
      });
      
      res.json(results);
    } catch (err: any) {
      console.error("Search Error:", err.message);
      res.status(500).json({ error: "Failed to search anime" });
    }
  });

  // Scraper for Popular Anime (Top)
  apiRouter.get("/anime/popular", async (req, res) => {
    try {
      const page = req.query.page || 1;
      const targetUrl = `${process.env.BASE_URL}/popular.html?page=${page}`;
      const response = await axios.get(targetUrl);
      const $ = cheerio.load(response.data);
      const results: any[] = [];
      
      $('.last_episodes ul.items li').each((_, el) => {
        const title = $(el).find('.name a').attr('title') || $(el).find('.name a').text();
        const href = $(el).find('.name a').attr('href') || "";
        const id = href.replace('/category/', '');
        const img = $(el).find('.img a img').attr('src');
        const released = $(el).find('.released').text().replace('Released:', '').trim();
        if (id) results.push({ id, title, img, released });
      });
      
      res.json(results);
    } catch (err: any) {
      console.error("Popular Error:", err.message);
      res.status(500).json({ error: "Failed to fetch popular anime" });
    }
  });

  // Scraper for Anime Details
  apiRouter.get("/anime/details/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const targetUrl = `${process.env.BASE_URL}/category/${id}`;
      const response = await axios.get(targetUrl);
      const $ = cheerio.load(response.data);
      
      const animeInfo = $('.anime_info_body_bg');
      const title = animeInfo.find('h1').text().trim();
      const img = animeInfo.find('img').attr('src');
      
      const p = animeInfo.find('p.type');
      const type = $(p[0]).find('a').text().trim();
      const synopsis = animeInfo.find('.description').text().replace('Plot Summary: ', '').trim();
      const genres: string[] = [];
      $(p[2]).find('a').each((_, el) => {
        genres.push($(el).text().replace(',', '').trim());
      });
      const released = $(p[3]).text().replace('Released:', '').trim();
      const status = $(p[4]).text().replace('Status:', '').trim();
      const otherNames = $(p[5]).text().replace('Other name:', '').trim();

      // For episodes, Gogoanime loads them dynamically usually, 
      // but they are often listed in the page source as a list or reachable.
      // We can get the episode range from the #episode_page list
      const epStart = $('#episode_page li a').first().attr('ep_start') || "0";
      const epEnd = $('#episode_page li a').last().attr('ep_end') || "0";

      let episodes: any[] = [];
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
      // Episodes are usually in reverse order (newest first) for some pages, 
      // but if we look at the HTML dump they were 1, 2, 3 going down. 
      // Actually let's just make sure they are sorted ascending by number.
      episodes.sort((a, b) => (a.number || 0) - (b.number || 0));

      res.json({
        id,
        title,
        img,
        type,
        synopsis,
        genres,
        released,
        status,
        otherNames,
        episodes
      });
    } catch (err: any) {
      console.error("Details Error:", err.message);
      res.status(500).json({ error: "Failed to fetch anime details" });
    }
  });

  apiRouter.get("/anime/watch/:id/:episode", async (req, res) => {
    try {
      const { id, episode } = req.params;
      const targetUrl = `${process.env.BASE_URL}/${id}-episode-${episode}`;
      console.log(`Fetching stream from: ${targetUrl}`);
      
      const response = await axios.get(targetUrl);
      const $ = cheerio.load(response.data);
      const servers: any[] = [];
      
      $('.anime_muti_link ul li a').each((_, el) => {
        const name = $(el).text().replace('Choose this server', '').trim();
        let url = $(el).attr('data-video');
        if (url) {
          if (url.startsWith('//')) url = 'https:' + url;
          servers.push({ name, url });
        }
      });
      
      res.json({ servers });
    } catch (err: any) {
      console.error("Watch Error:", err.message);
      res.status(500).json({ error: "Failed to fetch stream links" });
    }
  });

  // API Route for health
  apiRouter.get("/health", (req, res) => {
    res.json({ status: "ok", base: process.env.BASE_URL });
  });

  app.use("/api", apiRouter);

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Only start the server directly if executed as a standalone script
// This prevents the server from listening when imported in Vercel/Netlify functions
const isCjsMain = typeof require !== 'undefined' && require.main === module;
const isEsmMain = process.argv[1] && (process.argv[1].endsWith('server.ts') || process.argv[1].endsWith('server.cjs'));

if (isCjsMain || isEsmMain) {
  startServer();
}

export default app;
