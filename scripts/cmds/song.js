const axios = require("axios");

module.exports = {
  config: {
    name: "song",
    aliases: ["music", "play"],
    version: "8.0.0",
    author: "SK-SIDDIK-KHAN",
    description: "Direct song download (no button)",
    category: "media",
    role: 0,
    usePrefix: true
  },

  run: async ({ bot, msg, args }) => {
    const chatId = msg.chat.id;
    const keyword = args.join(" ");

    if (!keyword) {
      return bot.sendMessage(chatId,
        "⚠️ | Example: /song Believer",
        { reply_to_message_id: msg.message_id }
      );
    }

    try {
      // 🔍 SEARCH API
      const res = await axios.get(
        `https://yt-search-api.vercel.app/search?q=${encodeURIComponent(keyword)}`
      );

      const video = res.data?.data?.[0];

      if (!video) {
        return bot.sendMessage(chatId, "❌ | Song not found");
      }

      // ⏳ loading msg
      const wait = await bot.sendMessage(chatId, "⏳ | Downloading...");

      // 🎧 AUDIO API
      const audioUrl = `https://api.vevioz.com/api/button/mp3/${video.videoId}`;

      // 🎵 send audio
      await bot.sendAudio(chatId, audioUrl, {
        caption: `🎧 ${video.title}\n⏱ ${video.duration}`
      });

      // ❌ remove loading msg
      await bot.deleteMessage(chatId, wait.message_id);

    } catch (err) {
      console.log("ERROR:", err.message);
      bot.sendMessage(chatId, "❌ | Failed to fetch song");
    }
  }
};
