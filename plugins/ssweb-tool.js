// code by ⿻ ⌜ 𝐊𝐇𝐀𝐍 ⌟⿻⃮͛🇵🇰𖤐

const axios = require("axios");
const config = require('../config');
const { cmd } = require('../command');

cmd({
  pattern: "sss",
  alias: ["ssweb"],
  desc: "Download screenshot of a given link.",
  category: "other",
  use: ".ss <link>",
  filename: __filename,
}, 
async (conn, mek, m, { q, reply }) => {
  await conn.sendMessage(m.key.remoteJid, {
    react: {
        text: "💫",
        key: m.key
    }
});
  const jid = mek.key.remoteJid;

  if (!q) {
    await conn.sendMessage(jid, { react: { text: "❓", key: mek.key } });
    return await conn.sendMessage(jid, { text: "Please provide a URL to capture a screenshot." }, { quoted: mek });
  }

  try {
    // API call to get the screenshot from the URL provided
    const response = await axios.get(`https://api.davidcyriltech.my.id/ssweb?url=${q}`);
    console.log("API Response:", response.data); // Debugging output

    // Extract the screenshot URL from the API response
    const screenshotUrl = response.data.screenshotUrl || response.data.url || response.data.result;
    
    if (!screenshotUrl) {
      return await conn.sendMessage(jid, { text: "Couldn't find a screenshot URL in the API response." }, { quoted: mek });
    }

    // Download image as buffer
    const imgRes = await axios.get(screenshotUrl, { responseType: 'arraybuffer' });

    // Send the screenshot image with the URL in the caption
    await conn.sendMessage(jid, {
      image: Buffer.from(imgRes.data),
      caption: `Here is the screenshot image: \n\n[Image URL]: ${screenshotUrl}\n\n> *Powered by PatronTechX*`,
    }, { quoted: mek });

  } catch (error) {
    console.error("Screenshot Error:", error);
    await conn.sendMessage(jid, { text: "Failed to capture the screenshot. Please try again later." }, { quoted: mek });
  }
});
