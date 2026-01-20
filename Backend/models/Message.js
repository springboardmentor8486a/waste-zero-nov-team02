const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    receiver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    content: {
      type: String,
      required: true
    },
    conversation_id: {
      type: String,
      index: true
    }
  },
  { timestamps: true }
);

// Compound index for efficient message history queries
messageSchema.index({ sender_id: 1, receiver_id: 1, createdAt: -1 });
messageSchema.index({ receiver_id: 1, sender_id: 1, createdAt: -1 });
messageSchema.index({ conversation_id: 1, createdAt: -1 });

module.exports = mongoose.model("Message", messageSchema);
