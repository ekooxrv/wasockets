const fs = require('fs');
const path = require('path');


async function handleOwnerCommand(socket, remoteJid) {
    try {
        console.log('Handle Owner Command Start');
      const ownerFilePath = path.join(__dirname, '../database/json/listOwner.json');
      const ownerData = JSON.parse(fs.readFileSync(ownerFilePath, 'utf-8'));
      const ownerNumber = ownerData.ownerReal.number;
      const messageOptions = {
        text: `Nomor Owner: ${ownerNumber}`,
      };
  
      await socket.sendMessage(remoteJid, messageOptions);
      console.log('Handle OWNER Command End');
    } catch (error) {
      console.error('Error handling !owner command:', error);
    }
  }
  
  async function handleAdminCommand(socket, remoteJid) {
    try {
        console.log('Handle ADMIN Command Start');
      const ownerFilePath = path.join(__dirname, '../database/json/listOwner.json');
      const ownerData = JSON.parse(fs.readFileSync(ownerFilePath, 'utf-8'));
      const ownerNumber = ownerData.admin.number;
      const messageOptions = {
        text: `Nomor Admin: ${ownerNumber}`,
      };
  
      await socket.sendMessage(remoteJid, messageOptions);
      console.log('Handle ADMIN Command End');
    } catch (error) {
        console.error('Error handling !admin command:', error);
      }
  }


  async function handleMANGCommand(socket, remoteJid, m) {
    try {
      const ownerFilePath = path.join(__dirname, '../database/json/listOwner.json');
      const ownerData = JSON.parse(fs.readFileSync(ownerFilePath, 'utf-8'));
  
      // Mendapatkan nomor baru dari pesan
      const newAdminNumber = m.messages[0].message.conversation.split(' ')[1];
  
      // Menambahkan "@s.whatsapp.net" ke nomor baru
      const formattedAdminNumber = `${newAdminNumber}@s.whatsapp.net`;
      console.log('Formatted Admin Number:', formattedAdminNumber);
  
      // Membuat key baru untuk admin
      const newAdminKey = `admin${Object.keys(ownerData).length + 1}`;
      console.log('New Admin Key:', newAdminKey);
  
      // Menambahkan nomor admin baru ke objek ownerData
      ownerData[newAdminKey] = {
        number: formattedAdminNumber
      };
      console.log('Owner Data after addition:', ownerData);
  
      // Menyimpan perubahan ke file JSON
      fs.writeFileSync(ownerFilePath, JSON.stringify(ownerData, null, 2));
      console.log('File updated successfully.');
  
      const messageOptions = {
        text: `Nomor Admin baru ${newAdminKey}: ${formattedAdminNumber} berhasil ditambahkan!`
      };
  
      await socket.sendMessage(remoteJid, messageOptions);
    } catch (error) {
      console.error('Error handling MANG command:', error);
      console.error('Stack trace:', error.stack);
      const messageOptions = {
        text: 'Terjadi kesalahan saat menambahkan nomor admin baru. Silakan coba lagi nanti.'
      };
      await socket.sendMessage(remoteJid, messageOptions);
    }
  }
  

  
  module.exports = { handleOwnerCommand, handleAdminCommand, handleMANGCommand };
  