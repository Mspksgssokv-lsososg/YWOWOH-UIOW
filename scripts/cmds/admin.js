module.exports.config = {
  name: "admin",
  aliases: [],
  version: "1.0.2",
  role: 0,
  author: "SK-SIDDIK-KHAN",
  description: "Display information about the bot admins and group admins.",
  usePrefix: true,
  guide: "{p}",
  category: "Admin",
  countDown: 5,
};

module.exports.onStart = async ({ message, event, api, usersData, args }) => {
  try {
    const config = global.functions?.config || {};

    const adminBotIds = config.adminBot || [];
    const botOperatorIds = config.botOperator || [];

    const chatId = event.chat.id;

    let adminInfo = `╭──────────────────╮
✨ 𝐁𝐨𝐭 𝐀𝐝𝐦𝐢𝐧𝐬 & 𝐎𝐩𝐞𝐫𝐚𝐭𝐨𝐫𝐬 🍀
╰──────────────────╯`;

    if (!args[0]) {

      if (adminBotIds.length) {
        adminInfo += `\n\n✨ 𝐁𝐨𝐭 𝐀𝐝𝐦𝐢𝐧𝐬:\n`;

        for (const adminId of adminBotIds) {
          let name = "Unknown";
          try {
            name = await usersData.getName(String(adminId));
          } catch {}

          adminInfo += `- 𝐍𝐚𝐦𝐞: ${name}\n  𝐈𝐃: ${adminId}\n`;
        }

      } else {
        adminInfo += `\n\n- No Bot Admins Found.\n`;
      }

      if (botOperatorIds.length) {
        adminInfo += `\n✨ 𝐁𝐨𝐭 𝐎𝐩𝐞𝐫𝐚𝐭𝐨𝐫𝐬:\n`;

        for (const operatorId of botOperatorIds) {
          let name = "Unknown";
          try {
            name = await usersData.getName(String(operatorId));
          } catch {}

          adminInfo += `- 𝐍𝐚𝐦𝐞: ${name}\n  𝐈𝐃: ${operatorId}\n`;
        }

      } else {
        adminInfo += `\n- No Bot Operators Found.\n`;
      }
    }

    if (args[0]) {
      try {
        const chatAdmins = await api.getChatAdministrators(chatId);

        if (chatAdmins?.length) {
          adminInfo += `\n\n╭──────────────────╮
☆ 𝐆𝐫𝐨𝐮𝐩 𝐀𝐝𝐦𝐢𝐧𝐬 ☆
╰──────────────────╯`;

          for (const admin of chatAdmins) {
            const name =
              admin.user.username ||
              admin.user.first_name ||
              "Unknown";

            const adminId = admin.user.id;

            adminInfo += `\n- 𝐍𝐚𝐦𝐞: ${name}\n  𝐈𝐃: ${adminId}`;
          }

        } else {
          adminInfo += `\n\n- No Group Admins Found or not a group.`;
        }

      } catch {
        adminInfo += `\n\n- Cannot fetch group admins (maybe private chat).`;
      }
    }

    await message.reply(adminInfo);

  } catch (error) {
    console.log("Failed to get admin info:", error.message);
    await message.reply(`❌ | Error: ${error.message}`);
  }
};