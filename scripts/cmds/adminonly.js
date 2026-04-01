module.exports = {
  config: {
    name: "adminonly",
    aliases: ["aonly", "adm"],
    version: "1.0",
    author: "Siddik",
    role: 2, // only bot admin
    description: "Turn ON/OFF admin only mode",
    category: "system",
    guide: "/adminonly on | off"
  },

  onStart: async ({ message, args }) => {
    try {

      if (!args[0]) {
        return message.reply(
          "⚙️ | Usage:\n/adminonly on\n/adminonly off"
        );
      }

      if (args[0].toLowerCase() === "on") {
        global.adminOnly = true;
        return message.reply("✅ | Admin Only Mode ENABLED");
      }

      if (args[0].toLowerCase() === "off") {
        global.adminOnly = false;
        return message.reply("❌ | Admin Only Mode DISABLED");
      }

      return message.reply(
        "⚙️ | Invalid option!\nUse:\n/adminonly on\n/adminonly off"
      );

    } catch (err) {
      console.log(err);
      return message.reply("❌ | Error occurred");
    }
  }
};
