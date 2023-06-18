const path = require('path');
const fs = require('fs');
const directoryName = path.join(__dirname,"AllCodes");
const {v4} = require('uuid');

if(!fs.existsSync(directoryName)){
    fs.mkdirSync(directoryName,{recursive:true});
}
generateFile = async(formate,codeContent)=>{
    const id = v4();
    const fileName = `${id}.${formate}`;
    const filePath = path.join(directoryName,fileName);
    fs.writeFileSync(filePath,codeContent);
    return filePath;
}
module.exports = {
    generateFile
}