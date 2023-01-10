const mongoose = require('mongoose');

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
        type: String,
        default: 5,
    },
    roulette_bet: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'Bets'
    }],
})

User.statics.removeActiveBets = (cb) => {
    mongoose.model('User').find({}).populate('bets').exec(function(err, users){
        for(var i = 0; i < users.length; i++){
            console.log(users[i])
            let user = users[i];
            let objectIds = [];
            for(var x = 0; x < user.bets.length; x++){
                if(user.bets[x].active == true){
                    objectIds.push(user.bets[x]._id);
                }
            }
            mongoose.model('User').updateOne(user[i], {$pull: {bets: {$in: objectIds}}}, function(err){
                if(err)console.log(err.message);
                else console.log('Removed active bets from user: ' + user._id);
                
                if(i == users.length){
                    return cb();
                }
            })
        }
    });
}


User.methods.matchEmail = function (email) {
    if (email === this.email) return;
};

module.exports = mongoose.model('User', User);