const { cmd } = require('../command');

cmd({
    pattern: "patron",
    desc: "Information on how to use the bot.",
    category: "setting",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const ownerNumber = '+2348133729715'; // Owner's number
        const ownerName = 'ᴘᴀᴛʀᴏɴ TᴇᴄʜX 🚹'; // Owner's name

        // vCard content with clickable message link
        const vCard = 'BEGIN:VCARD\n' +
                      'VERSION:3.0\n' +
                      `FN:${ownerName}\n` +  
                      `TEL;type=CELL;type=VOICE;waid=${ownerNumber.replace('+', '')}:${ownerNumber}\n` + // WhatsApp link to message
                      'END:VCARD';

        const message = 
            `🔹 *Welcome to Patron Bot!* 🔹\n\n` +
            `Here’s how you can make the best use of the bot:\n\n` +
            `1️⃣ Use *.list* to get a list of available commands and their descriptions.\n` +
            `2️⃣ Use *.help* to get information about a command.\n` +
            `3️⃣ Use *.report* if you encounter any issues or if a command isn't working.\n` +
            `4️⃣ Use *.request* to suggest a new command or feature you'd like added.\n` +
            `5️⃣ For any other inquiries, just reach out to the bot owner.\n` +
            `6️⃣ Use *.getpair* to connect your number to my bot for session id.\n` +
            `7️⃣*Note:* The bot is constantly being updated, so keep an eye out for new features and improvements!\n\n` +
            `8️⃣ Use *.update* to update bot and use .checkupdate to check for available updates\n\n` +
            `💡 *Also* You should share the bot with your friends and join our support channel for updates.\n\n` +
            `*Visit our website for more information and to get session id:* https://botportal-two.vercel.app\n` +
            `*Please if you encounter any issue in a command please use .report (command). PLEASE*` +
            `\n\n` +
            `📰 *Join our Channel* for the latest updates on new features and announcements:\n` +
            `🔗 [Join Channel](https://whatsapp.com/channel/0029Val0s0rIt5rsIDPCoD2q)`;

        // Send the information message
        await conn.sendMessage(from, { text: message });

        // Send the vCard with clickable message link
        await conn.sendMessage(from, {
            contacts: {
                displayName: ownerName,
                contacts: [{ vcard: vCard }]  // Updated to vCard (capital 'C')
            }
        });
        

        // Optionally, you can send an image along with the information
        await conn.sendMessage(from, {
            image: { url: 'https://files.catbox.moe/e71nan.png' }, // Image URL
            caption: `╭━━〔 *PATRON-MD* 〕━━┈⊷\n┃◈╭─────────────·๏\n┃◈┃• *Here is the patron details*\n┃◈┃• *Name* - ${ownerName}\n┃◈┃• *Number* ${ownerNumber}\n┃◈┃• *Version*: 2.0.0 Beta\n┃◈└───────────┈⊷\n╰──────────────┈⊷`
        });

    } catch (err) {
        console.error("Error in patron command:", err);
        await conn.sendMessage(from, { text: "❌ Something went wrong while retrieving the information." });
    }
});
