const mongoose = require('mongoose');

const rouletteSchema = mongoose.Schema({
    game: {
        type: String
    },
    date: {
        type: Date,
    },
    outcome: {
        type: String
    }
});

const Round = mongoose.model('RouletteRounds', rouletteSchema);

module.exports = Round;
