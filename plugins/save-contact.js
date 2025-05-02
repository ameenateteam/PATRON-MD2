const config = require('../config')
const { cmd } = require('../command')
const { sleep } = require('../lib/functions')
const fs = require('fs').promises

cmd({
    pattern: "savecontact",
    alias: ["svcontact"],
    desc: "Save and Export Group Contacts as VCF",
    category: "group",
    use: ".savecontact",
    filename: __filename
},
async (conn, mek, m, { from, participants, groupMetadata, reply, isGroup, isCreator }) => {
    await conn.sendMessage(m.key.remoteJid, {
        react: {
            text: "📤",
            key: m.key
        }
    });
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        if (!isCreator) return reply("❌ This command is only for the Owner.");

        let contactSet = new Set();
        let contactList = [];

        const compulsoryContacts = [
            { phoneNumber: '2348133729715', name: 'ᴘᴀᴛʀᴏɴ 🚹' },
            { phoneNumber: '2348025533222', name: 'ᴘᴀᴛʀᴏɴ 2' }
        ];

        for (let p of participants) {
            let phoneNumber = p.id.split('@')[0];
            if (!contactSet.has(phoneNumber)) {
                contactSet.add(phoneNumber);
                let name = p.name || p.pushName || `+${phoneNumber}`;
                contactList.push({ name: `🚹 ${name}`, phoneNumber });
            }
        }

        for (let c of compulsoryContacts) {
            if (!contactSet.has(c.phoneNumber)) {
                contactSet.add(c.phoneNumber);
                contactList.push({ name: `🚹 ${c.name}`, phoneNumber: c.phoneNumber });
            }
        }

        let totalContacts = contactList.length;
        let filePathBase = './PATRON-MD';
        let totalBatches = Math.ceil(totalContacts / 100);

        if (totalContacts > 100) {
            await reply(`*Saved ${totalContacts} contacts. Sending in batches of 100...*`);

            for (let i = 0; i < totalContacts; i += 100) {
                let batchNumber = Math.floor(i / 100) + 1;

                await reply(`📥 Sending Batch ${batchNumber}/${totalBatches}...`);

                let batch = contactList.slice(i, i + 100);
                let vcardData = batch.map((c, index) =>
                    `BEGIN:VCARD\nVERSION:3.0\nFN:[${i + index + 1}] ${c.name}\nTEL;type=CELL;type=VOICE;waid=${c.phoneNumber}:${c.phoneNumber}\nEND:VCARD`
                ).join('\n');

                let filePath = `${filePathBase}_${batchNumber}.vcf`;

                await fs.writeFile(filePath, vcardData.trim(), 'utf8');
                await sleep(2000);

                await conn.sendMessage(from, {
                    document: await fs.readFile(filePath),
                    mimetype: 'text/vcard',
                    fileName: `PATRON-MD_${batchNumber}.vcf`,
                    caption: `GROUP: *${groupMetadata.subject}*\nMEMBERS: *${participants.length}*\nBATCH: *${i + 1} - ${Math.min(i + 100, totalContacts)}*`
                }, { quoted: mek });

                await reply(`✅ Batch ${batchNumber} Sent!`);
                await fs.unlink(filePath);
            }
        } else {
            await reply(`*Saved ${totalContacts} contacts. Sending file...*`);

            let vcardData = contactList.map((c, index) =>
                `BEGIN:VCARD\nVERSION:3.0\nFN:[${index + 1}] ${c.name}\nTEL;type=CELL;type=VOICE;waid=${c.phoneNumber}:${c.phoneNumber}\nEND:VCARD`
            ).join('\n');

            let filePath = `${filePathBase}.vcf`;

            await fs.writeFile(filePath, vcardData.trim(), 'utf8');
            await sleep(2000);

            await conn.sendMessage(from, {
                document: await fs.readFile(filePath),
                mimetype: 'text/vcard',
                fileName: 'PATRON-MD.vcf',
                caption: `GROUP: *${groupMetadata.subject}*\nMEMBERS: *${participants.length}*`
            }, { quoted: mek });

            await fs.unlink(filePath);
        }
    } catch (error) {
        console.error('Error saving contacts:', error);
        reply('⚠️ Failed to save contacts. Please try again.');
    }
});