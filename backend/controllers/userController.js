const User = require('../model/FileUser');
const bcrypt = require('bcrypt');
const passport = require('passport');  // authentication


exports.getUser = (req, res) => {
    const user = User.findById(req.params.userId);
    if (user) {
        res.json(user);
    } else {
        res.status(404).json({
            message: "No User Found",
        });
    }
};


exports.createUser = async (req, res) => {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const newUser = new User({
        username: req.body.username,
        password: hashedPassword,
        email: req.body.email,
    });

    checkEmail(req.body.email);
    

    async function checkEmail(email) {
        // Find the user with the specified email
        const user = User.findOne({ email: email });
      
        // If the user was found, compare the emails
        if (user) {
            res.send("AGAIN")
        } else {
            newUser.save();
            res.send("Loading...")
        }
      }
    
    
}

exports.loginUser = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) throw err;
        if (!user) {
            res.send("Username or Password is wrong");
        } else {
            req.logIn(user, (err) => {
                res.send("Login Sucessful");
            })
        }
    })(req, res, next);
}