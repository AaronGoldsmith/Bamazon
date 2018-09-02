const cTable = require('console.table');
var mysql = require('mysql')
var inquirer = require("inquirer");
var loader; // for timeOut

/* TODO: add functionality to "add to cart" */
var cart = [];

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "bamazon_DB"
});

connection.connect(function(err) {
   if (err) throw err;
   viewItems();
 });

 // returns true iff v is a positive number
 // ID's will never be 0, quantity should never be 0
 function checkNum(v){
   return !isNaN(v)&&(parseInt(v)>0);
 }

function purchaseItem(){
  clearInterval(loader);
  inquirer
    .prompt(
      [
        {
        message: "id: ",
        name: "id",
        type: "input",
        validate: checkNum 
      },
      {
        name: "qty",
        type: "input",
        message: "quantity: ",
        validate: checkNum 
      }
    ])
    .then(function(answer){

        var query = "SELECT item_id,price,stock_quantity,product_name FROM products WHERE ?";
        connection.query(query,{item_id: answer.id},function(err,resp){
          if(err) throw err;
        
          // `postbuy` contains the quantity remaining after the desired purchase
          var postBuy = parseInt(resp[0].stock_quantity)-parseInt(answer.qty);

          if(postBuy<0){
            console.log("Insufficient Quantity!");    
            loader = setInterval(purchaseItem,1000);   
          }
          else{
            var ITEM = resp[0].product_name;
            // conditionally change append an s if they are using the plural version
            var product = (parseInt(answer.qty))>1?ITEM+"s":ITEM;
            console.log("\n You may buy "+ answer.qty + " " +
                        product + " for $"+resp[0].price +
                        " each,\n There will be "+postBuy +" left in stock after your purchase\n");
            var total = parseInt(answer.qty)*resp[0].price;
            inquirer.prompt(
              {
                message:"Purchase for $" +total +"?",
                type:"confirm",
                name:"confirm"
              }).then(function(ans){
               if(ans.confirm){
                 connection.query("UPDATE products SET ? WHERE ?",
                   [
                     {
                       stock_quantity: (resp[0].stock_quantity-answer.qty)
                     },
                     {
                       item_id: answer.id // answer.item_id = initial id input
                     }
                   ],function(err){
                     if(err) throw err;
                     console.log("Thanks for your purchase!")
                     viewItems();
                   }
                 );
               }
               else{
                 connection.end();   // client doesn't want to continue
               }
             })
            }
      })

    })
}


function viewItems(){
  clearInterval(loader);
  console.log("\nType the ID and quantity of the item you would like to purchase\n")

  var query = "SELECT item_id,product_name, price, stock_quantity FROM products"
  connection.query(query,function(err,resp){
    if(err) throw err;
    var rows = []
    for(var i = 0;i<resp.length;i++){
      var productObj = {
                          ID: resp[i].item_id,
                          Product:resp[i].product_name,
                          Price: resp[i].price,
                          Qty: resp[i].stock_quantity
                        }
      rows.push(productObj);
    }
    console.table(rows)
    purchaseItem();

  })
}