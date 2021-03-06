/**
 * HOME ROUTER (/)
 * all the routes that map to the base level domain
 */
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// user model
const User = require('../models/personSchema').Person;
const checkSignIn = require('../shared/index.middle').checkSignIn;

// mongoose methods to connect to my database
const mongoApi = require('../services/mongooseSharedApi')

// Database call classes
const movieApi = require('../services/movieDbApi');
const tvApi = require('../services/movieDbTvApi');
const newsApi = require('../services/newsApi');

/**
 * Route Middleware to pick up if the user has signed in
 * if so store user data in global
 */
router.get('*', (req, res, next) =>{
    res.locals.user = req.session.user || null;
    console.log(res.locals.user);
    next();
});

/**
 * Home Route
 */
router.get('/', (req, res) =>{
    newsApi.getLatestNews(4, (newsBody) =>{
        tvApi.getAiringToday((tvBody) =>{
            movieApi.getNowShowing( (FilmBody) =>{
                const output = JSON.parse(FilmBody);
                const tvOutput = JSON.parse(tvBody);
                const newsOutput = newsBody;

                res.render('./home/index', {
                    title: "5 Minute Media",
                    url: "https://github.com",
                    css: "/css/home/landing-page.css",
                    filmList: output.results,
                    tvList: tvOutput.results,
                    newsList: newsOutput,
                });
            })
        })
    })
});

/**
 * Regex pattern ID
 */
router.get('/:id([0-9]{5})', (req, res)  =>{
    res.send('Your Id:' + req.params.id);
});

/**
 * Registration
 * Register a new user request
 */
router.get('/register', (req, res) => {
    res.render('./auth/register',{
        title: "Register new user"
    })
});

/**
 * Registration
 * On form submission check the information was given if so save it to the database
 */
router.post('/register', (req, res) =>{
    const userInfo = req.body;
    console.log(userInfo);
    if(!userInfo.firstname || !userInfo.lastname || !userInfo.email || !userInfo.password ) {
        res.send('Sorry not all information was filled out correctly');
    }else {
        const newUser = new User({
            firstname: userInfo.firstname,
            lastname: userInfo.lastname,
            email: userInfo.email,
            password: userInfo.password
        });

        newUser.save( (err, User) => {
            if(err){
                res.send('An error occured whilst connecting to the database');
            }else{
                console.log(newUser);
                res.send('New User added!');
                
            }
        });
    }
    // res.send('Your request has been sent successfully');
});

/**
 * USER
 * route to get all users in the database returned in JSON format
 */
router.get('/user', (req, res) =>{
    User.find( (err, response) =>{
        console.log(response);
        res.json(response);
    });
});

/**
 * Login
 * sends the login page for the user to login and request a new session
 */
router.get('/login', (req, res) =>{
    if(req.session.user){
        res.redirect('/logout');
    }
    res.render('./auth/login');
});

/**
 * Login Submission
 * once the user has submitted the form check it has all the details and then check the database 
 * if validated will get a new session
 */
router.post('/login', (req,res) =>{
    console.log(req.body);
    if(!req.body.email || !req.body.password){
        res.status('400');
        res.send('Invalid login details');
    } else {
        User.findOne({email: req.body.email, password: req.body.password}, (err, response) =>{
            if(response === null){
                res.status('401');
                res.send('Error incorrect login details');
            } else {
                console.log(response);
                const User = {
                    username: response.email,
                    
                }
                req.session.user = User;
                console.log(req.session);
                res.redirect('/user_area');
            }
        });
    }
});

router.get('/logout', (req,res) =>{
    req.session.destroy(()=>{
        console.log('logged out');
    });
    res.redirect('/login');
});

/**
 * USER AREA
 * a page that requires the user to login first and have an active session to contiune
 */
router.get('/user_area', checkSignIn, (req, res) =>{
    let Username = req.session.user.username;
    mongoApi.getFilmReviewsByUsername(Username, (filmReviewList) =>{
        mongoApi.getTvReviewsByUsername(Username, (tvReviewList) =>{
            res.render('./user/user_area', {
                filmList: filmReviewList,
                tvList: tvReviewList
            })
        })
    })
});



module.exports = router;