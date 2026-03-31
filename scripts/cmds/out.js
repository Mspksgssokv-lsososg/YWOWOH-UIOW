module.exports.config = {
    name: "out",
    aliases: ["leave"],
    version: "1.0",
    credits: "SK-SIDDIK-KHAN",
    role: 1, 
    usePrefix: true,
    description: "Make the bot leave the group",
    commandCategory: "utility",
    guide: { en: "out" },
    coolDowns: 5,
};

module.exports.run = async({ api, event, message }) => {
    const chatId = event.chat.id;

    try {
        await api.leaveChat(chatId);
    } catch (error) {
        console.error('Error leaving group:', error.message);
        await message.reply(`❌ | Error occurred: ${error.message}`);
    }
};
