const User = require('../models/user');
const Credential = require('../models/credential');

const app = require('../app');

const asyncHandler = require('express-async-handler');
const {body, validationResult} = require('express-validator');

const {getUser, setUser} = require('./currentUser');

//Display Sign-in Form on GET
exports.signin_get = asyncHandler(async(req, res, next) =>{
    res.render('signin', {title: "Sign In"});
});

//Handle Sign-in Form on POST
exports.signin_post = [
    asyncHandler(async(req, res, next) =>{
        const errors = validationResult(req);

        const credential = new Credential({
            email: req.body.email,
            password: req.body.password,
        });

        if(!errors.isEmpty()) {
            res.render('signin', {
                title: "Sign In",
                credential: credential,
                errors: errors.array(),
            });
            return ;
        }
        else {
            const credentialExists = await Credential.findOne({email: req.body.email}).exec();
            console.log("here");
            if(!credentialExists) {
                res.render('signin', {
                    title: "Sign In",
                    credential: credential,
                    form_errors: "User does not exist"
                });
                return ;
            }
            if(credentialExists.password !== credential.password) {
                res.render('signin', {
                   title: "Sign In",
                   credential: credential,
                   form_errors: "Incorrect password",
                });
                return ;
            }
            const user = await User.findById(credentialExists.user).exec();
            console.log(setUser);
            setUser(user._id);
            res.redirect(user.url);
        }    
    }),

]

//Display Sign-Up form on GET
exports.signup_get = asyncHandler(async(req, res, next) =>{
    res.render('signup', {title: "Sign up"});
});

//Handle Sign-Up form on POST4
exports.signup_post = [
    body("password")
    .trim()
    .isLength({min: 8, max: 32})
    .withMessage("Must contain at least 8 characters and not more than 32"),

    asyncHandler(async(req, res, next) =>{
        const errors = validationResult(req);
        console.log("here now");
        const user = new User({
            userid: req.body.userid,
            name: req.body.name,
        });

        const credential = new Credential({
            user: user._id,
            email: req.body.email,
            password: req.body.password,
        });

        if(!errors.isEmpty()) {
            res.render('signup', {
                title: "Sign Up",
                user: user,
                credential: credential,
                errors: errors.array(),
            });
            return ;
        }
        else {
            const userExists = await User.findOne({userid: req.body.userid}).exec();
            if(userExists) {
                res.render('signup', {
                    title: "Sign Up",
                    user: user,
                    credential: credential,
                    form_errors: "UserID already exists!",
                });
                return ;
            }
            const credentialExists = await Credential.findOne({email: req.body.email}).exec();
            if(credentialExists) {
                res.render('signup', {
                    title: "Sign Up",
                    user: user,
                    credential: credential,
                    form_errors: "Email has already been used!",
                });
                return ;
            }
            
            await user.save();
            await credential.save();
            setUser(user._id);
            res.redirect(user.url);
        }
    }),

];