const path = require("path");
const axios = require("axios");
const fs = require("fs-extra");
const chokidar = require("chokidar");

const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  pink: "\x1b[38;5;213m",
  mint: "\x1b[38;5;121m",
  lavender: "\x1b[38;5;183m",
  orange: "\x1b[38;5;208m"
};

const s = {
  ok: "✅",
  err: "❌",
  warn: "⚠️",
  reload: "♻️",
  arrow: "➤"
};

async function getStreamFromURL(url) {
  try {
    const res = await axios.get(url, { responseType: "stream" });
    return res.data;
  } catch {
    throw new Error("Failed to get stream");
  }
}

function getExtensionFromMimeType(mimeType = "") {
  const map = {
    "video/mp4": ".mp4",
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "audio/mpeg": ".mp3",
    "audio/mp4": ".m4a",
    "audio/wav": ".wav"
  };
  return map[mimeType] || "";
}

async function downloadFile(url, downloadPath) {
  const res = await axios.get(url, { responseType: "arraybuffer" });
  await fs.writeFile(downloadPath, Buffer.from(res.data));
}

function message(bot, msg) {
  const chatId = msg.chat.id;
  const messageId = msg.message_id;

  async function sendErr(err) {
    const text =
      typeof err === "object"
        ? `${err.name || "Error"}: ${err.message}`
        : err;

    return bot.sendMessage(chatId, `❌ | ${text}`, {
      reply_to_message_id: messageId
    });
  }

  return {
    reply: (text, opt = {}) =>
      bot.sendMessage(chatId, text, {
        reply_to_message_id: messageId,
        ...opt
      }).catch(sendErr),

    send: (text, opt = {}) =>
      bot.sendMessage(chatId, text, opt).catch(sendErr),

    unsend: (id) =>
      bot.deleteMessage(chatId, id).catch(() => {}),

    err: sendErr
  };
}

function loadScripts(bot) {
  const cmdPath = path.join(process.cwd(), "scripts", "cmds");
  const evPath = path.join(process.cwd(), "scripts", "events");

  if (!fs.existsSync(cmdPath)) fs.mkdirSync(cmdPath, { recursive: true });
  if (!fs.existsSync(evPath)) fs.mkdirSync(evPath, { recursive: true });

  console.log(`\n🚀 LOADING COMMANDS\n`);

  fs.readdirSync(cmdPath).forEach(file => {
    if (!file.endsWith(".js")) return;

    try {
      delete require.cache[require.resolve(path.join(cmdPath, file))];
      const cmd = require(path.join(cmdPath, file));

      if (!cmd.config?.name) return;

      global.commands.set(cmd.config.name, cmd);
      console.log(`✅ CMD: ${file}`);
    } catch {
      console.log(`❌ CMD ERROR: ${file}`);
    }
  });

  console.log(`\n⚡ LOADING EVENTS\n`);

  fs.readdirSync(evPath).forEach(file => {
    if (!file.endsWith(".js")) return;

    try {
      delete require.cache[require.resolve(path.join(evPath, file))];

      const ev = require(path.join(evPath, file));

      if (typeof ev.run !== "function") return;

      const eventName = ev.event || "message";

      const handler = (event) => ev.run({ bot, event });

      bot.on(eventName, handler);

      global.events.set(file, {
        event: eventName,
        handler
      });

      console.log(`✅ EVENT: ${file} → ${eventName}`);
    } catch {
      console.log(`❌ EVENT ERROR: ${file}`);
    }
  });

  chokidar.watch([cmdPath, evPath]).on("change", file => {
    try {
      delete require.cache[require.resolve(file)];

      if (file.includes("cmds")) {
        const cmd = require(file);
        if (!cmd.config?.name) return;

        global.commands.set(cmd.config.name, cmd);
        console.log(`♻️ CMD RELOAD: ${path.basename(file)}`);
      }

      if (file.includes("events")) {
        const fileName = path.basename(file);

        const old = global.events.get(fileName);
        if (old) bot.removeListener(old.event, old.handler);

        const ev = require(file);
        if (typeof ev.run !== "function") return;

        const eventName = ev.event || "message";
        const handler = (event) => ev.run({ bot, event });

        bot.on(eventName, handler);

        global.events.set(fileName, {
          event: eventName,
          handler
        });

        console.log(`♻️ EVENT RELOAD: ${fileName}`);
      }
    } catch {
      console.log(`❌ RELOAD ERROR: ${path.basename(file)}`);
    }
  });
}

module.exports = {
  messageUtils: message,
  loadScripts,
  getStreamFromURL
};
