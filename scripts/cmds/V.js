const fs = require("fs");
const path = require("path");

const dbPath = path.join(process.cwd(), "antichange.json");

// 🔥 auto create file
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify({}, null, 2));
}

// load
function loadDB() {
  try {
    return JSON.parse(fs.readFileSync(dbPath));
  } catch {
    return {};
  }
}

// save
function saveDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

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

    const db = loadDB();

    if (state === "on") {
      const chat = await bot.getChat(chatId);

      db[chatId] = {
        enabled: true,
        title: chat.title || "Protected Name"
      };

      saveDB(db);

      return message.reply("✅ | Anti-change ON (auto saved)");
    }

    if (state === "off") {
      delete db[chatId];
      saveDB(db);

      return message.reply("❌ | Anti-change OFF");
    }
  },

  onChat: async ({ bot, msg }) => {
    const chatId = msg.chat.id;

    const db = loadDB();

    if (!db[chatId] || !db[chatId].enabled) return;

    const data = db[chatId];

    try {
      if (msg.new_chat_title) {
        await bot.setChatTitle(chatId, data.title);
        bot.sendMessage(chatId, "⚠️ | Name reverted");
      }

      if (msg.new_chat_photo) {
        bot.sendMessage(chatId, "⚠️ | Photo change detected");
      }

    } catch (e) {
      console.log("Antichange Error:", e);
    }
  }
};
