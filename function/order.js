const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const apiKey = "041d6f82-c3f9-5100-9012-0671ce41f998";
const username = "gefuloDRXEEg";

function handleOrderMessage(socket, remoteJid, message, m) {
  if (message.startsWith("!order")) {
    const words = message.split(" ");
    if (words.length >= 3) {
      const buyerSkuCode = words[1];

      let gameId, serverId;

      // Check if the message contains 'ML' (Mobile Legends)
      if (message.includes("ML")) {
        const gameIdAndServer = words[2].split("-");
        gameId = gameIdAndServer[0];
        serverId = gameIdAndServer[1];
      } else {
        // If it doesn't contain 'ML', gameId contains the entire third word after !order
        gameId = words[2];
        serverId = ""; // Adjust as per your application logic
      }

      const reffId = "RVN" + Math.floor(1000 + Math.random() * 9000).toString();
      const signData = username + apiKey + reffId;
      const sign = crypto.createHash("md5").update(signData).digest("hex");
      console.log("Sign:", sign);

      const requestDataA = {
        username: username,
        buyer_sku_code: buyerSkuCode,
        customer_no: gameId + serverId,
        ref_id: reffId,
        sign: sign,
      };

      axios
        .post("https://api.digiflazz.com/v1/transaction", requestDataA)
        .then((responseA) => {
          console.log("Response Data A:", responseA.data);

          // Check if the message contains 'ML' (Mobile Legends)
          if (message.includes("ML")) {
            const requestDataB = new URLSearchParams();
            requestDataB.append(
              "key",
              "FXfgGWzuTpCCcTYVI8OOz2h05BMefq23qIOtF6NGNco3mO4kAZ9gYS7ITH0ceFcv"
            );
            requestDataB.append("sign", "0ef4686aecafb573d4b8ddad2bf5f724");
            requestDataB.append("type", "get-nickname");
            requestDataB.append("code", "mobile-legends");
            requestDataB.append("target", gameId);
            requestDataB.append("additional_target", serverId);

            const configB = {
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
            };

            axios
              .post(
                "https://vip-reseller.co.id/api/game-feature",
                requestDataB,
                configB
              )
              .then((responseB) => {
                console.log("Response Data B:", responseB.data);

                // Read success message from config.json
                const configFilePath = path.join(
                  __dirname,
                  "../database/json/struk.json"
                );
                const configData = fs.readFileSync(configFilePath);
                const config = JSON.parse(configData);
                let successMessage = config.successMessage;
                successMessage = successMessage
                  .replace("[ref_id]", reffId)
                  .replace("[customer_no]", gameId + serverId)
                  .replace("[buyer_sku_code]", buyerSkuCode)
                  .replace("[price]", responseA.data.data.price)
                  .replace("[status]", responseA.data.data.status)
                  .replace("[message]", responseA.data.data.message)
                  .replace("[nickname]", responseB.data.data);

                console.log("Success Message:", successMessage);

                const quotedMessage = m ? m.messages[0] : null;
                const message = {
                  text: successMessage,
                  quoted: quotedMessage,
                };
                socket.sendMessage(remoteJid, message, {
                  quoted: quotedMessage,
                });
              })
              .catch((errorB) => {
                console.error("Error in Request B:", errorB.message);
                socket.sendMessage(remoteJid, {
                  text: "Terjadi kesalahan dalam permintaan B.",
                });
              });
          } else {
            // Read success message from config.json and replace [nickname] with '-'
            const configFilePath = path.join(
              __dirname,
              "../database/json/struk.json"
            );
            const configData = fs.readFileSync(configFilePath);
            const config = JSON.parse(configData);
            let successMessage = config.successMessage;

            successMessage = successMessage
              .replace("[ref_id]", reffId)
              .replace("[customer_no]", gameId + serverId)
              .replace("[buyer_sku_code]", buyerSkuCode)
              .replace("[price]", responseA.data.data.price)
              .replace("[status]", responseA.data.data.status)
              .replace("[message]", responseA.data.data.message)
              .replace("[nickname]", "-"); // Replace [nickname] with '-'

            console.log("Success Message:", successMessage);

            const quotedMessage = m ? m.messages[0] : null; // Check if m is defined
            const message = {
              text: successMessage,
              quoted: quotedMessage,
            };
            socket.sendMessage(remoteJid, message, { quoted: quotedMessage });
          }
        })
        .catch((errorA) => {
          console.error("Error in Request A:", errorA.message);
          socket.sendMessage(remoteJid, {
            text: "Terjadi kesalahan dalam permintaan A.",
          });
        });
    } else {
      socket.sendMessage(remoteJid, {
        text: "Format !order tidak valid. Gunakan: !order buyerskucode idgame-idserver",
      });
    }
  }
}

module.exports = { handleOrderMessage };
