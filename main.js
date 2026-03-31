// main.js
const fs = require('fs');
const path = require('path');
const express = require('express');
const { spawn } = require('child_process');
const TelegramBot = require('node-telegram-bot-api');
const colors = require('colors');
const config = require('./config.json');
const { messageUtils, loadScripts } = require('./utils.js'); // utils.js থেকে import

// Initialize bot
const bot = new TelegramBot(config.token, { polling: true });

// Global maps for commands, events, replies
global.commands = new Map();
global.events = new Map();
global.functions = {
    reply: new Map(),
    onReply: new Map(),
    handleEvent: new Map()
};

// Users and threads for dashboard
let users = [];
let threads = [];

// Optional: restartable child process logic
let botProcess;
async function startBot() {
    botProcess = spawn('node', ['index.js'], {
        cwd: __dirname,
        stdio: 'inherit',
        shell: true
    });

    botProcess.on('close', (code) => {
        if (code === 2) {
            console.log('Restarting BotBee...'.red);
            startBot();
        } else if (code !== 0) {
            console.error(`Bot process exited with code ${code}`);
        }
    });
}

// Start the bot process
startBot();

// Load commands and events from scripts folder
loadScripts(bot, config);

// Express dashboard
const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/dashboard-data', (req, res) => {
    try {
        const uptime = process.uptime();
        const dashboardData = {
            botName: config.botName,
            prefix: config.prefix,
            adminName: config.adminName,
            totalUsers: users.length,
            totalThreads: threads.length,
            uptime
        };
        res.json(dashboardData);
    } catch (err) {
        console.error('Error fetching dashboard data:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`.cyan);
});

// Handle incoming messages
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text || '';
    const prefix = config.prefix;

    if (!text.startsWith(prefix)) return;

    const args = text.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    if (!global.commands.has(commandName)) return;

    try {
        const command = global.commands.get(commandName);
        await command.run({ bot, message: messageUtils(bot, msg), args, event: msg });
    } catch (err) {
        console.error(`Error running command ${commandName}:`, err);
        await messageUtils(bot, msg).err(err);
    }
});

// Handle replies for reply system
bot.on('callback_query', async (query) => {
    const infoID = query.message.message_id;
    if (global.functions.reply.has(infoID)) {
        const replyData = global.functions.reply.get(infoID);
        if (replyData) {
            const command = global.commands.get(replyData.commandName);
            if (command?.reply) {
                await command.reply({
                    bot,
                    message: messageUtils(bot, query.message),
                    args: query.data.split(' '),
                    Reply: replyData,
                    event: query
                });
            }
        }
    }
});

// Optional: handle inline replies
bot.on('inline_query', async (query) => {
    // handle inline commands if needed
});

// Optional: error logging
bot.on('polling_error', (error) => {
    console.error('Polling Error:', error);
});
