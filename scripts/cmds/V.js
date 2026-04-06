module.exports = {
  config: {
    name: "spamkick",
    version: "1.0",
    author: "Dipto",
    role: 1,
    description: "Auto kick spammer",
  },

  handleEvent: async function ({ api, event, threadsData }) {
    try {
      const threadID = event.threadID;
      const userID = event.senderID;

      if (!userID || userID == api.getCurrentUserID()) return;

      let data = await threadsData.get(threadID) || {};

      if (!data.spam) data.spam = {};

      const now = Date.now();

      let msgs = data.spam[userID] || [];

      msgs.push(now);

      msgs = msgs.filter(t => now - t < 10000);

      data.spam[userID] = msgs;

      // 🔥 spam detect
      if (msgs.length >= 2) {
        try {
          await api.removeUserFromGroup(userID, threadID);

          api.sendMessage(
            "🚫 Spammer kicked!",
            threadID
          );

          data.spam[userID] = [];
        } catch (e) {
          api.sendMessage(
            "❌ Bot admin na, kick korte parchi na",
            threadID
          );
        }
      }

      await threadsData.set(threadID, data);

    } catch (e) {
      console.log(e);
    }
  }
};
