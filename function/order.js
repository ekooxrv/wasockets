// order.js
const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const apiKey = "dev-bb9d48c0-69be-11ee-bb22-053566ba10ea";
const username = "haxemagnOyao";

async function handleOrderMessage(socket, remoteJid, words, m) {
    console.log('Handling !order command:', words);
    const ownerFilePath = path.join(__dirname, "../database/json/owner.json");
    const ownerData = fs.readFileSync(ownerFilePath);
    const ownerConfig = JSON.parse(ownerData);
    const ownerNumber = ownerConfig.owner.number;
  
    const senderNumber = m.messages[0].key.participant || m.messages[0].key.remoteJid;
  
    // Check if sender is the owner
    const isOwner = senderNumber === ownerNumber;
  
    if (!isOwner) {
      socket.sendMessage(remoteJid, {
        text: "Maaf, Anda tidak memiliki izin untuk menggunakan perintah ini.",
      });
      return; // Stop further execution if not the owner
    }
  
    let buyerSkuCode, gameId, serverId;
  
    if (words.length >= 3) {
      buyerSkuCode = words[1];
  
      if (words[2] && words[2].includes("MLER")) {
        const gameIdAndServer = words[2].split("-");
        gameId = gameIdAndServer[0];
        serverId = gameIdAndServer[1];
      } else {
        gameId = words[2];
        serverId = "";
      }
    } else {
      socket.sendMessage(remoteJid, {
        text: "Format !order tidak valid. Gunakan: !order buyerskucode idgame-idserver",
      });
      return;
    }
  
    // Continue with the rest of your logic...
    const reffId = "RVN" + Math.floor(1000 + Math.random() * 9000).toString();
    const signData = username + apiKey + reffId;
    const sign = crypto.createHash("md5").update(signData).digest("hex");
    console.log("Sign:", sign);
    
    const requestDataA = {
        testing: true,
        username: username,
        buyer_sku_code: buyerSkuCode,
        customer_no: gameId + serverId,
        ref_id: reffId,
        sign: sign,
    };
    
    // Split gameId into userId and serverId
    const [userId, zoneId] = gameId.split('-');
    
    const requestDataB = {
        userId: userId,
        zoneId: zoneId,
        // Add other necessary data for API B request
    };
    
    try {
        // Make the first request to API A
        const responseA = await axios.post("https://api.digiflazz.com/v1/transaction", requestDataA);
        console.log("Response Data A:", responseA.data);
    
        let nickname = "-";
    
            // Make the second request to API B for Mobile Legends
            const responseB = await axios.get(`https://api.hmdan214.repl.co/api/game/mobile-legends?userid=${requestDataB.userId}&zoneid=${requestDataB.zoneId}`);
            console.log("Response Data B:", responseB.data.result.name);
    
            // Use nickname from API B response
            nickname = responseB.data.result.name;
    
        // Continue with the rest of your logic...
        const configFilePath = path.join(__dirname, "../database/json/struk.json");
        const configData = fs.readFileSync(configFilePath);
        const config = JSON.parse(configData);
        let successMessage = config.successMessage
            .replace("[nickname]", nickname);
    
        successMessage = successMessage
            .replace("[ref_id]", reffId)
            .replace("[customer_no]", gameId + serverId)
            .replace("[buyer_sku_code]", buyerSkuCode)
            .replace("[price]", responseA.data.data.price)
            .replace("[status]", responseA.data.data.status)
            .replace("[message]", responseA.data.data.message);
    
        console.log("Success Message:", successMessage);
    
        const quotedMessage = m.messages[0];
        const message = {
            text: successMessage,
            quoted: quotedMessage,
        };
        socket.sendMessage(remoteJid, message, {
            quoted: quotedMessage,
        });
    } catch (error) {
        console.error("Error:", error.message);
        socket.sendMessage(remoteJid, {
            text: "Terjadi kesalahan dalam permintaan.",
        });
    }
}

module.exports = { handleOrderMessage };
