const axios = require("axios");
const Jimp = require("jimp");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "arrest",
    version: "2.0",
    author: "SK-SIDDIK-KHAN",
    role: 0,
    category: "fun",
    guide: "/arrest (reply বা mention)"
  },

  onStart: async ({ bot, event }) => {
    try {
      const chatId = event.chat?.id;
      if (!chatId) return;

      // 🔥 user detect
      let user1 = event.from.id;
      let user2;

      if (event.reply_to_message) {
        user2 = event.reply_to_message.from.id;
      } else if (event.entities) {
        const mention = event.entities.find(e => e.type === "text_mention");
        if (mention) user2 = mention.user.id;
      }

      if (!user2) {
        return bot.sendMessage(chatId, "❌ Reply or mention someone!");
      }

      // 🔥 generate image
      const imagePath = await generateArrestImage(bot, user1, user2);

      await bot.sendPhoto(chatId, imagePath, {
        caption: "🚔 You are under arrest 😆"
      });

      fs.unlinkSync(imagePath);

    } catch (err) {
      console.error("❌ arrest error:", err);
      bot.sendMessage(event.chat?.id, "❌ Failed!");
    }
  }
};

async function getProfilePic(bot, userId) {
  const photos = await bot.getUserProfilePhotos(userId, { limit: 1 });

  if (photos.total_count === 0) return null;

  const fileId = photos.photos[0][0].file_id;
  const file = await bot.getFile(fileId);

  const url = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;

  const res = await axios.get(url, { responseType: "arraybuffer" });
  return await Jimp.read(Buffer.from(res.data));
}

async function generateArrestImage(bot, uid1, uid2) {
  const [av1, av2] = await Promise.all([
    getProfilePic(bot, uid1),
    getProfilePic(bot, uid2)
  ]);

  if (!av1 || !av2) throw new Error("No DP found");

  av1.circle().resize(120, 120);
  av2.circle().resize(120, 120);

  // 🔥 background image
  const bgRes = await axios.get(
    "https://i.imgur.com/8qz1XbG.png", // arrest template
    { responseType: "arraybuffer" }
  );

  const bg = await Jimp.read(Buffer.from(bgRes.data));

  bg.resize(500, 500)
    .composite(av1, 320, 50)
    .composite(av2, 80, 250);

  const filePath = path.join(__dirname, `arrest_${Date.now()}.jpg`);
  await bg.writeAsync(filePath);

  return filePath;
}
