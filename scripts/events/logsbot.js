module.exports = {
  name: "logsbot",
  author: "SK-SIDDIK-KHAN",
  event: "message",

  run: async ({ bot, event }) => {
    try {
      const { admins } = global.config;

      // ❌ no new member
      if (!event.new_chat_members) return;

      const me = await bot.getMe();

      // ================= BOT JOIN =================
      const isBotAdded = event.new_chat_members.some(
        user => user.id === me.id
      );

      if (isBotAdded) {
        const user = event.from;
        const chat = event.chat;

        const msg =
`📢 BOT JOIN LOG

✅ Bot added to group
👤 Added by: ${user.first_name || "Unknown"}
🆔 User ID: ${user.id}

👥 Group: ${chat.title || "Unknown"}
🆔 Chat ID: ${chat.id}`;

        for (const adminID of admins) {
          await bot.sendMessage(adminID, msg).catch(() => {});
        }
      }

      // ================= BOT LEAVE =================
      if (event.left_chat_member) {
        if (event.left_chat_member.id === me.id) {
          const user = event.from;
          const chat = event.chat;

          const msg =
`📢 BOT LEAVE LOG

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
      console.log("❌ botJoin error:", err.message);
    }
  }
};
