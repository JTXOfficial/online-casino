const mongoose = require('mongoose');
const Bets = require('./bets');

const User = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    balance: {
        type: Number,
        default: 5,
    },
    bets: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'Bets'
    }],
})

User.statics.removeActiveBets = (cb) => {
    // Update all users with empty bets array
    mongoose.model('User').updateMany({}, { $set: { bets: [] } }, (err, result) => {
        if (err) {
            console.log(err.message);
            return cb(err);
        } else {
            console.log(`Removed active bets from all users`);
            return cb();
        }
    });
}

function calculateBalance(id, cb) {
    mongoose.model('User').findOne({_id: id}).populate('bets').exec(function(err, user) {
        if (err) {
            console.log(err.message);
        }

        let value = 0;
        for (var i = 0; i < user.bets.length; i++) {
            if (user.bets[i].active == true) {
                value += user.bets[i].amount;
            }
        }
        let balance = user.balance - value;

        cb(balance)
    })
}

User.statics.getUserBalance = function getUserBalance(id, cb) {
    calculateBalance(id, cb);
}

User.statics.bet = function bet(id, amount, gamemode, cb) {
    mongoose.model('User').findOne({_id: id}, function(err, user) {
            calculateBalance(id, function(actualBalance) {
            if (actualBalance >= amount) {
                let bet = new Bets   ({
                    amount: amount,
                    gamemode: gamemode,
                    date: new Date(),
                    active: true,
                    owner: user._id,
                });

                bet.save(function(err) {
                    user.bets.push(bet);
                    user.save(function(err) {
                        return cb(true, bet, actualBalance - amount);
                    })
                });
            } else {
                return cb(false, null, null)
            }
        });
    })
}

User.statics.getUser = function getUser(userId, cb) {
    mongoose.model('User').findOne({_id: userId}).populate('bets').exec(function(err, user) {
        if (err) {
            console.log(err.message);
        }
        let data = {};

        data.username = user.username;

        cb(data)

    });

}

User.methods.matchEmail = function (email) {
    if (email === this.email) return;
};

module.exports = mongoose.model('User', User);