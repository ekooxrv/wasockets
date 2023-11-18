// menu.js
const fs = require("fs");
const path = require("path");

function handleMenuCommand(socket, remoteJid, m) {
  const menuFilePath = path.join(__dirname, "../database/json/menu.json");
  const menuData = fs.readFileSync(menuFilePath);
  const menu = JSON.parse(menuData);
  const menuItems = menu.items.join('\n');

  const successMessage = `${menuItems}`;

  const quotedMessage = m.messages[0];
  const responseMessage = {
    text: successMessage,
    quoted: quotedMessage,
  };

  socket.sendMessage(remoteJid, responseMessage, { quoted: quotedMessage });
}

module.exports = { handleMenuCommand };
