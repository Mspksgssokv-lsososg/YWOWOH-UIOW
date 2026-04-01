module.exports = {
  config: {
    name: "adminonly",
    role: 2,
    description: "Toggle admin only mode"
  },

  onStart: async ({ bot, chatId, args }) => {
    if (args[0] === "on") {
      global.adminOnlyMode = true;
      return bot.sendMessage(chatId, "✅ Admin Only Mode ON");
    }

    if (args[0] === "off") {
      global.adminOnlyMode = false;
      return bot.sendMessage(chatId, "❌ Admin Only Mode OFF");
    }

    return bot.sendMessage(chatId, "Usage:\n/adminonly on\n/adminonly off");
  }
};
