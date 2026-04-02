const { admins } = global.config;

const messages = {
  added: (group, id, by, time, link) => 
`─────────────────
🤖 BOT ADDED
─────────────────
👥 Group: ${group}
🆔 ${id}
🔗 Link: ${link}
➕ Added by: ${by}
⏰ ${time}
─────────────────`,

  removed: (group, id, by, time, link) => 
`─────────────────
❌ BOT REMOVED
─────────────────
👥 Group: ${group}
🆔 ${id}
🔗 Link: ${link}
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

      const getGroupLink = async (chatId) => {
        try {
          const link = await bot.exportChatInviteLink(chatId);
          return link;
        } catch {
          return "No Link (Bot not admin)";
        }
      };

      const actorName = await getUserName(event.from.id);
      const time = getTime();
      const groupLink = await getGroupLink(event.chat.id);

      if (event.new_chat_members) {
        const isBotJoined = event.new_chat_members.some(
          member => member.id === me.id
        );

        if (isBotJoined) {
          const msg = messages.added(
            event.chat.title || "Unknown",
            event.chat.id,
            actorName,
            time,
            groupLink
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
            time,
            groupLink
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
