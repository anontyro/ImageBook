/**
 * NEW ROUTER (/news)
 * All the routes that are mapped to the news section which is basically
 * a blog about all of the
 */
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const request = require('request');



// news Model
const News = require('../../models/newsSchema').News;

const newsApi = require('../../services/newsApi');

/** Protect routes that require the user logged in*/
const checkSignIn = require('../../shared/index.middle').checkSignIn;

/** File upload middleware */
const getFile = require('../../shared/index.middle').setFileUpload;

const upload = getFile('public/img/news/cover_img/');

// index - news homepage
router.get('/', (req, res) =>{
    newsApi.getLatestNews(10, (output) =>{
        res.render('./news/index', {
            title: 'News Home',
            newsList: output
        });
    })
});
// Add new - add a new news article
// Update - update a news article
//both can be the same route
router.get('/add',checkSignIn,  (req, res) =>{
    res.render('./news/add', {
        title: 'Add a new Review'
    })
});

/**
 * 
 */
router.post('/add',checkSignIn,  upload.single('imageupload'), (req, res) =>{
    const newNews = req.body;
    console.log(req.file);
    res.send(req.body);
})

// Delete - remove a news article



module.exports = router;