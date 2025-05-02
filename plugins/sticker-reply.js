const axios = require('axios'); // Assuming axios is installed
const { cmd } = require('../command'); // Import your command handler (adjust the path)

cmd({
    pattern: 'qc', // Command pattern (e.g., !qc)
    desc: 'Generate a quote image from text', // Description of the command
    category: 'image', // Category under which the command will fall
    filename: __filename, // Path to the current file (auto-generated)
}, async (conn, mek, m, { from, text, quoted, reply, prefix, command, pushname }) => {
    await conn.sendMessage(m.key.remoteJid, {
        react: {
            text: "🖼️",
            key: m.key
        }
    });
    // Check if the text is more than 25 characters
    if (text.length > 25) {
        return reply(`Example :
        
1. Usage: ${prefix + command} *text*
Example: ${prefix + command} LOVE YOU

Maximum 25 characters.`);
    }

    // Get the text to quote
    let teks = m.quoted ? quoted.text : text;

    try {
        // Try to fetch profile picture of the user who sent the message
        let pic;
        try {
            pic = await conn.profilePictureUrl(m.sender, 'image');
        } catch {
            pic = 'https://k.top4top.io/p_3249y8ta43.jpg'; // Default picture if fetching fails
        }

        // Prepare the object to send to the API for generating the quote image
        const obj = {
            "type": "quote",
            "format": "png",
            "backgroundColor": "#FFFFFF",
            "width": 512,
            "height": 768,
            "scale": 2,
            "messages": [{
                "entities": [],
                "avatar": true,
                "from": {
                    "id": 1,
                    "name": pushname,
                    "photo": {
                        "url": pic
                    }
                },
                "text": teks,
                "replyMessage": {}
            }]
        };

        // Call the API to generate the image
        const json = await axios.post('https://btzqc.betabotz.eu.org/generate', obj, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Decode the image from base64
        const buffer = Buffer.from(json.data.result.image, 'base64');

        // Send the generated image as a sticker
        Fernazerini.sendImageAsSticker(m.chat, buffer, m, {
            packname: global.packname,
            author: global.author,
        });
    } catch (e) {
        console.log(e);
        reply(`${e}\n\nThe server is having an error, try again later`);
    }
});
