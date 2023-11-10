const fs = require('fs').promises;

async function handleMenuCommand(socket, remoteJid) {
  try {
    const menuData = await fs.readFile('./database/json/menu.json', 'utf-8');
    const menuJson = JSON.parse(menuData);
    const menuItems = menuJson.items.join('\n');
    const reply = `${menuItems}`; // Add an extra line break after "Menu:"
 
    await socket.sendMessage(remoteJid, { text: reply }, 'extendedTextMessage');
  } catch (error) {
    console.error('Error reading or sending menu:', error);
  }
}

module.exports = { handleMenuCommand };
