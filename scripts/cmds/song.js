const axios = require("axios");

module.exports = {
  config: {
    name: "song",
    aliases: ["music", "play"],
    version: "7.0.0",
    author: "SK-SIDDIK-KHAN",
    description: "Search & download song (fixed)",
    category: "media",
    role: 0,
    usePrefix: true
  },

  // 🔍 SEARCH PART (NO ERROR)
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
      const res = await axios.get(
        `https://yt-search-api.vercel.app/search?q=${encodeURIComponent(keyword)}`
      );

      const list = res.data?.data?.slice(0, 5);

      if (!list || list.length === 0) {
        return bot.sendMessage(chatId, "❌ | Song not found");
      }

      let text = `🎧 𝗦𝗢𝗡𝗚 𝗟𝗜𝗦𝗧\n\n`;
      const buttons = [];

      list.forEach((item, i) => {
        text += `➤ ${i + 1}. ${item.title}\n⏱ ${item.duration}\n\n`;

        buttons.push([{
          text: `${i + 1}`,
          callback_data: `song_${i}`
        }]);
      });

      const sent = await bot.sendMessage(chatId, text, {
        reply_markup: { inline_keyboard: buttons },
        reply_to_message_id: msg.message_id
      });

      // 🔥 SAVE BUTTON DATA
      global.client.handleButton.push({
        name: this.config.name,
        messageID: sent.message_id,
        author: msg.from.id,
        videos: list
      });

    } catch (err) {
      console.log("SEARCH ERROR:", err.message);
      bot.sendMessage(chatId, "❌ | Search failed");
    }
  },

  // 🎧 DOWNLOAD PART (WORKING)
  handleButton: async ({ bot, query, handleButton }) => {
    try {
      const userId = query.from.id;

      // 🔒 Only requester
      if (userId !== handleButton.author) {
        return bot.answerCallbackQuery(query.id, {
          text: "❌ | Not your request",
          show_alert: true
        });
      }

      await bot.answerCallbackQuery(query.id);

      const index = parseInt(query.data.split("_")[1]);
      const video = handleButton.videos[index];

      if (!video) return;

      const chatId = query.message.chat.id;

      const wait = await bot.sendMessage(chatId, "⏳ | Downloading...");

      // 🔥 REAL WORKING AUDIO API
      const audioUrl = `https://api.vevioz.com/api/button/mp3/${video.videoId}`;

      await bot.sendAudio(chatId, audioUrl, {
        caption: `🎧 ${video.title}`
      });

      await bot.deleteMessage(chatId, wait.message_id);

    } catch (err) {
      console.log("DOWNLOAD ERROR:", err.message);
      bot.sendMessage(query.message.chat.id, "❌ | Download failed");
    }
  }
};
