const mongoose = require('mongoose');

const connectDB = async() => {
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
        })

        console.log('MongoDB is connected');

    } catch (err) {
        console.log(err.message);
        process.exit(1);
    }
};

module.exports = connectDB;