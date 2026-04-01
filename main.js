const TelegramBot = require("node-telegram-bot-api");
const config = require("./config.json");
const { loadScripts, messageUtils } = require("./utils");

const fs = require("fs");
const path = require("path");

const utils = require("./utils");
global.utils = utils;

const usersData = require("./database/users");
const threadsData = require("./database/threads");

const token = process.env.TELEGRAM_BOT_TOKEN || config.token;
const bot = new TelegramBot(token, { polling: true });

global.commands = new Map();
global.events = new Map();
global.config = config;

global.functions = {
  reply: new Map(),
  onReply: new Map()
};

global.cooldowns = new Map();

loadScripts(bot);

// ================= THREAD SAVE =================
const threadFile = path.join(process.cwd(), "threads.json");
if (!fs.existsSync(threadFile)) fs.writeFileSync(threadFile, "[]");

function saveThread(chatId) {
  try {
    const data = JSON.parse(fs.readFileSync(threadFile));
    if (!data.includes(chatId)) {
      data.push(chatId);
      fs.writeFileSync(threadFile, JSON.stringify(data, null, 2));
    }
  } catch {
    fs.writeFileSync(threadFile, "[]");
  }
}
// =================================================

bot.on("message", async (msg) => {
  try {
    const text = msg.text?.trim() || "";
    if (!text) return;

    const prefix = config.prefix;
    const message = messageUtils(bot, msg);

    const chatId = msg.chat.id;
    const userId = msg.from.id;

    // ✅ AUTO SAVE THREAD
    saveThread(chatId);

    const isBotAdmin = (config.admins || []).includes(userId);
    const isOperator = (config.botOperator || []).includes(userId);

    if (config.ignore_list_ID?.enable &&
        config.ignore_list_ID.IDS.includes(userId)) return;

    if (config.white_list_ID?.enable &&
        !config.white_list_ID.IDS.includes(userId)) return;

    if (config.white_list_group?.enable &&
        !config.white_list_group.groups.includes(chatId)) return;

    let isAdmin = false;
    if (msg.chat.type !== "private") {
      try {
        const member = await bot.getChatMember(chatId, userId);
        isAdmin = ["administrator", "creator"].includes(member.status);
      } catch {}
    }

    const replyMsgId = msg.reply_to_message?.message_id;

    if (replyMsgId) {
      const data =
        global.functions.reply.get(replyMsgId) ||
        global.functions.onReply.get(replyMsgId);

      if (data) {
        const command = global.commands.get(data.commandName);

        if (command?.onReply || command?.reply) {
          return await (command.onReply || command.reply)({
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

    // onChat + noPrefix
    for (let cmd of global.commands.values()) {
      try {
        if (cmd.onChat) {
          await cmd.onChat({ bot, event: msg, msg, message, usersData, threadsData });
        }

        if (cmd.noPrefix && !text.startsWith(prefix)) {
          await cmd.noPrefix({ bot, event: msg, msg, message, usersData, threadsData });
        }
      } catch {}
    }

    // onMessage
    for (let cmd of global.commands.values()) {
      try {
        if (cmd.onMessage) {
          await cmd.onMessage({
            bot,
            chatId,
            userId,
            message: msg,
            messageId: msg.message_id,
            text,
            usersData,
            threadsData
          });
        }
      } catch {}
    }

    let commandName, args;

    if (text.startsWith(prefix)) {
      args = text.slice(prefix.length).trim().split(/ +/);
      commandName = args.shift()?.toLowerCase();
    } else {
      args = text.trim().split(/ +/);
      commandName = args.shift()?.toLowerCase();
    }

    const command =
      global.commands.get(commandName) ||
      [...global.commands.values()].find(cmd =>
        cmd.config?.aliases?.includes(commandName)
      );

    if (!command) return;

    if (command.config?.usePrefix === true && !text.startsWith(prefix)) return;

    // ================= COOLDOWN =================
    const cooldownTime = (command.config?.cooldown || 0) * 1000;

    if (cooldownTime > 0) {
      if (!global.cooldowns.has(commandName)) {
        global.cooldowns.set(commandName, new Map());
      }

      const now = Date.now();
      const timestamps = global.cooldowns.get(commandName);
      const expirationTime = timestamps.get(userId) || 0;

      if (now < expirationTime) {
        const timeLeft = ((expirationTime - now) / 1000).toFixed(1);
        return message.reply(`⏳ | Wait ${timeLeft}s`);
      }

      timestamps.set(userId, now + cooldownTime);
      setTimeout(() => timestamps.delete(userId), cooldownTime);
    }
    // ===========================================

    const role = command.config?.role ?? 0;

    if (role === 2 && !isBotAdmin)
      return message.reply("❌ | Bot admin only");

    if (role === 1 && !isBotAdmin && !isAdmin)
      return message.reply("❌ | Group admin only");

    if (role === 3 && !isBotAdmin && !isOperator)
      return message.reply("❌ | Operator only");

    try {
      if (command.onStart)
        await command.onStart({ bot, event: msg, msg, args, message, usersData, threadsData });

      else if (command.run)
        await command.run({ bot, event: msg, msg, args, message, usersData, threadsData });

      else if (command.start)
        await command.start({ bot, event: msg, msg, args, message, usersData, threadsData });

    } catch (err) {
      console.log(`❌ ${commandName}:`, err);
      message.err(err);
    }

  } catch (err) {
    console.log("❌ MAIN ERROR:", err);
  }
});

// ================= CALLBACK =================
bot.on("callback_query", async (query) => {
  try {
    if (!query.message) return;

    const msgId = query.message.message_id;
    const message = messageUtils(bot, query.message);

    const data =
      global.functions.reply.get(msgId) ||
      global.functions.onReply.get(msgId);

    if (!data) return;

    const command = global.commands.get(data.commandName);

    if (command?.onReply || command?.reply) {
      await (command.onReply || command.reply)({
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

  } catch (err) {
    console.log("❌ CALLBACK ERROR:", err);
  }
});

// ================= START LOG =================
console.log(`
━━━━━━━━━━━ SIDDIK BOT ━━━━━━━━━━━
🤖 Bot Running Successfully
📛 Name   : ${config.botName}
🔑 Prefix : ${config.prefix}
👑 Owner  : ${config.owner}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
