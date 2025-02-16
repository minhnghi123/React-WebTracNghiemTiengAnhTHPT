import { ENV_VARS } from "../config/envVars.config.js";

import axios from "axios";

export const getYoutubeVideos = async (topic) => {
  console.log(topic);
  const query = encodeURIComponent("Dang bai tap tieng anh " + topic);
  const youtubeUrl = `${ENV_VARS.YOUTUBE_API_URL}=${query}&key=${ENV_VARS.YOUTUBE_API_KEY}`;

  const response = await axios.get(youtubeUrl);
  return response.data.items.map((item) => ({
    title: item.snippet.title,
    videoId: item.id.videoId,
    thumbnail: item.snippet.thumbnails.default.url,
    linkUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
  }));
  //   return response;
};
