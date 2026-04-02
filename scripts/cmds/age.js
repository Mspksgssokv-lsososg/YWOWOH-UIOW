const axios = require("axios");

module.exports = {
  config: {
    name: "age",
    version: "3.0",
    author: "SK-SIDDIK-KHAN",
    role: 0,
    category: "calculator",
    guide: "/age DD/MM/YYYY (reply optional)"
  },

  onStart: async ({ bot, event, args }) => {
    try {
      const chatId = event.chat?.id;
      if (!chatId) return;

      const input = args[0];
      if (!input) {
        return bot.sendMessage(chatId, "❌ Date দাও (DD/MM/YYYY)");
      }

      // 🔥 target user (reply / self)
      let userId, name;

      if (event.reply_to_message) {
        userId = event.reply_to_message.from.id;
        name = event.reply_to_message.from.first_name;
      } else {
        userId = event.from.id;
        name = event.from.first_name;
      }

      const [day, month, year] = input.split("/").map(Number);
      const birthDate = new Date(year, month - 1, day);

      if (isNaN(birthDate)) {
        return bot.sendMessage(chatId, "❌ Invalid format! Use DD/MM/YYYY");
      }

      const today = new Date();

      let age = today.getFullYear() - birthDate.getFullYear();
      let m = today.getMonth() - birthDate.getMonth();
      let d = today.getDate() - birthDate.getDate();

      if (d < 0) {
        m--;
        d += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
      }

      if (m < 0) {
        age--;
        m += 12;
      }

      // 🎂 next birthday
      let next = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
      if (today > next) next.setFullYear(today.getFullYear() + 1);

      const diff = next - today;
      const daysLeft = Math.floor(diff / (1000 * 60 * 60 * 24));

      const mention = `[${name}](tg://user?id=${userId})`;

      // 🔥 get profile pic
      let photo;
      try {
        const photos = await bot.getUserProfilePhotos(userId, { limit: 1 });

        if (photos.total_count > 0) {
          const fileId = photos.photos[0][0].file_id;
          photo = fileId;
        }
      } catch (e) {}

      // 🔥 send with pic
      if (photo) {
        await bot.sendPhoto(chatId, photo, {
          caption:
            `🎂 Age Info\n\n` +
            `👤 ${mention}\n\n` +
            `📅 Age: ${age} বছর ${m} মাস ${d} দিন\n` +
            `🎉 Next Birthday: ${daysLeft} দিন বাকি`,
          parse_mode: "Markdown"
        });
      } else {
        // fallback (no dp)
        await bot.sendMessage(chatId,
          `🎂 Age Info\n\n` +
          `👤 ${mention}\n\n` +
          `📅 Age: ${age} বছর ${m} মাস ${d} দিন\n` +
          `🎉 Next Birthday: ${daysLeft} দিন বাকি`
        );
      }

    } catch (err) {
      console.log("❌ age error:", err.message);

      bot.sendMessage(
        event.chat?.id,
        "❌ Error!"
      );
    }
  }
};
