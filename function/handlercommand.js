const { default: makeWASocket, useMultiFileAuthState, downloadMediaMessage } = require("@whiskeysockets/baileys");
const Pino = require("pino");
const { handleOrderMessage } = require("./order.js");
const { handleAddCommand, handleDeleteCommand, handleCategoryCommand, handleCommand } = require("./cate.js");
const { pay, setCaption, setImg } = require("./pay2.js");
const path = require('path');
const fs = require('fs');
const { writeFile } = require('fs/promises');

// ...


async function connectToWhatsapp() {
  const auth = await useMultiFileAuthState("auth");
  const socket = makeWASocket({
    printQRInTerminal: true,
    browser: ["MamangSomay", "Firefox", "1.0.0"],
    auth: auth.state,
    logger: Pino({ level: "silent" }),
  });

  socket.ev.on("creds.update", auth.saveCreds);
  socket.ev.on("connection.update", ({ connection }) => {
    if (connection === "open") {
      console.log("Koneksi Terbuka");
    }
    if (connection === "close") {
      connectToWhatsapp();
    }
  });

  socket.ev.on("messages.upsert", async (m) => {
    if (
      m.messages &&
      m.messages[0] &&
      m.messages[0].message &&
      !m.messages[0].key.fromMe
    ) {
      const remoteJid = m.messages[0].key.remoteJid;
      const senderNumber = m.messages[0].key.participant || m.messages[0].key.remoteJid;
      console.log("Pesan masuk dari ID Grup:", remoteJid);
      console.log("Nomor Pengirim:", senderNumber);

      // Baca file owner.json
      try {
        // Handler untuk semua pengirim
        console.log("Conversation:", m.messages[0].message.conversation);
        const words = m.messages[0].message.conversation.split(" ");
        console.log("Words:", words);
        console.log("Isi Pesan:", m.messages[0].message);

        if (m.messages[0].message.imageMessage) {
          const imageMessage = m.messages[0].message.imageMessage;
          const imageUrl = imageMessage.url;
          const imageFileName = `image_` + Math.floor(1000 + Math.random() * 9000).toString() + `.jpg`;
          

          // Simpan gambar ke dalam folder yang sesuai
          const logger = Pino({ level: "silent" });
          const imagePath = path.join(__dirname, `../database/gambar/${imageFileName}`);
          const imageBuffer = await downloadMediaMessage(
            m.messages[0],
            'buffer',
            {},
            {
              logger,
              reuploadRequest: socket.updateMediaMessage,
            }
          );
          await writeFile(imagePath, imageBuffer);

          // Beri tahu pengguna bahwa gambar berhasil disimpan
          socket.sendMessage(remoteJid, {
            text: `Gambar berhasil disimpan dengan nama: ${imageFileName}. Gunakan !setimg ${imageFileName} untuk mengeset gambar pay.`,
          });
        }
        

        switch (words[0].toUpperCase()) {
          case 'ORDER':
            if (words.length >= 3) {
              await handleOrderMessage(socket, remoteJid, words, m);
            } else {
              socket.sendMessage(remoteJid, {
                text: "Format !order tidak valid. Gunakan: !order buyerskucode idgame-idserver",
              });
            }
            break;
            

            case 'SETIMG':
    if (words.length >= 2) {
      const newImagePath = path.join(__dirname, `../database/gambar/${words[1]}`);
      if (fs.existsSync(newImagePath)) {
        setImg(newImagePath); // Panggil setImg dengan parameter yang sesuai
        socket.sendMessage(remoteJid, {
          text: `Gambar berhasil diubah.`,
        });
      } else {
        socket.sendMessage(remoteJid, {
          text: `File gambar ${words[1]} tidak ditemukan.`,
        });
      }
    } else {
      socket.sendMessage(remoteJid, {
        text: "Format !setimg tidak valid. Gunakan: !setimg nama_gambar.jpg",
      });
    }
    break;


    case 'SETCAPT':
      if (words.length >= 2) {
        const newCaption = words.slice(1).join(' ');
        setCaption(newCaption);
        socket.sendMessage(remoteJid, {
          text: `Caption berhasil diubah menjadi: ${newCaption}`,
        });
      } else {
        socket.sendMessage(remoteJid, {
          text: "Format !setcapt tidak valid. Gunakan: !setcapt caption_baru",
        });
      }
      break;

    // Menanggapi pesan media
    case 'PAY':
      await pay(socket, remoteJid, m);
      break;

          // Menambahkan perintah lain yang dapat diakses oleh semua senderNumber di sini
          case 'MENU':
            await handleCommand(socket, remoteJid, m, 'menu');
            break;
          case 'ADD':
            if (words.length >= 2) {
              const category = words[1].toLowerCase();
              const description = words.slice(2).join(' ');
              await handleAddCommand(socket, remoteJid, category, description, m);
            } else {
              const adMessage = "Format !add tidak valid. Gunakan: !add category atau !add category description";
              const quotedMessage = m.messages[0];
              const addMessage = {
                text: adMessage,
                quoted: quotedMessage,
              };
              socket.sendMessage(remoteJid, addMessage, { quoted: quotedMessage });
            }
            break;

          case 'DELETE':
            if (words.length >= 2) {
              const category = words[1].toLowerCase();
              const description = words.slice(2).join(' ');
              await handleDeleteCommand(socket, remoteJid, category, description, m);
            } else {
              const salMessage = "Format !delete tidak valid. Gunakan: !delete category atau !delete category description";
              const quotedMessage = m.messages[0];
              const allText = {
                text: salMessage,
                quoted: quotedMessage,
              };
              socket.sendMessage(remoteJid, allText, { quoted: quotedMessage });
            }
            break;

          default:
            if (words[0].startsWith('!')) {
              const category = words[0].substring(1).toLowerCase();
              await handleCategoryCommand(socket, remoteJid, category, m);
            } else {
              console.log("Ignoring unknown command:", m.messages[0].message.conversation);
            }
            break;
        }

      } catch (error) {
        console.error('Error : ', error);
      }
    }
  });
}

connectToWhatsapp().catch((err) => {
  console.error("Error in WhatsApp connection:", err);
});
