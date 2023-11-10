// // dataHandler.js

// const fs = require('fs/promises');

// async function tambahDataKeJson(data, fileName) {
//   const filePath = `database/json/${fileName}.json`;
//   try {
//     // Baca data yang sudah ada dari file
//     let existingData = await fs.readFile(filePath, 'utf-8');

//     // Jika file kosong atau tidak valid, inisialisasikan dengan array kosong
//     if (!existingData.trim()) {
//       existingData = '{"items": []}';
//     }

//     const jsonData = JSON.parse(existingData);

//     // Tambahkan data baru ke dalam array "items"
//     jsonData.items.push(data);

//     // Tulis kembali data yang sudah diupdate ke file
//     await fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf-8');
//     console.log(`Data baru ditambahkan ke file JSON ${fileName}.json`);
//   } catch (error) {
//     console.error(`Error menambahkan data ke file JSON ${fileName}:`, error);
//   }
// }

// async function hapusSemuaDariJson(fileName) {
//   const filePath = `database/json/${fileName}.json`;
//   try {
//     // Hapus semua data dari file
//     await fs.writeFile(filePath, '{"items": []}', 'utf-8');
//     console.log(`Semua data dihapus dari file JSON ${fileName}.json`);
//   } catch (error) {
//     console.error(`Error menghapus data dari file JSON ${fileName}:`, error);
//   }
// }

// module.exports = {
//   tambahDataKeJson,
//   hapusSemuaDariJson
// };
