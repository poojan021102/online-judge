const mongoose = require("mongoose");
const AllVirdicts = mongoose.Schema({
    problemId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
    },
    executionTime:{
        type:Number,
        required:true,
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    userName:{
        type:String,
        required:true
    },
    status:{
        type:String,
        required:true,
    },
    filePath:{
        type:String,
        required:true
    },
    comment:{
        type:String
    },
    language:{
        type:String,
        required:true
    }
});
module.exports = mongoose.model("Verdicts",AllVirdicts);