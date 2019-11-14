var express    = require('express'),
	app        = express(),
	mongoose   = require('mongoose'),
	bodyParser = require('body-parser'),
	methodOverride = require('method-override')
	expressSanitizer = require('express-sanitizer');


// APP CONFIG
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));
mongoose.connect('mongodb://localhost:27017/blog_app', { useNewUrlParser: true, useUnifiedTopology: true});

// MONGOOSE/MODEL CONFIG
var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: {type: Date, default: Date.now}
});
var Blog = mongoose.model("Blog", blogSchema);

/**
Blog.create({
	title: "Test Blog",
	image: "https://images.unsplash.com/photo-1571492715522-862aeab6f849?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80",
	body: "HELLO THIS IS A BLOG POST!"
}, function(err, blog){
	if (err){
		console.log(err);
	} else {
		console.log("Added new blog");
	}
}
);
**/

// RESTFUL ROUTES
app.get("/blogs", function(req, res){
	Blog.find({}, function(err, blogs){
		if (err){
			console.log(err);
		} else {
			res.render("index", {blogs: blogs});
		}
	});
});

app.post("/blogs", function(req, res){
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.create(req.body.blog, function(err, blog){
		if (err){
			res.redirect("new");
		} else {
			res.redirect("/blogs");
		}
	});
});

app.get("/", function(req, res){
	res.redirect("/blogs");
});

app.get("/blogs/new", function(req, res){
	res.render("new");
});

app.get("/blogs/:id", function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if (err){
			res.redirect("/blogs");
		} else {
			res.render("show", {blog: foundBlog});
		}
	});
});

app.get("/blogs/:id/edit", function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if (err){
			res.redirect("/blogs");
		} else {
			res.render("edit", {blog: foundBlog});
		}
	})
});

app.put("/blogs/:id/edit", function(req, res){
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, blog){
		if (err){
			res.redirect("/blogs");
		} else {
			res.redirect("/blogs/" + req.params.id)
		}
	})
});

app.delete("/blogs/:id", function(req, res){
	Blog.findByIdAndRemove(req.params.id, function(err, foundBlog){
		if (err){
			res.redirect("/blogs");
		} else {
			res.redirect("/blogs");
		}
	})
});

app.listen(3000, function(){
	console.log("Blog app is listening on port 3000...");
});