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
const cron = require("node-cron");
const cors = require("cors");
const app = express();
const { createTableIfNotExists, insertDocument } = require("./databaseMapper");

app.use(cors({ origin: "http://localhost:5173" }));

//create a new dir called data
if (!fs.existsSync("data")) {
  fs.mkdirSync("data");
}

//make the data dir the current working directory
process.chdir("data");

// read documents from the database
const fetchAndStoreDbDocuments = async (dbName) => {
  const db = nano.use(dbName);
  const { rows } = await db.list({ include_docs: true });

  for (const row of rows) {
    const doc = row.doc;
    const numKeys = Object.keys(doc).length;

    const docType = typeof doc.type === "string" ? doc.type : "default";
    const folderPath = path.join(
      process.cwd(),
      dbName,
      `${numKeys}-key-value-pairs`,
      docType
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

    //if the key-value pairs are 10 or more, console log the first 1
    if (numKeys >= 10) {
      //console.log(`Document ${doc._id} has ${numKeys} key-value pairs:`, doc);
      const tableName = `${dbName}_${numKeys}_key_value_pairs_${doc.type}`; // Example table name format
      await createTableIfNotExists(tableName, doc);
      await insertDocument(tableName, doc);
    }
  }

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

  app.get("/api/medic", (req, res) => {
    const medicDir = path.join(process.cwd(), "medic");
    const dirs = fs
      .readdirSync(medicDir, { withFileTypes: true })
      .filter(
        (dirent) =>
          dirent.isDirectory() && parseInt(dirent.name.split("-")[0]) > 10
      )
      .map((dirent) => dirent.name);

    console.log(dirs);

    let mergedData = [];

    dirs.forEach((dir) => {
      const subDirs = fs
        .readdirSync(path.join(medicDir, dir), { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);

      console.log("Directory: ", dir, "Subdirectories: ", subDirs, "\n");

      subDirs.forEach((subDir) => {
        const files = fs
          .readdirSync(path.join(medicDir, dir, subDir))
          .filter((file) => file.endsWith(".json"));
        console.log("Files: ", files, "\n");
        files.forEach((file) => {
          const data = JSON.parse(
            fs.readFileSync(path.join(medicDir, dir, subDir, file), "utf8")
          );
          mergedData.push(data);
        });
      });
    });

    console.log("Merged data: ", mergedData);
    res.json(mergedData);
  });
  // Start the server
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});

const job = cron.schedule("* * * * *", async () => {
  await getAllDatabasesAndDocuments();
  console.log("Cron job ran successfully.");
});

job.start(); // Start the cron job

module.exports = app;
