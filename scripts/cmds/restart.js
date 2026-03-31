const fs = require("fs");
const path = require("path");
const https = require("https");

const categories = {
  "ISLAMIC-VIDEO": [
    "https://i.imgur.com/3EXzdzu.mp4",
    "https://i.imgur.com/elsJxEk.mp4",
    "https://i.imgur.com/htitv6P.mp4",
    "https://i.imgur.com/htitv6P.mp4",
    "https://i.imgur.com/PjTN0I5.mp4",
    "https://i.imgur.com/hzFQ4Xu.mp4",
    "https://i.imgur.com/8WojIf7.mp4",
    "https://i.imgur.com/guefl5P.mp4",
    "https://i.imgur.com/7zFKSsJ.mp4",
    "https://i.imgur.com/5Vys7Eb.mp4",
    "https://i.imgur.com/B6fu243.mp4",
    "https://i.imgur.com/53dHYJM.mp4",
    "https://i.imgur.com/pCWDq0c.mp4",
    "https://i.imgur.com/bytY1SY.mp4",
    "https://i.imgur.com/oWZkJ7b.mp4",
    "https://i.imgur.com/P8aujG8.mp4",
    "https://i.imgur.com/g0Fj7Ch.mp4",
    "https://i.imgur.com/nE1Z3kz.mp4",
    "https://i.imgur.com/AxnZq05.mp4",
    "https://i.imgur.com/sXYLgUB.mp4",
    "https://i.imgur.com/FmOKl2S.mp4",
    "https://i.imgur.com/vrQpE9G.mp4",
    "https://i.imgur.com/H8fHZdu.mp4",
    "https://i.imgur.com/G5i0xcY.mp4",
    "https://i.imgur.com/lqPyKgZ.mp4",
    "https://i.imgur.com/sUJFShv.mp4",
    "https://i.imgur.com/WzXz13s.mp4"
  ],
};

const PAGE_SIZE = 10;

module.exports = {
  config: {
    name: "album",
    author: "SK-SIDDIK-KHAN",
    description: "Send random videos from an album.",
    category: "media",
    usage: "/album [page]",
    usePrefix: true,
  },

  onStart: async (ctx) => {
    const { bot, args } = ctx;

    // ✅ SAFE DATA EXTRACTION (NO MORE ERRORS)
    const chatId =
      ctx.chatId ||
      ctx.message?.chat?.id ||
      ctx.msg?.chat?.id;

    const userId =
      ctx.userId ||
      ctx.message?.from?.id ||
      ctx.msg?.from?.id;

    if (!chatId || !userId) {
      console.log("❌ chatId বা userId পাওয়া যায়নি", ctx);
      return;
    }

    const categoryKeys = Object.keys(categories);
    let page = 1;

    if (args?.length > 0) {
      const inputPage = parseInt(args[0]);
      if (!isNaN(inputPage) && inputPage > 0) page = inputPage;
    }

    const totalPages = Math.ceil(categoryKeys.length / PAGE_SIZE) || 1;

    if (page > totalPages) {
      return bot.sendMessage(
        chatId,
        `❌ Page ${page} doesn't exist. Total pages: ${totalPages}`
      );
    }

    const startIndex = (page - 1) * PAGE_SIZE;
    const currentPageCategories = categoryKeys.slice(
      startIndex,
      startIndex + PAGE_SIZE
    );

    const text =
      `╭─🎬 𝗔𝗹𝗯𝘂𝗺 𝗩𝗶𝗱𝗲𝗼𝘀 ─╮\n` +
      currentPageCategories
        .map((cat, i) => `┃ ${startIndex + i + 1}. ${cat}`)
        .join("\n") +
      `\n╰─Page [${page} / ${totalPages}]─╯\n\nReply with number 🤙`;

    const sentMsg = await bot.sendMessage(chatId, text);

    // ✅ LISTENER
    const replyListener = async (replyMsg) => {
      try {
        if (
          replyMsg.chat?.id !== chatId ||
          replyMsg.from?.id !== userId ||
          replyMsg.reply_to_message?.message_id !== sentMsg.message_id
        )
          return;

        const num = parseInt(replyMsg.text);

        if (isNaN(num) || num < 1 || num > categoryKeys.length) {
          await bot.sendMessage(chatId, "❌ Invalid input");
          return cleanup();
        }

        const category = categoryKeys[num - 1];
        const videoURL =
          categories[category][
            Math.floor(Math.random() * categories[category].length)
          ];

        const fileName = path.basename(videoURL);
        const filePath = path.join(__dirname, "cache", "album", fileName);

        if (!fs.existsSync(path.dirname(filePath))) {
          fs.mkdirSync(path.dirname(filePath), { recursive: true });
        }

        const loadingMsg = await bot.sendMessage(
          chatId,
          `⏳ Loading ${category}...`
        );

        if (!fs.existsSync(filePath)) {
          await downloadFile(filePath, videoURL);
        }

        await bot.sendVideo(chatId, fs.createReadStream(filePath), {
          caption: `${category} ✅`,
        });

        await bot.deleteMessage(chatId, loadingMsg.message_id);
        cleanup();
      } catch (err) {
        console.error(err);
        bot.sendMessage(chatId, "❌ Failed to load video");
        cleanup();
      }
    };

    bot.on("message", replyListener);

    // ✅ CLEANUP
    const cleanup = () => {
      bot.removeListener("message", replyListener);
      try {
        bot.deleteMessage(chatId, sentMsg.message_id);
      } catch {}
    };

    // ✅ AUTO TIMEOUT
    setTimeout(cleanup, 30000);
  },
};

// ✅ DOWNLOAD FUNCTION
function downloadFile(filePath, url) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);

    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          return reject(new Error("Download failed"));
        }

        res.pipe(file);

        file.on("finish", () => file.close(resolve));
      })
      .on("error", (err) => {
        fs.unlink(filePath, () => {});
        reject(err);
      });
  });
}
