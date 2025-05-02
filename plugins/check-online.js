const { cmd } = require('../command');
const delay = ms => new Promise(r => setTimeout(r, ms));

cmd({
  pattern: "online",
  alias: ["whosonline","onlinemembers"],
  desc: "Check who's online in the group (Admins & Owner only)",
  category: "main",
  filename: __filename,
  use: ".online"
}, async (conn, mek, m, { from, isGroup, isAdmins, isCreator, reply }) => {
  // 1) only in groups + only admins/owner
  if (!isGroup)       return reply("❌ This command can only be used in a group!");
  if (!isCreator && !isAdmins)  
                        return reply("❌ Only owner or group admins can use this!");

  // 2) let people know we’re scanning
  await conn.sendMessage(from, { text: "🔄 Scanning for online members… Please wait 10–15 seconds." }, { quoted: mek });

  // 3) fetch group metadata & all participants
  const { participants } = await conn.groupMetadata(from);

  // 4) subscribe to each user’s presence
  await Promise.all(
    participants.map(p => conn.presenceSubscribe(p.id))
  );

  // 5) “ping” the group so WhatsApp emits presence updates back
  await conn.sendPresenceUpdate('available', from);

  // 6) wait a fixed period for updates to arrive (10-15s for a smaller group, longer for bigger ones)
  await delay(15000);  // You can increase this if needed

  // 7) collect online members from Baileys store
  const online = participants
    .filter(p => {
      const pres = conn.store.presences[p.id]?.lastKnownPresence;
      return ['available','composing','recording','online'].includes(pres);
    })
    .map(p => p.id);

  // 8) build & send the result
  if (online.length === 0) {
    return reply("⚠️ Couldn't detect any online members. They may be hiding their presence.");
  }

  const list = online
    .map((jid, i) => `${i+1}. @${jid.split('@')[0]}`)
    .join('\n');

  const text = `🟢 *Online Members* (${online.length}/${participants.length}):\n\n${list}`;
  await conn.sendMessage(from, { text, mentions: online }, { quoted: mek });
});
