// ==================================
// APP CONFIG
// ==================================

const express = require('express');
const app = new express();
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const expressSanitizer = require('express-sanitizer');
const moment = require('moment');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(methodOverride('_method'));
app.use(expressSanitizer());


// ==================================
// MONGOOSE CONFIG
// ==================================

const mongoose = require('mongoose');
mongoose.connect("mongodb://localhost:27017/blog_app", {useNewUrlParser: true}, (err, db) => {
	if (err) {
        console.log('MongoDB Connection Error:', err);
    }
});

let blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);
mongoose.set('useFindAndModify', false);


// ==================================
// ROUTES
// ==================================

// ROOT
app.get('/', (req, res) => {
	res.redirect('/blogs');
});

// INDEX
app.get('/blogs', (req, res) => {
	Blog.find({})
		.sort({created: -1})
		.exec((err, blogs) => {
			if(err) {
				console.log("Error: " + err);
			} else {
				res.render('index', {blogs: blogs, moment: moment});
			}
		});
});

// NEW
app.get('/blogs/new', (req, res) => {
	res.render('new');
});

// CREATE
app.post('/blogs', (req, res) => {
	// req.body.blog is an object containing the items in the form, due to the naming convention of the form inputs
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.create(req.body.blog, (err, newBlog) => {
		if(err) {
			res.render('new');
		} else {
			res.redirect('/blogs');
		}
	});
});

// SHOW
app.get('/blogs/:id', (req, res) => {
	Blog.findById(req.params.id, (err, blog) => {
		if(err) {
			res.redirect('/blogs');
		} else {
			res.render('show', {blog: blog, moment: moment});
		}
	});
});

// EDIT
app.get('/blogs/:id/edit', (req, res) => {
	Blog.findById(req.params.id, (err, blog) => {
		if(err) {
			res.redirect('/blogs');
		} else {
			res.render('edit', {blog: blog, moment: moment});
		}
	});
});

// UPDATE
app.put('/blogs/:id', (req, res) => {
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, (err, updatedblog) => {
		if (err) {
			res.redirect('/blogs');
		} else {
			res.redirect('/blogs/' + req.params.id);
		}
	});
});

// DELETE
app.delete('/blogs/:id', (req, res) => {
	Blog.findByIdAndRemove(req.params.id, (err) => {
		if (err) {
			res.redirect('/blogs/' + req.params.id);
		} else {
			res.redirect('/blogs');
		}
	});
});


// ==================================
// APP LISTEN
// ==================================

app.listen(3000, function() {
	console.log("Blog App Server has started!");
});