var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer(); 
var session = require('express-session');
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/userdb',{ useNewUrlParser: true });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false })); 
app.use(upload.array());
app.use(cookieParser());
app.use(session({resave: true ,secret: "123456", saveUninitialized: true}));

//var Users = [];
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
    //console.log(Users);
    /*
    userDB.find(function(err,result) {
        console.log(result);
    })
    */
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
    console.log("at logged in");

    if(req.session.user){
        //res.status(200);
        //response.setHeader("Content-Type", "text/html");
        console.log("Logged In");
        res.send("<font color=green>"+req.session.user.user_name+" loggedn in<font><br /><a href=/logout> LOGOUT<a>");
     } else {
         
        console.log(req.session.user);
        //res.redirect("/login");
     }
});

app.post("/register-submit", function(req ,res) {
    
    if(!req.body.user_name || !req.body.password || !req.body.email){
        res.status("400");
        res.send("<font color=red>Invalid details!</font><br /><a href='/register'>BACK</a>");
     } else {
         userDB.findOne({user_name : req.body.user_name},function(err,result) {
            var usr=JSON.stringify(result);
            console.log(result);
            //console.log(usr);

             if(result==null) {
                var newUser=new userDB({user_name: req.body.user_name ,password : req.body.password, email : req.body.email});
                newUser.save(function(err,userDB) {
                    if(err)
                    console.log(err.message);
                    else
                    console.log("Succesful registered!!!!");
                    res.send("<font color=green>"+req.body.user_name+" Successful Registered </font><br /><a href='/login'>Go to Login page</a>");
    
                })
             } else{
                res.send("<font color=red> User Already Exists! Login or choose another user name</font><br /><a href='/register'>Register another user</a>");

             }
         })

        /* 
        Users.filter(function (item) {
             if(item.user_name==req.body.user_name){
                 //document.getElementById(form).innerHTML="";
                  res.send("<font color=red> User Already Exists! Login or choose another user name</font><br /><a href='/register'>Register another user</a>");
             } 
         })
         */
        //var newUser={user_name: req.body.user_name ,password : req.body.password, email : req.body.email};
        //Users.push(newUser);
        
     }
})



app.post("/check-login",function(req,res) {
    console.log(req.session.user);
    if(!req.body.user_name || !req.body.password){
        res.status("400");
        res.send("<font color=red>Invalid details!</font><br /><a href='/login'>BACK</a>");
     } else {
         userDB.findOne({user_name : req.body.user_name, password : req.body.password},{_id:0,user_name:1,password:1},function(err, response) {
             console.log(response);

             if(response==null ) {
                //res.redirect("/login")

             } else {
                console.log("at check-login");
                req.session.user=response;
                console.log(req.session.user);
                res.redirect(200,"/loggedin");
             }
         })
         /*
        Users.filter(function (item) {
            if(item.user_name==req.body.user_name && item.password == req.body.password){
                console.log("Logged In");
                req.session.user=item;
                res.redirect("/loggedin");
            }
        })
        */
        res.redirect("/login")
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