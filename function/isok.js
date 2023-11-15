const { default: makeWASocket, useMultiFileAuthState, Mimetype } = require("@whiskeysockets/baileys");
const Pino = require("pino");
const { handleOrderMessage } = require("./order.js");
const { handleAddCommand } = require("./add-group-id.js");
const { handleMLCommand, handleFFCommand, handlePULSACommand, handlePLNCommand } = require("./produk.js");
const { handleMenuCommand } = require("./menu.js");
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

// ...

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
      const ownersData = await fs.readFile('./database/json/owner.json', 'utf-8');
      const owners = JSON.parse(ownersData);

      // Periksa apakah senderNumber adalah owner
      if (senderNumber === owners.owner.number) {
        switch (m.messages[0].message.conversation.toUpperCase()) {
          case 'MENU':
            await handleMenuCommand(socket, remoteJid, m);
            break;
          case 'ML':
            await handleMLCommand(socket, remoteJid, m);
            break;
          case 'FF':
            await handleFFCommand(socket, remoteJid, m);
            break;
          case 'PULSA':
            await handlePULSACommand(socket, remoteJid, m);
            break;
          case 'PLN':
            await handlePLNCommand(socket, remoteJid, m);
            break;
          case 'PAY':
            await pay(socket, remoteJid, m);
            break;
          default:
            // Handle other cases or commands here
            const message = m.messages[0].message.conversation;
            handleOrderMessage(socket, remoteJid, message, m);
        }
      } else {
        console.log(`Akses ditolak untuk ${senderNumber}. Bukan owner.`);
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
