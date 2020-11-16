const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

var cors = require("cors");
app.use(cors());
const redis = require("redis");

var client = redis.createClient(process.env.REDIS_URL);
client.on("error", function (err) {
  console.log("Error " + err);
});

let todos = [];

client.on("ready", () => {
  console.log("Connected");

  client.get("todos", (err, value) => {
    if (err) {
      throw err;
    }

    console.log("Value:", value);
    todos = JSON.parse(value);
  });
});

app.get("/api/todos", (req, res) => {
  res.json(todos);
});

app.post("/api/todos", (req, res) => {
  console.log("received: " + JSON.stringify(req.body.title));
  const newTodo = req.body;
  todos.push(newTodo);
  client.set("todos", JSON.stringify(todos), redis.print);
  res.json(req.body);
});

//create a server object:
app.get("/", function (req, res) {
  res.write("Welcome to the Todos API!"); //write a response to the client
  res.end(); //end the response
});

app.listen(process.env.PORT || 8080, function () {
  console.log("server running on 8080");
}); //the server object listens on port 8080
