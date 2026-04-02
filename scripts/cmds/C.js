module.exports = {
  config: {
    name: "aniblur",
    aliases: [],
    version: "1.0",
    author: "SK-SIDDIK-KHAN",
    role: 0,
    category: "fun",
    guide: "/aniblur"
  },

  onStart: async ({ bot, event }) => {
    const axios = require("axios");

    try {
      const chatId = event.chat.id;

      const links = [
        "https://i.postimg.cc/QdzSzcM1/image.jpg",
        "https://i.postimg.cc/QCSJJTPB/ros.jpg",
        "https://i.postimg.cc/v8PP9Rd0/distorted.jpg"
      ];

      const imgURL = links[Math.floor(Math.random() * links.length)];

      const res = await axios({
        url: imgURL,
        method: "GET",
        responseType: "stream"
      });

      await bot.sendPhoto(chatId, res.data, {
        caption: "🔰 Aniblur Pic 🔰"
      });

    } catch (e) {
      bot.sendMessage(event.chat.id, "❌ Error");
    }
  }
};
