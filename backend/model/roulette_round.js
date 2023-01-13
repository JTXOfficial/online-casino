const mongoose = require('mongoose');

const rouletteSchema = mongoose.Schema({
    game: {
        type: String
    },
    date: {
        type: Date,
    },
    outcome: {
        type: String,
    },
    client_seed: {
        type: String,
    },
    server_seed: {
        type: String,
    },

});

const Round = mongoose.model('RouletteRounds', rouletteSchema);

module.exports = Round;
