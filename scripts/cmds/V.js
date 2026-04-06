const os = require("os");
const moment = require("moment-timezone");

module.exports = {
    config: {
        name: "uptime",
        aliases: ["upv"],
        description: "Display bot and system status.",
        cooldown: 5,
        usePrefix: true // ⚠️ MUST for your system
    },

    onStart: async function ({ bot, event }) {
        try {
            const chatId = event.chat.id;
            const messageId = event.message_id;

            console.log("✅ UPTIME RUNNING");

            const imageUrl = "https://files.catbox.moe/qwdke3.jpg";

            // ================= SAFE GLOBAL =================
            const botName =
                global.config?.botName || "LIKHON BOT";
            const prefix =
                global.config?.prefix || "/";

            const bdTime = moment()
                .tz("Asia/Dhaka")
                .format("MM/DD/YYYY, h:mm:ss A");

            // ================= RAM =================
            const ramUsed =
                (os.totalmem() - os.freemem()) / 1024 / 1024 / 1024;
            const ramTotal =
                os.totalmem() / 1024 / 1024 / 1024;

            // ================= UPTIME FIX =================
            if (!global.botStartTime) {
                global.botStartTime = Date.now();
            }

            const uptimeMs = Date.now() - global.botStartTime;
            const uptimeFormatted = formatUptime(uptimeMs);

            // ================= PING =================
            const startTime = Date.now();

            getCpuLoad(async (cpuLoad) => {
                try {
                    const ping = Date.now() - startTime;

                    const output = `
╭━━━━━━❰ BOT INFO ❱━━━━━━╮
┃ 👤 Author: MOHAMMAD-BADOL
┃ 🤖 Bot Name: ${botName}
┃ ⏹ Prefix: ${prefix}
┃ 🕒 BD Time: ${bdTime}
┃ ⏱ Uptime: ${uptimeFormatted}
┃ 📡 Ping: ${ping} ms
┃ 🧠 CPU Load: ${cpuLoad} %
┃ 📦 RAM Used: ${ramUsed.toFixed(2)} / ${ramTotal.toFixed(2)} GB
┃ 🖥 Server: Online ✅
╰━━━━━━━━━━━━━━━❍
                    `.trim();

                    // ================= SEND =================
                    try {
                        await bot.sendPhoto(chatId, imageUrl, {
                            caption: output,
                            reply_to_message_id: messageId
                        });
                    } catch {
                        await bot.sendMessage(chatId, output, {
                            reply_to_message_id: messageId
                        });
                    }

                } catch (err) {
                    console.log("❌ SEND ERROR:", err);
                }
            });

        } catch (err) {
            console.log("❌ UPTIME ERROR:", err);
        }
    }
};

// ================= HELPERS =================

function formatUptime(ms) {
    const s = Math.floor(ms / 1000);
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${d}d ${h}h ${m}m ${sec}s`;
}

function getCpuLoad(callback) {
    const start = os.cpus().map(c => c.times);

    setTimeout(() => {
        const end = os.cpus().map(c => c.times);

        let idle = 0, total = 0;

        for (let i = 0; i < start.length; i++) {
            const idleDiff = end[i].idle - start[i].idle;

            const totalDiff =
                (end[i].user - start[i].user) +
                (end[i].nice - start[i].nice) +
                (end[i].sys - start[i].sys) +
                (end[i].irq - start[i].irq) +
                idleDiff;

            idle += idleDiff;
            total += totalDiff;
        }

        if (total === 0) return callback("0.00");

        const cpu = 100 * (total - idle) / total;
        callback(cpu.toFixed(2));
    }, 300);
}
