const fs = require('fs').promises;

async function replaceDataInJson(filePath, category, newData) {
  try {
    // Membaca data dari file JSON
    const data = await fs.readFile(filePath, 'utf-8');
    const jsonData = JSON.parse(data);

    // Memastikan bahwa kategori yang diminta tersedia
    if (!jsonData[category]) {
      throw new Error(`Category '${category}' not found.`);
    }

    // Mengganti data kategori dengan data baru
    jsonData[category].items = newData;

    // Menulis data yang telah diubah kembali ke file JSON
    await fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf-8');

    console.log(`Data in category '${category}' replaced successfully.`);
  } catch (error) {
    console.error(`Error replacing data in category '${category}':`, error);
  }
}

async function handleCommand(socket, remoteJid, m, command) {
  try {
    // Mengecek apakah perintah adalah 'replace' dan memiliki data penggantian
    if (command.command.toLowerCase() === 'replace' && command.category && command.newData) {
      const { category, newData } = command;

      // Memanggil fungsi replaceDataInJson untuk menggantikan data
      await replaceDataInJson('./database/json/data.json', category, newData);

      // Memberikan pesan balasan bahwa penggantian data telah berhasil
      const reply = `Data in category '${category}' replaced successfully.`;
      await socket.sendMessage(remoteJid, { text: reply }, { quoted: m });
    } else {
      // Mengeksekusi logika perintah lainnya...
      // ...
    }
  } catch (error) {
    console.error('Error handling command:', error);
  }
}

