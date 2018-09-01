const cTable = require('console.table');
var mysql = require('mysql')
// call with console.table([{OBJ},{OBJ},{OBJ}])
// 3 rows with OBJ.keys.length() columns

connection.connect(function(err) {
   if (err) throw err;
   console.log("connected as id " + connection.threadId);
   afterConnection();
 });

 function afterConnection(){
    console.log("Succesfully Connected")
    connection.end();
 }