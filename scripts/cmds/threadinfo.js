module.exports.config = {
    name: "threadinfo",
    aliases:["tinfo","groupinfo"],
    author: "SK-SIDDIK-KHAN",
    description: "Get information about the group",
    commandCategory: "info",
    usage: "[]",
    usePrefix: true,
    role: 0 
};

module.exports.onStart = async ({ bot, event, message }) => {
    try {
        const chat = await bot.getChat(event.chat.id);

        let infoMessage = `╭───[ ᰔᩚ 𝙂𝙍𝙊𝙐𝙋 𝙄𝙉𝙁𝙊࿐ ]\n`;
        infoMessage += `╰‣⊰ 𝙶𝚛𝚘𝚞𝚙 𝙽𝚊𝚖𝚎: ${chat.title}\n`;
        infoMessage += `╰‣⊰ 𝚃𝚢𝚙𝚎: ${chat.type}\n`;
        infoMessage += `╰‣⊰ 𝚃𝙸𝙳: ${chat.id}\n`;

        if (chat.description) {
            infoMessage += `╰‣ 𝙳𝚎𝚜𝚌𝚛𝚒𝚙𝚝𝚒𝚘𝚗: ${chat.description}\n`;
        }

        if (chat.invite_link) {
            infoMessage += `╰‣ 𝙸𝚗𝚟𝚒𝚝𝚎 𝙻𝚒𝚗𝚔: ${chat.invite_link}\n`;
        }

        await message.reply(infoMessage);

    } catch (error) {
        console.log('Error:', error.message);
        message.reply('❌ Error');
    }
};