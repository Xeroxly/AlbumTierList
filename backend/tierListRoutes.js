const express = require("express");
const database = require("./connect");
const { ObjectId } = require("mongodb");

let tierListRoutes = express.Router();

// Read All
// http://localhost:5000/tierLists
tierListRoutes.route("/tierLists").get(async (request, response) => {
  let db = database.getDb();
  let data = await db.collection("tierLists").find({}).toArray();

  if (data.length > 0) {
    response.json(data);
  } else {
    throw new Error("Data was not found");
  }
});

// Read One
// http://localhost:5000/tierLists/:id
tierListRoutes.route("/tierLists/:id").get(async (request, response) => {
  let db = database.getDb();
  let data = await db
    .collection("tierLists")
    .findOne({ _id: new ObjectId(request.params.id) });

  if (Object.keys(data).length > 0) {
    response.json(data);
  } else {
    throw new Error("Data was not found");
  }
});

// Create One
// http://localhost:5000/tierLists/
tierListRoutes.route("/tierLists").post(async (request, response) => {
  let db = database.getDb();
  let mongoObject = {
    title: request.body.title,
    data: request.body.data,
  };
  let data = await db.collection("tierLists").insertOne(mongoObject);

  response.json(data);
});

// Update One
// http://localhost:5000/tierLists/
tierListRoutes.route("/tierLists/:id").put(async (request, response) => {
  let db = database.getDb();
  let mongoObject = {
    $set: {
      title: request.body.title,
      data: request.body.data,
    },
  };
  let data = await db
    .collection("tierLists")
    .updateOne({ _id: new ObjectId(request.params.id) }, mongoObject);

  response.json(data);
});

// Delete One
// http://localhost:5000/tierLists/:id
tierListRoutes.route("/tierLists/:id").delete(async (request, response) => {
  let db = database.getDb();
  let data = await db
    .collection("tierLists")
    .deleteOne({ _id: new ObjectId(request.params.id) });

  response.json(data);
});

module.exports = tierListRoutes;
