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
  pink: "\x1b[38;5;213m",
  lavender: "\x1b[38;5;183m"
};

const s = {
  ok: "✅",
  err: "❌",
  warn: "⚠️",
  reload: "♻️"
};

async function getStreamFromURL(url) {
  const res = await axios.get(url, { responseType: "stream" });
  return res.data;
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

async function downloadFile(url, filePath) {
  const res = await axios.get(url, { responseType: "arraybuffer" });
  await fs.writeFile(filePath, Buffer.from(res.data));
}

function message(bot, msg) {
  const chatId = msg.chat.id;
  const messageId = msg.message_id;

  const sendErr = (err) =>
    bot.sendMessage(chatId, `❌ | ${err.message || err}`, {
      reply_to_message_id: messageId
    });

  return {
    reply: (text, opt = {}) =>
      bot.sendMessage(chatId, text, {
        reply_to_message_id: messageId,
        ...opt
      }).catch(sendErr),

    stream: async ({ url, caption = "" }) => {
      try {
        const ext = path.extname(url).toLowerCase();
        const opt = { caption, reply_to_message_id: messageId };

        if ([".jpg", ".png", ".jpeg", ".gif"].includes(ext))
          return bot.sendPhoto(chatId, url, opt);

        if ([".mp4", ".mov"].includes(ext))
          return bot.sendVideo(chatId, url, opt);

        if ([".mp3", ".wav", ".m4a"].includes(ext))
          return bot.sendAudio(chatId, url, opt);

      } catch (e) {
        sendErr(e);
      }
    },

    download: async ({ url, mimeType }) => {
      try {
        const ext = getExtensionFromMimeType(mimeType) || ".tmp";

        const tempDir = path.join(process.cwd(), "temp");
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

        const file = path.join(tempDir, `temp_${Date.now()}${ext}`);

        await downloadFile(url, file);

        const opt = { reply_to_message_id: messageId };

        if (mimeType.startsWith("image"))
          await bot.sendPhoto(chatId, file, opt);
        else if (mimeType.startsWith("video"))
          await bot.sendVideo(chatId, file, opt);
        else if (mimeType.startsWith("audio"))
          await bot.sendAudio(chatId, file, opt);

        await fs.remove(file).catch(() => {});
      } catch (e) {
        sendErr(e);
      }
    }
  };
}

function loadScripts(bot) {
  const cmdPath = path.join(process.cwd(), "scripts", "cmds");
  const evPath = path.join(process.cwd(), "scripts", "events");

  if (!fs.existsSync(cmdPath)) fs.mkdirSync(cmdPath, { recursive: true });
  if (!fs.existsSync(evPath)) fs.mkdirSync(evPath, { recursive: true });

  global.commands = new Map();
  global.events = new Map();

  console.log(
    `\n${c.cyan}────────────────────────────────────────────
${c.bold}${c.pink}🚀 LOADING COMMANDS${c.reset}
${c.cyan}────────────────────────────────────────────${c.reset}`
  );

  fs.readdirSync(cmdPath).forEach(file => {
    if (!file.endsWith(".js")) return;

    try {
      const cmd = require(path.join(cmdPath, file));
      if (!cmd.config?.name) return;

      global.commands.set(cmd.config.name, cmd);
      console.log(`${c.green}${s.ok} ${file}${c.reset}`);
    } catch {
      console.log(`${c.red}${s.err} ${file}${c.reset}`);
    }
  });

  console.log(
    `\n${c.cyan}────────────────────────────────────────────
${c.bold}${c.lavender}⚡ LOADING EVENTS${c.reset}
${c.cyan}────────────────────────────────────────────${c.reset}`
  );

  fs.readdirSync(evPath).forEach(file => {
    if (!file.endsWith(".js")) return;

    try {
      const ev = require(path.join(evPath, file));
      if (typeof ev.run !== "function") return;

      const eventName = ev.event || "message";

      const handler = (event) => ev.run({ bot, event });

      bot.on(eventName, handler);

      global.events.set(file, { event: eventName, handler });

      console.log(`${c.cyan}${s.ok} ${file}${c.reset}`);
    } catch {
      console.log(`${c.red}${s.err} ${file}${c.reset}`);
    }
  });

  chokidar.watch([cmdPath, evPath], {
    ignoreInitial: true,
    ignored: /(^|[\/\\])\../
  })
  .on("change", file => {

    if (!file.endsWith(".js")) return;

    try {
      delete require.cache[require.resolve(file)];

      if (file.includes("cmds")) {
        const cmd = require(file);
        if (!cmd.config?.name) return;

        global.commands.set(cmd.config.name, cmd);

        console.log(`${c.green}${s.reload} ${path.basename(file)}${c.reset}`);
      }

      if (file.includes("events")) {
        const name = path.parse(file).name;

        if (global.events.has(name)) {
          const old = global.events.get(name);
          bot.removeListener(old.event, old.handler);
        }

        const ev = require(file);
        if (typeof ev.run !== "function") return;

        const eventName = ev.event || "message";
        const handler = (event) => ev.run({ bot, event });

        bot.on(eventName, handler);

        global.events.set(name, { event: eventName, handler });

        console.log(`${c.cyan}${s.reload} ${name}${c.reset}`);
      }

    } catch {
      console.log(`${c.red}${s.err} reload failed ${path.basename(file)}${c.reset}`);
    }
  });
}

module.exports = {
  messageUtils: message,
  loadScripts,
  getStreamFromURL
};
