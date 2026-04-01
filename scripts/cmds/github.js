const axios = require("axios");
const moment = require("moment");

function autoDelete(bot, chatId, messageId, time = 5000) {
  setTimeout(() => {
    bot.deleteMessage(chatId, messageId).catch(() => {});
  }, time);
}

module.exports = {
  config: {
    name: "github",
    aliases: ["gitinfo", "githubinfo"],
    version: "3.4",
    author: "SK-SIDDIK-KHAN",
    cooldown: 5,
    role: 0,
    description: "Get GitHub user full info",
    category: "info",
    guide: "/github <username>"
  },

  onStart: async ({ bot, event, args }) => {
    const chatId = event.chat.id;

    if (!args[0]) {
      const msg = await bot.sendMessage(chatId, "Usage: /github <username>");
      return autoDelete(bot, chatId, msg.message_id, 5000);
    }

    const username = args[0];
    const api = `https://api.github.com/users/${username}`;

    try {
      const waitMsg = await bot.sendMessage(chatId, "Fetching GitHub data...");
      autoDelete(bot, chatId, waitMsg.message_id, 3000);

      const res = await axios.get(api, {
        headers: { "User-Agent": "Mozilla/5.0" }
      });

      const user = res.data;

      if (!user || !user.login) {
        const msg = await bot.sendMessage(chatId, "User not found");
        return autoDelete(bot, chatId, msg.message_id, 5000);
      }

      const info = 
`⊙─── [ 𝗚𝗜𝗧𝗛𝗨𝗕 𝗜𝗡𝗙𝗢 ] ───⊙

╰‣📛 Name: ${user.name || "No Name"}
╰‣👤 Username: ${user.login}
╰‣🔰 ID: ${user.id}
╰‣💬 Bio: ${user.bio || "No Bio"}
╰‣📦 Public Repos: ${user.public_repos || 0}
╰‣🎀 Followers: ${user.followers}
╰‣🔖 Following: ${user.following}
╰‣🌎 Location: ${user.location || "No Location"}
╰‣📌 Created: ${moment.utc(user.created_at).format("dddd, MMMM Do YYYY")}
╰‣♻ Updated: ${moment.utc(user.updated_at).format("dddd, MMMM Do YYYY")}
╰‣🔗 Profile: ${user.html_url}

⊙──── [ 𝐒𝐊 𝐒𝐈𝐃𝐃𝐈𝐊 ] ────⊙`;

      await bot.sendPhoto(chatId, user.avatar_url, {
        caption: info
      });

    } catch (err) {
      if (err.response?.status === 404) {
        const msg = await bot.sendMessage(chatId, "User not found");
        return autoDelete(bot, chatId, msg.message_id, 5000);
      }

      const msg = await bot.sendMessage(chatId, "Failed to fetch GitHub user");
      autoDelete(bot, chatId, msg.message_id, 5000);
    }
  }
};
