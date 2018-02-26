var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require('cli-table');

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "",
  database: "bAmazonDB"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");
  products();
});

// gives object of table in terminal
function products() {
  connection.query("SELECT * FROM products", function(err,res){
    for (var i = 9; i < res.length; i++) {
      console.log(res);
      showProducts();
    }
  })
}; // closes products function

// creates a table using the cli-table npm package
function showProducts() {
  var table = new Table({
    head: ['id', 'Product Name', 'Department', 'Price', 'Quantity']
  });

  connection.query("SELECT * FROM products", function(err, res) {
    for (var i = 0; i < res.length; i++) {
      table.push(
        [res[i].id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity]
      );
    }
    console.log(table.toString());

    // calls shop function to prompt user inputs
    shop();
  })
} // closes showProducts function

// prompt user inputs for what they would like to buy.
function shop() {
  inquirer.prompt([{
      type: 'input',
      name: 'id',
      message: "Type id tha you would you like to buy?"
    },
    {
      type: 'input',
      name: 'quantity',
      message: "How many would you like?"
    }
  ]).then(function(user) {
    var queryStr = 'SELECT * FROM products WHERE ?';
    var item = user.item_id;

    connection.query(queryStr, {id: user.id}, function(err, res) {
      if (err) throw err;
      console.log(res);

      // if number input 0 then kick them out show table again.
      if (res.length === 0) {

          console.log('\n-----------------------------------------------------\n');
          console.log("error: Invalid item id. Please select a valid Item ID.");
          console.log('\n-----------------------------------------------------\n');

          showProducts();
      } else {

        if (user.quantity <= res[0].stock_quantity) {
          console.log('\n-----------------------------------------------------\n');
          console.log("Congrats the product you requested is in stock! Placing order now");

          var updateQueryStr = 'UPDATE products SET stock_quantity = ' + (res[0].stock_quantity - user.quantity) + ' WHERE id = ' + res[0].id;

          // console.log('updateQueryStr ' + updateQueryStr);

          connection.query(updateQueryStr, function(err, data){
            if(err) throw err;

            console.log(data);
            console.log('Order has been placed! Your total is $ ' + res[0].price * user.quantity);
            console.log('Thank you for shopping with us.');
            console.log('\n-----------------------------------------------------\n');

            connection.end();
          });

        } else {
          console.log('Sorry Not enough in stock');
          console.log("Please check the quantity you are trying to buy.");
          showProducts();
        };
      }
    });
  });
} // closes shop function
