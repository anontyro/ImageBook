const request = require('request');
const apiKey = require('../config/env').MovieDbKeyV3;

const buildRequestOptions = (url, page, key, query) => {
    const options = {
        method: 'GET',
        url: url,
        qs: {page: page, language: 'en-us', api_key: apiKey},
        body: '{}' };
    
    if(query){
        options.qs.query = query;
    }
    return options;
}
module.exports ={
    /**
     * film
     */
    getNowShowing: (callback) =>{
        const options = buildRequestOptions( 
            'https://api.themoviedb.org/3/movie/now_playing', 1, apiKey);
        
        request( options, (err, res, body) => {
            if(!err && res.statusCode == 200) {
                callback(body);
            }
        })
    },
    getFilmDetails: (id, callback) =>{
        const options = buildRequestOptions(
            ('https://api.themoviedb.org/3/movie/' + id) , 1, apiKey
        );
        request( options, (err, res, body) => {
            if(!err && res.statusCode == 200) {
                callback(body);
            }
        })
    },
    getFilmSearch: (query, page, callback) => {
        const options = buildRequestOptions(
            'https://api.themoviedb.org/3/search/multi' , 1, apiKey, query
        );
        request( options, (err, res, body) => {
            if(!err && res.statusCode == 200) {
                callback(body);
            }
        })
    }
}