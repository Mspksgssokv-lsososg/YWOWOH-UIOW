module.exports = {
  name: "botJoin",
  author: "SK-SIDDIK-KHAN",
  event: "message",

  run: async ({ bot, event }) => {
    try {
      if (!event.new_chat_members && !event.left_chat_member) return;

      const me = await bot.getMe();
      const { admins } = global.config;

      // ================= BOT ADDED =================
      if (event.new_chat_members) {
        const isBotJoined = event.new_chat_members.some(
          member => member.id === me.id
        );

        if (isBotJoined) {
          const msg = `🤖 BOT ADDED

👥 Group: ${event.chat.title || "Unknown"}
🆔 ${event.chat.id}`;

          for (const adminID of admins) {
            await bot.sendMessage(adminID, msg).catch(err => {
              console.log("❌ send fail:", adminID, err.message);
            });
          }
        }
      }

      // ================= BOT REMOVED =================
      if (event.left_chat_member) {
        if (event.left_chat_member.id === me.id) {

          const msg = `❌ BOT REMOVED

👥 Group: ${event.chat.title || "Unknown"}
🆔 ${event.chat.id}`;

          for (const adminID of admins) {
            await bot.sendMessage(adminID, msg).catch(err => {
              console.log("❌ send fail:", adminID, err.message);
            });
          }
        }
      }

    } catch (err) {
      console.log("❌ botJoin error:", err);
    }
  }
};
