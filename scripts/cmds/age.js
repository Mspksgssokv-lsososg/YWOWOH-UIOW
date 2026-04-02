const axios = require("axios");

module.exports = {
  config: {
    name: "age",
    version: "4.0",
    author: "SK-SIDDIK-KHAN",
    role: 0,
    usePrefix: false,
    category: "calculator",
    guide: "/age DD/MM/YYYY (reply optional)"
  },

  onStart: async ({ bot, event, args }) => {
    try {
      const chatId = event.chat?.id;
      if (!chatId) return;

      if (!args[0]) {
        return bot.sendMessage(chatId, "❌ Please provide your birthday in DD/MM/YYYY format");
      }

      let userId, userName;

      if (event.reply_to_message) {
        userId = event.reply_to_message.from.id;
        userName = event.reply_to_message.from.first_name;
      } else {
        userId = event.from.id;
        userName = event.from.first_name;
      }

      const [day, month, year] = args[0].split("/").map(Number);
      const birthDate = new Date(year, month - 1, day);

      if (isNaN(birthDate)) {
        return bot.sendMessage(chatId, "❌ Invalid date format! Please use DD/MM/YYYY");
      }

      const today = new Date();

      let age = today.getFullYear() - birthDate.getFullYear();
      let monthDiff = today.getMonth() - birthDate.getMonth();
      let dayDiff = today.getDate() - birthDate.getDate();

      if (dayDiff < 0) {
        monthDiff--;
        dayDiff += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
      }

      if (monthDiff < 0) {
        age--;
        monthDiff += 12;
      }

      let nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
      if (today > nextBirthday) nextBirthday.setFullYear(today.getFullYear() + 1);

      const timeDiff = nextBirthday - today;

      const daysLeft = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const monthsLeft = Math.floor(daysLeft / 30);
      const remainingDays = daysLeft % 30;
      const hoursLeft = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutesLeft = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

      const weekDays = ["রবিবার","সোমবার","মঙ্গলবার","বুধবার","বৃহস্পতিবার","শুক্রবার","শনিবার"];
      const todayDay = weekDays[today.getDay()];

      const mention = `[${userName}](tg://user?id=${userId})`;

      let photo;
      try {
        const photos = await bot.getUserProfilePhotos(userId, { limit: 1 });
        if (photos.total_count > 0) {
          photo = photos.photos[0][0].file_id;
        }
      } catch {}

      const text =
`☽━━━━━━━━━━━━━━━━━━☾
● ${mention} ●

● আপনার বর্তমান বয়স ও জন্মদিনের সময়সূচী ●
☽━━━━━━━━━━━━━━━━━━☾

● ${mention} ●

আজ ${todayDay} ●

● আপনার বয়স: ${age} বছর, ${monthDiff} মাস, ${dayDiff} দিন ●

● আপনার জন্মদিন আসতে বাকি: ${monthsLeft} মাস, ${remainingDays} দিন ●

● মোট: ${daysLeft} দিন, ${hoursLeft} ঘন্টা, ${minutesLeft} মিনিট বাকি ●

☽━━━━━━━━━━━━━━━━━━☾`;

      if (photo) {
        await bot.sendPhoto(chatId, photo, {
          caption: text,
          parse_mode: "Markdown"
        });
      } else {
        await bot.sendMessage(chatId, text, {
          parse_mode: "Markdown"
        });
      }

    } catch (err) {
      console.log("❌ age error", err.message);

      bot.sendMessage(
        event.chat?.id,
        "❌ Error"
      );
    }
  }
};
