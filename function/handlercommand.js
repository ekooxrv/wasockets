const { default: makeWASocket, useMultiFileAuthState, MessageType } = require("@whiskeysockets/baileys");
const Pino = require("pino");
const { handleOrderMessage } = require("./order.js");
const { handleAddCommand } = require("./add-group-id.js");
const { handleCommand } = require("./produk.js");
const { pay } = require("./pay.js");

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

  const fs = require('fs').promises; // Import modul fs untuk membaca file

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
        // Pada bagian "messages.upsert"
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


  case 'PAY':
    // Handler untuk semua pengirim, tidak perlu memeriksa pemilik
    await pay(socket, remoteJid, m);
    break;
  // Menambahkan perintah lain yang dapat diakses oleh semua senderNumber di sini
  case 'MENU':
    await handleCommand(socket, remoteJid, m, 'menu');
    break;
  case 'ML':
    await handleCommand(socket, remoteJid, m, 'ml');
    break;
  case 'FF':
    await handleCommand(socket, remoteJid, m, 'ff');
    break;
  case 'PULSA':
    await handleCommand(socket, remoteJid, m, 'pulsa');
    break;
  case 'PLN':
    await handleCommand(socket, remoteJid, m, 'pln');
    break;
  // Kasus lainnya di sini...
  default:
    console.log("Ignoring unknown command:", m.messages[0].message.conversation);
    break;
}

      } catch (error) {
        console.error('Error reading owner.json:', error);
      }
    }
  });
}

connectToWhatsapp().catch((err) => {
  console.error("Error in WhatsApp connection:", err);
});
