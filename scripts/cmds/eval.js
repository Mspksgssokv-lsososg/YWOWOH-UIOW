const util = require("util");

module.exports = {
  config: {
    name: "eval",
    author: "SK-SIDDIK-KHAN",
    description: "Execute JavaScript code (admin only)",
    category: "development",
    usage: "eval <code>",
    usePrefix: true,
    role: 2
  },

  onStart: async function ({ message, event, args }) {
    try {
      const code = args.join(" ");
      const chatId = event.chat.id;

      if (!code) {
        return message.reply("⚠️ | Usage: eval <code>");
      }

      let result = await eval(code);

      if (typeof result !== "string") {
        result = util.inspect(result, { depth: 1 });
      }

      if (result.length > 4000) {
        result = result.slice(0, 4000) + "...";
      }

      return message.reply(`📤 Result:\n${result}`);

    } catch (err) {
      return message.reply(`❌ Error:\n${err.message}`);
    }
  }
};
