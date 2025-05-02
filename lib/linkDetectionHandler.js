const { getLinkDetectionMode } = require("./linkDetection");
const { incrementWarning, resetWarning, getWarningCount } = require("./warnings");
const { getPDMStatus, updatePDMStatus } = require('../plugins/pdmCommands');
const fs = require('fs');

const setupLinkDetection = (sock) => {
    sock.ev.on("messages.upsert", async ({ messages }) => {
        for (const message of messages) {
            if (!message.message) continue;
            const groupJid = message.key.remoteJid;
            if (!groupJid || !groupJid.endsWith("@g.us") || message.key.fromMe) continue;

            const msgText = message.message?.conversation || message.message?.extendedTextMessage?.text || "";
            const linkRegex = /\b((https?:\/\/)?(([\w-]+\.)+[\w-]{2,}|localhost|\d{1,3}(\.\d{1,3}){3})(:\d{2,5})?(\/[^\s]*)?)\b/gi;

            if (linkRegex.test(msgText)) {
                console.log(`Detected link in group ${groupJid}: ${msgText}`);

                const participant = message.key.participant;
                if (!participant) continue;

                const mode = await getLinkDetectionMode(groupJid) || "warn";

                // Delete the message properly
                await sock.sendMessage(groupJid, { delete: { remoteJid: groupJid, fromMe: false, id: message.key.id } });

                // Notify if PDM is enabled
                const pdmEnabled = await getPDMStatus(groupJid);
                if (pdmEnabled) {
                    await sock.sendMessage(groupJid, {
                        text: `❌ Links are not allowed in this group. @${participant.split('@')[0]} has been warned.`,
                        mentions: [participant],
                    });
                }

                if (mode === "kick") {
                    await sock.groupParticipantsUpdate(groupJid, [participant], "remove");
                    await sock.sendMessage(groupJid, {
                        text: `🚫 @${participant.split('@')[0]} has been removed for sending links.`,
                        mentions: [participant],
                    });
                } else if (mode === "warn") {
                    const warningCount = incrementWarning(groupJid, participant);
                    await sock.sendMessage(groupJid, {
                        text: `⚠️ @${participant.split('@')[0]}, links are not allowed!\nWarning count: ${warningCount}/3`,
                        mentions: [participant],
                    });

                    if (warningCount >= 3) {
                        await sock.groupParticipantsUpdate(groupJid, [participant], "remove");
                        await sock.sendMessage(groupJid, {
                            text: `🚫 @${participant.split('@')[0]} has been removed after 3 warnings.`,
                            mentions: [participant],
                        });
                        resetWarning(groupJid, participant);
                    }
                }
            }
        }
    });

    sock.ev.on('group.participants.update', async (event) => {
        const { id: groupJid, participants, action } = event;
        
        // Get the actor correctly - some libraries might have it in event.author
        const actor = event.actor || event.author || participants[0];
        
        const pdmEnabled = await getPDMStatus(groupJid);
        if (!pdmEnabled) return;
    
        try {
            const groupMetadata = await sock.groupMetadata(groupJid);
            if (!groupMetadata) return;
    
            // Get all participants who were affected (not just the first one)
            for (const user of participants) {
                const actorContact = groupMetadata.participants.find(p => p.id === actor);
                const userContact = groupMetadata.participants.find(p => p.id === user);
    
                const actorName = actorContact?.notify || actorContact?.name || actor?.split('@')[0] || "Someone";
                const userName = userContact?.notify || userContact?.name || user?.split('@')[0] || "User";
    
                if (action === 'promote') {
                    const promoMsg = `🎉 *${actorName}* promoted *@${user.split('@')[0]}* to admin.\n\n*Congratulations ${userName}! Handle your responsibility with care and lead the way!* 🎉`;
                    await sock.sendMessage(groupJid, {
                        text: promoMsg,
                        mentions: [actor, user],
                    });
                }
    
                if (action === 'demote') {
                    const demoMsg = `🚫 *${actorName}* demoted *@${user.split('@')[0]}* from admin.\n\n*${userName}, it's time to step back and regroup.* 😔`;
                    await sock.sendMessage(groupJid, {
                        text: demoMsg,
                        mentions: [actor, user],
                    });
                }
            }
        } catch (err) {
            console.error('Error sending promote/demote message:', err);
        }
    });
};

module.exports = setupLinkDetection;
