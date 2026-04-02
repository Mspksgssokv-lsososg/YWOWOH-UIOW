module.exports = {
  config: {
    name: "linkfb",
    aliases: ["link"],
    version: "5.0",
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

      // 🔥 1. reply
      if (event.reply_to_message) {
        userId = event.reply_to_message.from?.id;
        username = event.reply_to_message.from?.username;
      }

      // 🔥 2. mention
      else if (event.entities) {
        for (const ent of event.entities) {

          if (ent.type === "mention") {
            username = event.text.substring(
              ent.offset,
              ent.offset + ent.length
            ).replace("@", "");
          }

          if (ent.type === "text_mention") {
            userId = ent.user?.id;
            username = ent.user?.username;
          }
        }
      }

      // 🔥 3. args
      if (!userId && args[0]) {
        userId = args[0];
      }

      // 🔥 4. default (MAIN FIX 🔥)
      if (!userId) {
        userId = event.from?.id;
        username = event.from?.username;
      }

      // 🔥 FINAL SAFETY
      if (!userId && !username) {
        return bot.sendMessage(chatId, "❌ User not found!");
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
