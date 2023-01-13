const mongoose = require('mongoose');

const betSchema = mongoose.Schema({
    amount: {type: Number},
    date: {type: Date},
    payout: {type: Number},
    active: {type: Boolean},
    gamemode: {type: String},
    owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
});

betSchema.statics.removeActiveBets = function removeActiveBets(){
    // Delete all bets documents
    mongoose.model('Bets').deleteMany({}, (err, result) => {
        if (err) {
            console.log(err.message);
            return cb(err);
        } else {
            console.log(`Deleted all bets: ${result.deletedCount}`);
        }
    });
}

betSchema.methods.finish = function chargeBet(multiplier, cb){
    return new Promise((resolve, reject) => {
        let bet = this;
        mongoose.model('Bets').findOne(this).populate('owner').exec(function(err, populatedBet){
            if(!populatedBet) return resolve(false)
            var user = populatedBet.owner;
            user.balance -= bet.amount;
            user.balance += (bet.amount * multiplier);
            console.log(user.balance)
            user.save((err) => {
                if(err){
                    console.log(err.message);
                    resolve(false);
                }
                else{
                    bet.active = false;
                    if(multiplier > 0){
                        bet.payout = bet.amount * multiplier;
                    }else{
                        bet.payout = 0;
                    }
                    bet.save((err) => {
                        if(err) console.log(err.message);
                        resolve(true);
                    })
                }

            });
    
        });
    });
}


module.exports = mongoose.model('Bets', betSchema);