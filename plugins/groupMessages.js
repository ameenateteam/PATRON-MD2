const { cmd } = require('../command');
const { loadSettings, saveSettings } = require('../lib/groupMessagesStorage');

// Load persistent settings
let settings = loadSettings();

let welcomeSettings = settings.welcome || {};
let goodbyeSettings = settings.goodbye || {};

const defaultWelcomeMessage = "Welcome {user} to {group}! We're glad to have you here.";
const defaultGoodbyeMessage = "Goodbye {user}. We'll miss you in {group}.";

function formatMessage(template, userMention, groupName, memberCount) {
  return template
    .replace(/{user}/g, userMention)
    .replace(/{group}/g, groupName || "this group")
    .replace(/{gname}/g, groupName || "this group")
    .replace(/{count}/g, memberCount || "0");
}

// Welcome Command
cmd({
  pattern: "welcome",
  alias: ["welc", "wm"],
  desc: `Manage welcome messages in groups`,
  category: "group",
  filename: __filename
}, async (conn, mek, m, { from, args, reply, isGroup, isBotAdmins }) => {
  await conn.sendMessage(m.chat, { react: { text: "👋", key: m.key } });
  
  if (!isGroup) return reply("❌ This command only works in groups");
  if (!isBotAdmins) return reply("❌ Bot needs admin rights to manage welcome messages");

  try {
    if (!args.length) {
      const setting = welcomeSettings[from];
      const status = setting?.enabled 
        ? `✅ *Enabled*\n💬 Message: ${setting.message || defaultWelcomeMessage}`
        : "❌ *Disabled*";
        return reply(`Current welcome settings:\n\n${status}\n\nUsage:\n• welcome on/off\n• welcome <custom message>\n\n📌 *Tip:* You can use these placeholders in your message:\n• {user} - mentions the new member\n• {group} - group name\n• {gname} - alternative for group name\n• {count} - member count`);
    }

    const option = args[0].toLowerCase();
    if (option === "on") {
      welcomeSettings[from] = { enabled: true, message: defaultWelcomeMessage };
    } else if (option === "off") {
      welcomeSettings[from] = { enabled: false };
    } else {
      welcomeSettings[from] = { enabled: true, message: args.join(" ") };
    }

    settings.welcome = welcomeSettings;
    saveSettings(settings);
    return reply(option === "off" ? "❌ Welcome messages disabled" : "✅ Welcome messages updated");
    
  } catch (e) {
    console.error('Welcome command error:', e);
    return reply("❌ Error updating welcome settings");
  }
});

// Goodbye Command
cmd({
  pattern: "goodbye",
  alias: ["gb", "bye"],
  desc: "Manage goodbye messages in groups",
  category: "group",
  filename: __filename
}, async (conn, mek, m, { from, args, reply, isGroup, isBotAdmins }) => {
  await conn.sendMessage(m.chat, { react: { text: "👋", key: m.key } });
  
  if (!isGroup) return reply("❌ This command only works in groups");
  if (!isBotAdmins) return reply("❌ Bot needs admin rights to manage goodbye messages");

  try {
    if (!args.length) {
      const setting = goodbyeSettings[from];
      const status = setting?.enabled 
        ? `✅ *Enabled*\n💬 Message: ${setting.message || defaultGoodbyeMessage}`
        : "❌ *Disabled*";
        return reply(`Current goodbye settings:\n\n${status}\n\nUsage:\n• goodbye on/off\n• goodbye <custom message>\n\n📌 *Tip:* You can use these placeholders in your message:\n• {user} - mentions the leaving member\n• {group} - group name\n• {gname} - alternative for group name\n• {count} - member count`);
    }

    const option = args[0].toLowerCase();
    if (option === "on") {
      goodbyeSettings[from] = { enabled: true, message: defaultGoodbyeMessage };
    } else if (option === "off") {
      goodbyeSettings[from] = { enabled: false };
    } else {
      goodbyeSettings[from] = { enabled: true, message: args.join(" ") };
    }

    settings.goodbye = goodbyeSettings;
    saveSettings(settings);
    return reply(option === "off" ? "❌ Goodbye messages disabled" : "✅ Goodbye messages updated");
    
  } catch (e) {
    console.error('Goodbye command error:', e);
    return reply("❌ Error updating goodbye settings");
  }
});

// Group Participants Update Handler
function registerGroupMessages(conn) {
  conn.ev.on("group-participants.update", async (update) => {
    const groupId = update.id;
    
    try {
      const groupMetadata = await conn.groupMetadata(groupId).catch(() => null);
      const groupName = groupMetadata?.subject || "the group";
      const memberCount = groupMetadata?.participants?.length || 0;

      const handleMessage = async (participant, isWelcome) => {
        const settings = isWelcome ? welcomeSettings[groupId] : goodbyeSettings[groupId];
        if (!settings?.enabled) return;

        const template = settings.message || (isWelcome ? defaultWelcomeMessage : defaultGoodbyeMessage);
        const mention = `@${participant.split('@')[0]}`;
        const message = formatMessage(template, mention, groupName, memberCount);

        await conn.sendMessage(groupId, { 
          text: message, 
          mentions: [participant] 
        });
      };

      // Handle different actions
      if (update.action === "add") {
        for (const participant of update.participants) {
          await handleMessage(participant, true);
        }
      } 
      else if (update.action === "remove") {
        for (const participant of update.participants) {
          await handleMessage(participant, false);
        }
      }
      else if (update.action === "promote" || update.action === "demote") {

        for (const participant of update.participants) {
          // Baileys uses update.author as the actor (who performed the action), participant as the target
          const actor = update.author || update.actor || participant;
          const action = update.action === "promote" ? "promoted" : "demoted";
          const emoji = update.action === "promote" ? "🎉" : "🚫";
          await conn.sendMessage(groupId, {
            text: `${emoji} *@${actor.split('@')[0]}* ${action} *@${participant.split('@')[0]}*`,
            mentions: [actor, participant]
          });
        }
      }

    } catch (error) {
      console.error('Group update handler error:', error);
    }
  });
}

module.exports = { registerGroupMessages };