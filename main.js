const TelegramBot = require("node-telegram-bot-api");
const config = require("./config.json");
const { loadScripts, messageUtils } = require("./utils");

const usersData = require("./database/users");
const threadsData = require("./database/threads");

const token = process.env.TELEGRAM_BOT_TOKEN || config.token;
const bot = new TelegramBot(token, { polling: true });

global.commands = new Map();
global.events = new Map();

global.functions = {
  config: config,
  reply: new Map(),
  onReply: new Map()
};

loadScripts(bot);

bot.on("message", async (msg) => {
  try {
    const text = msg.text || "";
    const prefix = config.prefix;

    if (!text) return;

    const message = messageUtils(bot, msg);

    for (let cmd of global.commands.values()) {
      try {
        if (cmd.onChat) {
          await cmd.onChat({ bot, event: msg, msg, message, usersData, threadsData });
        }

        if (cmd.handleEvent) {
          await cmd.handleEvent({ bot, event: msg, msg, message, usersData, threadsData });
        }

        if (cmd.noPrefix && !text.startsWith(prefix)) {
          await cmd.noPrefix({ bot, event: msg, msg, message, usersData, threadsData });
        }

      } catch (e) {
        console.log("❌ Global Event Error:", e);
      }
    }

    const replyMsgId = msg.reply_to_message?.message_id;

    if (replyMsgId) {

      if (global.functions.reply.has(replyMsgId)) {
        const data = global.functions.reply.get(replyMsgId);
        const command = global.commands.get(data.commandName);

        if (command?.reply) {
          await command.reply({
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

      if (global.functions.onReply.has(replyMsgId)) {
        const data = global.functions.onReply.get(replyMsgId);
        const command = global.commands.get(data.commandName);

        if (command?.onReply) {
          await command.onReply({
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

    const hasPrefix = text.startsWith(prefix);

    const input = hasPrefix
      ? text.slice(prefix.length).trim()
      : text.trim();

    const args = input.split(/ +/);
    const commandName = args.shift()?.toLowerCase();

    const command =
      global.commands.get(commandName) ||
      [...global.commands.values()].find(cmd =>
        cmd.config?.aliases?.includes(commandName)
      );

    if (!command) return;

    if (command.config?.usePrefix === false) {
    } else {
      if (!hasPrefix) return;
    }

    try {
      if (command.onStart) {
        await command.onStart({
          bot,
          event: msg,
          msg,
          args,
          message,
          usersData,
          threadsData
        });
      } else if (command.run) {
        await command.run({
          bot,
          event: msg,
          msg,
          args,
          message,
          usersData,
          threadsData
        });
      } else if (command.start) {
        await command.start({
          bot,
          event: msg,
          msg,
          args,
          message,
          usersData,
          threadsData
        });
      }
    } catch (err) {
      console.log(`❌ ${commandName}:`, err);
      message.err(err);
    }

  } catch (err) {
    console.log("❌ MAIN ERROR:", err);
  }
});

bot.on("callback_query", async (query) => {
  try {
    if (!query.message) return;

    const msgId = query.message.message_id;
    const message = messageUtils(bot, query.message);

    if (global.functions.reply.has(msgId)) {
      const data = global.functions.reply.get(msgId);
      const command = global.commands.get(data.commandName);

      if (command?.reply) {
        await command.reply({
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
    }

    if (global.functions.onReply.has(msgId)) {
      const data = global.functions.onReply.get(msgId);
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
    }

  } catch (err) {
    console.log("❌ CALLBACK ERROR:", err);
  }
});

console.log(`
========================
🤖 BOT SYSTEM READY
Prefix : ${config.prefix}
Commands : ${global.commands.size}
========================
`);