module.exports = {
  config: {
    name: "dj",
    version: "2.0",
    author: "SK-SIDDIK-KHAN",
    role: 0,
    usePrefix: true,
    category: "media",
    guide: "/dj"
  },

  onStart: async ({ bot, event }) => {
    const axios = require("axios");

    try {
      const chatId = event.chat?.id;
      if (!chatId) return;

      const loading = await bot.sendMessage(chatId, "Loading Dj Audio... Please Wait ⏰");

      const links = [
        "https://drive.google.com/uc?id=1C4XLaxrHJwcwT-uEMdzZb4Y-oQ98nS0p",
        "https://drive.google.com/uc?id=1B9VwVFRw-d2r__HTyGxfin3r6QFdGN9K",
        "https://drive.google.com/uc?id=1B9gArnCkpo1801TjiSAuvlVtAdIQP57k",
        "https://drive.google.com/uc?id=1C0iPpXrTWvBOqkKDEEwSo9i7u_9AVyg8",
        "https://drive.google.com/uc?id=1BDIcusE7B9jELmr6lvciFP-puWfy3WXs",
        "https://drive.google.com/uc?id=1C04Pul6GTyzfOQlRLmDk8eGK9z-q3BmA",
        "https://drive.google.com/uc?id=1BNH2gUTtD5zBaTnMDY08pQ4CIGq3Lriw",
        "https://drive.google.com/uc?id=1BUYSSL8poh9icrlp3YOTV5IiYrn7iHAW",
        "https://drive.google.com/uc?id=1BwqorvYxglPa6vptXlLXpI92g3LZBG9C",
        "https://drive.google.com/uc?id=1BbVCsUECiAcZBG95CYuobYpg-wTNtrTL",
        "https://drive.google.com/uc?id=1BSnn0ku6C0DYdlFtnErqKDOuAWhdqmBJ",
        "https://drive.google.com/uc?id=1BYSqt8wKUkZnULVq_W-5O2jC4O-mfLSA"
      ];

      const audioURL = links[Math.floor(Math.random() * links.length)];

      const res = await axios({
        url: audioURL,
        method: "GET",
        responseType: "stream",
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      });

      await bot.sendAudio(chatId, res.data, {
        caption: "[ 🅓🅙-🅜🅤🅢🅘🅒 ]"
      });

      bot.deleteMessage(chatId, loading.message_id).catch(() => {});

    } catch (err) {
      console.log("❌ dj error:", err.message);

      bot.sendMessage(
        event.chat?.id,
        "❌ Failed to load DJ music"
      );
    }
  }
};