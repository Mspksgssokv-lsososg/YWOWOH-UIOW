const fs = require("fs");
const path = require("path");

// FILE PATH
const dataPath = path.join(__dirname, "threads.json");

// LOAD
function loadJSONData() {
  try {
    if (fs.existsSync(dataPath)) {
      return JSON.parse(fs.readFileSync(dataPath, "utf-8"));
    } else {
      fs.writeFileSync(dataPath, JSON.stringify([]));
      return [];
    }
  } catch (error) {
    console.error("Error loading JSON:", error);
    return [];
  }
}

// SAVE
function saveJSONData(data) {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error saving JSON:", error);
  }
}

let jsonData = loadJSONData();

// ================= EXPORT =================
module.exports = {

  // CREATE
  async createThread(threadData) {
    try {
      jsonData.push(threadData);
      saveJSONData(jsonData);
      return threadData;
    } catch (error) {
      console.error("Error creating thread:", error);
      return null;
    }
  },

  // GET ONE
  async getThread(threadId) {
    try {
      return jsonData.find(t => t.threadId == threadId) || null;
    } catch (error) {
      console.error("Error fetching thread:", error);
      return null;
    }
  },

  async get(threadId) {
    return this.getThread(threadId);
  },

  // UPDATE
  async updateThread(threadId, updateData) {
    try {
      const index = jsonData.findIndex(t => t.threadId == threadId);
      if (index === -1) return null;

      jsonData[index] = {
        ...jsonData[index],
        ...updateData
      };

      saveJSONData(jsonData);
      return jsonData[index];
    } catch (error) {
      console.error("Error updating thread:", error);
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
      const index = jsonData.findIndex(t => t.threadId == threadId);
      if (index === -1) return null;

      const deleted = jsonData.splice(index, 1);
      saveJSONData(jsonData);
      return deleted[0];
    } catch (error) {
      console.error("Error deleting thread:", error);
      return null;
    }
  },

  async delete(threadId) {
    return this.deleteThread(threadId);
  },

  // GET ALL
  async getAllThreads() {
    return jsonData;
  },

  async getAll() {
    return this.getAllThreads();
  }
};
