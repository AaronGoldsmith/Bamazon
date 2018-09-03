const cTable = require("console.table");
var mysql = require("mysql");
var inquirer = require("inquirer");
var loader; // for timeOut

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "bamazon_DB"
});

connection.connect(function(err) {
  if (err) throw err;
  var rline = "_".repeat(33) + "\n";
  console.log(rline);
  console.log("• Connected to Manager's Portal •\n" + rline);
  menu_choices();
});

function menu_choices() {
   // clear the console
  var options = [
    "  * View all items in stock",
    "  * View low-inventory items\n",
    "  * Reorder items from distributors",
    "  * Add a new product\n",
    "QUIT    "
  ];
  inquirer
    .prompt({
      message: "View, reorder, or add products to the inventory ",
      name: "selection",
      choices: options,
      type: "list",
      pageSize: 10
    })
    .then(function(answers) {
      // clear console for reduced cognitive load
      // comment this out if you are sending stdout to a log

      console.log('\x1Bc');
      // selection contains the index of the user's choice
      var selection = options.indexOf(answers.selection);
      switch (selection) {
        case 0:
          viewProducts();
          break; /* view products for sale */
        case 1:
          lowInventory();
          break; /* view low inventory */
        case 2:
          refillItem();
          break; /* add to inventory */
        case 3:
          addNewItem();
          break; /* add new product */
        case 4:
          console.log("\nAll Changes Saved. Thank you");
          connection.end();
          break;
      }
    });
}
 // function returns an object
function row_fromResp(response){
  //acts as an assertion
  if((!response.item_id)||(!response.product_name)||
      (!response.price)||(!response.stock_quantity))
      {return;}
  return {
    ID: response.item_id,
    Product: response.product_name,
    Price: response.price,
    Qty: response.stock_quantity
  }  
}

function timeoutDriver(){
  loader = setTimeout(function() {
    inquirer
      .prompt({
        message: " continue?",
        type: "confirm",
        name: "confirm"
      })
      .then(function(answers) {
        console.log("\n")
        if (answers.confirm) {
          menu_choices();

        } else {
          connection.end();
        }
      });
  }, 3000);
}
function viewProducts() {
  // connect to DB select all, print into table
  var query = "SELECT * FROM products WHERE stock_quantity > 0";
  connection.query(query, function(err, resp) {
    if (err) throw err;
    var rows = [];
    for (var i = 0; i < resp.length; i++) {
      rows.push(row_fromResp(resp[i]));
    }
    console.table("\n\tPRODUCT VIEWER", rows);
    // timeout for 3sec before asking to continue?
    timeoutDriver()
  });
}



function lowInventory() {
  // select all rows where count(stock_quantity) < 5
  var query = "SELECT * FROM products WHERE stock_quantity<5 "
  connection.query(query, function(err, resp) {
    if (err) throw err;
    var rows = [];
    for (var i = 0; i < resp.length; i++) {
      rows.push(row_fromResp(resp[i]));
    }
    console.table("   Inventory - Low Stock", rows);
    timeoutDriver();
  });
}

function refillItem() {
  // custom vs default
  // inquire about which items should be refilled or display all?
  var query = "SELECT * FROM products ORDER BY stock_quantity"
  connection.query(query, function(err, resp) {

  inquirer.prompt(
    [{
      message: "Choose an item to restock",
      type: "list",
      name: "restock",
      choices: function(){
        var items = [];
        for(var i = 0;i<resp.length;i++){
          items.push(resp[i].product_name+" ("+resp[i].stock_quantity+" left)");
        }
        return items;
      }
    },{
      message: "How many should get ordered?",
      type: "input",
      name: "quant",
    }])
  .then(function(answers) {
    var name = answers.restock.split("]")[0]
    var id = name.split("[")[1];
    var query = "UPDATE products SET ? WHERE ?"
    connection.query(query,[
      {
        stock_quantity:answers.quant
      },{
        item_id: id
      }],function(err){
        if(err) throw err;
        menu_choices();
      })
  })
})

}

function addNewItem() {
  // inquire about name, price, and quantity
  // make sure that item isn't already in our table
}
