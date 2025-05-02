const { cmd } = require('../command');
const { runtime } = require('../lib/functions');
const config = require('../config');

cmd({
    pattern: "uptime",
    alias: ["runtime", "up"],
    desc: "Show bot uptime with stylish formats",
    category: "main",
    filename: __filename,
    use: ".uptime"
},
async (conn, mek, m, { from, reply }) => {
    await conn.sendMessage(m.key.remoteJid, {
        react: {
            text: "⏱️",
            key: m.key
        }
    });
    try {
        const uptime = runtime(process.uptime());
        const startTime = new Date(Date.now() - process.uptime() * 1000);
        
        const message = `╭───『 UPTIME 』───⳹
│
│ ⏱️ ${uptime}
│
╰────────────────⳹
> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴘᴀᴛʀᴏɴ TᴇᴄʜX 🚹* `;

        await conn.sendMessage(from, { 
            text: message,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 2,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363303045895814@newsletter',
                    newsletterName: "PatronTechX",
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Uptime Error:", e);
        reply(`❌ Error: ${e.message}`);
    }
});