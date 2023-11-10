const fs = require("fs");

function getAllowedGroups() {
  try {
    const data = fs.readFileSync("./database/json/allowedGroups.json");
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

function saveAllowedGroups(groups) {
  fs.writeFileSync("allowedGroups.json", JSON.stringify(groups, null, 2));
}

async function handleAddCommand(socket, remoteJid, message) {
  const words = message.split(" ");
  if (words.length === 2) {
    const newGroup = words[1];
    const allowedGroups = getAllowedGroups();

    if (!allowedGroups.includes(newGroup)) {
      allowedGroups.push(newGroup);
      saveAllowedGroups(allowedGroups);
      await socket.sendMessage(remoteJid, {
        text: `Grup ${newGroup} telah ditambahkan ke daftar yang diizinkan.`,
      });
    } else {
      await socket.sendMessage(remoteJid, {
        text: `Grup ${newGroup} sudah ada dalam daftar yang diizinkan.`,
      });
    }
  } else {
    await socket.sendMessage(remoteJid, {
      text: "Format perintah tidak valid. Gunakan: `.add <NamaGrup>`",
    });
  }
}

module.exports = {
  handleAddCommand,
};
