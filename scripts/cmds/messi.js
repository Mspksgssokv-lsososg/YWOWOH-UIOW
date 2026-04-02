module.exports = {
  config: {
    name: "messi",
    aliases: ["messipic", "lm10"],
    version: "2.0",
    author: "SK-SIDDIK-KHAN",
    role: 0,
    category: "fun",
    guide: "/messi"
  },

  onStart: async ({ bot, event }) => {
    const axios = require("axios");

    try {

      const chatId = event.chat?.id || event.from?.id;
      if (!chatId) return;

      const links = [
        "https://i.imgur.com/ahKcoO3.jpg",
 
"https://i.imgur.com/Vsf4rM3.jpg",
 
"https://i.imgur.com/ximEjww.jpg",
 
"https://i.imgur.com/ukYhm0D.jpg",
 
"https://i.imgur.com/Poice6v.jpg",
 
"https://i.imgur.com/5yMvy5Z.jpg",
 
"https://i.imgur.com/ndyprcd.jpg",
 
"https://i.imgur.com/Pm2gC6I.jpg",
 
"https://i.imgur.com/wxxHuAG.jpg",
 
"https://i.imgur.com/GwOCq59.jpg",
 
 "https://i.imgur.com/oM0jc4i.jpg",
 
"https://i.imgur.com/dJ0OUef.jpg",
 
"https://i.imgur.com/iurRGPT.jpg",
 
"https://i.imgur.com/jogjche.jpg",
 
"https://i.imgur.com/TiyhKjG.jpg",
 
"https://i.imgur.com/AwlBM23.jpg",
 
"https://i.imgur.com/9OLSXZD.jpg",
 
"https://i.imgur.com/itscmiy.jpg",
 
"https://i.imgur.com/FsnCelU.jpg",
 
"https://i.imgur.com/c7BCwDF.jpg",
 
"https://i.imgur.com/3cnR6xh.jpg",
 
"https://i.imgur.com/TZqepnU.jpg",
 
"https://i.imgur.com/kYxEPrD.jpg",
 
"https://i.imgur.com/9ZjD5nX.jpg",
 
"https://i.imgur.com/YWyI4hP.jpg"
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
        caption: "[ Messi Profile For You ]"
      });

    } catch (err) {

      console.log("❌ messi error:", err.message);

      const chatId = event.chat?.id || event.from?.id;
      if (chatId) {
        bot.sendMessage(chatId, "❌ Image load failed, try again!");
      }
    }
  }
};