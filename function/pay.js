// pay.js

const { Mimetype, MessageType } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

async function pay(socket, remoteJid, m) {
  const imagePath = path.join(__dirname, '../database/images/pay.jpg');
  const imageBuffer = fs.readFileSync(imagePath);
  const quotedMessage = m.messages[0];
  const messageOptions = {
    image: imageBuffer,
    caption: 'tested',
    quoted: quotedMessage,
  };

  // Kirim gambar sebagai quoted message
  await socket.sendMessage(remoteJid, messageOptions, { quoted: quotedMessage });
}

module.exports = { pay };
