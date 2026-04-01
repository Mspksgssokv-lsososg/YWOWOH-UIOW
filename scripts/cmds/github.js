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
    version: "3.2",
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
    const msg = await bot.sendMessage(chatId, "⚠️ | Usage: /github <username>");
    return autoDelete(bot, chatId, msg.message_id);
  }

  const username = args[0];
  const api = `https://api.github.com/users/${username}`;

  let waitMsg;

  try {
    waitMsg = await bot.sendMessage(chatId, "⏳ | Fetching GitHub data...");

    const res = await axios.get(api, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const user = res.data;

    if (!user || !user.login) {
      const msg = await bot.sendMessage(chatId, "❌ | User not found");
      return autoDelete(bot, chatId, msg.message_id);
    }

    const info = `⊙─── [ 𝗚𝗜𝗧𝗛𝗨𝗕 𝗜𝗡𝗙𝗢 ] ───⊙

╰‣📛𝗡𝗮𝗺𝗲: ${user.name || "No Name"}
╰‣👤 𝗨𝘀𝗲𝗿𝗻𝗮𝗺𝗲: ${user.login}
╰‣🔰 𝗜𝗗: ${user.id}
╰‣💬 𝗕𝗶𝗼: ${user.bio || "No Bio"}
╰‣🔓 𝗣𝘂𝗯𝗹𝗶𝗰 𝗥𝗲𝗽𝗼𝘀𝗶𝘁𝗼𝗿𝗶𝗲𝘀: ${user.public_repos || "0"}
╰‣🎀 𝗙𝗼𝗹𝗹𝗼𝘄𝗲𝗿𝘀: ${user.followers}
╰‣🔖 𝗙𝗼𝗹𝗹𝗼𝘄𝗶𝗻𝗴: ${user.following}
╰‣🌎 𝗟𝗼𝗰𝗮𝘁𝗶𝗼𝗻: ${user.location || "No Location"}
╰‣📌 𝗔𝗰𝗰𝗼𝘂𝗨𝗻𝘁 𝗖𝗿𝗲𝗮𝘁𝗲𝗱: ${moment.utc(user.created_at).format("dddd, MMMM Do YYYY")}
╰‣♻ 𝗔𝗰𝗰𝗼𝘂𝗨𝗨𝗻𝘁 𝗨𝗽𝗱𝗮𝘁𝗲𝗱: ${moment.utc(user.updated_at).format("dddd, MMMM Do YYYY")}
╰‣🔗 𝗣𝗿𝗼𝗳𝗶𝗹𝗲: ${user.html_url}

⊙──── [ 𝐒𝐊 𝐒𝐈𝐃𝐃𝐈𝐊 ] ────⊙`;

    await bot.sendPhoto(chatId, user.avatar_url, {
      caption: info
    });

  } catch (err) {
    console.log("GitHub Error:", err.response?.status || err.message);

    if (err.response?.status === 404) {
      const msg = await bot.sendMessage(chatId, "❌ | User not found");
      return autoDelete(bot, chatId, msg.message_id);
    }

    const msg = await bot.sendMessage(chatId, "❌ | Failed to fetch GitHub user");
    autoDelete(bot, chatId, msg.message_id);

  } finally {
    if (waitMsg) {
      bot.deleteMessage(chatId, waitMsg.message_id).catch(() => {});
    }
  }
}
