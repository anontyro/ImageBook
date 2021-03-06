/**
 * FILM ROUTER (/film)
 * All the routes that map to the sub path of films
 */
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const request = require('request');
const apiKey = require('../../config/env').MovieDbKeyV3;

// film model
const Film = require('../../models/filmSchema').Film;
const FilmReview = require('../../models/userReviewSchema').FilmReview;

// mongoose methods to connect to my database
const mongoApi = require('../../services/mongooseSharedApi')

//SignIn middleware to protect routes
const checkSignIn = require('../../shared/index.middle').checkSignIn;
const movieApi = require('../../services/movieDbApi');

// film homepage
router.get('/', (req, res) => {
    mongoApi.getLastAddedFilms(2, (callback) => {
        movieApi.getNowShowing((body) =>{
            const output = JSON.parse(body);
            const ranStart = Math.floor(Math.random() * ( (output.results.length-10) - 0) + 0);
            console.log('random start: ' + ranStart + ', from total:' + output.results.length)
            // res.send(body);
            res.render('./film/index', {
                title: 'Film Home',
                filmList: output,
                filmListStart: ranStart,
                filmListEnd: (ranStart + 10)
            });
        })
    });

});

// film search view
router.get('/search', (req,res) =>{
    const query = req.query.q;
    if(query === undefined){
        res.send('error query string required in the format q=thor');
    }
    movieApi.getFilmSearch(query, 1, (body) => {
        console.log(JSON.parse(body));
        res.render('./film/film_search', {
            filmSearch: JSON.parse(body)
        });
    });
});

/**
 * Get the reviews that a user has done from the database
 */
router.get('/reviewList/:username', (req, res) =>{
    const Username = req.params.username;
    mongoApi.getFilmReviewsByUsername(Username, (reviewList) =>{
        res.json(reviewList);
    })
});

// display film list
router.get('/list', (req, res) => {
    Film.find( (err, response) => {
        res.json(response);
    });
});

// get add form to add a new film to the database
router.get('/add', checkSignIn,(req, res) => {
    res.render('./film/add', {
        title: 'Add a new film'
    })
});
// post the add form to add the film to the database
router.post('/add', checkSignIn, (req,res) =>{
    const newFilm = req.body;
    console.log(newFilm);
    if(!newFilm.title || !newFilm.releaseDate) {
        res.send('Sorry not all information was entered correctly, try again');
    }else {
        const film = new Film({
            title: newFilm.title,
            releaseDate: newFilm.releaseDate,
            blurb: newFilm.blurb,
            dateAdded: Date.now()
        });

        film.save((err, Film) =>{
            if(err){
                res.send('An error occured whilst trying to save the film data');
            } else{
                console.log(film);
                res.send('new film successfully added');
            }
        });
    }
});

// Least specific routes these are the last

// specific film detail view
router.get('/:id', (req,res) =>{
    const FilmId = req.params.id;
    const reviewAdded = req.query.review;
    const user = req.session.user;
    let userReview;

    mongoApi.getFilmReviewsByFilmId(FilmId, (reviews) =>{
        if(user){
            for(let i = 0; i < reviews.length; i++) {
                if(reviews[i].username === user.username){
                    userReview = reviews[i];
                }
            }
        }
        movieApi.getFilmDetails(FilmId, (body) => {
            res.render('./film/film_detail', {
                filmContent: JSON.parse(body),
                updates: reviewAdded,
                userReviews: reviews,
                currentUserReview: userReview,
            });
        });
    })
});

// user review post from the film
// needs to be reconsidered and refactored
router.post('/:id', checkSignIn, (req, res) =>{
    const filmId = req.params.id;
    const review = req.body;
    const update = req.query.type;

    const newReview ={
        username: req.session.user.username,
        filmId: filmId,
        filmTitle: review.filmtitle,
        title: review.title,
        rating: review.rating,
        review: review.review,
        reviewDate: Date.now(),
    };

    const query = {
        username: req.session.user.username,
        filmId: filmId
    };

    FilmReview.findOneAndUpdate(query, newReview, {upsert: true}, (err, body) =>{
        if(err){
            console.log(err);
            res.send(err);
        } else{
            console.log(newReview);
            res.redirect('/film/' + filmId + '?review=' + newReview.title)
        }
    });
    
});

module.exports = router;