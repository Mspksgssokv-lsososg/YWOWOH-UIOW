module.exports = {
  config: {
    name: "botJoin",
    author: "SK-SIDDIK-KHAN",
    category: "events"
  },

  onChat: async ({ bot, event }) => {
    try {
      const { admins } = global.config;

      if (!event.new_chat_members && !event.left_chat_member) return;

      const me = await bot.getMe();

      // ✅ BOT ADDED
      if (event.new_chat_members) {
        const isBotAdded = event.new_chat_members.some(
          user => user.id === me.id
        );

        if (isBotAdded) {
          const user = event.from;
          const chat = event.chat;

          const msg =
`📢 BOT JOIN LOG

✅ Bot added to group
👤 Added by: ${user.first_name}
🆔 ${user.id}

👥 ${chat.title}
🆔 ${chat.id}`;

          for (const adminID of admins) {
            await bot.sendMessage(adminID, msg).catch(() => {});
          }
        }
      }

      // ❌ BOT REMOVED
      if (event.left_chat_member) {
        if (event.left_chat_member.id === me.id) {
          const user = event.from;
          const chat = event.chat;

          const msg =
`📢 BOT LEAVE LOG

❌ Bot removed from group
👤 Removed by: ${user.first_name}
🆔 ${user.id}

👥 ${chat.title}
🆔 ${chat.id}`;

          for (const adminID of admins) {
            await bot.sendMessage(adminID, msg).catch(() => {});
          }
        }
      }

    } catch (err) {
      console.log("❌ botJoin error:", err.message);
    }
  }
};
