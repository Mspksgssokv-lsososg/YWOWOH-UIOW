module.exports = {
  config: {
    name: "logsbot",
    version: "3.0.0",
    author: "Siddik",
    category: "events"
  },

  onStart: async ({ bot, event }) => {
    try {
      const { admins } = global.config;

      // 🔥 get bot info once
      const botData = await bot.getMe();

      // ================== BOT ADDED ==================
      if (event.new_chat_members) {
        const isBotAdded = event.new_chat_members.some(
          user => user.id === botData.id
        );

        if (isBotAdded) {
          const user = event.from;
          const chat = event.chat;

          const msg =
`📢 BOT LOGS

✅ Bot added to group
👤 Added by: ${user.first_name || "Unknown"}
🆔 User ID: ${user.id}

👥 Group: ${chat.title || "Unknown"}
🆔 Chat ID: ${chat.id}`;

          for (const adminID of admins) {
            await bot.sendMessage(adminID, msg).catch(() => {});
          }
        }
      }

      // ================== BOT REMOVED ==================
      if (event.left_chat_member) {
        if (event.left_chat_member.id === botData.id) {
          const user = event.from;
          const chat = event.chat;

          const msg =
`📢 BOT LOGS

❌ Bot removed from group
👤 Removed by: ${user.first_name || "Unknown"}
🆔 User ID: ${user.id}

👥 Group: ${chat.title || "Unknown"}
🆔 Chat ID: ${chat.id}`;

          for (const adminID of admins) {
            await bot.sendMessage(adminID, msg).catch(() => {});
          }
        }
      }

    } catch (err) {
      console.log("❌ logsbot error:", err.message);
    }
  }
};
