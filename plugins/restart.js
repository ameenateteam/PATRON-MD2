const { cmd } = require("../command");
const { sleep } = require("../lib/functions"); // You still need sleep!

const { exec } = require('child_process');

cmd({
    pattern: "restart",
    desc: "Restart PATRON-MD",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { reply, isCreator }) => {
    await conn.sendMessage(m.key.remoteJid, {
        react: {
            text: "🔄",
            key: m.key
        }
    });
    try {
        if (!isCreator) {
            return reply("Only the bot owner can use this command.");
        }

        reply("*♻️ Restarting Patron-MD...*");
        await sleep(1500); // small wait to send the reply

        // Use PM2 to restart the application
        exec('pm2 restart all', (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return reply(`❌ An error occurred while restarting the bot: ${error.message}`);
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                return reply(`❌ Error: ${stderr}`);
            }
            console.log(`stdout: ${stdout}`);
            reply("✅ Patron-MD has been successfully restarted.");
        });
    } catch (e) {
        console.error(e);
        reply(`❌ An error occurred: ${e.message}`);
    }
});


