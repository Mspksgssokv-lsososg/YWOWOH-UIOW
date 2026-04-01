const fs = require("fs");
const path = require("path");

const configPath = path.join(process.cwd(), "config.json");

function getConfig() {
  return JSON.parse(fs.readFileSync(configPath, "utf-8"));
}

function saveConfig(data) {
  fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
}

module.exports = {
  config: {
    name: "whitelist",
    aliases: ["wl"],
    role: 2,
    category: "admin",
    description: "Whitelist system"
  },

  onStart: async ({ message, args, event, usersData }) => {
    let data = getConfig();

    // ===== INIT =====
    if (!data.white_list_ID) {
      data.white_list_ID = {
        enable: false,
        IDS: []
      };
    }

    const action = args[0];
    let uids = [];

    // ===== GET USER ID =====
    if (Object.keys(event.entities || {}).length > 0) {
      uids = Object.keys(event.entities);
    } else if (args[1]) {
      uids = args.slice(1).filter(id => !isNaN(id));
    }

    // ===== ADD =====
    if (action === "add" || action === "-a") {
      if (uids.length === 0)
        return message.reply("⚠️ Provide user ID");

      let added = [];
      let exists = [];

      for (let uid of uids) {
        if (data.white_list_ID.IDS.includes(uid)) {
          exists.push(uid);
        } else {
          data.white_list_ID.IDS.push(uid);
          added.push(uid);
        }
      }

      saveConfig(data);
      global.config = data;

      return message.reply(
        `✅ Added:\n${added.join("\n") || "None"}\n\n⚠️ Already:\n${exists.join("\n") || "None"}`
      );
    }

    // ===== REMOVE =====
    if (action === "remove" || action === "-r") {
      if (uids.length === 0)
        return message.reply("⚠️ Provide user ID");

      let removed = [];
      let notFound = [];

      for (let uid of uids) {
        if (data.white_list_ID.IDS.includes(uid)) {
          data.white_list_ID.IDS =
            data.white_list_ID.IDS.filter(id => id !== uid);
          removed.push(uid);
        } else {
          notFound.push(uid);
        }
      }

      saveConfig(data);
      global.config = data;

      return message.reply(
        `❌ Removed:\n${removed.join("\n") || "None"}\n\n⚠️ Not Found:\n${notFound.join("\n") || "None"}`
      );
    }

    // ===== LIST =====
    if (action === "list" || action === "-l") {
      if (data.white_list_ID.IDS.length === 0)
        return message.reply("📭 Empty whitelist");

      return message.reply(
        "👑 Whitelist:\n" + data.white_list_ID.IDS.join("\n")
      );
    }

    // ===== ON =====
    if (action === "on") {
      data.white_list_ID.enable = true;

      saveConfig(data);
      global.config = data;

      return message.reply("✅ Whitelist ON");
    }

    // ===== OFF =====
    if (action === "off") {
      data.white_list_ID.enable = false;

      saveConfig(data);
      global.config = data;

      return message.reply("❌ Whitelist OFF");
    }

    // ===== USAGE =====
    return message.reply(
`Usage:
/whitelist add <id>
/whitelist remove <id>
/whitelist list
/whitelist on
/whitelist off`
    );
  }
};
