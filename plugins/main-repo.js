const fetch = require('node-fetch');
const config = require('../config');
const { cmd } = require('../command');

cmd({
    pattern: "repo",
    alias: ["sc", "script", "info"],
    desc: "Fetch GitHub repository information",
    category: "info",
    filename: __filename,
},
async (conn, mek, m, { from, reply }) => {
    await conn.sendMessage(m.key.remoteJid, {
        react: {
            text: "📂",
            key: m.key
        }
    });

    const githubRepoURL = 'https://github.com/Itzpatron/PATRON-MD2/fork';

    try {
        const [, username, repoName] = githubRepoURL.match(/github\.com\/([^/]+)\/([^/]+)/);
        const response = await fetch(`https://api.github.com/repos/${username}/${repoName}`);
        
        if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
        const repoData = await response.json();

        // Format 1: Classic Box
        const style1 = `╭───『 PATRON-MD REPO 』───⳹
│ 🌐 Use this link to get session id:\n│ 👉 https://botportal-two.vercel.app
│ 🚀 Or use this bot .getpair 234xxxxxx
│ 📦 *Repository*: ${repoData.name}
│ 👑 *Owner*: ${repoData.owner.login}
│ ⭐ *Stars*: ${repoData.stargazers_count}
│ ⑂ *Forks*: ${repoData.forks_count}
│ 🔗 *URL*: ${repoData.html_url}
│
│ 📝 *Description*:
│ ${repoData.description || 'No description'}
│
╰────────────────⳹
> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴘᴀᴛʀᴏɴ TᴇᴄʜX 🚹* `;

        // Format 2: Minimalist
        const style2 = `•——[ *GITHUB INFO* ]——•
  ├─ 🌐 *Use this link to get session id:*\n│ 👉 https://botportal-two.vercel.app
  ├─ 🚀 *Or use this bot .getpair 234xxxxxx*     
  │
  ├─ 🏷️ ${repoData.name}
  ├─ 👤 ${repoData.owner.login}
  ├─ ✨ ${repoData.stargazers_count} Stars
  ├─ ⑂ ${repoData.forks_count} Forks
  │
  •——[ *PATRON-MD* ]——•
> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴘᴀᴛʀᴏɴ TᴇᴄʜX 🚹* `;

        // Format 3: Fancy Borders
        const style3 = `▄▀▄▀▄ *REPOSITORY INFO* ▄▀▄▀▄
  ♢ *Use this link to get session id:*\n│ 👉 https://botportal-two.vercel.app
  ♢ *Or use this bot .getpair 234xxxxxx*
  ♢  
  ♢ *Project*: ${repoData.name}
  ♢ *Author*: ${repoData.owner.login}
  ♢ *Stars*: ${repoData.stargazers_count} ✨
  ♢ *Forks*: ${repoData.forks_count} ⑂
  ♢ *Updated*: ${new Date(repoData.updated_at).toLocaleDateString()}
  
  🔗 ${repoData.html_url}
  
>  > *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴘᴀᴛʀᴏɴ TᴇᴄʜX 🚹* `;

        // Format 4: Code Style
        const style4 = `┌──────────────────────┐
│  ⚡ *PATRON-MD REPO*  ⚡  │
├─ 🌐 *Use this link to get session id:*\n│ 👉 https://botportal-two.vercel.app
├─ 🚀 *Or use this bot .getpair 234xxxxxx* 
├──────────────────────┤
│ • Name: ${repoData.name}
│ • Owner: ${repoData.owner.login}
│ • Stars: ${repoData.stargazers_count}
│ • Forks: ${repoData.forks_count}
│ • URL: ${repoData.html_url}
│ • Desc: ${repoData.description || 'None'}
└──────────────────────┘
> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴘᴀᴛʀᴏɴ TᴇᴄʜX 🚹* `;

        // Format 5: Modern Blocks
        const style5 = `▰▰▰▰▰ *REPO INFO* ▰▰▰▰▰
  🌐 *Use this link to get session id:*\n│ 👉 https://botportal-two.vercel.app
  🚀 *Or use this bot .getpair 234xxxxxx* 

  🏷️  *${repoData.name}*
  👨‍💻  ${repoData.owner.login}
  
  ⭐ ${repoData.stargazers_count}  ⑂ ${repoData.forks_count}
  🔗 ${repoData.html_url}
  
  📜 ${repoData.description || 'No description'}
  
> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴘᴀᴛʀᴏɴ TᴇᴄʜX 🚹* `;

        // Format 6: Retro Terminal
        const style6 = `╔══════════════════════╗
║   *PATRON-MD REPO*    ║
║ *Use this link to get session id:*\n│ 👉 https://botportal-two.vercel.app
║ *Or use this bot .getpair 234xxxxxx* 
╠══════════════════════╣
║ > NAME: ${repoData.name}
║ > OWNER: ${repoData.owner.login}
║ > STARS: ${repoData.stargazers_count}
║ > FORKS: ${repoData.forks_count}
║ > URL: ${repoData.html_url}
║ > DESC: ${repoData.description || 'None'}
╚══════════════════════╝
> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴘᴀᴛʀᴏɴ TᴇᴄʜX 🚹* `;

        // Format 7: Elegant
        const style7 = `┌───────────────┐
│  📂  *REPO*  │
🌐 *Use this link to get session id:*\n│ 👉 https://botportal-two.vercel.app
🚀 *Or use this bot .getpair 234xxxxxx* 
└───────────────┘
│
│ *Project*: ${repoData.name}
│ *Author*: ${repoData.owner.login}
│
│ ✨ ${repoData.stargazers_count} Stars
│ ⑂ ${repoData.forks_count} Forks
│
│ 🔗 ${repoData.html_url}
│
┌───────────────┐
│  📝  *DESC*  │
└───────────────┘
${repoData.description || 'No description'}

> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴘᴀᴛʀᴏɴ TᴇᴄʜX 🚹* `;

        // Format 8: Social Media Style
        const style8 = `✦ *PATRON-MD Repository* ✦

🌐 *Use this link to get session id:*\n│ 👉 https://botportal-two.vercel.app
🚀 *Or use this bot .getpair 234xxxxxx* 

📌 *${repoData.name}*
👤 @${repoData.owner.login}

⭐ ${repoData.stargazers_count} Stars | ⑂ ${repoData.forks_count} Forks
🔄 Last updated: ${new Date(repoData.updated_at).toLocaleDateString()}

🔗 GitHub: ${repoData.html_url}

${repoData.description || 'No description available'}

> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴘᴀᴛʀᴏɴ TᴇᴄʜX 🚹* `;

        // Format 9: Fancy List
        const style9 = `╔♫═🎧═♫══════════╗
   *PATRON-MD REPO*
  ╚♫═🎧═♫══════════╝

*Use this link to get session id:*\n│ 👉 https://botportal-two.vercel.app
*Or use this bot .getpair 234xxxxxx* 

•・゜゜・* ✧  *・゜゜・•
 ✧ *Name*: ${repoData.name}
 ✧ *Owner*: ${repoData.owner.login}
 ✧ *Stars*: ${repoData.stargazers_count}
 ✧ *Forks*: ${repoData.forks_count}
•・゜゜・* ✧  *・゜゜・•

🔗 ${repoData.html_url}

${repoData.description || 'No description'}

> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴘᴀᴛʀᴏɴ TᴇᴄʜX 🚹* `;

        // Format 10: Professional
        const style10 = `┏━━━━━━━━━━━━━━━━━━┓
┃  *REPOSITORY REPORT*  ┃
┗━━━━━━━━━━━━━━━━━━┛

◈  🌐 *Use this link to get session id:*\n│ 👉 https://botportal-two.vercel.app
◈  🚀 *Or use this bot .getpair 234xxxxxx* 

◈ Project: ${repoData.name}
◈ Maintainer: ${repoData.owner.login}
◈ Popularity: ★ ${repoData.stargazers_count} | ⑂ ${repoData.forks_count}
◈ Last Update: ${new Date(repoData.updated_at).toLocaleDateString()}
◈ URL: ${repoData.html_url}

Description:
${repoData.description || 'No description provided'}

> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴘᴀᴛʀᴏɴ TᴇᴄʜX 🚹* `;

        const styles = [style1, style2, style3, style4, style5, style6, style7, style8, style9, style10];
        const selectedStyle = styles[Math.floor(Math.random() * styles.length)];

        // Send image with repo info
        await conn.sendMessage(from, {
            image: { url: 'https://files.catbox.moe/e71nan.png' },
            caption: selectedStyle,
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

        // Send audio
        await conn.sendMessage(from, {
            audio: { url: 'https://github.com/Itzpatron/PATRON-DATA/raw/refs/heads/main/autovoice/SLAVA_FUNK.mp3' },
            mimetype: 'audio/mp4',
            ptt: true,
            contextInfo: { 
                mentionedJid: [m.sender],
                forwardingScore: 2,
                isForwarded: true
            }
        }, { quoted: mek });

    } catch (error) {
        console.error("Repo command error:", error);
        reply(`❌ Error: ${error.message}`);
    }
});
