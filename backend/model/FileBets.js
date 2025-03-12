const { generateId, readData, writeData, BETS_FILE, USERS_FILE } = require('../config/FileDatabase');

// Bets model
class Bets {
  constructor(data) {
    this._id = data._id || generateId();
    this.amount = data.amount;
    this.date = data.date || new Date();
    this.payout = data.payout;
    this.active = data.active !== undefined ? data.active : true;
    this.gamemode = data.gamemode;
    this.owner = data.owner;
  }

  // Save bet to the database
  save(callback) {
    const bets = readData(BETS_FILE);
    const existingBetIndex = bets.findIndex(bet => bet._id === this._id);

    if (existingBetIndex !== -1) {
      // Update existing bet
      bets[existingBetIndex] = this;
    } else {
      // Add new bet
      bets.push(this);
    }

    const success = writeData(BETS_FILE, bets);
    if (callback) callback(success ? null : new Error('Failed to save bet'));
    return success;
  }

  // Static methods
  static findOne(query, callback) {
    const bets = readData(BETS_FILE);
    let bet = null;

    if (query._id) {
      bet = bets.find(b => b._id === query._id);
    }

    if (bet) {
      const betInstance = new Bets(bet);
      if (callback) callback(null, betInstance);
      return betInstance;
    }

    if (callback) callback(null, null);
    return null;
  }

  static deleteMany(query, callback) {
    // For now, we'll just delete all bets (since the only use case is clearing all bets)
    const success = writeData(BETS_FILE, []);
    if (callback) callback(success ? null : new Error('Failed to delete bets'), { deletedCount: 'all' });
    return success;
  }

  // Static methods from the original Bets model
  static removeActiveBets() {
    // Delete all bets
    this.deleteMany({}, (err, result) => {
      if (err) {
        console.log(err.message);
      } else {
        console.log(`Deleted all bets`);
      }
    });
  }

  // Create a new bet
  static create(data) {
    console.log("Creating new bet with data:", data);
    const bet = new Bets(data);
    const success = bet.save();
    console.log(`Bet created with ID: ${bet._id}, saved: ${success}`);
    return bet;
  }

  // Instance methods from the original Bets model
  async finish(multiplier, callback) {
    try {
      console.log(`Finishing bet ${this._id} with multiplier ${multiplier}`);
      
      // Find the owner (user) of this bet
      const users = readData(USERS_FILE);
      const userIndex = users.findIndex(user => user._id === this.owner);
      
      if (userIndex === -1) {
        console.error(`User ${this.owner} not found`);
        if (callback) callback(false, null);
        return false;
      }
      
      const user = users[userIndex];
      console.log(`User ${user.username} found, current balance: ${user.balance}`);
      
      // Update bet status
      this.active = false;
      if (multiplier > 0) {
        this.payout = this.amount * multiplier;
        // Add winnings to user balance
        user.balance += this.payout;
        console.log(`User won ${this.payout}, new balance: ${user.balance}`);
      } else {
        this.payout = 0;
        console.log(`User lost ${this.amount}`);
      }
      
      // Save changes
      users[userIndex] = user;
      const userSaved = writeData(USERS_FILE, users);
      const betSaved = this.save();
      
      console.log(`Bet finished: User saved: ${userSaved}, Bet saved: ${betSaved}`);
      
      if (callback) callback(userSaved && betSaved, user.balance);
      return userSaved && betSaved;
    } catch (err) {
      console.error('Error finishing bet:', err.message);
      if (callback) callback(false, null);
      return false;
    }
  }
}

module.exports = Bets; 