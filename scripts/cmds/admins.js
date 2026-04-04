const fs = require("fs");
const path = require("path");

const configPath = path.join(__dirname, "../../config.json");

let config = require(configPath);

if (!Array.isArray(config.adminBot)) config.adminBot = [];
if (!Array.isArray(config.botOperator)) config.botOperator = [];

module.exports.config = {
  name: "admins",
  aliases: ["access", "operator"],
  version: "3.0.0",
  role: 3,
  author: "SK-SIDDIK-KHAN",
  description: "Smart admin manager",
  usePrefix: true,
  category: "Admin",
  countDown: 5,
};

module.exports.run = async ({ message, args, msg }) => {
  try {
    const action = args[0]?.toLowerCase();
    const roleType = args[1]?.toLowerCase();

    if (!action || !roleType) {
      return message.reply(
        "Usage:\n/admins [add|remove|list] [admin|operator]"
      );
    }

    let targetKey;
    if (roleType === "admin") targetKey = "adminBot";
    else if (roleType === "operator") targetKey = "botOperator";
    else return message.reply("Use admin / operator");

    let targetList = config[targetKey];

    let userId;

    if (msg.reply_to_message) {
      userId = msg.reply_to_message.from.id;
    }

    else if (args[2] && !isNaN(args[2])) {
      userId = parseInt(args[2]);
    }

    else {
      userId = msg.from.id;
    }

    switch (action) {
      case "add":
        if (targetList.includes(userId)) {
          return message.reply("Already exists");
        }

        targetList.push(userId);
        saveConfig();

        return message.reply(`✅ Added ${userId} to ${roleType}`);

      case "remove":
        if (!targetList.includes(userId)) {
          return message.reply("Not found");
        }

        config[targetKey] = targetList.filter(id => id !== userId);
        saveConfig();

        return message.reply(`✅ Removed ${userId} from ${roleType}`);

      case "list":
        return message.reply(
          targetList.length
            ? `📋 ${roleType.toUpperCase()} LIST\n━━━━━━━━━━━━━━\n${targetList.join("\n")}`
            : "Empty list"
        );

      default:
        return message.reply("Use add / remove / list");
    }

  } catch (err) {
    console.error(err);
    message.reply("Error occurred");
  }
};

function saveConfig() {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}
