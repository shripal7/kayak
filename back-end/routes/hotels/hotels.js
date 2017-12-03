var path = require('path');
var express = require('express');
var hotelhandler = express.Router();
var mongo=require('../mongo.js');
var mongoURL = "mongodb://localhost:27017/kayak";
var fs=require('fs');
var time = require('time');
var kafka = require('../kafka/client');

module.exports = hotelhandler;

hotelhandler.post('/getHotels',function(req,res){
  //Input parameters: from city, from date,to date
  var redis = require("redis")

      client = redis.createClient();
      client.get("hhome", function(err, reply) {
         if(err){
            client.set("hhome",parseInt(req.body.hhome));
        }
          else{
         var x=parseInt(reply)+parseInt(req.body.hhome);
           client.set("hhome",x);
          console.log("Checking redis:"+x);
          }

        });

    kafka.make_request('hotels_topic', {type: "getHotels", body: req.body, session: req.session}, function (err, results) {

        if(results){
            console.log("in get kafka flights results");
         //   res.status(201).json({user:user,rooms:req.body.rooms});
            res.status(results.status).json({user: results.value, rooms: results.rooms});
        }
    })
});





hotelhandler.post('/bookHotel',function(req,res){


  var redis = require("redis"),
      client = redis.createClient();
      client.get("hlist", function(err, reply) {
        if(err){
            client.set("hlist",parseInt(req.body.hlist));
          }
          else{
            var x=parseInt(reply)+parseInt(req.body.hlist);
            client.set("hlist",x);
            console.log("Checking redis listing:"+x);
          }
        });


        client.get("hbooking", function(err, reply) {
          if(err){
              client.set("hbooking",parseInt(req.body.hbooking));
            }
            else{
              var x=parseInt(reply)+parseInt(req.body.hbooking);
              client.set("hbooking",x);
              console.log("Checking redis booking:"+x);
            }
          });





    kafka.make_request('hotels_topic', {type: "bookHotel", body: req.body, session: req.session}, function (err, results) {

        if (results) {
            console.log("Booking done through kafka");
            console.log(results.value);

            res.status(results.status).json({user: results.value, username: req.session.user});
            if (err) {
                res.send("error").status(404);
            }


        }

    });



});




hotelhandler.post('/redis',function(req,res){

  var redis = require("redis"),
      client = redis.createClient();
  mongo.connect(mongoURL, function(){
            console.log('Connected to mongo at: ' + mongoURL);
            var coll = mongo.collection('car');
            coll.find({"carCity":"New York"}).toArray(function(error, user){
                if (user) {

                  client.set("car", JSON.stringify(user));
                  client.get("car", function(err, reply) {
                    if(err){
                        res.status(400).send({nai:"no"});
                      }
                      else{
                        res.status(201).send({value:reply});
                      }

                    });
                  }
                });
});
});
