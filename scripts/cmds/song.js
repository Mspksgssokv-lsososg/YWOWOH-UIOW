const axios = require("axios");
const Youtube = require("youtube-search-api");
const nayan = require("nayan-media-downloaders");

module.exports = {
  config: {
    name: "song",
    aliases: ["a"],
    version: "2.1.0",
    author: "SK-SIDDIK-KHAN",
    category: "media",
    role: 0,
    usePrefix: true
  },

  run: async ({ bot, msg, args }) => {
    const chatId = msg.chat.id;
    const query = args.join(" ");

    if (!query) {
      return bot.sendMessage(chatId, "❌ | Give song name");
    }

    try {
      const wait = await bot.sendMessage(chatId, "🔍 Searching...");

      // 🔎 Search YouTube
      const res = await Youtube.GetListByKeyword(query, false, 1);
      const video = res.items[0];

      if (!video) {
        return bot.sendMessage(chatId, "❌ | No song found");
      }

      const videoUrl = `https://www.youtube.com/watch?v=${video.id}`;

      // 🎧 Download
      const data = await nayan.ytdown(videoUrl);

      const audio = data.data.audio;
      const title = data.data.title;

      await bot.deleteMessage(chatId, wait.message_id);

      await bot.sendAudio(chatId, audio, {
        caption: `🎧 ${title}`
      });

    } catch (err) {
      console.log(err);
      bot.sendMessage(chatId, "❌ | Download failed");
    }
  }
};
