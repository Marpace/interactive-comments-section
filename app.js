const bodyParser = require('body-parser');
const ejs = require('ejs');
const path = require("path");
const express = require("express");
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const livereload = require("livereload");
const connectLivereload = require("connect-livereload");
const fs = require("fs");


const app = express();
const liveReloadServer = livereload.createServer();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true})); 



//reading json file with data for challenge
let rawData = fs.readFileSync("data.json");
let data = JSON.parse(rawData);


// for refreshing browser on css changes 
liveReloadServer.server.once("connection", () => {
  setTimeout(() => {
    liveReloadServer.refresh("/");
  }, 100);
});
liveReloadServer.watch(path.join(__dirname, 'public'));
app.use(connectLivereload());

//conection to MongoDB database
mongoose.connect(`mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@comments.a2jgq.mongodb.net/commentsDB?retryWrites=true&w=majority`, {
    useNewUrlParser: true, 
    useUnifiedTopology: true
});

const commentSchema = new mongoose.Schema({
  
  content: String,
  createdAt: String,
  score: Number,
  user: {
    image: String,
    username: String
  },
  replies: [
    {
      content: String,
      createdAt: String,
      score: Number,
      replyingTo: String,
      user: {
        image: String,
        username: String
      }
    }
  ]
});



const Comment = new mongoose.model('Comment', commentSchema);




// initial comments and replies
const comment1 = new Comment({
  content: data.comments[0].content,
  createdAt: data.comments[0].createdAt,
  score: data.comments[0].score,
  user: {
    image: data.comments[0].user.image.png,
    username: data.comments[0].user.username
  }, 
  replies: []
});

const comment2 = new Comment({
  content: data.comments[1].content,
  createdAt: data.comments[1].createdAt,
  score: data.comments[1].score,
  user: {
    image: data.comments[1].user.image.png,
    username: data.comments[1].user.username
  }, 
  replies: [
    {
      content: data.comments[1].replies[0].content,
      createdAt: data.comments[1].replies[0].createdAt,
      score: data.comments[1].replies[0].score,
      replyingTo: data.comments[1].replies[0].replyingTo,
      user: {
        image: data.comments[1].replies[0].user.image.png,
        username: data.comments[1].replies[0].user.username
        }
    },
    {
      content: data.comments[1].replies[1].content,
      createdAt: data.comments[1].replies[1].createdAt,
      score: data.comments[1].replies[1].score,
      replyingTo: data.comments[1].replies[1].replyingTo,
      user: {
        image: data.comments[1].replies[1].user.image.png,
        username: data.comments[1].replies[1].user.username
        }
    }
  ]
});


const initialComments = [comment1, comment2];

// saving initial comments and replies to the database
Comment.find({}, function(err, documents){
  if(documents.length < 1) {
    Comment.insertMany(initialComments, function(err){
      if(err){
        console.log(err);
      } else {
        console.log("Comments added successfully!");
      }
    }) 
  }
})



// get route 
app.get("/", (req, res, next) => {
  Comment.find({}, function(err, comments){
    if(err) console.log(err);
    else {
      res.render('index', {comments: comments})
    }
  })
});

// Post routes
// creates new comment, saves to database and redirects to root
app.post("/compose-comment", (req, res, next) => {

  const newComment = new Comment({
    content: req.body.content,
    createdAt: new Date().getTime(),
    score: 0,
    user: {
      image: "./images/avatars/image-juliusomo.png",
      username: "juliusomo"
    }, 
    replies: []
  });

  Comment.create(newComment);
  res.redirect("/");

});



//creates new reply and pushes to replies array in corresponding comment
app.post("/compose-reply", (req, res, next) => {
  const newReply = {
    content: req.body.content,
    createdAt: new Date().getTime(),
    score: 0,
    replyingTo: req.body.replyingTo,
    user: {
      image: "./images/avatars/image-juliusomo.png",
      username: "juliusomo"
    }
  }

  Comment.findById(req.body.commentId, function(err, doc){
    if(err) console.log(err)
    else {
      console.log("reply added to the database")
      doc.replies.push(newReply);
      doc.save();
      res.redirect("/")
    }
  })
});

//updates edited comment 
app.post("/update-comment", (req, res, next) => {

  const createdAt = new Date().getTime();
  
  Comment.findByIdAndUpdate(req.body.commentId, {content: req.body.editedContent, createdAt: createdAt}, (err, comment) => {
    if(err) console.log(err)
    else {
      console.log("Comment has been updated")
      return res.redirect("/");
    }
  })
});

//updates edited reply 
app.post("/update-reply", (req, res, next) => {
  const index = req.body.replyIndex;
  const editedContent = req.body.editedContent;

  Comment.findById(req.body.commentId, (err, comment) => {
    if(err) console.log(err);
    else {
      console.log("Reply has been updated")
      comment.replies[index].content = editedContent;
      comment.replies[index].createdAt = new Date().getTime();
      comment.save();
      res.redirect('/')
    }
  });

});

// deletes reply from replies array in the comment document
app.post("/delete-reply", (req, res, next)=> {

  const index = req.body.replyIndex

  Comment.findById(req.body.commentId, (err, doc) => {
    if(err) console.log(err)
    else {
      console.log("reply deleted")  
      doc.replies.splice(index, 1);
      doc.save()
      res.redirect("/");
    }
  });
});


// deletes comment from database
app.post("/delete-comment", (req, res, next) => {
  Comment.findByIdAndRemove(req.body.commentId, (err, foundComment) => {
    if(err) console.log(err)
    else {
      console.log("Comment deleted");
      res.redirect("/");
    }
  })
})

//increases score by 1 
app.post("/upvote", (req, res, next) => {
  const newScore = Number(req.body.score) + 1;

  Comment.findByIdAndUpdate(req.body.commentId, {score: newScore}, (err, comment) => {
    if(err) console.log(err);
    else {

      console.log("score updated")
      res.redirect("/");
    }
  })
})

//decreases score by 1
app.post("/downvote", (req, res, next) => {
  Comment.findByIdAndUpdate(req.body.commentId, {score: req.body.score - 1}, (err, comment) => {
    if(err) console.log(err);
    else {
      console.log("score updated")
      res.redirect("/");
    }
  })
})

// server
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function(){
    console.log('Server has started successfully')
})