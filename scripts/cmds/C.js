const fs = require("fs");
const path = require("path");

const configPath = path.join(__dirname, "../../config.json");

// ================= CONFIG =================
function readConfig() {
  try {
    const data = fs.readFileSync(configPath, "utf-8");
    const config = JSON.parse(data);

    if (!Array.isArray(config.adminId)) {
      config.adminId = [];
    }

    return config;
  } catch (err) {
    return { adminId: [] };
  }
}

function writeConfig(config) {
  try {
    fs.writeFileSync(
      configPath,
      JSON.stringify(config, null, 2),
      "utf-8"
    );
  } catch (err) {
    console.log("CONFIG WRITE ERROR:", err.message);
  }
}

// ================= MODULE =================
module.exports = {
  config: {
    name: "adminv",
    aliases: ["adminf"],
    role: 2,
    cooldowns: 5,
    version: "1.0.4",
    author: "SK-SIDDIK-KHAN",
    category: "admin",
    description: "Manage admins.",
    usage: "admin <list|-l|add|-a|remove|-r>",
  },

  onStart: async function ({ bot, msg, args }) {
    const chatId = msg.chat.id;

    if (!args.length) {
      return bot.sendMessage(
        chatId,
        "Usage: admin <list|add|remove>",
        { reply_to_message_id: msg.message_id }
      );
    }

    const action = args[0].toLowerCase();

    if (action === "list" || action === "-l") {
      return listAdmins(bot, chatId, msg);
    }

    if (action === "add" || action === "-a") {
      const userId =
        args[1] ||
        (msg.reply_to_message && msg.reply_to_message.from.id);

      if (!userId) {
        return bot.sendMessage(
          chatId,
          "Reply or give userId",
          { reply_to_message_id: msg.message_id }
        );
      }

      return addAdmin(bot, chatId, String(userId), msg);
    }

    if (action === "remove" || action === "-r") {
      const userId =
        args[1] ||
        (msg.reply_to_message && msg.reply_to_message.from.id);

      if (!userId) {
        return bot.sendMessage(
          chatId,
          "Reply or give userId",
          { reply_to_message_id: msg.message_id }
        );
      }

      return removeAdmin(bot, chatId, String(userId), msg);
    }

    return bot.sendMessage(chatId, "Invalid action", {
      reply_to_message_id: msg.message_id,
    });
  },
};

// ================= FUNCTIONS =================

async function getUserName(bot, chatId, userId) {
  try {
    const user = await bot.getChatMember(chatId, userId);
    return (
      user.user.first_name +
      (user.user.last_name ? " " + user.user.last_name : "")
    );
  } catch {
    return "Unknown";
  }
}

async function listAdmins(bot, chatId, msg) {
  const config = readConfig();
  const admins = config.adminId;

  if (!admins.length) {
    return bot.sendMessage(chatId, "No admins found", {
      reply_to_message_id: msg.message_id,
    });
  }

  let text = "Admin List:\n";

  let i = 1;
  for (const id of admins) {
    const name = await getUserName(bot, chatId, id);
    text += `${i++}. ${name} (${id})\n`;
  }

  bot.sendMessage(chatId, text, {
    reply_to_message_id: msg.message_id,
  });
}

async function addAdmin(bot, chatId, userId, msg) {
  const config = readConfig();
  const admins = config.adminId;

  if (admins.includes(userId)) {
    return bot.sendMessage(chatId, "Already admin", {
      reply_to_message_id: msg.message_id,
    });
  }

  const name = await getUserName(bot, chatId, userId);

  admins.push(userId);
  writeConfig(config);

  bot.sendMessage(chatId, `Added ${name} (${userId})`, {
    reply_to_message_id: msg.message_id,
  });
}

async function removeAdmin(bot, chatId, userId, msg) {
  const config = readConfig();
  const admins = config.adminId;

  if (!admins.includes(userId)) {
    return bot.sendMessage(chatId, "Not an admin", {
      reply_to_message_id: msg.message_id,
    });
  }

  const name = await getUserName(bot, chatId, userId);

  config.adminId = admins.filter(id => id !== userId);
  writeConfig(config);

  bot.sendMessage(chatId, `Removed ${name} (${userId})`, {
    reply_to_message_id: msg.message_id,
  });
}
