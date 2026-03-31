const os = require('os');
const process = require('process');
const { formatDuration } = require('date-fns'); 

module.exports = {
    config: {
        name: "uptime",
        aliases:["upt","up"],
        author: "SK-SIDDIK-KHAN",
        description: "Get system and bot uptime information",
        commandCategory: "utility",
        usage: "uptime",
        usePrefix: false,
        role: 0,
    },
    onStart: async ({ message,usersData, threadsData }) => {
        try {
            const systemUptime = formatDuration({ hours: Math.floor(os.uptime() / 3600), minutes: Math.floor((os.uptime() % 3600) / 60), seconds: Math.floor(os.uptime() % 60) });
            const processUptime = formatDuration({ hours: Math.floor(process.uptime() / 3600), minutes: Math.floor((process.uptime() % 3600) / 60), seconds: Math.floor(process.uptime() % 60) });

    
            const systemInfo = {
        os: os.type() + " " + os.release(),
                cores: os.cpus().length,
                architecture: os.arch(),
                totalMemory: (os.totalmem() / (1024 ** 3)).toFixed(2) + " GB",
                freeMemory: (os.freemem() / (1024 ** 3)).toFixed(2) + " GB",
                ramUsage: ((os.totalmem() - os.freemem()) / (1024 ** 2)).toFixed(2) + " MB",
            };
            const totalUsers = await usersData.getAllUsers().then(users => users.length);
            const totalThreads = await threadsData.getAllThreads().then(threads => threads.length);

            const uptimeMessage = `
╭──✦ [ 𝐔𝐩𝐭𝐢𝐦𝐞 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧 ]
├‣ 🕒 𝚂𝚢𝚜𝚝𝚎𝚖 𝚄𝚙𝚝𝚒𝚖𝚎: ${systemUptime}
╰‣ ⏱ Process Uptime: ${processUptime}

╭──✦ [ 𝐒𝐲𝐬𝐭𝐞𝐦 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧 ]
├‣ 📡 𝙾𝚂: ${systemInfo.os}
├‣ 🛡 𝙲𝚘𝚛𝚎𝚜: ${systemInfo.cores}
├‣ 🔍 𝙰𝚛𝚌𝚑𝚒𝚝𝚎𝚌𝚝𝚞𝚛𝚎: ${systemInfo.architecture}
├‣ 🖥 𝙽𝚘𝚍𝚎 𝚅𝚎𝚛𝚜𝚒𝚘𝚗: ${process.version}
├‣ 📈 𝚃𝚘𝚝𝚊𝚕 𝙼𝚎𝚖𝚘𝚛𝚢: ${systemInfo.totalMemory}
├‣ 📉 𝙵𝚛𝚎𝚎 𝙼𝚎𝚖𝚘𝚛𝚢: ${systemInfo.freeMemory}
├‣ 📊 𝚁𝙰𝙼 𝚄𝚜𝚊𝚐𝚎: ${systemInfo.ramUsage}
├‣ 👥 𝚃𝚘𝚝𝚊𝚕 𝚄𝚜𝚎𝚛𝚜: ${totalUsers} members
╰‣📂 𝚃𝚘𝚝𝚊𝚕 𝚃𝚑𝚛𝚎𝚊𝚍𝚜: ${totalThreads} Groups`;
            await message.reply(uptimeMessage);
        } catch (err) {
            await message.reply(`❌ | Error occurred: ${err.message}`);
        }
    }
};
