const fs = require("fs");
const path = require("path");
const axios = require("axios");
const nayan = require("nayan-media-downloaders");
const Youtube = require("youtube-search-api");

module.exports = {
  config: {
    name: "song",
    aliases: ["a"],
    prefix: true,
    permission: 0,
    description: "Direct song download (no button).",
  },

  start: async function ({ api, event }) {
    const keyword = event.body?.split(" ").slice(1).join(" ");

    if (!keyword) {
      return api.sendMessage(
        event.threadId,
        "⚠️ Please provide a song name.\nExample: song Believer",
        { reply_to_message_id: event.msg.message_id }
      );
    }

    try {
      // 🔍 YouTube search
      const results = await Youtube.GetListByKeyword(keyword, false, 1);
      const video = results.items?.[0];

      if (!video) {
        return api.sendMessage(event.threadId, "❌ No results found.", {
          reply_to_message_id: event.msg.message_id,
        });
      }

      const videoUrl = `https://www.youtube.com/watch?v=${video.id}`;

      const waitMsg = await api.sendMessage(
        event.threadId,
        "⏳ Downloading audio...",
        { reply_to_message_id: event.msg.message_id }
      );

      // 🎧 download using nayan api
      const data = await nayan.ytdown(videoUrl);

      const audioUrl = data?.data?.audio;
      const title = data?.data?.title || video.title;

      if (!audioUrl) {
        throw new Error("No audio URL");
      }

      const cacheDir = path.join(__dirname, "Nayan");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

      const filePath = path.join(cacheDir, `song_${Date.now()}.mp3`);
      const writer = fs.createWriteStream(filePath);

      const res = await axios.get(audioUrl, { responseType: "stream" });
      res.data.pipe(writer);

      writer.on("finish", async () => {
        await api.deleteMessage(event.threadId, waitMsg.message_id);

        await api.sendAudio(event.threadId, filePath, {
          caption: `🎧 ${title}`,
          reply_to_message_id: event.msg.message_id,
        });

        fs.unlinkSync(filePath);
      });

    } catch (err) {
      console.log("ERROR:", err);
      api.sendMessage(
        event.threadId,
        "❌ Failed to download audio.",
        { reply_to_message_id: event.msg.message_id }
      );
    }
  }
};
