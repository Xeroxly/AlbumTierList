const connect = require("./connect");
const express = require("express");
const cors = require("cors");
const tierLists = require("./tierListRoutes");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(tierLists);

app.listen(PORT, () => {
  connect.connectToServer();
  console.log("Server is running on port: ", PORT);
});
