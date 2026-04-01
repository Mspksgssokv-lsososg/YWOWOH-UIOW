const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "Siddik", "balance.json");

const getData = () => {
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

const saveData = (data) => {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  } catch {}
};

module.exports = {
  config: {
    name: "daily",
    aliases: ["claim"],
    author: "SK-SIDDIK-KHAN",
    version: "1.1.0",
    cooldown: 5,
    role: 0,
    description: "Claim your daily reward money.",
    category: "games",
    guide: "{pn}"
  },

  onStart: async function ({ message, event }) {
    try {
      const userId = event.from.id;

      const balances = getData();
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;

      let user = balances[userId] || { money: 0, lastClaim: 0 };

      if (now - user.lastClaim < oneDay) {
        const waitTime = oneDay - (now - user.lastClaim);
        const hours = Math.floor(waitTime / (1000 * 60 * 60));
        const minutes = Math.floor((waitTime % (1000 * 60 * 60)) / (1000 * 60));

        return message.reply(
          `⏳ You already claimed your daily reward.\nTry again in ${hours}h ${minutes}m.`
        );
      }

      const reward = Math.floor(Math.random() * (500 - 100 + 1)) + 100;

      user.money += reward;
      user.lastClaim = now;

      balances[userId] = user;
      saveData(balances);

      return message.reply(
        `💰 You claimed ${reward} BDT!\n💸 Total Balance: ${user.money} BDT`
      );

    } catch (err) {
      console.error("DAILY CMD ERROR:", err);
      return message.reply("❌ Something went wrong");
    }
  }
};
