const mongoose = require("mongoose");
const AllProblems = new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    sampleInput:{
        type:String,
        required:true,
    },
    sampleOutput:{
        type:String,
        required:true
    },
    constraints:{
        type:String,
        required:true
    },
    correctSubmission:{
        type:Number,
        default:0,
        required:true,
    },
    wrongSubmission:{
        type:Number,
        default:0,
        required:true,
    },
    createdBy:{
        type:String,
        required:true,
    }
})
module.exports = mongoose.model("Problems",AllProblems)