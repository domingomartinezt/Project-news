var express = require('express');
var app = express();
var pg = require('pg');
var bodyParser = require('body-parser');
var Sequelize = require('sequelize');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(express.static('public'));
//connect to a database
if (process.env.POSTGRES_USER){
  var connetionString = 'postgres://'+process.env.POSTGRES_USER+':'+process.env.POSTGRES_PASSWORD+'@localhost/project_news';
}else{
  var connetionString = process.env.DATABASE_URL;
}
//set the view engine to hbs for handlebars, ejs for ejs, or pug for pug
app.set('view engine', 'ejs');
//sets this application to look at `my-views` next to the running application
app.set('views', './views');
//sets this application to use post routing



// Activate-desactive an article
app.post('/thumbsUp', function(request,response){
  sequelize.sync().then(function(){
    Article.findById(request.body.id).then(article => {
      article.increment('thumbs_up');
      return response.json(article.dataValues.thumbs_up + 1);
    })
  });
});

app.post('/thumbsDown', function(request,response){
  sequelize.sync().then(function(){
    Article.findById(request.body.id).then(article => {
      article.increment('thumbs_down');
      return response.json(article.dataValues.thumbs_down + 1);
    })
  });
});


// Call the form to update an article
app.get('/article/:id', function(request,response){
  sequelize.sync().then(function(){
    Article.findById(request.params.id).then(article => {
      article.increment('visits');
    })
  });
  sequelize.sync().then(function(){
    Article.findById(request.params.id, {include: [Author]}).then(article => {
      response.render('article',{article: article});
    })
  });
});


// Get all the messages
app.get('/', function(request,response){
  sequelize.Promise.all([
    Article.findAll({where: {active: true}, include: [Author], order:[['createdAt','DESC']]}),
    Article.findAll({where: {active: true}, include: [Author], order:[['visits','DESC']], limit :5}),
    Article.findAll({where: {active: true}, include: [Author], order:[['thumbs_up','DESC']], limit :5})])
    .spread(function(articles, featured, rated) {
      response.render('main',{articles: articles, featured: featured, rated: rated});
  });
});


// Show the list of all the articles created
app.get('/listArticles', function(request,response){
  sequelize.sync().then(function(){
    Article.findAll({include: [Author]}).then(articles => {
      response.render('listArticles',{articles: articles});
    })
  });
});

// Create a new article
app.post('/newArticle', function(request,response){
  sequelize.sync().then(function(){
    Article.create(request.body).then(article =>{
      response.redirect('/listArticles');
    })
  });
});

// Delete an article
app.get('/deleteArticle/:id', function(request,response){
  console.log(request.params.id);
  sequelize.sync().then(function(){
    Article.destroy({
      where: {id: request.params.id}}).then(function(){
      response.redirect('/listArticles');
    })
  });
});

// Activate-desactive an article
app.post('/activateArticle', function(request,response){
  sequelize.sync().then(function(){
    Article.update({active: request.body.active},
      {where: {id: request.body.id}})
  });
});

// Call the form to update an article
app.get('/updateArticle/:id', function(request,response){
  var article, authors;
  sequelize.sync().then(function(){
    Article.findById(request.params.id, {include: [Author]}).then(article => {
      sequelize.sync().then(function(){
        Author.findAll().then(authors => {
          // console.log(article.dataValues.author.first_name);
          response.render('updateArticle',{authors: authors, article: article});
        })
      });
    })
  });
});

// Sumit the changes to update an author
app.post('/updateArticle', function(request,response){
  sequelize.sync().then(function(){
    Article.update(request.body,
      {where: {id: request.body.id}}).then(function(){
      response.redirect('/listArticles');
    })
  });
});


// Call the form to create a new article
app.get('/newArticle', function(request,response){
  sequelize.sync().then(function(){
    Author.findAll({
      where: {active: 'true'}
    }).then(authors => {
      response.render('newArticle',{authors: authors});
    })
  });
});



// >>>>>>>>>> Event to manage authors <<<<<<<<<<

// List all athors view list of authors
app.get('/listAuthors', function(request,response){
  sequelize.sync().then(function(){
    Author.findAll().then(authors => {
      response.render('listAuthors',{authors: authors});
    })
  });
});

// Create a new author
app.post('/newAuthor', function(request,response){
  sequelize.sync().then(function(){
    Author.create(request.body).then(function(){
      response.redirect('/listAuthors');
    })
  });
});

// Delete an author
app.get('/deleteAuthor/:id', function(request,response){
  console.log(request.params.id);
  sequelize.sync().then(function(){
    Author.destroy({
      where: {id: request.params.id}}).then(function(){
      response.redirect('/listAuthors');
    })
  });
});

// Activate-desactive an author
app.post('/activateAutor', function(request,response){
  console.log(request.params.id);
  sequelize.sync().then(function(){
    Author.update({active: request.body.active},
      {where: {id: request.body.id}})
  });
});

// Update an author call the form
app.get('/updateAutor/:id', function(request,response){
  sequelize.sync().then(function(){
    Author.findById(request.params.id).then(authors => {
      console.log(authors);
      response.render('updateAuthor',{authors: authors});
    })
  });
});

// Sumit the changes to update an author
app.post('/updateAuthor', function(request,response){
  sequelize.sync().then(function(){
    Author.update(request.body,
      {where: {id: request.body.id}}).then(function(){
      response.redirect('/listAuthors');
    })
  });
});

// Call the form to create a new author
app.get('/newAuthor', function(request,response){
  response.render('newAuthor');
});


var sequelize = new Sequelize(connetionString);
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

const Author = sequelize.define('author',{
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
  first_name: Sequelize.STRING,
  second_name: Sequelize.STRING,
  active: Sequelize.BOOLEAN
});

const Article = sequelize.define('article',{
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
  title: Sequelize.STRING,
  URL_image: Sequelize.TEXT,
  resume: Sequelize.TEXT,
  body: Sequelize.TEXT,
  category: Sequelize.STRING,
  visits: {type: Sequelize.INTEGER, defaultValue: 0},
  thumbs_up: {type: Sequelize.INTEGER, defaultValue: 0},
  thumbs_down: {type: Sequelize.INTEGER, defaultValue: 0},
  active: Sequelize.BOOLEAN

});

Article.belongsTo(Author, {foreignKey: { allowNull: false }, onDelete: 'CASCADE', onUpdate:'RESTRICT'});
Author.hasMany(Article, {onDelete: 'CASCADE', onUpdate:'RESTRICT'});


// Force sync all models
// sequelize.sync({force: true});


app.listen(process.env.PORT, function(){
 console.log('Listing on port no. 3005');
});
