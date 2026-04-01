const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "Siddik", "balance.json");

const getBalanceData = () => {
  try {
    const dir = path.dirname(dataPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(dataPath)) {
      fs.writeFileSync(dataPath, JSON.stringify({}, null, 2));
      return {};
    }

    const raw = fs.readFileSync(dataPath, "utf8");
    if (!raw.trim()) return {};

    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const saveBalanceData = (data) => {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  } catch {}
};

module.exports = {
  config: {
    name: "bal",
    aliases: ["balance", "money"],
    author: "SK-SIDDIK-KHAN",
    version: "1.1.0",
    cooldown: 5,
    role: 0,
    description: "Shows the user's current balance.",
    category: "games",
    guide: "{pn}"
  },

  onStart: async function ({ message, event }) {
    try {
      const userId = event.from.id;
      const balances = getBalanceData();

      if (!balances[userId]) {
        balances[userId] = { money: 0 };
        saveBalanceData(balances);
      }

      const userBalance = balances[userId].money;

      return message.reply(`💸 | Your balance: ${userBalance} BDT`);
    } catch {
      return message.reply("❌ Error loading balance");
    }
  }
};
