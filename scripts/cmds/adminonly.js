const fs = require("fs");
const path = require("path");

const configPath = path.join(process.cwd(), "config.json");

function getConfig() {
  return JSON.parse(fs.readFileSync(configPath, "utf-8"));
}

function saveConfig(data) {
  fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
}

module.exports = {
  config: {
    name: "adminonly",
    author: "SK-SIDDIK-KHAN",
    aliases: ["onlyadmin", "adonly"],
    role: 2,
    usePrefix: true,
    category: "admin",
    description: "Turn on/off admin only mode"
  },

  onStart: async ({ bot, msg, args }) => {
    const chatId = msg.chat.id;

    const data = getConfig();

    if (!data.adminOnly) {
      data.adminOnly = {
        enable: false
      };
    }

    const action = args[0];

    if (action === "on") {
      data.adminOnly.enable = true;
      saveConfig(data);

      return bot.sendMessage(chatId, "✅ Turned on the mode only admin can use bot");
    }

    if (action === "off") {
      data.adminOnly.enable = false;
      saveConfig(data);

      return bot.sendMessage(chatId, "❌ Turned off the mode only admin can use bot");
    }

    return bot.sendMessage(chatId,
`Usage:
/adminonly on
/adminonly off`
    );
  }
};
