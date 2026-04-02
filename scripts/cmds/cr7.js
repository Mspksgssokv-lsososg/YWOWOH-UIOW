module.exports = {
  config: {
    name: "cr7",
    aliases: [],
    version: "1.0",
    author: "SK-SIDDIK-KHAN",
    role: 0,
    category: "fun",
    guide: "/cr7"
  },

  onStart: async ({ bot, event }) => {
    const axios = require("axios");

    try {
      const chatId = event.chat.id;

      const links = [
        "https://i.imgur.com/gwAuLMT.jpg",
 
"https://i.imgur.com/MuuhaJ4.jpg",
 
"https://i.imgur.com/6t0R8fs.jpg",
 
"https://i.imgur.com/7RTC4W5.jpg",
 
"https://i.imgur.com/VTi2dTP.jpg",
 
"https://i.imgur.com/gdXJaK9.jpg",
 
"https://i.imgur.com/VqZp7IU.jpg",
 
"https://i.imgur.com/9pio8Lb.jpg",
 
"https://i.imgur.com/iw714Ym.jpg",
 
"https://i.imgur.com/zFbcrjs.jpg",
 
"https://i.imgur.com/e0td0K9.jpg",
 
"https://i.imgur.com/gsJWOmA.jpg",
 
"https://i.imgur.com/lU8CaT0.jpg",
 
"https://i.imgur.com/mmZXEYl.jpg",
 
"https://i.imgur.com/d2Ot9pW.jpg",
 
"https://i.imgur.com/iJ1ZGwZ.jpg",
 
"https://i.imgur.com/isqQhNQ.jpg",
 
"https://i.imgur.com/GoKEy4g.jpg",
 
"https://i.imgur.com/TjxTUsl.jpg",
 
"https://i.imgur.com/VwPPL03.jpg",
 
"https://i.imgur.com/45zAhI7.jpg",
 
"https://i.imgur.com/n3agkNi.jpg",
 
"https://i.imgur.com/F2mynhI.jpg",
 
"https://i.imgur.com/XekHaDO.jpg"
      ];

      const imgURL = links[Math.floor(Math.random() * links.length)];

      const res = await axios({
        url: imgURL,
        method: "GET",
        responseType: "stream"
      });

      await bot.sendPhoto(chatId, res.data, {
        caption: "[ Ronaldo Profile For You ]"
      });

    } catch (e) {
      bot.sendMessage(event.chat.id, "❌ Error");
    }
  }
};