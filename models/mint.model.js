const mongoose = require('mongoose'),
      Schema = mongoose.Schema;

let MintSchema = new Schema(
  {
    blockNumber: { type: Number, required: true },
    player: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'in progress', 'complete'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Mint', MintSchema);
