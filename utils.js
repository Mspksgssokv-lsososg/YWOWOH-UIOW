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

  // ===== EVENT LOAD (FINAL FIX) =====
  if (!fs.existsSync(eventsPath)) {
    console.log("❌ events folder not found!");
    return;
  }

  const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith(".js"));

  for (const file of eventFiles) {
    try {
      const event = require(path.join(eventsPath, file));

      if (typeof event.run !== "function") {
        console.log(`❌ Event ${file} has no run function`);
        continue;
      }

      // সব event message এ handle হবে
      bot.on("message", (msg) => {
        try {
          event.run({
            bot,
            event: msg
          });
        } catch (err) {
          console.error(`❌ Event error (${file}):`, err);
        }
      });

      global.events.set(file, event);
      console.log(`✅ Event loaded: ${file}`);
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

      // ===== EVENT RELOAD (FINAL FIX) =====
      if (filePath.includes("events")) {
        const ev = require(filePath);

        if (typeof ev.run !== "function") return;

        // পুরা listener reset
        bot.removeAllListeners("message");

        // সব event আবার load
        const files = fs.readdirSync(eventsPath).filter(f => f.endsWith(".js"));

        for (const f of files) {
          const e = require(path.join(eventsPath, f));

          if (typeof e.run !== "function") continue;

          bot.on("message", (msg) => {
            try {
              e.run({
                bot,
                event: msg
              });
            } catch (err) {
              console.error(`❌ Event error (${f}):`, err);
            }
          });
        }

        console.log(`♻️ Reloaded events`);
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
