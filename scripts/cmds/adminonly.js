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
    aliases: ["onlyadmin", "adonly"],
    author: "SK-SIDDIK-KHAN",
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

      return bot.sendMessage(chatId, "✅ Admin only mode ON");
    }

    if (action === "off") {
      data.adminOnly.enable = false;
      saveConfig(data);

      return bot.sendMessage(chatId, "❌ Admin only mode OFF");
    }

    return bot.sendMessage(chatId,
`Usage:
/adminonly on
/adminonly off`
    );
  }
};
