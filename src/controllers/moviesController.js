const path = require('path');
const db = require('../database/models');
const sequelize = db.sequelize;
const { Op, where } = require("sequelize");
const moment = require('moment');



//Aqui tienen una forma de llamar a cada uno de los modelos
const {Movies,Genres,Actor} = require('../database/models');

//Aquí tienen otra forma de llamar a los modelos creados
/* const Movies = db.Movie;
const Genres = db.Genre;
const Actors = db.Actor; */


const moviesController = {
    'list': (req, res) => {
        db.Movie.findAll()
            .then(movies => {
                res.render('moviesList.ejs', {movies})
            })
    },
    'detail': (req, res) => {
        db.Movie.findByPk(req.params.id)
            .then(movie => {
                res.render('moviesDetail.ejs', {movie});
            });
    },
    'new': (req, res) => {
        db.Movie.findAll({
            order : [
                ['release_date', 'DESC']
            ],
            limit: 5
        })
            .then(movies => {
                res.render('newestMovies', {movies});
            });
    },
    'recomended': (req, res) => {
        db.Movie.findAll({
            where: {
                rating: {[db.Sequelize.Op.gte] : 8}
            },
            order: [
                ['rating', 'DESC']
            ]
        })
            .then(movies => {
                res.render('recommendedMovies.ejs', {movies});
            });
    },
    //Aqui dispongo las rutas para trabajar con el CRUD
    add: async function (req, res) {
        try {
            let allGenres = await db.Genre.findAll();
            return res.render('moviesAdd', {allGenres})
        } catch (error) {
            console.log(error)
        }
        
    },
    create: async function (req,res) {
        try {
            let {title, rating, awards, release_date, length, genre_id} = req.body;
            let movie = await db.Movie.create({
                title : title.trim(),
                rating,
                awards,
                release_date,
                length,
                genre_id
            })
            res.redirect('/movies')

        } catch (error) {
            console.log(error)
        }
        
    },
    edit: async function(req,res) {
        try {
            let {id} = req.params
            let allGenres = await db.Genre.findAll();
            let Movie = await db.Movie.findByPk(id, {include: [{ association: "genre" }],});
            return res.render('moviesEdit', {allGenres, Movie, fecha : moment(Movie.release_date).format('YYYY-MM-DD')})
        } catch (error) {
            console.log(error)
        }
    },
    update: async function (req,res) {
        try {
            let {title, rating, awards, release_date, length, genre_id} = req.body;
            await db.Movie.update({
                title : title.trim(),
                rating,
                awards,
                release_date,
                length,
                genre_id
            },
            {
                where : {
                    id : req.params.id
                }
            }
            )
            let movie = await db.Movie.findByPk(req.params.id)

            return res.redirect(`/movies`)
        } catch (error) {
            console.log(error)
        }
        
    },
    delete: async function (req,res) {
        try {
            let {id} = req.params
            let Movie = await db.Movie.findByPk(id);
            return res.render('moviesDelete', {Movie})
        } catch (error) {
            console.log(error)
        }
    },
    destroy: function (req,res) {
        db.Movie.destroy(
            {
                where: {
                    id : req.params.id
                }
            }
        )
            .then(movie => {
                return res.redirect('/movies')
            })
            .catch(error => console.log(error))
    }
}

module.exports = moviesController;