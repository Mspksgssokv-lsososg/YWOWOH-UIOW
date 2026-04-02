module.exports = {
  config: {
    name: "tglink",
    aliases: ["link"],
    version: "3.0",
    author: "SK-SIDDIK-KHAN",
    role: 0,
    category: "utility",
    guide: "/linkfb (reply / mention / id)"
  },

  onStart: async ({ bot, event, args }) => {
    try {
      const chatId = event.chat?.id;
      if (!chatId) return;

      let userId = null;
      let username = null;

      // 🔥 1. reply করলে
      if (event.reply_to_message) {
        userId = event.reply_to_message.from.id;
        username = event.reply_to_message.from.username;
      }

      // 🔥 2. mention করলে
      else if (event.entities) {
        const mention = event.entities.find(e => e.type === "mention");
        if (mention) {
          username = event.text.substring(
            mention.offset,
            mention.offset + mention.length
          ).replace("@", "");
        }
      }

      // 🔥 3. args দিলে (user id)
      else if (args[0]) {
        userId = args[0];
      }

      // 🔥 4. default: নিজের
      else {
        userId = event.from.id;
        username = event.from.username;
      }

      // 🔥 link generate
      let link;

      if (username) {
        link = `https://t.me/${username}`;
      } else {
        link = `tg://user?id=${userId}`;
      }

      await bot.sendMessage(chatId,
        `🔗 Profile Link:\n${link}`,
        { reply_to_message_id: event.message_id }
      );

    } catch (err) {
      console.log("❌ linkfb error:", err.message);

      bot.sendMessage(
        event.chat?.id,
        "❌ Failed to get profile link!"
      );
    }
  }
};
