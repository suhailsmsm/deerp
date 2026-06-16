const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'credentials.json');

const ensureDb = () => {
  if (!fs.existsSync(DB_PATH)) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify({ apps: [] }, null, 2));
  }
};

const readDb = () => {
  ensureDb();
  const raw = fs.readFileSync(DB_PATH, 'utf8');
  return JSON.parse(raw);
};

const writeDb = (data) => {
  ensureDb();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

module.exports = { readDb, writeDb };
