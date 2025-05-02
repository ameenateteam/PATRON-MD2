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
    const stringKey = JSON.stringify(key);
    db[stringKey] = message;
    saveDB(db);
    // Log key and message type for debugging
    console.log('Saved message with key:', key, 'type:', message && message.message ? Object.keys(message.message)[0] : 'unknown');
}

function getMessage(key) {
    const db = loadDB();
    const stringKey = JSON.stringify(key);
    const result = db[stringKey];
    if (!result) {
        // Compare all keys for debugging
        const allKeys = Object.keys(db).map(k => JSON.parse(k));
        console.log('Message not found for key:', key);
        console.log('Available keys:', allKeys);
    }
    return result;
}

module.exports = { saveMessage, getMessage };
