module.exports = {
  config: {
    name: "adminonly",
    aliases: ["aonly", "adm"],
    version: "1.0",
    author: "SK-SIDDIK-KHAN",
    role: 2, 
    description: "Turn On/Off admin only mode",
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
        return message.reply("✅ Turned on the mode only admin can use bot");
      }

      if (args[0].toLowerCase() === "off") {
        global.adminOnly = false;
        return message.reply("❌ Turned off the mode only admin can use bot");
      }

      return message.reply(
        "⚙️ | Invalid option\nUse:\n/adminonly on\n/adminonly off"
      );

    } catch (err) {
      console.log(err);
      return message.reply("❌ | Error occurred");
    }
  }
};
