const nano = require("nano")({
  url: "http://127.0.0.1:5984",
  requestDefaults: {
    auth: {
      username: "medic",
      password: "password",
    },
  },
});

const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors({ origin: "http://localhost:5173" }));

//create a new dir called data
if (!fs.existsSync("data")) {
  fs.mkdirSync("data");
}

//make the data dir the current working directory
process.chdir("data");

const fetchAndStoreDbDocuments = async (dbName) => {
  const db = nano.use(dbName);
  const { rows } = await db.list({ include_docs: true });

  rows.forEach((row) => {
    const doc = row.doc;
    const numKeys = Object.keys(doc).length;

    // Define folder path based on number of key-value pairs
    const folderPath = path.join(
      process.cwd(),
      dbName,
      `${numKeys}-key-value-pairs`
    );
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // Define file path to store the document JSON
    const filePath = path.join(folderPath, `${doc._id}.json`);

    // Create directory for each document's path before writing the file
    const fileDir = path.dirname(filePath);
    if (!fs.existsSync(fileDir)) {
      fs.mkdirSync(fileDir, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(doc, null, 2));
    console.log(`Stored document ${doc._id} in ${filePath}`);
  });

  console.log(`Finished processing database: ${dbName}`);
};

const getAllDatabasesAndDocuments = async () => {
  try {
    const dbs = await nano.db.list();
    for (const dbName of dbs) {
      //if the db name does not start with medic, skip it
      if (dbName === "medic") {
        console.log(`Processing database: ${dbName}`);
        await fetchAndStoreDbDocuments(dbName);
      } else {
        console.log(`Skipping database: ${dbName}`);
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

getAllDatabasesAndDocuments().then(() => {
  console.log("Done fetching and storing all documents.");

  // Create API endpoints for each database
  const dbs = fs
    .readdirSync(process.cwd())
    .filter((file) => file.endsWith(".json"))
    .map((file) => file.replace(".json", ""));

  for (const dbName of dbs) {
    const filePath = path.join(process.cwd(), `${dbName}.json`);
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

    app.get(`/api/${dbName}`, (req, res) => {
      res.json(data); // Send the data as-is
    });
  }

  app.post("/auth/login", (req, res) => {
    try {
      const { username, password } = req.body;
      console.log(`Received login request for user: ${username}`);
      return res
        .status(200)
        .json({ success: true, message: "Login successful" });
    } catch (error) {
      console.error("Error:", error);
      return res
        .status(500)
        .json({ success: false, message: "An error occurred" });
    }
  });

  // Start the server
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});
