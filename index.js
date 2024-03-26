const nano = require('nano')({
  url: 'http://127.0.0.1:5984',
  requestDefaults: {
    auth: {
      username: 'medic',
      password: 'password'
    }
  }
});
const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();

//create a new dir called data
if (!fs.existsSync('data')) {
  fs.mkdirSync('data');
}

//make the data dir the current working directory
process.chdir('data');

const fetchAndStoreDbDocuments = async (dbName) => {
  const db = nano.use(dbName);
  const { rows } = await db.list({ include_docs: true });
  const docs = rows.map(row => row.doc);

  // Store documents in a file as JSON in the current working directory
  const filePath = path.join(process.cwd(), `${dbName}.json`);
  fs.writeFileSync(filePath, JSON.stringify(docs, null, 2));
  console.log(`Stored ${docs.length} documents from ${dbName} in ${filePath}`);
};

const getAllDatabasesAndDocuments = async () => {
  try {
    const dbs = await nano.db.list();
    for (const dbName of dbs) {
      await fetchAndStoreDbDocuments(dbName);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

getAllDatabasesAndDocuments().then(() => {
  console.log('Done fetching and storing all documents.');

  // Create API endpoints for each database
  const dbs = fs.readdirSync(process.cwd())
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace('.json', ''));

  for (const dbName of dbs) {
    const filePath = path.join(process.cwd(), `${dbName}.json`);
    const docs = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    app.get(`/api/${dbName}`, (req, res) => {
      res.json(docs);
    });
  }

  // Start the server
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});
