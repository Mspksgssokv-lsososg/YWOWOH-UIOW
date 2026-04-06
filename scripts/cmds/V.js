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
        title: chat.title || "Protected Name",
        photo: chat.photo?.big_file_id || null
      };

      return message.reply("✅ | Anti-change ON (saved current name & photo)");
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
      // Name change detect
      if (msg.new_chat_title && data.enabled) {
        await bot.setChatTitle(chatId, data.title);
        bot.sendMessage(chatId, "⚠️ | Name change blocked & restored");
      }

      // Photo change detect
      if (msg.new_chat_photo && data.enabled) {
        if (data.photo) {
          await bot.setChatPhoto(chatId, data.photo);
          bot.sendMessage(chatId, "⚠️ | Photo change blocked & restored");
        } else {
          bot.sendMessage(chatId, "⚠️ | Photo changed (no backup found)");
        }
      }

    } catch (e) {
      console.log("Antichange Error:", e);
    }
  }
};
