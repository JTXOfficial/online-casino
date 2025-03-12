const { generateId, readData, writeData, ROUNDS_FILE } = require('../config/FileDatabase');

// RouletteRound model
class RouletteRound {
  constructor(data) {
    this._id = data._id || generateId();
    this.game = data.game;
    this.date = data.date || new Date();
    this.outcome = data.outcome;
    this.client_seed = data.client_seed;
    this.server_seed = data.server_seed;
  }

  // Save round to the database
  save(callback) {
    const rounds = readData(ROUNDS_FILE);
    const existingRoundIndex = rounds.findIndex(round => round._id === this._id);

    if (existingRoundIndex !== -1) {
      // Update existing round
      rounds[existingRoundIndex] = this;
    } else {
      // Add new round
      rounds.push(this);
    }

    const success = writeData(ROUNDS_FILE, rounds);
    if (callback) callback(success ? null : new Error('Failed to save round'));
    return success;
  }

  // Static methods
  static create(data) {
    const round = new RouletteRound(data);
    round.save();
    return round;
  }
}

module.exports = RouletteRound; 