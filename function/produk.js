const fs = require('fs').promises;

async function handleCommand(socket, remoteJid, m, category) {
  try {
    // Membaca data dari file JSON
    const data = await fs.readFile('./database/json/data.json', 'utf-8');
    const jsonData = JSON.parse(data);
    
    // Memastikan bahwa kategori yang diminta tersedia
    if (!jsonData[category]) {
      throw new Error(`Category '${category}' not found.`);
    }

    const items = jsonData[category].items.join('\n');
    
    // Membuat pesan balasan
    const reply = `${category.toUpperCase()} Details:\n\n${items}`;
    
    // Mengambil pesan yang dikutip dari pesan masuk
    const quotedMessage = m.messages[0];
    
    // Membuat objek pesan
    const message = {
      text: reply,
      quoted: quotedMessage,
    };

    // Mengirimkan pesan balasan
    await socket.sendMessage(remoteJid, message, { quoted: quotedMessage });
  } catch (error) {
    console.error(`Error reading or sending ${category} details:`, error);
  }
}

module.exports = { handleCommand };
