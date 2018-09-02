const cTable = require('console.table');
var mysql = require('mysql')
var inquirer = require("inquirer");
var loader; // for timeOut


var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "bamazon_DB"
});