const config = require('../config');
const { cmd, commands } = require('../command');
const { runtime } = require('../lib/functions');
const axios = require('axios');

function isEnabled(value) {
    // Function to check if a value represents a "true" boolean state
    return value && value.toString().toLowerCase() === "true";
}

cmd({
    pattern: "env",
    alias: ["setting", "allvar"],
    desc: "Settings of bot",
    category: "menu",
    filename: __filename,
    use: ".env"
}, 
async (conn, mek, m, { from, quoted, reply }) => {
    await conn.sendMessage(m.key.remoteJid, {
        react: {
            text: "⤵️",
            key: m.key
        }
    });
    try {
        // Define the settings message with the correct boolean checks
        let envSettings = `╭━━━〔 *PATRON-MD* 〕━━━┈⊷
┃▸╭───────────
┃▸┃๏ *ENV SETTINGS 🗿*
┃▸└───────────···๏
┃▸┃๏ *Check settingmenu for how to change them*
╰────────────────┈⊷
╭━━〔 *Enabled Disabled* 〕━━┈⊷
┇๏ *Status View:* ${isEnabled(config.AUTO_STATUS_SEEN) ? "Enabled ✅" : "Disabled ❌"}
┇๏ *Status Reply:* ${isEnabled(config.AUTO_STATUS_REPLY) ? "Enabled ✅" : "Disabled ❌"}
┇๏ *Auto Reply:* ${isEnabled(config.AUTO_REPLY) ? "Enabled ✅" : "Disabled ❌"}
┇๏ *Auto Sticker:* ${isEnabled(config.AUTO_STICKER) ? "Enabled ✅" : "Disabled ❌"}
┇๏ *Auto Voice:* ${isEnabled(config.AUTO_VOICE) ? "Enabled ✅" : "Disabled ❌"}
┇๏ *Custom Reacts:* ${isEnabled(config.CUSTOM_REACT) ? "Enabled ✅" : "Disabled ❌"}
┇๏ *Auto React:* ${isEnabled(config.AUTO_REACT) ? "Enabled ✅" : "Disabled ❌"}
┇๏ *Anti-Link:* ${isEnabled(config.ANTI_LINK) ? "Enabled ✅" : "Disabled ❌"}
┇๏ *Anti-Bad Words:* ${isEnabled(config.ANTI_BAD) ? "Enabled ✅" : "Disabled ❌"}
┇๏ *Auto Typing:* ${isEnabled(config.AUTO_TYPING) ? "Enabled ✅" : "Disabled ❌"}
┇๏ *Auto Recording:* ${isEnabled(config.AUTO_RECORDING) ? "Enabled ✅" : "Disabled ❌"}
┇๏ *Always Online:* ${isEnabled(config.ALWAYS_ONLINE) ? "Enabled ✅" : "Disabled ❌"}
┇๏ *Public Mode:* ${isEnabled(config.PUBLIC_MODE) ? "Enabled ✅" : "Disabled ❌"}
┇๏ *Read Message:* ${isEnabled(config.READ_MESSAGE) ? "Enabled ✅" : "Disabled ❌"}
┇๏ *Custom React:* ${isEnabled(config.CUSTOM_REACT) ? "Enabled ✅" : "Disabled ❌"}
╭━━〔 *Custom Settings* 〕━━┈⊷
┇๏ *Sticker Name:* ${config.STICKER_NAME || "Not Set ❌"}
┇๏ *Status Auto-Reply Msg:* ${config.AUTO_STATUS_MSG || "Not Set ❌"}
┇๏ *Custom React Emojis:* ${config.CUSTOM_REACT_EMOJIS || "Not Set ❌"}
┇๏ *Owner Number:* ${config.OWNER_NUMBER || "Not Set ❌"}
┇๏ *Owner Name:* ${config.OWNER_NAME || "Not Set ❌"}
┇๏ *Antidel Path:* ${config.ANTI_DEL_PATH || "Not Set ❌"}
╰━━━━━━━━━━━━──┈⊷
> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴘᴀᴛʀᴏɴ TᴇᴄʜX 🚹* `;

        // Send message with an image
        await conn.sendMessage(
            from,
            {
                image: { url: 'https://files.catbox.moe/e71nan.png' }, // Image URL
                caption: envSettings,
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
            },
            { quoted: mek }
        );

        // Send an audio file
        await conn.sendMessage(from, {
            audio: { url: 'https://github.com/Itzpatron/PATRON-DATA/raw/refs/heads/main/autovoice/SLAVA_FUNK.mp3' }, // Audio URL
            mimetype: 'audio/mp4',
            ptt: true
        }, { quoted: mek });

    } catch (error) {
        console.log(error);
        reply(`Error: ${error.message}`);
    }
});
