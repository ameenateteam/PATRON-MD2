//---------------------------------------------------------------------------
//           PATRON-MD  
//---------------------------------------------------------------------------
//  ⚠️ DO NOT MODIFY THIS FILE ⚠️  
//---------------------------------------------------------------------------
const { cmd, commands } = require('../command');
const config = require('../config');
const prefix = config.PREFIX;
const fs = require('fs');
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, sleep, fetchJson } = require('../lib/functions2');
const { writeFileSync } = require('fs');
const path = require('path');

cmd({
  pattern: "newgc",
  alias: ["creategc"],
  category: "group",
  desc: "Create a new group and join yourself.",
  filename: __filename,
}, async (conn, mek, m, { body, sender, reply }) => {
  try {
    if (!body || body.trim().length === 0) {
      return reply(`⚠️ *Usage:* .newgc group_name\n
❌ *Error:* Group name cannot be empty.`);
    }

    const groupName = body.trim();

    // Validate group name length
    if (groupName.length > 25) {
      return reply(`❌ *Error:* Group name is too long. Please use a name with fewer than 25 characters.`);
    }

    // Add only the sender
    const senderJid = sender.endsWith("@s.whatsapp.net") ? sender : `${sender}@s.whatsapp.net`;

    // Attempt to create the group
    const group = await conn.groupCreate(groupName, [senderJid]);

    // Small delay to let group init
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Try to get invite link
    let inviteLink;
    try {
      inviteLink = await conn.groupInviteCode(group.id);
    } catch (e) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      inviteLink = await conn.groupInviteCode(group.id);
    }

    // Welcome message inside the new group
    await conn.sendMessage(group.id, {
      text: `👋 *Hello everyone!*

This is the beginning of "${groupName}".`
    });

    // Reply back to sender with info
    reply(
      `✅ *Group created successfully!*

🆔 *Group Name:* ${groupName}
🔗 *Invite Link:* https://chat.whatsapp.com/${inviteLink}

ℹ️ You’ve been added to the group.`
    );

  } catch (e) {
    console.error("Group creation error:", e);

    // Handle specific errors
    if (e.data === 406) {
      reply(`❌ *Failed to create group.*

_Error:_ Group creation is not acceptable. This might be due to rate limits or account restrictions.`);
    } else {
      reply(`❌ *Failed to create group.*

_Error:_ ${e.message}`);
    }
  }
});
