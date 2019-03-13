var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var URL = require('url').URL;


var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var config = require('./config.js');
var middleware = require('./middleware');


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
    console.log("enter in HOME PAGE");
    response.sendFile(__dirname+"/"+"home_page.html");
})

app.get("/register",function(req,res) {
    console.log("enter in REGISTER PAGE")
    
    if(req.session.user){
        console.log("SESSION exist for user : "+ req.session.user.user_name);
        console.log("Redirecting to LOGGEDIN PAGE ");
        res.redirect("/loggedin");
     }
     
    res.sendFile(__dirname+"/"+"register_page.html");
});


app.get("/login",function(req,res) {
    console.log("enter in LOGIN PAGE")
   
    if(req.session.user){
        console.log("SESSION exist for user : "+ req.session.user.user_name);
        console.log("Redirecting to LOGGEDIN PAGE ");
        res.redirect("/loggedin");
     }
     
    res.sendFile(__dirname+"/"+"login_page.html");
});

function checkToken(req) {
    console.log(req)
    var token =req.get('authorization');
    console.log(token);
    if(token) {
        jwt.verify(token, config.secret, function(err, decoded) {
            if(err) {
                return res.json({
                    success : false,
                    message : 'Token is not valid'
                });
            } else {
                return token
            }
        })
    } else {
        console.log("TOKEN doesn't exist for any user. \n Redirecting to LOGIN PAGE ");
        res.redirect("/login");
    }
}
app.get("/loggedin",function(req,res) {
    
    console.log("enter  in LOGGEDIN PAGE")
    if(req.session.user){
        console.log("logged in user : "+ req.session.user.user_name);
        res.send("<head><title>HOME</title></head><body><font color=green>"+req.session.user.user_name+
        " loggedn in<font><br /><a href=/profile> PROFILE<a></body><br /><a href=/logout> LOGOUT<a></body>");
     } else { 
        console.log("SESSION doesn't exist for any user. \n Redirecting to LOGIN PAGE ");
        res.redirect("/login");
     }
     
});

app.get("/profile",function(req,res) {
    var token = jwt.sign({id: req.session.user.user_name},config.secret,{expiresIn : 60});
    console.log(token)
    res.send("<head><title>PROFILE</title></head><body><font color=green> "+req.session.user.user_name+"<font><br /><a href=/logout> LOGOUT<a></body>");
})

app.post("/register-submit", function(req ,res) {
    console.log("enter in REGISTER POST REQUEST(register-submit)");
    if(!req.body.user_name || !req.body.password || !req.body.email){
        console.log("INVALID DETAILS");
        res.status("400");
        res.send("<font color=red>Invalid details!</font><br /><a href='/register'>BACK</a>");
     } else {
         userDB.findOne({user_name : req.body.user_name},function(err,result) {
             if(result==null) {
                //var hashedPassword = bcrypt.hashSync(req.body.password, 8);
                var newUser=new userDB({user_name: req.body.user_name ,password : req.body.password, email : req.body.email});
                newUser.save(function(err,userDB) {
                    if(err) console.error("ERROR in save() function : "+err.message);
                    else{
                        console.log("SUCCESSFUL REGISTER USER ");
                        console.log(result)
                        res.status(200);
                        res.send("<font color=green>"+req.body.user_name+" Successful Registered </font><br /><a href='/login'>Go to Login page</a>");
                    }
                })
             } else{
                    console.log("User Already Exist !!!");
                    res.send("<font color=red> User Already Exists! Login or choose another user name</font><br /><a href='/register'>Register another user</a>");
             }
         })
     }
})



app.post("/check-login",function(req,res) {
    console.log("enter in LOGIN POST REQUEST(check-login)");
    if(!req.body.user_name || !req.body.password){
        console.log("INVALID DETAILS");
        res.send("<font color=red>Invalid details!</font><br /><a href='/login'>BACK</a>");
     } else {
         userDB.findOne({user_name : req.body.user_name, password : req.body.password},{_id:0,user_name:1,password:1},function(err, response) {
             if(response==null ) {
                 console.error("Incorrect username or password!!!");
                 console.log("Redirecting to LOGIN PAGE");
                res.redirect('/login');
            } else {
                console.log("User : "+req.body.user_name+" has found in DB.");
                req.session.user=response;
                console.log("Assigning SESSION to user : "+response.user_name);
                //var token = jwt.sign({id: response.user_name},config.secret,{expiresIn : 60});
                //console.log(token)
                /*
                res.json({
                    success : true,
                    token : token
                });
                */
                //res.setHeader('authorization',token); 
                //res.set('x-access-token' , token)
                //res.cookie('token',token);
                //res.header('authorization', token).send();
                //console.log(res)
                //checkToken(res)
                console.log("Redirecting to LOGGEDIN PAGE");
                res.redirect("/loggedin");
             }
         })
     }
})

app.get('/logout', function(req, res){
    console.log("enter in LOGOUT PAGE");
    //console.log(res)
    
    if(req.session.user) {
        var name=req.session.user.user_name;
    req.session.destroy();
    console.log("SESSION has been destroyed for user : "+name)
    console.log("User : "+name+" logged out.")
    }
    

    console.log("Redirecting to LOGIN PAGE");
    res.redirect('/login');
 });

var server = app.listen(8889, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log("Example app listening at http://%s:%s",host,port);
});