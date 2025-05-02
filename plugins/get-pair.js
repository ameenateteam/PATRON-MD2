//const fetch = require("node-fetch");
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, sleep, fetchJson} = require('../lib/functions')
const { cmd } = require("../command");

// get pair 2

cmd({
    pattern: "pair",
    alias: ["getpair", "clonebot"],
    desc: "Pairing code",
    category: "download",
    use: ".pair <phone_number>",
    filename: __filename
}, 
async (conn, mek, m, { from, prefix, quoted, q, reply }) => {
    await conn.sendMessage(m.key.remoteJid, {
        react: {
            text: "✅",
            key: m.key
        }
    });
    try {
        const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

        if (!q) {
            return await reply("*Example -* .pair +23475822XX");
        }

        // Automatically add "+" if missing
        if (!q.startsWith("+")) {
            q = "+" + q;
        }

        const response = await fetch(`https://patron-pairing.onrender.com/pair?phone=${q}`);
        const pair = await response.json();

        if (!pair || !pair.code) {
            return await reply("Failed to retrieve pairing code. Please check the phone number and try again.");
        }

        const pairingCode = pair.code;
        const doneMessage = "> *PATRON-MD PAIR COMPLETED*";

        await reply(`${doneMessage}\n\n*Your pairing code is:* ${pairingCode}`);

        await sleep(2000);

        await reply(`${pairingCode}`);
    } catch (error) {
        console.error(error);
        await reply("An error occurred. Please try again later.");
    }
});
