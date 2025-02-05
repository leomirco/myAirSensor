const mongoose = require('mongoose');

const sensorDataSchema = new mongoose.Schema({
    model: {
        type: String,
        required: true
    },
    serialNumber: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    }, 
    address: {
        type: String,
        required: true
    },
    timestamp: { 
        type: Date, 
        default: Date.now
    },
    PM10: {
        type: Number,
        required: false
    },
    PM25: {
        type: Number,
        required: false
    },
    NO2: {
        type: Number,
        required: false
    },
    CO2: {
        type: Number,
        required: false
    },
    CO: {
        type: Number,
        required: false
    },
    TVOC: {
        type: Number,
        required: false
    }
});

module.exports = sensorDataSchema;