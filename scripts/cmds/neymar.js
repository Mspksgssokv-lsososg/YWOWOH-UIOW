module.exports = {
  config: {
    name: "neymar",
    version: "2.0",
    author: "SK-SIDDIK-KHAN",
    role: 0,
    category: "fun",
    guide: "/neymar"
  },

  onStart: async ({ bot, event }) => {
    const axios = require("axios");

    try {

      const chatId = event.chat?.id || event.from?.id;
      if (!chatId) return;

      const links = [
      "https://i.imgur.com/arWjsNg.jpg",
 
"https://i.imgur.com/uJYvMR0.jpg",
 
"https://i.imgur.com/A3MktQ4.jpg",
 
"https://i.imgur.com/wV8YHHp.jpg",
 
"https://i.imgur.com/14sAFjM.jpg",
 
"https://i.imgur.com/EeAi2G6.jpg",
 
"https://i.imgur.com/fUZbzhJ.jpg",
 
"https://i.imgur.com/bUjGSCX.jpg",
 
"https://i.imgur.com/4KZvLbO.jpg",
 
"https://i.imgur.com/gBEAsYZ.jpg",
 
"https://i.imgur.com/baKOat0.jpg",
 
"https://i.imgur.com/4Z0ERpD.jpg",
 
"https://i.imgur.com/h2ReDUe.jpg",
 
"https://i.imgur.com/KQPalvi.jpg",
 
"https://i.imgur.com/VRALDic.jpg",
 
"https://i.imgur.com/Z3qGkZa.jpg",
 
"https://i.imgur.com/etyPi7B.jpg",
 
"https://i.imgur.com/tMxLEwl.jpg",
 
"https://i.imgur.com/OwEdlZo.jpg",
 
"https://i.imgur.com/UHAo39t.jpg",
 
"https://i.imgur.com/aV4EVT9.jpg",
 
"https://i.imgur.com/zdC8yiG.jpg",
 
"https://i.imgur.com/JI7tjsr.jpg",
 
"https://i.imgur.com/fFuPCrM.jpg",
 
"https://i.imgur.com/XIaAXju.jpg",
 
"https://i.imgur.com/yyIJwPH.jpg",
 
"https://i.imgur.com/MyGcsJM.jpg",
 
"https://i.imgur.com/UXjh4R1.jpg",
 
"https://i.imgur.com/QGrvMZL.jpg"
    ];

      const imgURL = links[Math.floor(Math.random() * links.length)];

      const res = await axios({
        url: imgURL,
        method: "GET",
        responseType: "stream",
        timeout: 10000,
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      });

      if (!res || !res.data) throw new Error("Invalid image");

      await bot.sendPhoto(chatId, res.data, {
        caption: "[ Neymar Profile For You ]"
      });

    } catch (err) {

      console.log("❌ neymar error:", err.message);

      const chatId = event.chat?.id || event.from?.id;
      if (chatId) {
        bot.sendMessage(chatId, "❌ Image load failed, try again!");
      }
    }
  }
};