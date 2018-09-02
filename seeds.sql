USE bamazon_DB;

INSERT INTO products(product_name,department_name,price,stock_quantity) 
VALUES ("Cat bed","pet supplies", 100.00,40);

INSERT INTO products(product_name,department_name,price,stock_quantity)
VALUES ("canned soup","groceries",2.00,100);

INSERT INTO products(product_name,department_name,price,stock_quantity)
VALUES ("cat carrier","travel",29.50,4);

INSERT INTO products(product_name,department_name,price,stock_quantity)
VALUES ("tablet","electronics",49.99,40);

INSERT INTO products(product_name,department_name,price,stock_quantity)
VALUES ("dog treats","pet supplies",8.25,12);

INSERT INTO products(product_name,department_name,price,stock_quantity)
VALUES ("cereal","groceries",4.00,100);

INSERT INTO products(product_name,department_name,price,stock_quantity)
VALUES ("spiral notebook","office supplies",1.50,1000);

INSERT INTO products(product_name,department_name,price,stock_quantity)
VALUES ("USA flag","home decor",12.00,50);

INSERT INTO products(product_name,department_name,price,stock_quantity)
VALUES ("flashlight","camping/outdoors",19.50,25);

INSERT INTO products(product_name,department_name,price,stock_quantity)
VALUES ("nutrition bars","groceries",3.50,20);



SELECT * FROM products;