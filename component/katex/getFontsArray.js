var fs = require('fs');
fs.readdir('./fonts', function(err, files){
    if (err) throw err;
    let exportArray = [];
    files.forEach(function(file){
       exportArray.push("component/katex/fonts/" + file);
   });
    console.log(exportArray);
});
