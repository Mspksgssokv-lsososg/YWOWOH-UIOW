module.exports = {
  name: "logsbot",
  author: "SK-SIDDIK-KHAN",
  event: "message",

  run: async ({ bot, event }) => {
    try {
      if (!event.new_chat_members) return;

      const me = await bot.getMe();

      const isBotJoined = event.new_chat_members.some(
        member => member.id === me.id
      );

      if (!isBotJoined) return;

      const msg = `🤖 Bot Added!

👥 Group: ${event.chat.title || "Unknown"}
🆔 ${event.chat.id}`;

      await bot.sendMessage(event.chat.id, msg);

    } catch (err) {
      console.log("❌ botJoin runtime error:", err);
    }
  }
};
