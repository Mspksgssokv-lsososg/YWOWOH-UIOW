const { writeFileSync } = require("fs-extra");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "whitelists",
    aliases: ["wlonly", "onlywlst", "onlywhitelist", "wl"],
    version: "1.5.5",
    author: "SK-SIDDIK-KHAN",
    countDown: 5,
    role: 2,
    usePrefix: false,
    category: "owner"
  },

  langs: {
    en: {
      added: `╭✦✅ | Added %1 user(s)
%2
╰‣`,

      alreadyAdded: `\n╭✦⚠️ | Already added %1 user(s)
%2
╰‣`,

      removed: `╭✦✅ | Removed %1 user(s)
%2
╰‣`,

      notAdded: `\n╭✦⚠️ | Not found %1 user(s)
%2
╰‣`,

      listAdmin: `╭✦✨ | Whitelist Users
%1
╰‣`,

      turnedOn: "✅  | 𝚃𝚞𝚛𝚗𝚎𝚍 𝚘𝚗 𝚝𝚑𝚎 𝚖𝚘𝚍𝚎 𝚘𝚗𝚕𝚢 𝚠𝚑𝚒𝚝𝚎𝚕𝚒𝚜𝚝𝙸𝚍𝚜 𝚌𝚊𝚗 𝚞𝚜𝚎 𝚋𝚘𝚝",

      turnedOff: "❎ | 𝚃𝚞𝚛𝚗𝚎𝚍 𝚘ff 𝚝𝚑𝚎 𝚖𝚘𝚍𝚎 𝚘𝚗𝚕𝚢 𝚠𝚑𝚒𝚝𝚎𝚕𝚒𝚜𝚝𝙸𝚍𝚜 𝚌𝚊𝚗 𝚞𝚜𝚎 𝚋𝚘𝚝",

      missing: "⚠️ | 𝙶𝚒𝚟𝚎 𝚄𝙸𝙳 𝚘𝚛 𝚛𝚎𝚙𝚕𝚢 𝚞𝚜𝚎𝚛"
    }
  },

  onStart: async function ({ bot, msg, args, message }) {

    const lang = module.exports.langs.en;

    if (!args[0]) {
      return message.reply("⚠️ | Use: wl add/remove/list/m on/off");
    }

    const userId = String(msg.from.id);
    const permission = (global.config.admins || []).map(String);

    if (!permission.includes(userId)) {
      return message.reply("❌ | 𝐘𝐨𝐮 𝐚𝐫𝐞 𝐧𝐨𝐭 𝐚𝐝𝐦𝐢𝐧");
    }

    const configPath = path.join(process.cwd(), "config.json");
    let config = {};

    try {
      config = JSON.parse(fs.readFileSync(configPath));
    } catch {
      config = {};
    }

    if (!config.white_list_ID) {
      config.white_list_ID = {
        enable: false,
        IDS: []
      };
    }

    config.white_list_ID.IDS = config.white_list_ID.IDS.map(String);

    const formatUsers = async (uids, showName = true) => {
      return (
        await Promise.all(
          uids.map(async (uid) => {
            if (!showName) {
              return `├‣ USER ID: ${uid}`;
            }

            try {
              const user = await bot.getChat(uid);
              const name = user.first_name || "Unknown";

              return `├‣ USER NAME: ${name}
├‣ USER ID: ${uid}`;
            } catch {
              return `├‣ USER NAME: Unknown
├‣ USER ID: ${uid}`;
            }
          })
        )
      ).join("\n");
    };

    switch (args[0]) {

      case "add": {
        if (!args[1] && !msg.reply_to_message)
          return message.reply(lang.missing);

        let uids = msg.reply_to_message
          ? [String(msg.reply_to_message.from.id)]
          : args.filter(arg => !isNaN(arg)).map(String);

        const added = [];
        const already = [];

        for (const uid of uids) {
          if (config.white_list_ID.IDS.includes(uid))
            already.push(uid);
          else {
            config.white_list_ID.IDS.push(uid);
            added.push(uid);
          }
        }

        writeFileSync(configPath, JSON.stringify(config, null, 2));

        const addedText = await formatUsers(added, true);
        const alreadyText = await formatUsers(already, false);

        return message.reply(
          lang.added.replace("%1", added.length).replace("%2", addedText) +
          (already.length
            ? lang.alreadyAdded.replace("%1", already.length).replace("%2", alreadyText)
            : "")
        );
      }

      case "remove": {
        if (!args[1] && !msg.reply_to_message)
          return message.reply(lang.missing);

        let uids = msg.reply_to_message
          ? [String(msg.reply_to_message.from.id)]
          : args.filter(arg => !isNaN(arg)).map(String);

        const removed = [];
        const notFound = [];

        for (const uid of uids) {
          if (config.white_list_ID.IDS.includes(uid)) {
            config.white_list_ID.IDS =
              config.white_list_ID.IDS.filter(id => id !== uid);
            removed.push(uid);
          } else {
            notFound.push(uid);
          }
        }

        writeFileSync(configPath, JSON.stringify(config, null, 2));

        const removedText = await formatUsers(removed, true);
        const notFoundText = await formatUsers(notFound, false);

        return message.reply(
          lang.removed.replace("%1", removed.length).replace("%2", removedText) +
          (notFound.length
            ? lang.notAdded.replace("%1", notFound.length).replace("%2", notFoundText)
            : "")
        );
      }

      case "list": {
        const list = config.white_list_ID.IDS;

        const listText = list.length
          ? await formatUsers(list, true)
          : "├‣ Empty";

        return message.reply(
          lang.listAdmin.replace("%1", listText)
        );
      }

      case "m": {
        if (args[1] === "on") {
          config.white_list_ID.enable = true;
          message.reply(lang.turnedOn);
        }
        else if (args[1] === "off") {
          config.white_list_ID.enable = false;
          message.reply(lang.turnedOff);
        }

        writeFileSync(configPath, JSON.stringify(config, null, 2));
      }
    }
  }
};
