const express = require("express");

const dataRouter = express.Router();

dataRouter.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "Data endpoint" });
});

module.exports = dataRouter;
