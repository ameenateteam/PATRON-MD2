const { cmd } = require('../command');
const axios = require('axios');


cmd({
    pattern: "ai",
    alias: ["bot", "dj", "gpt", "gpt4", "bing"],
    desc: "Chat with an AI model",
    category: "ai",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply }) => {
    try {
        const question = q?.trim() || args.join(" ").trim();
        const jid = mek.key.remoteJid; // always reliable for both group and private

        if (!question) {
            await conn.sendMessage(jid, { react: { text: "❓", key: mek.key } });
            return await conn.sendMessage(jid, { text: "❓ Please provide a message for the AI.\n\nExample: `.ai Hello, how are you?`" }, { quoted: mek });
        }

        const apiUrl = `https://lance-frank-asta.onrender.com/api/gpt?q=${encodeURIComponent(question)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.message) {
            await conn.sendMessage(jid, { react: { text: "❌", key: mek.key } });
            return await conn.sendMessage(jid, { text: "⚠️ AI failed to respond. Please try again later." }, { quoted: mek });
        }

        await conn.sendMessage(jid, { text: `🤖 *AI Response:*\n\n${data.message}` }, { quoted: mek });
        await conn.sendMessage(jid, { react: { text: "✅", key: mek.key } });

    } catch (e) {
        console.error("Error in AI command:", e);
        await conn.sendMessage(mek.key.remoteJid, { react: { text: "❌", key: mek.key } });
        await conn.sendMessage(mek.key.remoteJid, { text: "An error occurred while communicating with the AI." }, { quoted: mek });
    }
});


cmd({
    pattern: "openai",
    alias: ["chatgpt", "gpt3", "open-gpt"],
    desc: "Chat with OpenAI",
    category: "ai",
    filename: __filename
}, async (conn, mek, m, { from, args, q, reply }) => {
    try {
        await conn.sendMessage(m.key.remoteJid, {
            react: {
                text: "🧠",
                key: m.key
            }
        });
        // Check if there's a question or 'no' command
        if (!q || q.toLowerCase() === "no") {
            const usageMessage = "🧠 *Usage:*\n• openai <question>n\nExample: `.openai What is the capital of France?`";

            // Check if the message is in a group or private chat
            if (mek.key.remoteJid.endsWith('@g.us')) {
                // If it's a group, send the usage message in the group
                await conn.sendMessage(mek.key.remoteJid, { text: usageMessage }, { quoted: mek });
            } else {
                // If it's a private chat, send the usage message to the user directly (without quoted)
                await conn.sendMessage(mek.key.remoteJid, { text: usageMessage });
            }

            return;  // Exit early after showing usage message
        }

        // Limit the length of input
        if (q.length > 500) {
            return await reply("❌ Your question is too long. Please keep it under 500 characters.");
        }

        // Prepare API call URL
        const apiUrl = `https://vapis.my.id/api/openai?q=${encodeURIComponent(q)}`;

        // Timeout for the API call to avoid hanging
        const { data } = await axios.get(apiUrl, { timeout: 10000 });

        // Handle case where API response is empty or malformed
        if (!data || !data.result) {
            await conn.sendMessage(mek.key.remoteJid, { text: "OpenAI failed to respond. Please try again later." }, { quoted: mek });
            return;
        }

        // Send the OpenAI response
        await conn.sendMessage(mek.key.remoteJid, { text: `🧠 *OpenAI Response:*\n\n${data.result}` }, { quoted: mek });

    } catch (e) {
        console.error("❌ Error in OpenAI command:", e.message || e);
        await conn.sendMessage(mek.key.remoteJid, { text: "An error occurred while communicating with OpenAI." }, { quoted: mek });
    }
});






cmd({
    pattern: "deepseek",
    alias: ["deep", "seekai"],
    desc: "Chat with DeepSeek AI",
    category: "ai",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    await conn.sendMessage(m.key.remoteJid, {
            react: {
                text: "🧠",
                key: m.key
            }
        })
    try {
        if (!q) return reply("Please provide a message for DeepSeek AI.\nExample: `.deepseek Hello`");

        const apiUrl = `https://api.ryzendesu.vip/api/ai/deepseek?text=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.answer) {
            await react("❌");
            return reply("DeepSeek AI failed to respond. Please try again later.");
        }

        await reply(`🧠 *DeepSeek AI Response:*\n\n${data.answer}`);
        await react("✅");
    } catch (e) {
        console.error("Error in DeepSeek AI command:", e);
        await react("❌");
        reply("An error occurred while communicating with DeepSeek AI.");
    }
});


