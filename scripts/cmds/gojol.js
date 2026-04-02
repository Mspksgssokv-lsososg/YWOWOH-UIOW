module.exports = {
  config: {
    name: "gojol",
    version: "2.0",
    author: "SK-SIDDIK-KHAN",
    role: 0,
    category: "media",
    guide: "/gojol"
  },

  onStart: async ({ bot, event }) => {
    const axios = require("axios");

    try {
      const chatId = event.chat?.id;
      if (!chatId) return;

      // 🔥 loading msg
      const loading = await bot.sendMessage(chatId, "⏳ Loading Islamic Gojol...");

      const links = [
        "https://drive.google.com/uc?id=1xjyq3BrlW3bGrp8y7eedQSuddCbdvLMN",
        "https://drive.google.com/uc?id=1CCQqJVqvFsgyAd4ZjZB0BJ3lGN4Kc2l2",
        "https://drive.google.com/uc?id=1xnht0PdBt9DnLGzW7GmJUTsTIJnxxByo",
        "https://drive.google.com/uc?id=1CDCa4AlqErr1b7JRNWL62AP0WtdjlSOE",
        "https://drive.google.com/uc?id=1yK0A3lyIJoPRp6g3UjNrC31n0yLfc1Ht",
        "https://drive.google.com/uc?id=1ySwrEG6xVqPdY5BcBP8I3YFCUOX4jV9e",
        "https://drive.google.com/uc?id=1CESeRi5Ue4HR6GSDfYJrREGGcsvYJvAB"
      ];

      const audioURL = links[Math.floor(Math.random() * links.length)];

      // 🔥 download stream
      const res = await axios({
        url: audioURL,
        method: "GET",
        responseType: "stream",
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      });

      // 🔥 send audio
      await bot.sendAudio(chatId, res.data, {
        caption: "🎧 Islamic Gojol"
      });

      // 🔥 delete loading msg
      bot.deleteMessage(chatId, loading.message_id).catch(() => {});

    } catch (err) {
      console.log("❌ gojol error:", err.message);

      bot.sendMessage(
        event.chat?.id,
        "❌ Failed to load audio!"
      );
    }
  }
};