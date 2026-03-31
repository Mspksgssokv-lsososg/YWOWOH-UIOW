module.exports.config = {
    name: "spy",
    aliases: ["userinfo"],
    version: "1.0",
    credits: "SK-SIDDIK-KHAN",
    role: 0,
    usePrefix: true,
    description: "Get information about a user, including their bio and avatar",
    commandCategory: "utility",
    guide: " [user_id]",
    coolDowns: 5,
    premium: false
};

module.exports.run = async({ bot, event, message, args }) => {
    const userId = event.reply_to_message?.from.id || args[0] || event.from.id;

    try {
        const userProfile = await bot.getUserProfilePhotos(userId);
        const user = await bot.getChat(userId);

        const bio = user.bio || 'No bio available';
        const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
        const username = user.username ? `@${user.username}` : 'No username';

        let profilePhotoUrl = null;
        if (userProfile.total_count > 0) {
            profilePhotoUrl = userProfile.photos[0][0].file_id;
        }

        const status = user.is_bot ? 'Bot' : 'User';
        const userLink = user.username ? `https://t.me/${user.username}` : 'No link available';

        const infoMessage = `
╭──✦ [ 𝐔𝐬𝐞𝐫 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧 ]
├‣ 🆔 𝚄𝚜𝚎𝚛 𝙸𝙳: ${userId}
├‣ 👤 𝙵𝚞𝚕𝚕 𝙽𝚊𝚖𝚎: ${fullName}
├‣ 📱 𝚄𝚜𝚎𝚛𝚗𝚊𝚖𝚎: ${username}
├‣ 📝 𝙱𝚒𝚘: ${bio}
├‣ 📊 𝚂𝚝𝚊𝚝𝚞𝚜: ${status}
╰‣ 🔗 𝚄𝚜𝚎𝚛 𝙻𝚒𝚗𝚔: ${userLink}`;

        if (profilePhotoUrl) {
            await bot.sendPhoto(event.chat.id, profilePhotoUrl, {
                caption: infoMessage,
                reply_to_message_id: event.message_id
            });
        } else {
            await message.reply(infoMessage);
        }

    } catch (error) {
        console.error('Error:', error.message);
        await message.reply(`❌ | Error occurred: ${error.message}`);
    }
};