const { cmd } = require("../command");
const axios = require('axios');
const fs = require('fs');
const path = require("path");
const AdmZip = require("adm-zip");
const { execSync } = require('child_process');
const { setCommitHash, getCommitHash } = require('../data/updateDB');

cmd({
    pattern: "update",
    alias: ["upgrade", "sync"],
    desc: "Update the bot to the latest version.",
    category: "misc",
    filename: __filename
}, async (client, message, args, { reply, isCreator }) => {
    if (!isCreator) return reply("⚠️ *Creator only command*");
    
    await client.sendMessage(message.key.remoteJid, {
        react: { text: "🔄", key: message.key }
    });

    try {
        // Stylish message with emoji and font
        const stylish = (text, emoji) => `*${emoji} 卄 ${text} 卄 ${emoji}*`;
        
        await reply(stylish("Checking PATRON-MD", "🔍"));

        // Get latest commit
        const { data: commitData } = await axios.get(
            "https://api.github.com/repos/Itzpatron/PATRON-MD2/commits/main"
        );
        
        if (await getCommitHash() === commitData.sha) {
            return reply(stylish("Already latest version", "✅"));
        }

        await reply(stylish("Updating PATRON-MD", "⚡"));

        // Download and extract
        const zipPath = path.join(__dirname, "update_temp.zip");
        fs.writeFileSync(
            zipPath,
            (await axios.get("https://github.com/Itzpatron/PATRON-MD2/archive/main.zip", {
                responseType: "arraybuffer"
            })).data
        );
        
        new AdmZip(zipPath).extractAllTo(path.join(__dirname, 'temp_update'), true);
        
        // Apply update
        copyFolderSync(
            path.join(__dirname, 'temp_update/PATRON-MD2-main'),
            path.join(__dirname, '..')
        );
        
        // Cleanup
        await setCommitHash(commitData.sha);
        fs.unlinkSync(zipPath);
        fs.rmSync(path.join(__dirname, 'temp_update'), { recursive: true });

        await reply(stylish("Updated! Restarting...", "🔄"));
        execSync('pm2 restart all', { stdio: 'inherit' });

    } catch (error) {
        console.error("Update error:", error);
        reply(stylish("Update failed", "❌"));
    }
});

function copyFolderSync(source, target) {
    if (!fs.existsSync(source)) return;
    fs.existsSync(target) || fs.mkdirSync(target, { recursive: true });
    
    fs.readdirSync(source).forEach(item => {
        if (['config.js', 'app.json'].includes(item)) return;
        const src = path.join(source, item);
        const dest = path.join(target, item);
        fs.lstatSync(src).isDirectory() ? copyFolderSync(src, dest) : fs.copyFileSync(src, dest);
    });
}