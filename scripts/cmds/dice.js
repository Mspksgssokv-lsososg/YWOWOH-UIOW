const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "Siddik", "balance.json");

const getData = () => {
	try {
		const dir = path.dirname(dataPath);
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}

		if (!fs.existsSync(dataPath)) {
			fs.writeFileSync(dataPath, JSON.stringify({}, null, 2));
			return {};
		}

		const raw = fs.readFileSync(dataPath, "utf8");
		if (!raw.trim()) return {};

		return JSON.parse(raw);
	} catch {
		return {};
	}
};

const saveData = (data) => {
	try {
		fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
	} catch {}
};

module.exports = {
	config: {
		name: "dice",
		aliases: ["roll"],
		version: "1.2",
		author: "SK-SIDDIK-KHAN",
		cooldown: 5,
		role: 0,
		usePrefix: true,
		description: {
			en: "Dice betting game"
		},
		category: "game",
		guide: {
			en: "{pn} <1-6> <amount>"
		}
	},

	onStart: async function ({ message, args, event }) {

		const formatBoldSerif = (text) => {
			const map = {
				a:"𝐚",b:"𝐛",c:"𝐜",d:"𝐝",e:"𝐞",f:"𝐟",g:"𝐠",h:"𝐡",i:"𝐢",j:"𝐣",
				k:"𝐤",l:"𝐥",m:"𝐦",n:"𝐧",o:"𝐨",p:"𝐩",q:"𝐪",r:"𝐫",s:"𝐬",t:"𝐭",
				u:"𝐮",v:"𝐯",w:"𝐰",x:"𝐱",y:"𝐲",z:"𝐳",
				A:"𝐀",B:"𝐁",C:"𝐂",D:"𝐃",E:"𝐄",F:"𝐅",G:"𝐆",H:"𝐇",I:"𝐈",J:"𝐉",
				K:"𝐊",L:"𝐋",M:"𝐌",N:"𝐍",O:"𝐎",P:"𝐏",Q:"𝐐",R:"𝐑",S:"𝐒",T:"𝐓",
				U:"𝐔",V:"𝐕",W:"𝐖",X:"𝐗",Y:"𝐘",Z:"𝐙",
				"0":"𝟎","1":"𝟏","2":"𝟐","3":"𝟑","4":"𝟒","5":"𝟓","6":"𝟔","7":"𝟕","8":"𝟖","9":"𝟗"
			};
			return text.split("").map(c => map[c] || c).join("");
		};

		const userId = event.from.id;

		const guess = parseInt(args[0]);
		const bet = parseInt(args[1]);

		if (isNaN(guess) || guess < 1 || guess > 6)
			return message.reply("⚠️ Choose a number between 1-6");

		if (isNaN(bet) || bet <= 0)
			return message.reply("⚠️ Enter valid bet amount");

		const data = getData();

		if (!data[userId]) {
			data[userId] = { money: 0, lastClaim: 0 };
		}

		let money = data[userId].money;

		if (bet > money)
			return message.reply(`❌ Not enough balance\n💰 Your balance: ${money} BDT`);

		const dice = Math.floor(Math.random() * 6) + 1;

		let msg;

		if (guess === dice) {
			money += bet;
			msg = `🎲 DICE GAME\n━━━━━━━━━━━━━━\n🎯 Your Guess: ${guess}\n🎲 Dice Result: ${dice}\n🏆 You Win: ${bet} BDT\n💰 Balance: ${money} BDT`;
		} else {
			money -= bet;
			msg = `🎲 DICE GAME\n━━━━━━━━━━━━━━\n🎯 Your Guess: ${guess}\n🎲 Dice Result: ${dice}\n💀 You Lost: ${bet} BDT\n💰 Balance: ${money} BDT`;
		}

		data[userId].money = money;

		saveData(data);

		return message.reply(formatBoldSerif(msg));
	}
};
