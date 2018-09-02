// const cTable = require('console.table');
var mysql = require('mysql')
var inquirer = require("inquirer");
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "bamazon_DB"
});
// call with console.table([{OBJ},{OBJ},{OBJ}])
// 3 rows with OBJ.keys.length() columns

connection.connect(function(err) {
   if (err) throw err;
   viewItems();
 });

function purchaseItem(){
  console.log("\nType the ID and quantity\nof the item you would like to purchase")
  inquirer
    .prompt([{
      message: "id: ",
      name: "id",
      type: "input",
      validate: function(val) {return (!isNaN(val));} // returns true iff val=number
    },{
      name: "qty",
      type: "input",
      message: "quantity: ",
      validate: function(val) {return (!isNaN(val));} // returns true iff val=number
    }]).then(function(answer){
      // answer.id has the id
      // answer.qty has quantity
      var query = "SELECT item_id,price,stock_quantity,product_name FROM products WHERE ?";
      // update table if stock > answer.qty
      connection.query(query,{item_id: answer.id},function(err,resp){
        if(err) throw err;
        for(var i = 0;i<resp.length;i++){
          console.log("| $"+resp[i].price+"  "+resp[i].product_name+" ~  "+resp[i].stock_quantity +" in stock")
        }

      })
      connection.end();

    })
}

function viewItems(){
  var query = "SELECT item_id,product_name, price, stock_quantity FROM products"
  connection.query(query,function(err,resp){
    if(err) throw err;
    console.log("\nPRODUCT|PRICE|STOCK\n __ __ __ __ __\n")
    for(var i = 0;i<resp.length;i++){
      console.log(resp[i].item_id+"|"+resp[i].product_name+"|"+resp[i].price+"||"+resp[i].stock_quantity)
    }
    console.log("_________");
    purchaseItem();

  })
}