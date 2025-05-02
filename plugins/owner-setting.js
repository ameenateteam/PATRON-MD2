const { cmd ,commands } = require('../command');
const { exec } = require('child_process');
const config = require('../config');
const {sleep} = require('../lib/functions')
// 1. Shutdown Bot
cmd({
    pattern: "shutdown",
    desc: "Shutdown the bot.",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { from, isCreator, reply }) => {
    if (!isCreator) return reply("❌ Only the bot owner can shutdown the bot!");

    await conn.sendMessage(from, {
        react: {
            text: "🛑",
            key: m.key
        }
    });

    await reply("🛑 Shutting down the bot...");

    await sleep(1500); // Add a small delay for smoother UX
    process.exit(0); // Proper and clean shutdown
});


// 2. Broadcast Message to All Groups
cmd({
    pattern: "broadcast",
    desc: "Broadcast a message to all groups.",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { from, isCreator, args, reply }) => {
    await conn.sendMessage(m.key.remoteJid, {
        react: {
            text: "📢",
            key: m.key
        }
    });
    if (!isCreator) return reply("❌ You are not the owner!");
    if (args.length === 0) return reply("📢 Please provide a message to broadcast.");

    const text = args.join(' ');
    const message = `📢 *ANNOUNCEMENT!*\n\n${text}\n\n*ᴘᴀᴛʀᴏɴ-ᴍᴅ ʙʀᴏᴀᴅᴄᴀsᴛ*`;

    try {
        const groups = Object.keys(await conn.groupFetchAllParticipating());
        let count = 0;

        for (const groupId of groups) {
            await conn.sendMessage(groupId, { text: message }, { quoted: mek });
            count++;
        }

        reply(`📢 Broadcast complete!\nMessage sent to ${count} group(s).`);
    } catch (err) {
        reply(`❌ Broadcast failed: ${err.message}`);
    }
});

// 3. Set Profile Picture
cmd({
    pattern: "setpp",
    desc: "Set bot profile picture.",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, quoted, reply }) => {
    await conn.sendMessage(m.key.remoteJid, {
        react: {
            text: "🖼️",
            key: m.key
        }
    });
    if (!isOwner) return reply("❌ You are not the owner!");
    if (!quoted || !quoted.message || !quoted.message.imageMessage) return reply("❌ Please reply to an image.");
    try {
        const media = await conn.downloadMediaMessage(quoted);
        await conn.updateProfilePicture(conn.user.jid, { url: media });
        reply("🖼️ Profile picture updated successfully!");
    } catch (error) {
        reply(`❌ Error updating profile picture: ${error.message}`);
    }
});

// 6. Clear All Chats
cmd({
    pattern: "clear",
    desc: "Clear all messages in the current chat.",
    category: "owner",
    filename: __filename
}, async (conn, mek, m, { from, isCreator, reply }) => {
    if (!isCreator) return reply("❌ Only the owner can clear chats!");

    try {
        await conn.sendMessage(from, { react: { text: "🧹", key: m.key } });

        // Correct method to clear chat
        await conn.chatModify({ delete: true }, from);

        await sleep(1000);
        reply("🧹 Chat successfully cleared!");
    } catch (error) {
        console.error(error);
        reply(`❌ Failed to clear chat: ${error.message}`);
    }
});



  

// 8. Group JIDs List
cmd({
    pattern: "gjid",
    desc: "Get the list of JIDs for all groups the bot is part of.",
    category: "owner",
    react: "",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, reply }) => {
    await conn.sendMessage(m.key.remoteJid, {
        react: {
            text: "📝",
            key: m.key
        }
    });
    if (!isOwner) return reply("❌ You are not the owner!");
    const groups = await conn.groupFetchAllParticipating();
    const groupJids = Object.keys(groups).join('\n');
    reply(`📝 *Group JIDs:*\n\n${groupJids}`);
});


// delete 

cmd({
    pattern: "delete",
    alias: ["del", "delmsg"],
    desc: "Delete a message (reply to a message)",
    category: "owner",
    filename: __filename
}, async (Void, citel, text, { isCreator }) => {
    if (!isCreator) return citel.reply("❌ Only the bot owner can delete messages.");
    
    try {
        // Check if there's a quoted message
        if (!citel.quoted) {
            return citel.reply("⚠️ Please reply to the message you want to delete.");
        }

        // Get the correct message key (works for both private and group chats)
        const key = {
            remoteJid: citel.quoted.chat,  // Use chat instead of fakeObj
            id: citel.quoted.id,
            fromMe: citel.quoted.fromMe || false,
            participant: citel.quoted.sender  // Important for group messages
        };

        console.log("Delete Key:", JSON.stringify(key, null, 2));

        // First try: Modern deletion method
        try {
            await Void.sendMessage(citel.chat, { delete: key });
            console.log("Message deleted successfully");
        } catch (modernError) {
            console.log("Modern delete failed, trying legacy method:", modernError);
            
            // Fallback: Legacy deletion method
            await Void.sendMessage(citel.chat, {
                text: "Deleting message...",
                delete: key
            });
        }

        // Send success reaction
        await Void.sendMessage(citel.chat, {
            react: {
                text: "✅",
                key: citel.key
            }
        });

    } catch (err) {
        console.error("Delete Error:", err);
        let errorMsg = "❌ Failed to delete message.";
        
        if (err.message.includes("MessageNotFound")) {
            errorMsg += "\nMessage not found or already deleted.";
        } else if (err.message.includes("NotAllowed")) {
            errorMsg += "\nI need to be admin to delete others' messages in groups.";
        } else if (err.message.includes("participant")) {
            errorMsg += "\nCouldn't identify message sender in group.";
        } else if (err.message.includes("remoteJid")) {
            errorMsg += "\nInvalid message format.";
        }
        
        // Additional group-specific checks
        if (citel.isGroup) {
            errorMsg += "\n\nNote: In groups, I can only:";
            errorMsg += "\n- Delete my own messages anytime";
            errorMsg += "\n- Delete others' messages if I'm admin";
        }
        
        return citel.reply(errorMsg);
    }
});


