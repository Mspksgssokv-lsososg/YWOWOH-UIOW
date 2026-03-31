const path = require("path");
const fs = require("fs-extra");
const chokidar = require("chokidar");

// ================= MESSAGE =================
function message(bot, msg) {
  const chatId = msg.chat.id;
  const messageId = msg.message_id;

  async function sendMessageError(err) {
    if (typeof err === "object" && !err.stack)
      err = JSON.stringify(err, null, 2);
    else err = `${err.name || err.error}: ${err.message}`;

    return await bot.sendMessage(chatId, `❌ | Error: ${err}`, {
      reply_to_message_id: messageId,
    });
  }

  return {
    send: async (text, options = {}) => {
      try {
        return await bot.sendMessage(chatId, text, options);
      } catch (err) {
        await sendMessageError(err);
      }
    },

    reply: async (text, options = {}) => {
      try {
        return await bot.sendMessage(chatId, text, {
          ...options,
          reply_to_message_id: messageId,
        });
      } catch (err) {
        await sendMessageError(err);
      }
    },

    err: async (err) => {
      await sendMessageError(err);
    }
  };
}

// ================= LOAD SCRIPTS =================
function loadScripts(bot) {

  const commandsPath = path.join(__dirname, "scripts", "cmds");
  const eventsPath = path.join(__dirname, "scripts", "events");

  // ===== COMMAND LOAD =====
  if (!fs.existsSync(commandsPath)) {
    console.log("❌ cmds folder not found!");
    return;
  }

  const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));

  for (const file of commandFiles) {
    try {
      const command = require(path.join(commandsPath, file));

      if (!command.config || !command.run) continue;

      global.commands.set(command.config.name, command);
      console.log(`✅ Command: ${command.config.name}`);
    } catch (err) {
      console.error(`❌ ${file}`, err);
    }
  }

  // ===== EVENT LOAD (FIXED) =====
  if (!fs.existsSync(eventsPath)) {
    console.log("❌ events folder not found!");
    return;
  }

  const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith(".js"));

  for (const file of eventFiles) {
    try {
      const event = require(path.join(eventsPath, file));
      const eventName = file.replace(".js", "");

      if (typeof event.run !== "function") {
        console.log(`❌ Event ${file} has no run function`);
        continue;
      }

      bot.on(eventName, (msg) => {
        event.run({
          bot,
          event: msg
        });
      });

      global.events.set(eventName, event);
      console.log(`✅ Event: ${eventName}`);
    } catch (err) {
      console.error(`❌ ${file}`, err);
    }
  }

  // ===== AUTO RELOAD =====
  chokidar.watch([commandsPath, eventsPath]).on("change", (filePath) => {
    delete require.cache[require.resolve(filePath)];

    try {
      const fileName = path.basename(filePath, ".js");

      // ===== COMMAND RELOAD =====
      if (filePath.includes("cmds")) {
        const cmd = require(filePath);

        if (!cmd.config || !cmd.run) return;

        global.commands.set(cmd.config.name, cmd);
        console.log(`♻️ Reloaded command: ${fileName}`);
      }

      // ===== EVENT RELOAD (FIXED) =====
      if (filePath.includes("events")) {
        const ev = require(filePath);

        if (typeof ev.run !== "function") return;

        bot.removeAllListeners(fileName);

        bot.on(fileName, (msg) => {
          ev.run({
            bot,
            event: msg
          });
        });

        global.events.set(fileName, ev);
        console.log(`♻️ Reloaded event: ${fileName}`);
      }

    } catch (err) {
      console.error("Reload error:", err);
    }
  });
}

module.exports = {
  messageUtils: message,
  loadScripts
};
