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

async function getExtensionFromUrl(mediaUrl) {
  try {
    const response = await axios.get(mediaUrl, { responseType: "stream" });
    const type = response.headers["content-type"];
    return getExtensionFromMimeType(type) || path.extname(new URL(mediaUrl).pathname).toLowerCase();
  } catch {
    return path.extname(mediaUrl).toLowerCase();
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
  try {
    const res = await axios.get(url, { responseType: "arraybuffer" });
    await fs.writeFile(downloadPath, Buffer.from(res.data));
  } catch {
    throw new Error("Download failed");
  }
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
    send: async (text, opt = {}) => {
      try {
        return await bot.sendMessage(chatId, text, opt);
      } catch (e) {
        return sendErr(e);
      }
    },

    reply: async (text, opt = {}) => {
      try {
        return await bot.sendMessage(chatId, text, {
          reply_to_message_id: messageId,
          ...opt
        });
      } catch (e) {
        return sendErr(e);
      }
    },

    unsend: async (id) => {
      try {
        return await bot.deleteMessage(chatId, id);
      } catch {}
    },

    stream: async ({ url, caption = "" }) => {
      try {
        const ext = url.startsWith("http")
          ? await getExtensionFromUrl(url)
          : path.extname(url).toLowerCase();

        const options = { caption, reply_to_message_id: messageId };

        if ([".jpg", ".jpeg", ".png", ".gif"].includes(ext)) {
          return bot.sendPhoto(chatId, url, options);
        }

        if ([".mp4", ".mov"].includes(ext)) {
          return bot.sendVideo(chatId, url, options);
        }

        if ([".mp3", ".wav", ".m4a"].includes(ext)) {
          return bot.sendAudio(chatId, url, options);
        }

        throw new Error("Unsupported media type");
      } catch (e) {
        return sendErr(e);
      }
    },

    download: async ({ url, mimeType }) => {
      try {
        const ext = getExtensionFromMimeType(mimeType) || ".tmp";
        const file = path.join(process.cwd(), `temp_${Date.now()}${ext}`);

        await downloadFile(url, file);

        const options = { reply_to_message_id: messageId };

        if (mimeType.startsWith("image")) {
          await bot.sendPhoto(chatId, file, options);
        } else if (mimeType.startsWith("video")) {
          await bot.sendVideo(chatId, file, options);
        } else if (mimeType.startsWith("audio")) {
          await bot.sendAudio(chatId, file, options);
        } else {
          throw new Error("Unsupported file type");
        }

        await fs.remove(file);
      } catch (e) {
        return sendErr(e);
      }
    },

    code: async (txt) => {
      try {
        return await bot.sendMessage(
          chatId,
          `\`\`\`js\n${txt}\n\`\`\``,
          {
            parse_mode: "Markdown",
            reply_to_message_id: messageId
          }
        );
      } catch (e) {
        return sendErr(e);
      }
    },

    err: sendErr
  };
}

function loadScripts(bot) {
  const cmdPath = path.join(process.cwd(), "scripts", "cmds");
  const evPath = path.join(process.cwd(), "scripts", "events");

  if (!fs.existsSync(cmdPath)) fs.mkdirSync(cmdPath, { recursive: true });
  if (!fs.existsSync(evPath)) fs.mkdirSync(evPath, { recursive: true });

  console.log(
    `\n${c.cyan}────────────────────────────────────────────
${c.bold}${c.pink}🚀 LOADING COMMANDS${c.reset}
${c.cyan}────────────────────────────────────────────${c.reset}`
  );

  fs.readdirSync(cmdPath).forEach(file => {
    if (!file.endsWith(".js")) return;

    try {
      delete require.cache[require.resolve(path.join(cmdPath, file))];
      const cmd = require(path.join(cmdPath, file));

      if (!cmd.config?.name) {
        console.log(`${c.yellow}${s.warn} cmd skipped ${c.bold}${file}${c.reset}`);
        return;
      }

      global.commands.set(cmd.config.name, cmd);

      console.log(
        `${c.green}${s.ok} cmd load successfully ${c.bold}${file}${c.reset}`
      );
    } catch {
      console.log(
        `${c.red}${s.err} cmd load failed ${c.bold}${file}${c.reset}`
      );
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

      console.log(
        `${c.cyan}${s.ok} event load successfully ${c.bold}${file}${c.reset}`
      );
    } catch {
      console.log(
        `${c.red}${s.err} event load failed ${c.bold}${file}${c.reset}`
      );
    }
  });

  chokidar.watch([cmdPath, evPath]).on("change", file => {
    try {
      delete require.cache[require.resolve(file)];

      if (file.includes("cmds")) {
        const cmd = require(file);
        if (!cmd.config?.name) return;

        global.commands.set(cmd.config.name, cmd);

        console.log(
          `${c.green}${s.reload} cmd reload ${c.bold}${path.basename(file)}${c.reset}`
        );
      }

      if (file.includes("events")) {
        const name = path.parse(file).name;

        if (global.events.has(name)) {
          bot.removeListener(name, global.events.get(name));
        }

        const ev = require(file);
        if (typeof ev.run !== "function") return;

        const handler = (...args) => ev.run({ bot, event: args[0] });

        bot.on(name, handler);
        global.events.set(name, handler);

        console.log(
          `${c.cyan}${s.reload} event reload ${c.bold}${name}${c.reset}`
        );
      }
    } catch {
      console.log(
        `${c.red}${s.err} reload failed ${c.bold}${path.basename(file)}${c.reset}`
      );
    }
  });
}

module.exports = {
  messageUtils: message,
  loadScripts,
  getStreamFromURL
};
