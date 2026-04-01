const fs = require("fs-extra");

module.exports = {
	config: {
		name: "loadconfig",
		aliases: ["loadcf"],
		version: "2.0",
		author: "SK-SIDDIK-KHAN",
		cooldown: 5,
		role: 2,
		description: "Reload config of bot",
		category: "owner",
		guide: "{pn}"
	},

	onStart: async function ({ message }) {
		try {
			const newConfig = fs.readJsonSync("./config.json");

			global.config = newConfig; 

			return message.reply("✅ Config Reloaded Successfully");
		} catch (err) {
			console.log("❌ LoadConfig Error:", err);
			return message.reply("❌ Failed to reload config");
		}
	}
};
