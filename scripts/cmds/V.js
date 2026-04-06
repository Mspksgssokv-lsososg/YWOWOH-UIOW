module.exports = {
  config: {
    name: "spamkick",
    version: "1.0",
    author: "Dipto",
    role: 1,
    usePrefix: false,
    shortDescription: "Auto kick spammer",
    longDescription: "Kick user if sends 4 messages in 10 sec",
    category: "moderation"
  },

  onStart: async function () {},

  handleEvent: async function ({ api, event, threadsData }) {
    try {
      const threadID = event.threadID;
      const userID = event.senderID;

      // ignore bot
      if (!userID || userID == api.getCurrentUserID()) return;

      let threadData = await threadsData.get(threadID) || {};

      if (!threadData.data) threadData.data = {};
      if (!threadData.data.spam) threadData.data.spam = {};

      const now = Date.now();

      let userMsgs = threadData.data.spam[userID] || [];

      userMsgs.push(now);

      // last 10 sec
      userMsgs = userMsgs.filter(t => now - t < 10000);

      threadData.data.spam[userID] = userMsgs;

      // 🔥 4 message = kick
      if (userMsgs.length >= 4) {
        try {
          await api.removeUserFromGroup(userID, threadID);

          api.sendMessage(
            "🚫 Spammer kicked (4 msg rule)",
            threadID
          );

          threadData.data.spam[userID] = [];
        } catch (e) {
          api.sendMessage(
            "❌ Bot admin lagbe",
            threadID
          );
        }
      }

      await threadsData.set(threadID, threadData);

    } catch (err) {
      console.log("SpamKick Error:", err);
    }
  }
};
