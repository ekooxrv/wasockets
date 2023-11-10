const fs = require('fs').promises;

async function handleMLCommand(socket, remoteJid) {
  try {
    const mlData = await fs.readFile('./database/json/ml.json', 'utf-8');
    const mlJson = JSON.parse(mlData);
    const mlItems = mlJson.items.join('\n');

    const reply = `ML Details:\n\n${mlItems}`;

    await socket.sendMessage(remoteJid, { text: reply }, 'extendedTextMessage');
  } catch (error) {
    console.error('Error reading or sending ML details:', error);
  }
}

async function handleFFCommand(socket, remoteJid) {
  try {
    const ffData = await fs.readFile('./database/json/ff.json', 'utf-8');
    const ffJson = JSON.parse(ffData);
    const ffItems = ffJson.items.join('\n');

    const reply = `FF Details:\n\n${ffItems}`;

    await socket.sendMessage(remoteJid, { text: reply }, 'extendedTextMessage');
  } catch (error) {
    console.error('Error reading or sending FF details:', error);
  }
}

async function handlePULSACommand(socket, remoteJid) {
  try {
    const pulsaData = await fs.readFile('./database/json/pulsa.json', 'utf-8');
    const pulsaJson = JSON.parse(pulsaData);
    const pulsaItems = pulsaJson.items.join('\n');

    const reply = `PULSA Details:\n\n${pulsaItems}`;

    await socket.sendMessage(remoteJid, { text: reply }, 'extendedTextMessage');
  } catch (error) {
    console.error('Error reading or sending PULSA details:', error);
  }
}

async function handlePLNCommand(socket, remoteJid) {
  try {
    const plnData = await fs.readFile('./database/json/pln.json', 'utf-8');
    const plnJson = JSON.parse(plnData);
    const plnItems = plnJson.items.join('\n');

    const reply = `PLN Details:\n\n${plnItems}`;

    await socket.sendMessage(remoteJid, { text: reply }, 'extendedTextMessage');
  } catch (error) {
    console.error('Error reading or sending PLN details:', error);
  }
}

module.exports = { handleMLCommand, handleFFCommand, handlePULSACommand, handlePLNCommand };
