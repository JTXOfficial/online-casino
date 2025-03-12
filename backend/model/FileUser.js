const { generateId, readData, writeData, USERS_FILE, BETS_FILE } = require('../config/FileDatabase');
const FileBets = require('./FileBets');

// User model
class User {
  constructor(data) {
    this._id = data._id || generateId();
    this.username = data.username;
    this.password = data.password;
    this.email = data.email;
    this.balance = data.balance || 5;
    this.bets = data.bets || [];
  }

  // Save user to the database
  save(callback) {
    const users = readData(USERS_FILE);
    const existingUserIndex = users.findIndex(user => user._id === this._id);

    if (existingUserIndex !== -1) {
      // Update existing user
      users[existingUserIndex] = this;
    } else {
      // Add new user
      users.push(this);
    }

    const success = writeData(USERS_FILE, users);
    if (callback) callback(success ? null : new Error('Failed to save user'));
    return success;
  }

  // Static methods
  static findOne(query, callback) {
    const users = readData(USERS_FILE);
    let user = null;

    if (query._id) {
      user = users.find(u => u._id === query._id);
    } else if (query.username) {
      user = users.find(u => u.username === query.username);
    } else if (query.email) {
      user = users.find(u => u.email === query.email);
    }

    if (user) {
      const userInstance = new User(user);
      if (callback) callback(null, userInstance);
      return userInstance;
    }

    if (callback) callback(null, null);
    return null;
  }

  static findById(id, callback) {
    return this.findOne({ _id: id }, callback);
  }

  static updateMany(query, update, callback) {
    const users = readData(USERS_FILE);
    
    // For now, we'll just update all users (since the only use case is clearing bets)
    const updatedUsers = users.map(user => {
      if (update.$set && update.$set.bets !== undefined) {
        user.bets = update.$set.bets;
      }
      return user;
    });

    const success = writeData(USERS_FILE, updatedUsers);
    if (callback) callback(success ? null : new Error('Failed to update users'), { nModified: updatedUsers.length });
    return success;
  }

  // Instance methods
  matchEmail(email) {
    return this.email === email;
  }

  // Static methods from the original User model
  static removeActiveBets(callback) {
    // Update all users with empty bets array
    this.updateMany({}, { $set: { bets: [] } }, (err, result) => {
      if (err) {
        console.log(err.message);
        return callback(err);
      } else {
        console.log(`Removed active bets from all users`);
        return callback();
      }
    });
  }

  static getUserBalance(id, callback) {
    this.calculateBalance(id, callback);
  }

  static calculateBalance(id, callback) {
    const user = this.findById(id);
    if (!user) {
      callback(0);
      return;
    }

    const bets = readData(BETS_FILE);
    const userBets = bets.filter(bet => user.bets.includes(bet._id) && bet.active);
    
    let value = 0;
    for (let i = 0; i < userBets.length; i++) {
      value += userBets[i].amount;
    }
    
    const balance = user.balance - value;
    callback(balance);
  }

  static bet(id, amount, gamemode, callback) {
    console.log(`User ${id} placing bet of ${amount} on ${gamemode}`);
    
    // Convert amount to a number to ensure proper calculations
    amount = parseFloat(amount);
    if (isNaN(amount) || amount <= 0) {
      console.error("Invalid bet amount:", amount);
      callback(false, null, null);
      return;
    }
    
    const user = this.findById(id);
    if (!user) {
      console.error("User not found:", id);
      callback(false, null, null);
      return;
    }

    console.log(`Found user: ${user.username}, ID: ${user._id}, current balance: ${user.balance}`);

    this.calculateBalance(id, function(actualBalance) {
      console.log(`User ${id} has balance of ${actualBalance}, attempting to bet ${amount}`);
      
      if (actualBalance >= amount) {
        const bet = FileBets.create({
          amount: amount,
          gamemode: gamemode,
          date: new Date(),
          active: true,
          owner: user._id,
        });

        console.log(`Created bet: ${bet._id}, amount: ${bet.amount}, owner: ${bet.owner}`);

        // Add bet to user's bets array
        user.bets.push(bet._id);
        
        // Deduct bet amount from user's balance
        user.balance -= amount;
        
        // Save user with updated balance and bets
        const saved = user.save();
        console.log(`User saved: ${saved}, new balance: ${user.balance}`);
        
        callback(true, bet, actualBalance - amount);
      } else {
        console.error(`Insufficient funds: balance ${actualBalance}, bet amount ${amount}`);
        callback(false, null, null);
      }
    });
  }

  static getUser(userId, callback) {
    const user = this.findById(userId);
    if (!user) {
      callback({});
      return;
    }

    const data = {
      username: user.username
    };

    callback(data);
  }
}

module.exports = User; 