module.exports.config = {
  name: "bc",
  aliases: ["broadcast"],
  description: "Send a broadcast message to all users and groups",
  version: "1.0.2",
  role: 2,
  usePrefix: true,
  category: "admin",
  usages: [
    "/bc <message>",
    "Reply to a message with /bc to broadcast it"
  ]
};

module.exports.start = async ({ api, event, args }) => {
  const threadID = event.threadID;

  const text =
    args.join(" ") ||
    (event.messageReply ? event.messageReply.body : "");

  if (!text)
    return api.sendMessage("❌ Please provide a message to broadcast.", threadID);

  let userGrp = {};
  try {
    userGrp = await global.data.get("userGrp.json") || {};
  } catch {
    userGrp = {};
  }

  const users = userGrp.user || {};
  const groups = userGrp.grp || {};

  const targetIds = [
    ...Object.keys(users).filter(id => users[id]),
    ...Object.keys(groups).filter(id => groups[id])
  ];

  if (!targetIds.length)
    return api.sendMessage("⚠️ No users or groups found to broadcast.", threadID);

  await api.sendMessage("📤 Broadcasting message...", threadID);

  let count = 0;

  for (const id of targetIds) {
    try {
      if (String(id) === String(threadID)) continue;

      await api.sendMessage(
        `📢 Broadcast Message:\n\n${text}`,
        id
      );

      count++;
    } catch (e) {
      console.log(`Failed to send to ${id}:`, e.message);
    }
  }

  return api.sendMessage(
    `✅ Broadcast sent to ${count} users/groups.`,
    threadID
  );
};
