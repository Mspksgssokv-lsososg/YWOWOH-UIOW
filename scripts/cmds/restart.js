module.exports = {
  config: {
    name: "restart",
    version: "3.0.0",
    role: 2,
    author: "SK-SIDDIK-KHAN",
    description: "Smart restart with clean unsend timing",
    usePrefix: true,
    category: "admin",
    cooldown: 5
  },

  onStart: async ({ message, event, bot }) => {
    try {
      const start = Date.now();

      const sentMsg = await message.reply("🔄 | Restarting the bot...");

      const totalDelay = 2000; 
      const unsendBefore = 1000; 

      setTimeout(async () => {
        try {
          await bot.deleteMessage(
            event.chat.id,
            sentMsg.message_id
          );
        } catch {}
      }, totalDelay - unsendBefore);

      setTimeout(async () => {
        const elapsed = ((Date.now() - start) / 1000).toFixed(2);

        await message.reply(
          `✅ | Bot restarted\n⏰ | Time: ${elapsed}s`
        );
      }, totalDelay);

    } catch (err) {
      return message.reply("❌ | Restart failed");
    }
  }
};
