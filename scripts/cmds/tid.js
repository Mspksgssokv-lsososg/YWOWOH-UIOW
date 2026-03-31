module.exports.config = {
    name: "tid",
    author: "SK-SIDDIK-KHAN",
    role: 0,
    description: "Get group id",
    commandCategory: "info",
    usage: "[]",
    usePrefix: true,
    premium: false
};

module.exports.onStart = async ({ event, bot }) => {
    try {
        const chatId = String(event.chat.id).replace(/^-/, ""); 

        bot.sendMessage(event.chat.id, `<code>${chatId}</code>`, {
            parse_mode: "HTML",
            reply_to_message_id: event.message_id
        });

    } catch (error) {
        console.log(error);
    }
};