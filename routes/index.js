var express = require('express');
var router = express.Router();
const shortid = require("shortid");
const userModel = require("./users");
const urlModel = require("./shorturl");
const passport = require("passport");
const localStrategy = require("passport-local");
const flash = require('connect-flash');
const Toastify = require('toastify-js');
passport.use(new localStrategy(userModel.authenticate()));
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', ({error:req.flash('error')}));
});



router.post("/register", async function(req,res){
  const userdata = new userModel({
    username: req.body.username,
    email: req.body.email,
    fullName: req.body.fullName
  });
  const {email,username} = req.body;  
  const usere = await userModel.findOne({ email });
  const useru = await userModel.findOne({username});
  
  if (usere) {
    // Email is already in use
    req.flash('error', 'Email is already in use.');
    return res.redirect('/'); // Redirect to the registration page or handle accordingly
  }

  if (useru) {
    // Username is already in use
    req.flash('error', 'Username is already in use.');
    return res.redirect('/'); // Redirect to the registration page or handle accordingly
  }

  userModel.register(userdata, req.body.password)
  .then(function(){
    passport.authenticate("local")(req,res,function(){
       res.redirect("/profile");
    })
  })
})
// login
router.post("/login", passport.authenticate("local",{
  successRedirect:"/profile",
  failureRedirect:"/login",
  failureFlash: true
}), function(req,res){
});

router.get('/profile', isLoggedIn , async (req, res) => {
  try {
    // Populate the shortUrls array to get the full details of each short URL
    const user = await userModel.findOne({username : req.session.passport.user}).populate("shortUrls");
    const shortUrls = user.shortUrls;
    const successMessage = req.flash("success"); 
    res.render("profile",{user,shortUrls,successMessage});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get('/profile/:username', isLoggedIn , async (req, res) => {
  try {
    const username = req.params.username;

    // Populate the shortUrls array to get the full details of each short URL
    const user = await userModel.findOne({username}).populate("shortUrls");;
    const shortUrls = user.shortUrls;
    console.log(shortUrls);
    console.log(user);
    if (user) {
      res.render('profile', { user,shortUrls});
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/login' , function(req, res, next) {
  res.render("login" , ({error:req.flash('error')}));
});

router.get("/logout", function(req,res,next){
  req.logout(function(err){
    if(err) { return next(err);}
    res.redirect("/");
  });
});

function isLoggedIn(req,res,next){
  if (req.isAuthenticated()){
    return next();
  } else {
    res.redirect('/login');
  }
}


router.post("/shorten", isLoggedIn ,async function(req,res,next){
   const {url} = req.body;
  
   try{
    const shortId = shortid.generate();
    const user = await userModel.findOne({username : req.session.passport.user})
    const newUrl = await urlModel.create({
      full: url,
      short: shortId,
      user: user._id,
      deleteKey:shortId
    });
    user.shortUrls.push(newUrl._id);
    await user.save();
    req.flash('success', 'Short URL created successfully');
    res.redirect('/profile');
   }catch (error) {
    console.error(error);
    req.flash('error', 'Failed to create short URL');
    res.render('profile',{error});
  }
});


router.get("/:short", async (req, res) => {
  try {
    const short = req.params.short;
    const entry = await urlModel.findOneAndUpdate(
      { short },
      { $inc: { clicks: 1 } },
      { new: true } // Ensure you get the updated document
    );

    if (entry) {
      const red = entry.full;
      return res.redirect(red);
    } else {
      return res.status(404).send("Short URL not found");
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
});


router.delete('/shorturl/delete', isLoggedIn, async (req, res) => {
  const { shortUrl, deleteKey } = req.body;

  try {
    const deletedShortUrl = await urlModel.findOneAndDelete({ short: shortUrl, deleteKey });
    if (deletedShortUrl) {
      // Remove the short URL reference from the user's array
      req.user.shortUrls.pull(deletedShortUrl._id);
      await req.user.save();
      req.flash('deleted', 'Short URL deleted successfully');
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } catch (error) {
    console.error(error);
    res.json({ success: false });
  }
});





module.exports = router;
