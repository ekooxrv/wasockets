const fs = require('fs').promises;
const { pay } = require('./pay.js');

async function handleCategoryCommand(socket, remoteJid, category, m) {
    try {
      // Baca file ./database/json/data.json
      const data = await fs.readFile('./database/json/data.json', 'utf8');
      const jsonData = JSON.parse(data);
  
      // Periksa apakah kategori sudah ada dalam ./database/json/data.json
      const normalizedCategory = category.toLowerCase();
      if (jsonData.category.hasOwnProperty(normalizedCategory)) {
        // Ambil items dari kategori yang sesuai
        const items = jsonData.category[normalizedCategory].items;
  
        // Kirim balasan dengan daftar items
        const quotedMessage = m.messages[0];
        const listItem = `Items ${normalizedCategory}:\n${items.join('\n')}`;
        const itemMessage = {
            text: listItem,
            quoted: quotedMessage,

        };
        socket.sendMessage(remoteJid, itemMessage, { quoted: quotedMessage });
      } else {
        // Kategori tidak ditemukan
        const quotedMessage = m.messages[0];
        const elMessage = {
            text: `Tidak ada menu dengan nama ${normalizedCategory}`,
            quoted: quotedMessage,
        }
        socket.sendMessage(remoteJid, elMessage, { quoted: quotedMessage });
      }
    } catch (error) {
      console.error('Error handling category command:', error);
    }
  }

// Fungsi untuk menangani perintah "add"
async function handleAddCommand(socket, remoteJid, category, description) {
    try {
      // Baca file data.json
      const data = await fs.readFile('./database/json/data.json', 'utf8');
      const jsonData = JSON.parse(data);
  
      // Periksa apakah kategori sudah ada dalam data.json
      if (jsonData.category.hasOwnProperty(category)) { // Perubahan disini
        // Jika tidak ada deskripsi (item), beri tahu bahwa kategori sudah ada
        if (!description) {
          socket.sendMessage(remoteJid, {
            text: `Kategori '${category}' sudah ada.`
          });
          return;
        }
  
        // Tambahkan item ke kategori yang sesuai
        jsonData.category[category].items.push(description); // Perubahan disini
  
        // Kirim balasan
        socket.sendMessage(remoteJid, {
          text: `Item '${description}' berhasil ditambahkan ke kategori '${category}'.`
        });
      } else {
        // Kategori belum ada, tambahkan sebagai kategori baru
        jsonData.category[category] = { items: [] }; // Perubahan disini
  
        // Jika ada deskripsi (item), tambahkan deskripsi sebagai item pertama
        if (description) {
          jsonData.category[category].items.push(description); // Perubahan disini
          socket.sendMessage(remoteJid, {
            text: `Kategori '${category}' berhasil ditambahkan dengan item '${description}'.`
          });
        } else {
          // Jika tidak ada deskripsi (item), beri tahu bahwa kategori baru sudah ditambahkan
          socket.sendMessage(remoteJid, {
            text: `Kategori '${category}' berhasil ditambahkan.`
          });
        }
      }
  
      // Simpan perubahan kembali ke file data.json
      await fs.writeFile('./database/json/data.json', JSON.stringify(jsonData, null, 2), 'utf8');
    } catch (error) {
      console.error('Error handling add command:', error);
    }
  }
  

  async function handleDeleteCommand(socket, remoteJid, category, description) {
    try {
      // Baca file data.json
      const data = await fs.readFile('./database/json/data.json', 'utf8');
      const jsonData = JSON.parse(data);
  
      // Periksa apakah kategori sudah ada dalam data.json
      if (jsonData.category.hasOwnProperty(category)) {
        // Periksa apakah ada deskripsi (item) yang akan dihapus
        if (description) {
          const items = jsonData.category[category].items;
          const index = items.indexOf(description);
          if (index !== -1) {
            // Hapus item dari kategori yang sesuai
            items.splice(index, 1);
  
            // Kirim balasan
            socket.sendMessage(remoteJid, {
              text: `Item '${description}' berhasil dihapus dari kategori '${category}'.`
            });
          } else {
            // Item tidak ditemukan dalam kategori
            socket.sendMessage(remoteJid, {
              text: `Item '${description}' tidak ditemukan dalam kategori '${category}'.`
            });
          }
        } else {
          // Tidak ada deskripsi (item) yang diberikan, hapus seluruh kategori
          delete jsonData.category[category];
  
          // Kirim balasan
          socket.sendMessage(remoteJid, {
            text: `Kategori '${category}' berhasil dihapus.`
          });
        }
  
        // Simpan perubahan kembali ke file data.json
        await fs.writeFile('./database/json/data.json', JSON.stringify(jsonData, null, 2), 'utf8');
      } else {
        // Kategori tidak valid
        socket.sendMessage(remoteJid, {
          text: `Kategori '${category}' tidak ditemukan.`
        });
      }
    } catch (error) {
      console.error('Error handling delete command:', error);
    }
  }

  
// Fungsi untuk menangani perintah "menu"
async function handleCommand(socket, remoteJid, message, category) {
    try {
      // Baca file data.json
      const data = await fs.readFile('./database/json/data.json', 'utf8');
      const jsonData = JSON.parse(data);

      // Ambil semua kategori dari data.json
      const allCategories = Object.keys(jsonData.category);

      // Tambahkan "PAY" ke daftar kategori jika belum ada
      if (!allCategories.includes('PAY')) {
        allCategories.push('PAY');
      }

      // Panggil fungsi handlePayCommand dari pay.js jika category adalah "PAY"
      if (category.toUpperCase() === 'PAY') {
        await handlePayCommand(socket, remoteJid, message);
        return;
      }

      // Kirim balasan dengan daftar semua kategori
      socket.sendMessage(remoteJid, {
        text: `Daftar Kategori:\n${allCategories.join('\n')}`
      });
    } catch (error) {
      console.error('Error handling menu command:', error);
    }
}
  
  async function handlePayCommand(socket, remoteJid, message) {
    try {
        // Panggil fungsi pay dari pay.js
        await pay(socket, remoteJid, message);
    } catch (error) {
        console.error('Error handling PAY command:', error);
    }
}


module.exports = { handleCategoryCommand, handleAddCommand, handleDeleteCommand, handleCommand };