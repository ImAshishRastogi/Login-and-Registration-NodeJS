var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/userdb',{ useNewUrlParser: true });


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false })); 
app.use(cookieParser());
app.use(session({resave: true ,secret: "123456", saveUninitialized: true}));

//-----------------------------------------------------------------------------------------------------------------------------


var Schema = mongoose.Schema;
var userSchema = new Schema({
    user_name: String,
    password : String,
    email : String
});
var userDB = mongoose.model('userDB',userSchema);

//-----------------------------------------------------------------------------------------------------------------------------

app.get("/",function(request,response) {
    response.sendFile(__dirname+"/"+"home_page.html");
})

app.get("/register",function(req,res) {
    if(req.session.user){
        res.redirect("/loggedin");
     }
    res.sendFile(__dirname+"/"+"register_page.html");
});


app.get("/login",function(req,res) {
    if(req.session.user){
        res.redirect("/loggedin");
     }
    res.sendFile(__dirname+"/"+"login_page.html");
});

app.get("/loggedin",function(req,res) {

    if(req.session.user){
        res.send("<head><title>USER</title></head><body><font color=green>"+req.session.user.user_name+
        " loggedn in<font><br /><a href=/logout> LOGOUT<a></body>");
     } else { 
        res.redirect("/login");
     }
});

app.post("/register-submit", function(req ,res) {
    
    if(!req.body.user_name || !req.body.password || !req.body.email){
        res.status("400");
        res.send("<font color=red>Invalid details!</font><br /><a href='/register'>BACK</a>");
     } else {
         userDB.findOne({user_name : req.body.user_name},function(err,result) {
             if(result==null) {
                var newUser=new userDB({user_name: req.body.user_name ,password : req.body.password, email : req.body.email});
                newUser.save(function(err,userDB) {
                    if(err) console.log(err.message);
                    else{
                    res.send("<font color=green>"+req.body.user_name+" Successful Registered </font><br /><a href='/login'>Go to Login page</a>");
                    }
                })
             } else{
                res.send("<font color=red> User Already Exists! Login or choose another user name</font><br /><a href='/register'>Register another user</a>");

             }
         })
     }
})



app.post("/check-login",function(req,res) {
    if(!req.body.user_name || !req.body.password){
        res.status("400");
        res.send("<font color=red>Invalid details!</font><br /><a href='/login'>BACK</a>");
     } else {
         userDB.findOne({user_name : req.body.user_name, password : req.body.password},{_id:0,user_name:1,password:1},function(err, response) {
             if(response==null ) {
                res.redirect('/login');
            } else {
                req.session.user=response;
                res.redirect("/loggedin");
             }
         })
     }
})

app.get('/logout', function(req, res){
    var name=req.session.user.user_name;
    req.session.destroy(function(){
       console.log(name+" user logged out.")
    });
    
    res.redirect('/login');
 });

var server = app.listen(8889, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log("Example app listening at http://%s:%s",host,port);
});