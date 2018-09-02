DROP DATABASE IF EXISTS bamazon_DB;
CREATE DATABASE bamazon_DB;

USE bamazon_DB;
CREATE TABLE products(
   item_id INT NOT NULL AUTO_INCREMENT,
   product_name VARCHAR(100) NOT NULL,
   department_name VARCHAR(50) NOT NULL,
   price DECIMAL(10,2) NOT NULL,
   stock_quantity INT DEFAULT 0,
   PRIMARY KEY (item_id)
);