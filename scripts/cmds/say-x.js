module.exports = {
  config: {
    name: "x",
    aliases: ["sbn", "banglasay"],
    version: "2.0",
    author: "SK-SIDDIK-KHAN",
    role: 0,
    usePrefix: true,
    category: "media",
    guide: "/x <text>"
  },

  onStart: async ({ bot, event, args }) => {
    const axios = require("axios");

    try {
      const chatId = event.chat?.id;
      if (!chatId) return;

      if (!args.length) {
        return bot.sendMessage(chatId, "❌ Please enter a text");
      }

      let text = args.join(" ");
      let lang = "bn"; 

      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(text)}`;

      const res = await axios({
        url,
        method: "GET",
        responseType: "stream",
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      });

      await bot.sendAudio(chatId, res.data, {
        caption: "🗣️ Bangla Voice"
      });

    } catch (err) {
      console.log("❌ TTS error:", err.message);

      bot.sendMessage(
        event.chat?.id,
        "❌ Failed to generate voice"
      );
    }
  }
};