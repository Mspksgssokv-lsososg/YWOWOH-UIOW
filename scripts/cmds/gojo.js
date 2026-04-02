module.exports = {
  config: {
    name: "gojo",
    aliases: ["gojopic", "gojophoto"],
    version: "2.0",
    author: "SK-SIDDIK-KHAN",
    role: 0,
    category: "fun",
    guide: "/gojo"
  },

  onStart: async ({ bot, event }) => {
    const axios = require("axios");

    try {

      const chatId = event.chat?.id || event.from?.id;
      if (!chatId) return;

      const links = [
      "https://i.imgur.com/RKTWov0.jpeg",
 
"https://i.imgur.com/vBocwop.jpeg",
 
"https://i.imgur.com/tTZsRfh.jpeg",
 
"https://i.imgur.com/yT69Sac.jpeg",
 
"https://i.imgur.com/1qWJ1vy.jpeg",
 
"https://i.imgur.com/Xc2uBRl.jpeg",
 
"https://i.imgur.com/kU4R0XK.jpeg",
 
"https://i.imgur.com/hwFV9Sq.jpeg",
 
 "https://i.imgur.com/T48CEO6.jpeg",
 
"https://i.imgur.com/W8GfqZN.jpeg",
 
"https://i.imgur.com/zkApVTb.jpeg",
 
"https://i.imgur.com/emUbsFl.jpeg",
 
"https://i.imgur.com/WYBJMjm.jpeg",
 
"https://i.imgur.com/QHQGDBj.jpeg",
 
"https://i.imgur.com/vtCL7i6.jpeg",
 
"https://i.imgur.com/2RDEUIR.jpeg",
 
"https://i.imgur.com/AnqajiQ.jpeg",
 
"https://i.imgur.com/NinTb5o.jpeg",
 
"https://i.imgur.com/QgBL32P.jpeg",
 
"https://i.imgur.com/NinTb5o.jpeg",
 
"https://i.imgur.com/QgBL32P.jpeg",
 
"https://i.imgur.com/gME3HeC.jpeg",
 
"https://i.imgur.com/OcVyAEg.jpeg"
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
        caption: "🔰𝐇𝐞𝐫𝐞 𝐈𝐬 𝐘𝐨𝐮𝐫 𝐆𝐨𝐣𝐨 𝐏𝐢𝐜𝐭𝐮𝐫𝐞🔰"
      });

    } catch (err) {

      console.log("❌ gojo error:", err.message);

      const chatId = event.chat?.id || event.from?.id;
      if (chatId) {
        bot.sendMessage(chatId, "❌ Image load failed, try again!");
      }
    }
  }
};