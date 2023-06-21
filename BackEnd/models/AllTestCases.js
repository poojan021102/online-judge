const mongoose = require('mongoose');
const AllTestCases = mongoose.Schema({
    problemId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
    },
    testCases:[
        {
            input:{
                type:String,
                required:true
            },
            output:{
                type:String,
                required:true
            }
        }
    ]
});
module.exports = mongoose.model("TestCases",AllTestCases);