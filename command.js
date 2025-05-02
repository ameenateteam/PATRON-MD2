var commands = [];

function cmd(info, func) {
    var data = info;
    data.function = func;
    if (!data.dontAddCommandList) data.dontAddCommandList = false;
    if (!info.desc) info.desc = '';
    if (!data.fromMe) data.fromMe = false;
    if (!info.category) data.category = 'misc';
    if(!info.filename) data.filename = "Not Provided";
    commands.push(data);
    return data;
}

const handleCommand = async (conn, mek, m, { isGroup, isOwner, isAdmin, isBotAdmin, reply }) => {
  // Check if message is a command
  if (!m.text.startsWith(prefix)) return;

  const command = m.text.slice(prefix.length).trim().split(/ +/)[0].toLowerCase();
  const args = m.text.slice(prefix.length + command.length).trim();

  // Find the command handler
  const cmdHandler = commands.find(cmd => cmd.pattern === command);
  if (!cmdHandler) return;

  // Check command category restrictions
  if (cmdHandler.category === 'owner' && !isOwner) {
    return reply("❌ This command is only available to the bot owner.");
  }

  if (cmdHandler.category === 'admin' && !isGroup) {
    // Allow sudo users to use admin commands in private
    const userId = m.sender.split('@')[0];
    const isSudo = require('./plugins/sudo').isSudo;
    if (!isSudo(userId)) {
      return reply("❌ This command can only be used in groups or by sudo users.");
    }
  }

  if (cmdHandler.category === 'admin' && isGroup && !isAdmin && !isBotAdmin) {
    return reply("❌ This command requires admin privileges.");
  }

  // Execute the command
  try {
    await cmdHandler.func(conn, mek, m, {
      isGroup,
      isOwner,
      isAdmin,
      isBotAdmin,
      reply,
      args,
      command
    });
  } catch (error) {
    console.error('Command error:', error);
    reply('❌ An error occurred while executing the command.');
  }
};

module.exports = {
    cmd,
    AddCommand:cmd,
    Function:cmd,
    Module:cmd,
    commands,
    handleCommand,
};
