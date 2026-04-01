const axios = require("axios");
const moment = require("moment");

module.exports = {
  config: {
    name: "github",
    aliases: ["git", "gh"],
    version: "3.0",
    author: "SK-SIDDIK-KHAN",
    cooldown: 5,
    role: 0,
    description: "Get GitHub user full info",
    category: "info",
    guide: "/github <username>"
  },

  onStart: async ({ bot, event, args, message }) => {
    const chatId = event.chat.id;

    if (!args[0]) {
      return message.reply("⚠️ | Usage: /github <username>");
    }

    const username = args[0];
    const api = `https://api.github.com/users/${username}`;

    try {
      const waitMsg = await bot.sendMessage(chatId, "⏳ | Fetching GitHub data...");

      const res = await axios.get(api);
      const user = res.data;

      if (!user || !user.login) {
        return bot.sendMessage(chatId, "❌ | User not found");
      }

      const info = 
`⊙─── [ 𝗚𝗜𝗧𝗛𝗨𝗕 𝗜𝗡𝗙𝗢 ] ───⊙

╰‣📛𝗡𝗮𝗺𝗲: ${user.name || "No Name"}
╰‣👤 𝗨𝘀𝗲𝗿𝗻𝗮𝗺𝗲: ${user.login}
╰‣🔰 𝗜𝗗: ${user.id}
╰‣💬 𝗕𝗶𝗼: ${user.bio || "No Bio"}
╰‣🔓 𝗣𝘂𝗯𝗹𝗶𝗰 𝗥𝗲𝗽𝗼𝘀𝗶𝘁𝗼𝗿𝗶𝗲𝘀: ${user.public_repos || "0"}
╰‣🎀 𝗙𝗼𝗹𝗹𝗼𝘄𝗲𝗿𝘀: ${user.followers}
╰‣🔖 𝗙𝗼𝗹𝗹𝗼𝘄𝗶𝗻𝗴: ${user.following}
╰‣🌎 𝗟𝗼𝗰𝗮𝘁𝗶𝗼𝗻: ${user.location || "No Location"}
╰‣📌 𝗔𝗰𝗰𝗼𝘂𝗻𝘁 𝗖𝗿𝗲𝗮𝘁𝗲𝗱: ${moment.utc(user.created_at).format("dddd, MMMM Do YYYY")}
╰‣♻ 𝗔𝗰𝗰𝗼𝘂𝗻𝘁 𝗨𝗽𝗱𝗮𝘁𝗲𝗱: ${moment.utc(user.updated_at).format("dddd, MMMM Do YYYY")}
╰‣🔗 𝗣𝗿𝗼𝗳𝗶𝗹𝗲: ${user.html_url}

⊙──── [ 𝐒𝐊 𝐒𝐈𝐃𝐃𝐈𝐊 ] ────⊙`;

      await bot.sendPhoto(chatId, user.avatar_url, {
        caption: info
      });

      await bot.deleteMessage(chatId, waitMsg.message_id);

    } catch (err) {
      console.log(err);
      bot.sendMessage(chatId, "❌ | Failed to fetch GitHub user");
    }
  }
};
