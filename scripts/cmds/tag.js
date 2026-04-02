module.exports = {
  config: {
    name: "tag",
    version: "3.0",
    author: "SK-SIDDIK-KHAN",
    role: 0,
    category: "tools",
    guide: "/tag | /tag all | /tag admin"
  },

  onStart: async ({ bot, event, args }) => {
    try {
      const chatId = event.chat?.id;
      if (!chatId) return;

      // 🔥 1. TAG ALL
      if (args[0] === "all") {
        const members = await bot.getChatAdministrators(chatId); // fallback (Telegram limitation)

        let text = "👥 Group Mention:\n\n";

        members.forEach(user => {
          const id = user.user.id;
          const name = user.user.first_name;
          text += `[${name}](tg://user?id=${id})\n`;
        });

        return bot.sendMessage(chatId, text, {
          parse_mode: "Markdown"
        });
      }

      // 🔥 2. TAG ADMIN
      if (args[0] === "admin") {
        const admins = await bot.getChatAdministrators(chatId);

        let text = "👑 Admin List:\n\n";

        admins.forEach(user => {
          const id = user.user.id;
          const name = user.user.first_name;
          text += `[${name}](tg://user?id=${id})\n`;
        });

        return bot.sendMessage(chatId, text, {
          parse_mode: "Markdown"
        });
      }

      // 🔥 3. NORMAL TAG
      let userId, name;

      if (event.reply_to_message) {
        userId = event.reply_to_message.from.id;
        name = event.reply_to_message.from.first_name;
      } else {
        userId = event.from.id;
        name = event.from.first_name;
      }

      const mention = `[${name}](tg://user?id=${userId})`;

      await bot.sendMessage(chatId, mention, {
        parse_mode: "Markdown",
        reply_to_message_id: event.message_id
      });

    } catch (err) {
      console.log("❌ tag error:", err.message);

      bot.sendMessage(
        event.chat?.id,
        "❌ Tag failed!"
      );
    }
  }
};