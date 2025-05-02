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

// Normalize the key to only relevant fields
function normalizeKey(key) {
    if (!key) return {};
    return {
        remoteJid: key.remoteJid,
        id: key.id,
        fromMe: !!key.fromMe,
        participant: key.participant || undefined
    };
}

function saveMessage(key, message) {
    const db = loadDB();
    const normKey = normalizeKey(key);
    db[JSON.stringify(normKey)] = message;
    saveDB(db);
    console.log('Saved message with normalized key:', normKey, 'type:', message && message.message ? Object.keys(message.message)[0] : 'unknown');
}

function getMessage(key) {
    const db = loadDB();
    const normKey = normalizeKey(key);
    const result = db[JSON.stringify(normKey)];
    if (!result) {
        // Compare all keys for debugging
        const allKeys = Object.keys(db).map(k => JSON.parse(k));
        console.log('Message not found for normalized key:', normKey);
        console.log('Available keys:', allKeys);
    }
    return result;
}

module.exports = { saveMessage, getMessage };
