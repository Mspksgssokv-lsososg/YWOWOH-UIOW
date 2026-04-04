module.exports = {
  config: {
    name: "restart",
    aliases: [],
    version: "2.1.0",
    role: 2,
    author: "SK-SIDDIK-KHAN",
    description: "Soft restart with auto unsend.",
    usePrefix: true,
    category: "admin",
    cooldown: 5
  },
 
  onStart: async function ({ message, event, bot }) {
    try {
      const start = Date.now();
 
      const msg = await message.reply("🔄 | Restarting the bot...");
 
      setTimeout(async () => {
        const elapsed = ((Date.now() - start) / 1000).toFixed(2);
 
        try {
          if (msg?.message_id) {
            await message.unsend(msg.message_id);
          } else {
            await bot.deleteMessage(event.chat.id, msg.message_id);
          }
        } catch {}
 
        await message.reply(
          `✅ | Bot restarted\n⏰ | Time: ${elapsed}s`
        );
      }, 1500);
 
    } catch {
      return message.reply("❌ | Restart failed");
    }
  }
};
 
