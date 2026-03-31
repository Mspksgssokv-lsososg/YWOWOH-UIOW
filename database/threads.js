const Thread = require("../models/thread");
const fs = require("fs");
const path = require("path");

// ✅ FIXED PATH
const dataPath = path.join(__dirname, "threads.json");

// ================= JSON SYSTEM =================
function loadJSONData() {
  try {
    if (fs.existsSync(dataPath)) {
      return JSON.parse(fs.readFileSync(dataPath, "utf-8"));
    } else {
      fs.writeFileSync(dataPath, JSON.stringify([]));
      return [];
    }
  } catch (error) {
    console.error("Error loading JSON data:", error);
    return [];
  }
}

function saveJSONData(data) {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error saving JSON data:", error);
  }
}

let jsonData = loadJSONData();

// ================= EXPORT =================
module.exports = {

  // CREATE
  async createThread(threadData) {
    try {
      const thread = new Thread(threadData);
      await thread.save();
      return thread;
    } catch (error) {
      console.error("Error creating thread:", error.message);
      return null;
    }
  },

  // GET THREAD
  async getThread(threadId) {
    try {
      const thread = await Thread.findOne({ threadId });
      return thread || null;
    } catch (error) {
      console.error("Error fetching thread:", error.message);
      return null;
    }
  },

  async get(threadId) {
    return this.getThread(threadId);
  },

  // UPDATE
  async updateThread(threadId, updateData) {
    try {
      const updated = await Thread.findOneAndUpdate(
        { threadId },
        updateData,
        { new: true }
      );
      return updated || null;
    } catch (error) {
      console.error("Error updating thread:", error.message);
      return null;
    }
  },

  async set(threadId, updateData) {
    return this.updateThread(threadId, updateData);
  },

  async setThread(threadId, updateData) {
    return this.updateThread(threadId, updateData);
  },

  async setThreadData(threadId, updateData) {
    return this.updateThread(threadId, updateData);
  },

  // DELETE
  async deleteThread(threadId) {
    try {
      const deleted = await Thread.findOneAndDelete({ threadId });
      return deleted || null;
    } catch (error) {
      console.error("Error deleting thread:", error.message);
      return null;
    }
  },

  async delete(threadId) {
    return this.deleteThread(threadId);
  },

  // GET ALL 🔥 FIXED
  async getAllThreads() {
    try {
      const threads = await Thread.find({});
      return Array.isArray(threads) ? threads : [];
    } catch (error) {
      console.error("Error fetching all threads:", error.message);
      return []; // ✅ VERY IMPORTANT
    }
  },

  async getAll() {
    return this.getAllThreads();
  }
};
