const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "file",
    author: "SK-SIDDIK-KHAN",
    description: "Send command file",
    category: "utility",
    usage: "file <name>",
    usePrefix: true,
    role: 2,
  },

  onStart: async ({ args, bot, msg, message }) => {
    try {
      const name = args[0];

      if (!name) {
        return message.reply("Usage: /file <command_name>");
      }

      const filePath = path.join(__dirname, `${name}.js`);

      if (!fs.existsSync(filePath)) {
        return message.reply("❌ | File not found");
      }

      await bot.sendDocument(msg.chat.id, filePath, {
        caption: `📂 ${name}.js`
      });

    } catch (err) {
      console.error(err);
      message.reply("❌ | Error sending file");
    }
  }
};
