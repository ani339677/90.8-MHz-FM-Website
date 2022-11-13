//jshint esversion:6
require('dotenv').config()
const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
// const https = require('https');
// const options={
//   key: fs.readFileSync('localhost.key'),
//   cert: fs.readFileSync('localhost.crt')
// }
const { createServer } = require("http");
const { Server } = require("socket.io");
const nodemailer = require('nodemailer');
const {google} = require("googleapis");
const CLIENT_ID = '372917835791-1cslhmea6njrmpqbod1mrrlauadv74kf.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = '1//04EkzH2uX-IVgCgYIARAAGAQSNwF-L9IrQBJ2aTfRhedrqn7ZcAXmxBL0pl48F3XaodGyKXa9jY3Lur3S8VmDgxI9OR-3nn1GFrU';
const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({refresh_token: REFRESH_TOKEN});

const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/fmcrsDB", {useNewUrlParser: true});

subscribersSchema={
  email_id: {
    type: String,
    required: [1,"Email is must."],
    trim: true,
    lowercase: true,
    unique: true,
  },
  phone_number: {
    type: Number,
    min: 1000000000,
    max: 9999999999,
    required: [1, "Phone number is must."],
    unique: true
  }
};
participantSchema={
  _id: Number,
  fullName: {
    type: String,
    required: [1]
  },
  phone_number: {
    type: Number,
    required: [1]
  },
  email_id: {
    type: String,
    required: [1]
  },
  class: {
    type: String,
    required: [1]
  },
  branch: {
    type: String,
    required: [1]
  },
};
eventSchema={
  eventName: {
    type: String,
    unique: true
  },
  participants: {
    type: [participantSchema],
  }
};

const subscriber = mongoose.model("subscriber",subscribersSchema);
const participant = mongoose.model("participant",participantSchema);
const event = mongoose.model("event",eventSchema);

const subscribeContent = fs.createReadStream(__dirname+"/subscribeUs.html");



const app=express();
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("static"));
const httpServer = createServer(app);
//const httpServer=https.createServer(options,app);
const io = new Server(httpServer);

httpServer.listen(process.env.PORT || 3000, function(){
  console.log("90.8MHz FMCRS Website started running successfully!")
});
// app.listen(process.env.PORT || 3000, function(){
//   console.log("Server started on port 3000");
// });

let live_programs_notification = function(){
  let text="";
  if (currLiveProg.length!=0){
    for(var i=0; i<currLiveProg.length; i++){
        if (i==0){
            text+=currLiveProg[i];
        }
        else{
            text+=", "+currLiveProg[i]
        }
    }
    text+=" LIVE NOW! Can listen under Programs section."
  }
  return text;
}


app.get("/fm", function(req,res){
  res.render("index",{if_success: "", live_text: live_programs_notification()});
});

app.get("/fm/programs",function(req,res){
  const programs=require(__dirname+"/static/fm/data/programs");
  //console.log(programs);
  var audioFilesObj={}
  programs.forEach(function(program){
    var pName=program.programName;
    const folderPath = __dirname+"/static/fm/data/programAudios/"+pName;
    try {
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath)
      }
      else{
        const files = fs.readdirSync(folderPath);
        const audios=[];
        files.forEach(function(file){
          if (path.extname(file)=='.mp3' || path.extname(file)=='.wav'){
            audios.push(file);
          }
        });
        console.log(audios);
        audioFilesObj[pName]=audios;
      }
    } catch (err) {
      console.error(err)
    }
  });
  //console.log(audioFilesObj);
  res.render("snippet_programs",{if_success: "", programs:programs, audioFiles:audioFilesObj});
})

app.post("/fm", function(req,res){
    var em_id=req.body.email_id;
    var ph_no=req.body.phone_number;
    const newSubscriber= new subscriber({
      email_id: em_id,
      phone_number: ph_no
    });
    subscriber.insertMany([newSubscriber], function(err){
      if(!err){
        oAuth2Client.getAccessToken(function(err,token){
          if (err){
            console.log(err);
          }
          else{
            console.log("Access Token is ",token);
            const transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                type: 'OAuth2',
                user: 'fmcommunityradio90.8mhz@gmail.com',
                cllientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: token, 
              }
            });
            const mailOptions = {
              from: 'fmcommunityradio90.8mhz@gmail.com',
              to: em_id,
              subject: '90.8 MHz FM Community Radio',
              html: subscribeContent,
            };
            transporter.sendMail(mailOptions, function(error, info){
              if (error) {
                console.log(error);
                success="false";
              } else {
                console.log('Email sent: ' + info.response);
                success="true";
              }
              res.render("index",{if_success: success, live_text: live_programs_notification()});
            });
          }
        }); 

      }
      else{
        if(err.code===11000){
          res.render("index",{if_success: "already registered", live_text: live_programs_notification()});
        }
        if(err._message==="subscriber validation failed"){
          console.log("Invalid data");
          res.render("index",{if_success: "invalid data", live_text: live_programs_notification()});
        }
        
      }
    })
    
});

