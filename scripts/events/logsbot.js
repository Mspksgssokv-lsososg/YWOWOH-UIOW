const { admins } = global.config;

const messages = {
  added: (group, id, by, time) => 
`─────────────────
🤖 BOT ADDED
─────────────────
👥 Group: ${group}
🆔 ${id}
➕ Added by: ${by}
⏰ ${time}
─────────────────`,

  removed: (group, id, by, time) => 
`─────────────────
❌ BOT REMOVED
─────────────────
👥 Group: ${group}
🆔 ${id}
➖ Removed by: ${by}
⏰ ${time}
─────────────────`,

  error: "❌ botJoin error"
};

function getTime() {
  return new Date().toLocaleString("en-BD", {
    timeZone: "Asia/Dhaka"
  });
}

module.exports = {
  name: "logsbot",
  author: "SK-SIDDIK-KHAN",
  event: "message",

  run: async ({ bot, event }) => {
    try {
      if (!event.new_chat_members && !event.left_chat_member) return;

      const me = await bot.getMe();

      const getUserName = async (id) => {
        try {
          const user = await bot.getChat(id);
          return user.first_name || "Unknown";
        } catch {
          return "Unknown";
        }
      };

      const actorName = await getUserName(event.from.id);
      const time = getTime();

      if (event.new_chat_members) {
        const isBotJoined = event.new_chat_members.some(
          member => member.id === me.id
        );

        if (isBotJoined) {
          const msg = messages.added(
            event.chat.title || "Unknown",
            event.chat.id,
            actorName,
            time
          );

          for (const adminID of admins) {
            await bot.sendMessage(adminID, msg).catch(err => {
              console.log("❌ send fail:", adminID, err.message);
            });
          }
        }
      }

      if (event.left_chat_member) {
        if (event.left_chat_member.id === me.id) {

          const msg = messages.removed(
            event.chat.title || "Unknown",
            event.chat.id,
            actorName,
            time
          );

          for (const adminID of admins) {
            await bot.sendMessage(adminID, msg).catch(err => {
              console.log("❌ send fail:", adminID, err.message);
            });
          }
        }
      }

    } catch (err) {
      console.log(messages.error, err);
    }
  }
};
