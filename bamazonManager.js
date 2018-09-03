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
  console.log('\x1Bc');
  console.log(rline);
  console.log("• Connected to Manager's Portal •\n" + rline);
  menu_choices();
});

function menu_choices() {
   // clear the console
  var options = [
    "  * View all items in stock",
    "  * View low-inventory items\n",
    "  * Add to inventory",
    "  * Add a new product\n",
    "  ·QUIT APPLICATION·  "
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

    // setTimeout for 3sec before asking to continue
    timeoutDriver()
  });
}
function checkNum(v) {
  return !isNaN(v) && parseInt(v) > 0;
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
  var newTotal;  
  var query = "SELECT * FROM products ORDER BY stock_quantity"
  var items = [] // dictionary will hold name:quantity

  connection.query(query, function(err, resp) {
    if(err) throw err;
    inquirer.prompt(
    [{
      message: "Choose an item to restock",
      type: "list",
      name: "restock",
      choices: function(){
        var titles = [];
        for(var i = 0;i<resp.length;i++){
           items[resp[i].product_name]=resp[i].stock_quantity
           titles.push(resp[i].product_name)
        }
        return titles;
      },
      pageSize: 15
    },
      {
      message: "How many should get ordered?",
      type: "input",
      name: "quant",
      validate: checkNum
    }])
  .then(function(answers) {
    // product to restock
    var current = answers.restock;

    // update our database with the sum of existing + number ordered
    newTotal = parseInt(items[current]) + parseInt(answers.quant)
    connection.query("UPDATE products SET ? WHERE ?",
      [{
        stock_quantity: newTotal
      },
      {
        product_name: answers.restock
      }
    ],function(err){
        if(err) throw err;
        menu_choices();
      })
  })
});

}

function addNewItem() {
  // inquire about name, price, and quantity
  // make sure that item isn't already in our table
  var depts = [];
  connection.query("SELECT product_name,department_name FROM products",function(err,res){
    if(err) throw err;
    
    // filters out repeats
    res.forEach(response => {
      if(depts.indexOf(response.department_name)==-1){depts.push(response.department_name)
      }
    })
 
  inquirer.prompt([{
    message: "What should the item be referred to as?",
    type: "input",
    name: "product"
  },
  {
    message: "What is the price per item?",
    type: "input",
    name: "itemPrice",
    validate: checkNum
  },
  {
    message: "What department will it go in?",
    type: "list",
    name: "dept",
    choices: depts
  },
{
  message: "How many should there be in stock?",
  type: "input",
  name: "quant",
  validate: checkNum
}])
  .then(function(answers) {
    var query = "INSERT INTO products SET ?"
    connection.query(query,
    {
      product_name:answers.product,
      department_name:answers.dept,
      price: parseFloat(answers.itemPrice),
      stock_quantity: parseInt(answers.quant)
    },function(error){
      if(error) throw error
      console.log('good')
    })
    menu_choices(); 

  })
})
}
