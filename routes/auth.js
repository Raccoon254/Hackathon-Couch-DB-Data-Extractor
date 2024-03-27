const express = require("express");

const authRouter = express.Router();

authRouter.get("/login", (req, res) => {
  res.redirect("/displayData");
});

module.exports = authRouter;
