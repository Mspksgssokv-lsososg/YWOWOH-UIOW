module.exports = {
  config: {
    name: "spamkick",
    version: "1.0",
    author: "Dipto",
    cooldown: 3,
    role: 1,
    description: "Auto kick spammer",
    commandCategory: "moderation",
  },

  onChat: async function ({ api, event, threadsData }) {
    try {
      const threadID = event.threadID;
      const userID = event.senderID;

      if (!userID) return;

      let thread = await threadsData.get(threadID) || {};

      if (!thread.settings) thread.settings = {};
      if (!thread.settings.spam) thread.settings.spam = {};

      const now = Date.now();

      let userMsgs = thread.settings.spam[userID] || [];

      userMsgs.push(now);

      // last 10 sec
      userMsgs = userMsgs.filter(t => now - t < 10000);

      thread.settings.spam[userID] = userMsgs;

      // spam detect
      if (userMsgs.length >= 6) {
        try {
          await api.removeUserFromGroup(userID, threadID);

          api.sendMessage(
            "⚠️ User kicked for spamming!",
            threadID
          );

          thread.settings.spam[userID] = [];
        } catch (e) {
          api.sendMessage(
            "❌ Bot needs admin permission",
            threadID
          );
        }
      }

      await threadsData.set(threadID, thread);

    } catch (e) {
      console.log(e);
    }
  },
};
