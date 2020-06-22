var express = require('express');
var router = express.Router();
const Books = require('../models').Book;
const db = require('../models');
const { Op } = db.Sequelize;


/* Handler function to wrap each route. */
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      res.status(500).send(error);
    }
  }
}




/* Displays all books */
router.get('/', asyncHandler(async (req, res) => {
  let pageNum = req.query.page; //variable will hold query string value
  const limit = 5;  //results shown per page
  let page = (pageNum) ? pageNum : 1;  //initially no page will wll be selected so we'll set the default page to 1
  const offset = limit * (page - 1); 
  const booksData = await Books.findAndCountAll({limit, offset});
  const books = booksData.rows;
  const pages = Math.ceil(booksData.count / limit); //calculates how many pages are needed based on number of results
  res.render("books/index", { books, pages, title: "Books" });
}));


/* capture search input and creates query string  */
router.post('/s', asyncHandler(async(req, res) => {
    let {search} = req.body;
    res.redirect(`/books/s?q=${search}`)
}));

/* looks for books that match user search */
router.get('/s', asyncHandler(async (req, res) => {
  let noResults;
  let query = req.query.q;
  let pageNum = req.query.page;
  const limit = 5;
  let page = (pageNum) ? pageNum : 1;
  const offset = limit * (page - 1);
  const booksData = await Books.findAndCountAll({ 
    where: {  //this will iterate through all book data and retrieve any book that match user search
      [Op.or]: [
        {title: { [Op.like]: `%${query}%` }},
        {author: { [Op.like]: `%${query}%` }},
        {genre: { [Op.like]: `%${query}%` }},
        {year: { [Op.like]: `%${query}%` }}
      ]
    },
    limit, 
    offset,
  });
  const NumOfResults = booksData.count; 
  const books = booksData.rows;
  if (booksData.count === 0) { noResults = "No Results, Please try again"} // 'no results msg' will display if there are zero results
  const pages = Math.ceil(NumOfResults / limit); // number of pages required base on results and limit per page
  res.render("books/index", {query, books, noResults, pages, title: "Book Search" });
}));

/* create new book form */
router.get('/new', function(req, res) {
  res.render("books/new-book", { book: {}, title: "New Book" } );
});

/* post new book to database */
router.post('/', asyncHandler(async(req, res) => {
  let book;
  try { //if input passes validation we'll add new book to database
    book = await Books.create(req.body);
    res.redirect("/books/" + book.id)
  } catch (error) {
    if (error.name === "SequelizeValidationError") {  //if validation error fail we'll show form again without submitting to database
      book = await Books.build(req.body);
      res.render("books/new-book", { book, errors: error.errors, title: "New Book"})
    } else {
      throw error;
    }
  }
}));


/* display book detail form */
router.get('/:id', asyncHandler(async(req, res) => {
  const book = await Books.findByPk(req.params.id);
  if (book) {
    res.render("books/update-book", { book, title: "Book Update" } );
  } else {
    res.render('error')
    res.sendStatus((404));
  }
}));

/* updates book info to database */
router.post('/:id', asyncHandler(async(req, res) => {
  let book;
  try { 
    book = await Books.findByPk(req.params.id);
    if (book) {
      await book.update(req.body);
      res.redirect("/books/" + book.id);
    } else {
      res.sendStatus((404))
    }
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      book = await Books.build(req.body);
      book.id = req.params.id;
      res.render("books/update-book", {book, errors: error.errors, title: "update book"});
    } else {
      throw error
    }
  }
  res.render("books/index", { title: "Books" } );
}));

/* DELETES book */
router.post('/:id/delete', asyncHandler(async(req, res) => {
  const book = await await Books.findByPk(req.params.id);
  if (book) {
    await book.destroy();
    res.redirect("/books");
  } else {
    res.sendStatus((404));
  }
}));





module.exports = router;
