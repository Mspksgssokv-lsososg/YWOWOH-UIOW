/**
 * Main entry point for Bot'Bee
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
const colors = require('colors');
const config = require('./config.json');

// Global maps for commands, events, replies
global.commands = new Map();
global.events = new Map();
global.functions = {
  reply: new Map(),
  onReply: new Map(),
  handleEvent: new Map()
};

// Load message utility and script loader
const { messageUtils, loadScripts } = require('./utils/messageUtils.js');

// Initialize bot
const bot = new TelegramBot(config.token, { polling: true });
console.log(`[ BOT ] • ${config.botName} started`.green);

// Load all commands and events
loadScripts(bot);

// Bot restart logic
bot.on('polling_error', (err) => console.error('Polling Error:', err));
process.on('uncaughtException', (err) => console.error('Uncaught Exception:', err));

// Auto reply handler
bot.on('message', async (msg) => {
  try {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const args = msg.text ? msg.text.split(' ').slice(1) : [];

    const replyId = msg.reply_to_message?.message_id;

    // Handle onReply
    if (replyId && global.functions.reply.has(replyId)) {
      const Reply = global.functions.reply.get(replyId);
      const command = commands.get(Reply.commandName);
      if (command?.reply) {
        await command.reply({ event: msg, message: messageUtils(bot, msg), args, Reply });
        return;
      }
    }

    // Handle onReply from onReply map
    if (replyId && global.functions.onReply.has(replyId)) {
      const Reply = global.functions.onReply.get(replyId);
      const command = commands.get(Reply.commandName);
      if (command?.onReply) {
        await command.onReply({ event: msg, message: messageUtils(bot, msg), args, Reply });
        return;
      }
    }

    // Handle command with prefix
    const prefix = config.prefix;
    if (!msg.text) return;
    if (!msg.text.startsWith(prefix)) return;

    const [cmdName, ...cmdArgs] = msg.text.slice(prefix.length).trim().split(/\s+/);
    const command = commands.get(cmdName) || Array.from(commands.values()).find(c => c.config.aliases?.includes(cmdName));

    if (!command) return;

    // Execute command
    await command.run({ event: msg, message: messageUtils(bot, msg), args: cmdArgs });

  } catch (err) {
    console.error('Message handler error:', err);
  }
});

// Periodic update check (optional)
const { checkForUpdates } = require('./utils/updateCheck.js');
setInterval(() => {
  checkForUpdates();
}, 1000 * 60 * 5); // check every 5 minutes

// Express server for dashboard
const express = require('express');
const app = express();
const port = 3000;

let users = []; // will be replaced with DB later
let threads = [];

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/dashboard-data', (req, res) => {
  const uptime = process.uptime();
  res.json({
    botName: config.botName,
    prefix: config.prefix,
    adminName: config.adminName,
    totalUsers: users.length,
    totalThreads: threads.length,
    uptime
  });
});

app.listen(port, () => console.log(`[ SERVER ] • Running on port ${port}`.cyan));
