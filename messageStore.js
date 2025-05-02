const fs = require('fs');
const path = require('path');
const DB_FILE = path.join(__dirname, 'messages.json');

function loadDB() {
    if (!fs.existsSync(DB_FILE)) return {};
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function saveDB(db) {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

function saveMessage(key, message) {
    const db = loadDB();
    db[JSON.stringify(key)] = message;
    saveDB(db);
}

function getMessage(key) {
    const db = loadDB();
    return db[JSON.stringify(key)];
}

module.exports = { saveMessage, getMessage };
