const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const Pino = require("pino");
const { handleOrderMessage } = require("./order.js");
const { handleAddCommand } = require("./add-group-id.js");
const { handleMLCommand, handleFFCommand, handlePULSACommand, handlePLNCommand,} = require("./produk.js");
const { handleMenuCommand } = require("./menu.js");
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
      console.log("Pesan masuk dari ID Grup:", remoteJid);

      if (m.messages[0].message.conversation.startsWith(".add")) {
        await handleAddCommand(socket, remoteJid, m.messages[0].message.conversation);
      } else if (m.messages[0].message.conversation.toUpperCase() === 'MENU') {
        await handleMenuCommand(socket, remoteJid);
      } else if (m.messages[0].message.conversation.toUpperCase() === 'ML') {
        await handleMLCommand(socket, remoteJid);
      } else if (m.messages[0].message.conversation.toUpperCase() === 'FF') {
        await handleFFCommand(socket, remoteJid);
      } else if (m.messages[0].message.conversation.toUpperCase() === 'PULSA') {
        await handlePULSACommand(socket, remoteJid);
      } else if (m.messages[0].message.conversation.toUpperCase() === 'PLN') {
        await handlePLNCommand(socket, remoteJid);
      } else {
        // Handle other cases or commands here
      }

      const message = m.messages[0].message.conversation;
      handleOrderMessage(socket, remoteJid, message);
    }
  });
}

connectToWhatsapp().catch((err) => {
  console.error("Error in WhatsApp connection:", err);
});
