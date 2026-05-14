import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";

async function run() {
  const targetUrl = "https://anitaku.to/category/naruto";
  const response = await axios.get(targetUrl);
  const $ = cheerio.load(response.data);
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
  console.log("Episodes found:", episodes.length);
}
run();
