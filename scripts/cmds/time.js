const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "time",
    aliases: ["now"],
    author: "SK-SIDDIK-KHAN",
    version: "1.0.0",
    cooldown: 5,
    role: 0,
    description: "Shows the current time with the configured timezone.",
    category: "utility",
    guide: "Use: {pn}"
  },

  onStart: async function ({ message }) {
    if (!message) return;
    try {
      const now = moment.tz(global.config?.timeZone || "Asia/Dhaka");
      await message.reply(
        `🕒 Current time: ${now.format("h:mm:ss A")}\n📅 Date: ${now.format("DD/MM/YYYY")}`
      );
    } catch (e) {
      console.error("Error in time command:", e);
      await message.reply("❌ There was an error getting the time.");
    }
  }
};
