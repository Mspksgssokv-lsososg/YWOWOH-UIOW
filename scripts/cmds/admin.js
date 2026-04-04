module.exports.config = {
  name: "admin",
  aliases: [],
  version: "1.0.3",
  role: 0,
  author: "SK-SIDDIK-KHAN",
  description: "Display information about the bot admins and group admins.",
  usePrefix: true,
  guide: "{p}",
  category: "Admin",
  countDown: 5,
};
 
module.exports.onStart = async ({ message, event, bot, usersData, args }) => {
  try {
    const config = global.config || {};
 
    const adminBotIds = config.admins || [];
    const botOperatorIds = config.botOperator || [];
 
    const chatId = event.chat.id;
 
    let adminInfo = `╭━━━━━━━━━━━━━━━━╮
✨ 𝐁𝐎𝐓 𝐀𝐃𝐌𝐈𝐍 & 𝐎𝐏𝐄𝐑𝐀𝐓𝐎𝐑𝐒
╰━━━━━━━━━━━━━━━━╯`;
 
    if (!args[0]) {
 
      if (adminBotIds.length) {
        adminInfo += `\n\n👑 𝐁𝐎𝐓 𝐀𝐃𝐌𝐈𝐍𝐒:\n`;
 
        let i = 1;
        for (const adminId of adminBotIds) {
          let name = "Unknown";
          try {
            name = await usersData.getName(String(adminId));
          } catch {}
 
          adminInfo += `\n${i++}. 👤 ${name}\n   🆔 ${adminId}`;
        }
 
      } else {
        adminInfo += `\n\n⚠️ No Bot Admins Found`;
      }
 
      if (botOperatorIds.length) {
        adminInfo += `\n\n⚡ 𝐁𝐎𝐓 𝐎𝐏𝐄𝐑𝐀𝐓𝐎𝐑𝐒:\n`;
 
        let i = 1;
        for (const operatorId of botOperatorIds) {
          let name = "Unknown";
          try {
            name = await usersData.getName(String(operatorId));
          } catch {}
 
          adminInfo += `\n${i++}. 👤 ${name}\n   🆔 ${operatorId}`;
        }
 
      } else {
        adminInfo += `\n\n⚠️ No Bot Operators Found`;
      }
    }
 
    if (args[0]) {
      try {
        const chatAdmins = await bot.getChatAdministrators(chatId);
 
        if (chatAdmins?.length) {
          adminInfo += `\n\n╭━━━━━━━━━━━━━━━━━━╮
👥 𝐆𝐑𝐎𝐔𝐏 𝐀𝐃𝐌𝐈𝐍𝐒
╰━━━━━━━━━━━━━━━━━━╯`;
 
          let i = 1;
          for (const admin of chatAdmins) {
            const name =
              admin.user.username ||
              admin.user.first_name ||
              "Unknown";
 
            const adminId = admin.user.id;
 
            adminInfo += `\n\n${i++}. 👤 ${name}\n   🆔 ${adminId}`;
          }
 
        } else {
          adminInfo += `\n\n⚠️ No Group Admins Found`;
        }
 
      } catch {
        adminInfo += `\n\n❌ Cannot fetch group admins`;
      }
    }
 
    return message.reply(adminInfo);
 
  } catch (error) {
    console.log("ADMIN CMD ERROR:", error.message);
    return message.reply(`❌ | Error: ${error.message}`);
  }
};
 
