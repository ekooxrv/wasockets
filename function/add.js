// add.js
const fs = require('fs');
const path = require('path');

async function handleAddCommand(socket, remoteJid, m) {
  try {
    const ownerFilePath = path.join(__dirname, '../database/json/listOwner.json');
    const ownerData = JSON.parse(fs.readFileSync(ownerFilePath, 'utf-8'));

    // Mendapatkan nomor baru dari pesan
    const newAdminNumber = m.messages[0].message.conversation.split(' ')[1];

    // Membuat key baru untuk admin
    const newAdminKey = `admin${Object.keys(ownerData).length + 1}`;

    // Menambahkan nomor admin baru ke objek adminData
    adminData[newAdminKey] = {
      number: newAdminNumber
    };

    // Menyimpan perubahan ke file JSON
    fs.writeFileSync(ownerFilePath, JSON.stringify(ownerData, null, 2));

    const messageOptions = {
      text: `Nomor Admin baru ${newAdminKey}: ${newAdminNumber} berhasil ditambahkan!`
    };

    await socket.sendMessage(remoteJid, messageOptions);
  } catch (error) {
    console.error('Error handling !add command:', error);
  }
}

module.exports = { handleAddCommand };
