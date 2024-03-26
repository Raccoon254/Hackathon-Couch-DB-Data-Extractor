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

const fetchAndStoreDbDocuments = async (dbName) => {
  const db = nano.use(dbName);
  const { rows } = await db.list({ include_docs: true });
  const docs = rows.map(row => row.doc);

  // Store documents in a file as JSON
  const filePath = path.join(__dirname, `${dbName}.json`);
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

getAllDatabasesAndDocuments().then(() => console.log('Done fetching and storing all documents.'));
