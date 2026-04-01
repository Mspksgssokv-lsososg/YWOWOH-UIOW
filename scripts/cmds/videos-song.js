const fs = require("fs");
const path = require("path");
const axios = require("axios");
const nayan = require("nayan-media-downloaders");
const Youtube = require("youtube-search-api");

module.exports = {
  config: {
    name: "video",
    aliases: ["videos", "yt"],
    author: "SK-SIDDIK-KHAN",
    role: 0,
    description: "Direct video download",
    usePrefix: true
  },

  run: async function ({ bot, msg, args }) {
    const chatId = msg.chat.id;
    const keyword = args.join(" ");

    if (!keyword) {
      return bot.sendMessage(chatId,
        "⚠️ | Example: /video Believer",
        { reply_to_message_id: msg.message_id }
      );
    }

    try {
      const results = await Youtube.GetListByKeyword(keyword, false, 1);
      const video = results.items?.[0];

      if (!video) {
        return bot.sendMessage(chatId, "❌ | Video not found");
      }

      const videoUrl = `https://www.youtube.com/watch?v=${video.id}`;

      const wait = await bot.sendMessage(chatId, "⏳ | Downloading video...");

      const data = await nayan.ytdown(videoUrl);

      const videoLink = data?.data?.video; 
      const title = data?.data?.title || video.title;

      if (!videoLink) throw new Error("No video");

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

      const filePath = path.join(cacheDir, `video_${Date.now()}.mp4`);
      const writer = fs.createWriteStream(filePath);

      const res = await axios.get(videoLink, { responseType: "stream" });
      res.data.pipe(writer);

      writer.on("finish", async () => {
        await bot.deleteMessage(chatId, wait.message_id);

        await bot.sendVideo(chatId, filePath, {
          caption: `🎬 ${title}`
        });

        fs.unlinkSync(filePath);
      });

    } catch (err) {
      console.log("ERROR:", err);
      bot.sendMessage(chatId, "❌ | Download failed");
    }
  }
};