app.post("/fm/event", function(req,res){
  //console.log(req.body);
  const folderPath = __dirname+"/static/fm/data/eventGlimpses/"+req.body.event_name
  try {
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath)
    }
    else{
      const files = fs.readdirSync(folderPath);
      const photos=[];
      files.forEach(function(file){
        if (path.extname(file)=='.png' || path.extname(file)=='.jpg' || path.extname(file)=='.jpeg' || path.extname(file)=='.mp4' || path.extname(file)=='.mkv' || path.extname(file)=='.avi'){
          photos.push({fName: file, ext: path.extname(file)});
        }
      });
      //console.log(photos);
      res.render("snippet_event_glimpses",{if_success: "", event_name: req.body.event_name, glimpses: photos});
    }
  } catch (err) {
    console.error(err)
  }
});

app.post("/fm/event_register",function(req,res){
  const details=req.body;
  //console.log(details);
  event.find({eventName:details.eventName}, function(err,docs){
    //console.log(docs);
    const newParticipant = new participant(
      {
        fullName: details.full_name,
        phone_number: details.phone_number,
        email_id: details.email_id,
        _id: details.university_roll_no,
        class: details.class,
        branch: details.branch
      }
    );
    if (docs.length==0){
      console.log("New event to be created!");
      const newEvent = new event({
        eventName: details.eventName,
        participants: [newParticipant]
      });
      event.insertMany([newEvent],function(err){
        if (err){
          console.log(err);
        }
      });
    }
    else{
      console.log("Exsisting event needs to be updated!");
      var toBeAdded=true;
      console.log(docs[0].participants);
      docs[0].participants.forEach(function(participant){
        if (participant._id==details.university_roll_no){
          toBeAdded=false;
        }
      })
      if (toBeAdded){
        event.updateOne({eventName: details.eventName}, {participants: docs[0].participants.concat([newParticipant])}, function(err){
          if (err){
            console.log(err);
          }
        });
      }
      
    }
  });
});

app.get("/fm/login", function(req,res){
  res.render("login",{login: ""});
});

// Live Streaming

let currLiveProg = [];
let allPrograms = ["GURBANI","ASSI TE SAADA SAMAJ","SAADA CAMPUS","RU-BA-RU","EK MULAQAT","AFSANE PUNJABIYAAN DE","SEHAT SAMBHAL","CAREER AWARENESS"];

app.post("/fm/go_live", function(req,res){
  var en = req.body.eventName;
  if(!currLiveProg.includes(en)){
    currLiveProg.push(en);
    res.render("sender",{eventName: en});
  }
  else{
    res.render("live_programs");
  }
})

app.post("/fm/join_live", function(req,res){
  res.render("reciever",{eventName: req.body.eventName})
})

app.get("/fm/curr_live", function(req,res){
  res.render("curr_live_programs",{currLive: currLiveProg});
});

app.post("/fm/dashboard", function(req,res){
  if (req.body.chosen==="LIVE STREAMING"){
    res.render("live_programs",{clp: currLiveProg, ap: allPrograms});
  }
})

app.post("/fm/login", function(req,res){
  if (req.body.username===process.env.FM_USERNAME && req.body.password===process.env.FM_PASSWORD){
    res.render("dashboard");
  }
  else{
    res.render("login",{login: "failed"});
  }
});

let server_connections={};
let client_connections={};
function no_of_users(pName){
  var noOfUsers=0;
  for (var i in client_connections){
    if(client_connections[i]==pName){
      noOfUsers+=1;
    }
  }
  return noOfUsers;
}
io.on("connection", (socket) => {
  socket.on("join-request", (obj) => {
    //console.log(obj)
    socket.join(obj.program);
    client_connections[obj.socketId]=obj.program;
    socket.broadcast.emit(obj.program, {peerId: obj.peerId, nou: no_of_users(obj.program)});
  })
  socket.on("new-connection",function(conn){
    server_connections[conn.si]=conn.program;
  })
  socket.on("disconnect", function(reason){
    //console.log("Disconnected!");
    //console.log(server_connections[this.id]);
    if (server_connections[this.id]==undefined && client_connections[this.id]!=undefined){
      //console.log("User Disconnected");
      console.log(this.id,client_connections);
      var soc_en=client_connections[this.id];
      //console.log(soc_en);
      delete client_connections[this.id];
      //console.log(client_connections);
      socket.broadcast.emit(soc_en+"disconnect", no_of_users(soc_en));
      
    }
    let en=server_connections[this.id];
    //console.log(this.id, connections,en);
    for (var i = 0; i < currLiveProg.length; i++) {
      if (currLiveProg[i] === en) {
        //console.log(currLiveProg);
        var spliced = currLiveProg.splice(i, 1);
        //console.log(currLiveProg);
      }
    }
    //console.log(connections);
    delete server_connections[this.id];
    //console.log(connections);
  })
});

//Add an event
