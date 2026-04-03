const TelegramBot = require("node-telegram-bot-api");
const config = require("./config.json");
const { loadScripts, messageUtils } = require("./utils");

const fs = require("fs");
const path = require("path");

// ================= GLOBAL =================
global.utils = require("./utils");

const usersData = require("./database/users");
const threadsData = require("./database/threads");

const token = process.env.TELEGRAM_BOT_TOKEN || config.token;
const bot = new TelegramBot(token, { polling: true });

global.commands = new Map();
global.events = new Map();
global.config = config;
global.adminOnly = false;

global.functions = {
  reply: new Map(),
  onReply: new Map()
};

global.cooldowns = new Map();
global.firstChatMap = new Set();

// ================= LOAD =================
loadScripts(bot);

// ================= FILE =================
const threadFile = path.join(process.cwd(), "threads.json");
const banFile = path.join(process.cwd(), "banned.json");

if (!fs.existsSync(threadFile)) fs.writeFileSync(threadFile, "[]");
if (!fs.existsSync(banFile)) fs.writeFileSync(banFile, "[]");

function getJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file));
  } catch {
    return [];
  }
}

function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function isBanned(userId) {
  return getJSON(banFile).includes(String(userId));
}

function saveThread(chatId) {
  const data = getJSON(threadFile);
  if (!data.includes(chatId)) {
    data.push(chatId);
    saveJSON(threadFile, data);
  }
}

// ================= MESSAGE =================
bot.on("message", async (msg) => {
  try {
    const text = msg.text?.trim();
    if (!text) return;

    const prefix = config.prefix;
    const message = messageUtils(bot, msg);

    const chatId = msg.chat?.id;
    const userId = msg.from?.id;
    if (!chatId || !userId) return;

    const isBotAdmin = (config.admins || []).includes(userId);

    // ================= BAN =================
    if (isBanned(userId))
      return message.reply("🚫 You are banned");

    if (global.adminOnly && !isBotAdmin)
      return message.reply("🔒 Admin only");

    saveThread(chatId);

    // ================= FIRST CHAT =================
    if (!global.firstChatMap.has(chatId)) {
      global.firstChatMap.add(chatId);
      for (const ev of global.events.values()) {
        if (ev.onFirstChat)
          await ev.onFirstChat({ bot, event: msg, message, usersData, threadsData });
      }
    }

    // ================= ON CHAT =================
    for (const cmd of global.commands.values()) {
      if (cmd.onChat)
        await cmd.onChat({ bot, event: msg, msg, message, usersData, threadsData });
    }

    // ================= EVENT =================
    for (const ev of global.events.values()) {
      if (ev.onEvent)
        await ev.onEvent({ bot, event: msg, message, usersData, threadsData });
    }

    // ================= REPLY =================
    const replyMsgId = msg.reply_to_message?.message_id;
    if (replyMsgId) {
      const data =
        global.functions.reply.get(replyMsgId) ||
        global.functions.onReply.get(replyMsgId);

      if (data) {
        const command = global.commands.get(data.commandName);
        if (command?.onReply) {
          return await command.onReply({
            bot,
            event: msg,
            msg,
            message,
            args: text.split(" "),
            Reply: data,
            usersData,
            threadsData
          });
        }
      }
    }

    // ================= COMMAND =================
    if (!text.startsWith(prefix)) return;

    const args = text.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift()?.toLowerCase();

    const command =
      global.commands.get(commandName) ||
      [...global.commands.values()].find(cmd =>
        cmd.config?.aliases?.includes(commandName)
      );

    // ================= NOT FOUND =================
    if (!command)
      return message.reply("❌ Command not found");

    // ================= COOLDOWN =================
    const cooldown = (command.config?.cooldown || 0) * 1000;

    if (cooldown > 0) {
      if (!global.cooldowns.has(commandName))
        global.cooldowns.set(commandName, new Map());

      const now = Date.now();
      const timestamps = global.cooldowns.get(commandName);
      const expire = timestamps.get(userId) || 0;

      if (now < expire)
        return message.reply(`⏳ Wait ${Math.ceil((expire - now) / 1000)}s`);

      timestamps.set(userId, now + cooldown);
      setTimeout(() => timestamps.delete(userId), cooldown);
    }

    // ================= ROLE =================
    const role = command.config?.role ?? 0;

    if (role === 2 && !isBotAdmin)
      return message.reply("⚠️ Only bot admin");

    // ================= START =================
    try {
      if (command.onStart)
        await command.onStart({
          bot,
          event: msg,
          msg,
          args,
          message,
          usersData,
          threadsData
        });

    } catch (err) {
      console.log(`❌ ${commandName}:`, err);
      message.reply("❌ Error occurred");
    }

  } catch (err) {
    console.log("❌ MAIN ERROR:", err);
  }
});

// ================= REACTION =================
bot.on("message_reaction", async (reaction) => {
  for (const ev of global.events.values()) {
    if (ev.onReaction)
      await ev.onReaction({ bot, event: reaction });
  }
});

// ================= CALLBACK =================
bot.on("callback_query", async (query) => {
  const msgId = query.message?.message_id;
  const message = messageUtils(bot, query.message);

  const data =
    global.functions.reply.get(msgId) ||
    global.functions.onReply.get(msgId);

  if (!data) return;

  const command = global.commands.get(data.commandName);

  if (command?.onReply) {
    await command.onReply({
      bot,
      event: query,
      msg: query.message,
      message,
      args: query.data?.split(" ") || [],
      Reply: data,
      usersData,
      threadsData
    });
  }
});

// ================= GLOBAL EVENT =================
global.handlerEvent = async function (type, data) {
  for (const ev of global.events.values()) {
    if (ev.handlerEvent) {
      await ev.handlerEvent({ bot, type, data });
    }
  }
};

// ================= ERROR =================
process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);

// ================= START =================
console.log(`
🤖 ${config.botName} Running...
Prefix: ${config.prefix}
Owner : ${config.owner}
`);

bot.on("polling_error", console.log);
