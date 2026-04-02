const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "circle",
    version: "2.0",
    author: "SK-SIDDIK-KHAN",
    role: 0,
    category: "image",
    guide: "/circle [1-50] (reply image)"
  },

  onStart: async ({ bot, event, args }) => {
    try {
      const chatId = event.chat?.id;
      if (!chatId) return;

      // 🔥 reply check
      if (!event.reply_to_message) {
        return bot.sendMessage(chatId, "❌ Reply to an image!");
      }

      const msg = event.reply_to_message;

      // 🔥 image detect
      let fileId;
      if (msg.photo) {
        fileId = msg.photo[msg.photo.length - 1].file_id;
      } else if (msg.sticker) {
        fileId = msg.sticker.file_id;
      } else {
        return bot.sendMessage(chatId, "❌ Only photo/sticker supported!");
      }

      // 🔥 border number
      const borderNumber = args[0] ? parseInt(args[0]) : 0;
      if (isNaN(borderNumber) || borderNumber < 0 || borderNumber > 50) {
        return bot.sendMessage(chatId, "❌ Border must be 0-50");
      }

      // 🔥 get file url
      const file = await bot.getFile(fileId);
      const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;

      // 🔥 download
      const res = await axios.get(fileUrl, { responseType: "arraybuffer" });
      const image = await loadImage(Buffer.from(res.data));

      // 🔥 canvas
      const size = Math.min(image.width, image.height);
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext("2d");

      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      ctx.drawImage(
        image,
        (image.width - size) / 2,
        (image.height - size) / 2,
        size,
        size,
        0,
        0,
        size,
        size
      );

      // 🔥 border
      if (borderNumber > 0) {
        addBorder(ctx, size, borderNumber);
      }

      // 🔥 save
      const filePath = path.join(__dirname, "circle.png");
      const out = fs.createWriteStream(filePath);
      const stream = canvas.createPNGStream();

      stream.pipe(out);

      out.on("finish", async () => {
        await bot.sendPhoto(chatId, filePath, {
          caption: "⭕ Circle Image"
        });
        fs.unlinkSync(filePath);
      });

    } catch (err) {
      console.error("❌ circle error:", err);
      bot.sendMessage(event.chat?.id, "❌ Failed!");
    }
  }
};

// 🎨 border function
function addBorder(ctx, size, borderNumber) {
  const colors = [
    "#FF0000","#00FF00","#0000FF","#FFFF00","#00FFFF","#FF00FF",
    "#000000","#808000","#008000","#800080","#008080","#000080",
    "#FF6347","#4682B4","#DAA520","#CD5C5C","#4B0082","#7FFF00"
  ];

  const color = colors[(borderNumber - 1) % colors.length];

  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 5, 0, Math.PI * 2);
  ctx.lineWidth = 10;
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.closePath();
}
