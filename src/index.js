const express = require("express");
const app = express();

//app.use(express.urlencoded({ extended: true }));
app.use(express.json());

var cors = require("cors");
app.use(cors());

let todos = [];

const redis = require("async-redis");
const client = redis.createClient(process.env.REDIS_URL || "");

client.on("error", function (err) {
  console.log("Error " + err);
});

client.on("ready", async () => {
  console.log("Connected");

  const value = await client.get("todos");
  console.log("received from redis: " + value);
  todos = value ? JSON.parse(value) : [];
});

app.get("/api/todos", (req, res) => {
  res.json(todos);
});

app.post("/api/todos", async (req, res) => {
  console.log("received: " + JSON.stringify(req.body.title));

  const newTodo = req.body;
  newTodo.id = ++todos.length;
  todos.push(newTodo);
  await client.set("todos", JSON.stringify(todos));
  res.status(201).json(newTodo);
});

//create a server object:
app.get("/", function (req, res) {
  res.write("Welcome to the Todos API!"); //write a response to the client
  res.end(); //end the response
});

const port = process.env.PORT || 8080;

app.listen(port, function () {
  console.log(`server running on ${port}`);
}); //the server object listens on port 8080
