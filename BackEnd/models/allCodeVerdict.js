const mongoose = require("mongoose");
const allCodeVeridct = mongoose.Schema({
    status:{
        type:Boolean,
        required:true
    },
    message:{
        type:String
    }
});
module.exports = mongoose.model("allCodeVerdictSchema",allCodeVeridct);