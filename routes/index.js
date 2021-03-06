/**
 * BUNDLED ROUTES
 * all of the routes bundled together to make it easy to supply
 * in the index.js file
 */
const homeRoutes = require('./home.routes');
const filmRoutes = require('./film/film.routes');
const tvRoutes = require('./tv/tv.routes');
const newsRoutes = require('./news/news.routes');
const errorRoutes = require('./error.routes');

/**
 * Bundled routes checked in order added
 * @param {*} app injected express app param 
 */
module.exports = (app)=>{ 
    app.use('/', homeRoutes);
    app.use('/film', filmRoutes);
    app.use('/tv', tvRoutes);
    app.use('/news', newsRoutes);
    app.use('**', errorRoutes);

};