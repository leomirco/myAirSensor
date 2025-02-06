"use strict";
const express = require('express');
// CONNECT TO MONGODB
const mongoose = require('mongoose');
//Handlbars
const handlebars = require('handlebars');
const helpers = require('handlebars-helpers')(); 
handlebars.registerHelper('helpers', helpers); 
handlebars.registerHelper("prettifyDate", function(timestamp) {
  return new Date(timestamp).toString('yyyy-MM-dd')
});

require('dotenv').config();
const MONGO_STRING = process.env.MONGO_STRING;
console.log("MONGO_STRING :", MONGO_STRING);
const base = process.env.BASE;
console.log("BASE :", base);
// Set `strictQuery: false` to globally opt into filtering by properties that aren't in the schema
// Included because it removes preparatory warnings for Mongoose 7.
// See: https://mongoosejs.com/docs/migrating_to_6.html#strictquery-is-removed-and-replaced-by-strict
//mongoose.set("strictQuery", false);

var router = express.Router();
//const mongoString = process.env.ATLAS_URI; 
// import model schema
//-----------------------------------------------------
// const readingSchema = new mongoose.Schema({
//   name:String,
//   email:String,
//   age:Number
// })
//-----------------------------------------------------
const readingSchema = require('../models/reading.js');
console.log('readingSchema: ', readingSchema);
const SensorData = mongoose.model('SensorData', readingSchema);
// Connect to DB
connectToMongoDB(MONGO_STRING);

  // FS
const fs = require("fs");
// funtion for connect to mongodb
async function connectToMongoDB(mongoString) {
  try {
    //mongoose.set('bufferCommands', false);
    await mongoose.connect(mongoString);
    console.log('Connessione a MongoDB stabilita con successo');
  } catch (error) {
    console.error('Errore durante la connessione a MongoDB:', error);
  }
}
async function getAllRecords() {
  try {
    console.log('Reading schema: ', SensorData);
    await SensorData.find()
    .then(readings => {
      console.log("Get all readings value", readings);
      return readings;
    })
    .catch(err => {
      console.error(err);
    });
  } catch (error) {
    console.error('Errore durante il recupero dei documenti:', error);
    return error;
  }
}

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post("/insertvalue", async (req, res) => {
  console.log('/insertValue - DB schema', readingSchema);
  console.log('/insertValue - New reading ', req.body);
  var serialNumber = req.body.serialNumber;
  var model = req.body.model;
  var city = req.body.city;
  var address = req.body.address;
  var timestamp = req.body.timestamp;
  var PM10 = req.body.PM10;
  var PM25 = req.body.PM25;
  var NO2 = req.body.NO2;
  var CO = req.body.CO;
  var CO2 = req.body.CO2;
  var TVOC = req.body.TVOC;
  // insert new reading
  const newSensorData = new SensorData({
    serialNumber: serialNumber,
    model: model,
    city: city,
    address: address,
    timestamp: timestamp,
    PM10: PM10,
    PM25: PM25,
    NO2: NO2,
    CO: CO,
    CO2: CO2,
    TVOC: TVOC,
  });
  newSensorData.save().
  then(insert => {  
    console.log("/insertValue - measurement entered:", insert);
    res.json(insert).status(200);
  })
  .catch(err => {
    console.error(err);
    res.json(err).status(500);
  });
});


//return all sensors
router.get("/getallsensors", async (req, res) => {
  try {
    //console.log('Reading schema: ', SensorData);
    await SensorData.aggregate([
      {
        $group: {
          _id: "$serialNumber",
          documents: { $push: "$$ROOT" }
        }   
      }
    ])
    .then(uniqueSerialNumbers => {
      console.log("getall uniqueSerialNumbers", uniqueSerialNumbers);
      let devices = [];
      uniqueSerialNumbers.forEach(uniqueSerialNumbers => {
        console.log("Serial Number:", uniqueSerialNumbers._id);
        console.log("City:", uniqueSerialNumbers.documents[0].city);
        console.log("Address:", uniqueSerialNumbers.documents[0].address);
        let device = {sensornumber:uniqueSerialNumbers._id, city: uniqueSerialNumbers.documents[0].city, address: uniqueSerialNumbers.documents[0].address};
        devices.push(device);
      //   uniqueSerialNumbers.documents.forEach(document => {
      //     console.log("City:", document.city);
      //     console.log("Address:", document.address);
      // });
      console.log('Devices :',devices);
      console.log('Devices number :',devices.length);
    });
      // HANDLEBARS
      var log = true;
      var page = '/sensorlist.html';
      var dir = '/template';
      readHTMLFile(page, dir, (err, html) => {
        if (err) {
          console.log("/getallsensors - Read html file: ", err);
        }
        var template = handlebars.compile(html);
        var replacements = {
          devices: devices,
          devicesnumber: devices.length,
          base: base,
        }
        if (log) {
          console.log("/getallsensors - Replacements: ", replacements);
        }
        var html = template(replacements);
        res.send(html);
      })
    })
    .catch(err => {
      console.error(err);
      res.json(err).status(500);
    });
  } catch (error) {
    console.error('Error', error);
    res.json(error).status(500);
  }
});
// return all measures HTML
router.get("/getallvalue", async (req, res) => {
  try {
    console.log('Reading schema: ', SensorData);
    console.log('/getLastValue - req.parameters ', req.query.serialnumber);
    var serialNumber = req.query.serialnumber;
    await SensorData.find({serialNumber: serialNumber}).sort({ _id: -1 }).lean().limit(30)
    .then(readings => {
      console.log("Get all readings value", readings);
      // HANDLEBARS
      var log = true;
      var page = '/readings.html';
      var dir = '/template';
      readHTMLFile(page, dir, (err, html) => {
        if (err) {
          console.log("/GET ALL RECORD - Read html file: ", err);
        }
        var template = handlebars.compile(html);
        var replacements = {
          number_reading: readings.length,
          measures: readings,
        }
        if (log) {
          console.log("/GET ALL RECORD - Replacements: ", replacements);
        }
        var html = template(replacements);
        res.send(html);
      })
    })
    .catch(err => {
      console.error(err);
      res.json(err).status(500);
    });
  } catch (error) {
    console.error('Error', error);
    res.json(error).status(500);
  }
});
//return last measures JSON
router.get("/getlastvalue", async (req, res) => {
  try {
    //console.log('Reading schema: ', SensorData);
    console.log('/getLastValue - req.parameters ', req.query.serialnumber);
    var serialNumber = req.query.serialnumber;
    await SensorData.find({serialNumber: serialNumber}).sort({ _id: -1 }).lean().limit(1)
    .then(readings => {
      console.log("getLast value", readings);
      res.json(readings).status(200);
    })
    .catch(err => {
      console.error(err);
      res.json(err).status(500);
    });
  } catch (error) {
    console.error('Error', error);
    res.json(error).status(500);
  }
});

// END SERVER
module.exports = router;

// *****************************
// ********* FUNCTIONS *********
// *****************************
function readHTMLFile(templateName, dir, callback) {
  var perc = __dirname + dir + templateName;
  console.log("Reading file: ", perc)
  console.log("Reading __dirname: ", __dirname)
  fs.readFile(__dirname + dir + templateName, { encoding: 'utf-8' },
    function(err, html) {
      if (err) {
        throw err;
        //callback(err);
      } else {
        callback(null, html)
      }
    })
}
