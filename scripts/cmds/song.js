const fs = require("fs");
const path = require("path");
const axios = require("axios");
const nayan = require("nayan-media-downloaders");
const Youtube = require("youtube-search-api");

module.exports = {
  config: {
    name: "song",
    aliases: ["a"],
    role: 0,
    description: "Direct song download (no button)",
    usePrefix: true
  },

  run: async function ({ bot, msg, args }) {
    const chatId = msg.chat.id;
    const keyword = args.join(" ");

    if (!keyword) {
      return bot.sendMessage(chatId,
        "⚠️ | Example: /song Believer",
        { reply_to_message_id: msg.message_id }
      );
    }

    try {
      // 🔍 search
      const results = await Youtube.GetListByKeyword(keyword, false, 1);
      const video = results.items?.[0];

      if (!video) {
        return bot.sendMessage(chatId, "❌ | Song not found");
      }

      const videoUrl = `https://www.youtube.com/watch?v=${video.id}`;

      const wait = await bot.sendMessage(chatId, "⏳ | Downloading...");

      // 🎧 download
      const data = await nayan.ytdown(videoUrl);

      const audioUrl = data?.data?.audio;
      const title = data?.data?.title || video.title;

      if (!audioUrl) throw new Error("No audio");

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

      const filePath = path.join(cacheDir, `song_${Date.now()}.mp3`);
      const writer = fs.createWriteStream(filePath);

      const res = await axios.get(audioUrl, { responseType: "stream" });
      res.data.pipe(writer);

      writer.on("finish", async () => {
        await bot.deleteMessage(chatId, wait.message_id);

        await bot.sendAudio(chatId, filePath, {
          caption: `🎧 ${title}`
        });

        fs.unlinkSync(filePath);
      });

    } catch (err) {
      console.log("ERROR:", err);
      bot.sendMessage(chatId, "❌ | Download failed");
    }
  }
};
