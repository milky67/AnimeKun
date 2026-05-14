const axios = require("axios");
const cheerio = require("cheerio");

async function run() {
  const response = await axios.get("https://anitaku.to/category/naruto");
  const html = response.data;
  
  // Try to find movie_id
  const match = html.match(/movie_id\s*["']?\s*:\s*["']?(\d+)/) || html.match(/class=["'][^"']*movie_id[^"']*["']\s+value=["'](\d+)["']/);
  console.log("Regex match 1:", match ? match[1] : "not found");

  const match2 = html.match(/id=["']movie_id["']\s+value=["'](\d+)["']/);
  console.log("Regex match 2:", match2 ? match2[1] : "not found");
  
  const match3 = html.match(/<input[^>]+id=["']movie_id["'][^>]*>/);
  console.log("Raw input:", match3 ? match3[0] : "not found");
}
run();
