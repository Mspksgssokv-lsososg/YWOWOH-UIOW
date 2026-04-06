module.exports = {
  config: {
    name: "antichange",
    aliases: ["ac"],
    cooldown: 5
  },

  run: async ({ bot, msg, args, message }) => {
    const chatId = msg.chat.id;

    if (!args[0]) {
      return message.reply("❌ | Use: antichange on/off");
    }

    const state = args[0].toLowerCase();

    if (!["on", "off"].includes(state)) {
      return message.reply("❌ | Use only on/off");
    }

    if (!global.antichange) global.antichange = {};

    if (state === "on") {
      const chat = await bot.getChat(chatId);

      global.antichange[chatId] = {
        enabled: true,
        title: chat.title || "Protected Name"
      };

      return message.reply("✅ | Anti-change ON (name protected)");
    }

    if (state === "off") {
      delete global.antichange[chatId];
      return message.reply("❌ | Anti-change OFF");
    }
  },

  onChat: async ({ bot, msg }) => {
    const chatId = msg.chat.id;

    if (!global.antichange || !global.antichange[chatId]) return;

    const data = global.antichange[chatId];

    try {
      if (msg.new_chat_title && data.enabled) {
        await bot.setChatTitle(chatId, data.title);
        bot.sendMessage(chatId, "⚠️ | Name change blocked");
      }

      if (msg.new_chat_photo && data.enabled) {
        bot.sendMessage(chatId, "⚠️ | Photo change detected (Telegram limitation)");
      }

    } catch (e) {
      console.log(e);
    }
  }
};
