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
      // selection contains the index of the
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

function viewProducts() {
  // connect to DB select all, print into table

  var query = "SELECT * FROM products WHERE stock_quantity > 0";
  connection.query(query, function(err, resp) {
    if (err) throw err;
    var rows = [];
    for (var i = 0; i < resp.length; i++) {
      rows.push({
        ID: resp[i].item_id,
        Product: resp[i].product_name,
        Price: resp[i].price,
        Qty: resp[i].stock_quantity
      });
    }
    console.table("\tPRODUCT VIEWER", rows);
    // timeout for 3sec before asking to continue?
    loader = setTimeout(function() {
      inquirer
        .prompt({
          message: " continue?",
          type: "confirm",
          name: "confirm"
        })
        .then(function(answers) {
          if (answers.confirm) {
            menu_choices();
          } else {
            connection.end();
          }
        });
    }, 3000);
  });
}

function lowInventory() {
  // connect to DB select all where count(stock_quantity) < 5
}

function refillItem() {
  // inquire about which item should be refilled
  // ask about the quantity
}

function addNewItem() {
  // inquire about name, price, and quantity
  // make sure that item isn't already in our table
}
