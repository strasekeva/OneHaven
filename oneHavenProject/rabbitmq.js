// ---- V datoteki rabbitmq.js ----

const amqp = require("amqplib");
const WebSocket = require("ws");

let channel;
let connection;
let isListening = false;
const QUEUE_NAME = "new_reservations";
const wss = new WebSocket.Server({ port: 8080 });

// 1. Interna vrsta za vsa prejeta sporočila
const messageQueue = [];

// Funkcija za obveščanje WebSocket klientov
const broadcastToClients = (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

const connectRabbitMQ = async () => {
  try {
    if (connection) {
      console.log("Povezava z RabbitMQ že obstaja.");
      return;
    }

    console.log("Vzpostavljam povezavo z RabbitMQ...");
    connection = await amqp.connect("amqp://localhost");
    channel = await connection.createChannel();
    // Nastavimo prefetch (opcijsko), da se naenkrat obdeluje samo 1 sporočilo 
    // channel.prefetch(1);
    
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    console.log(`Queue "${QUEUE_NAME}" je bila uspešno inicializirana.`);

    connection.on("close", async () => {
      console.log("RabbitMQ povezava zaprta. Poskus ponovnega povezovanja...");
      connection = null;
      channel = null;
      setTimeout(connectRabbitMQ, 5000);
    });

    connection.on("error", (err) => {
      console.error("Napaka na RabbitMQ povezavi:", err);
    });

    process.on("exit", async () => {
      console.log("Zapiram RabbitMQ povezavo...");
      if (channel) await channel.close();
      if (connection) await connection.close();
    });
  } catch (error) {
    console.error("Napaka pri povezavi z RabbitMQ:", error);
    setTimeout(connectRabbitMQ, 5000);
  }
};

const sendToQueue = async (message) => {
  try {
    if (!channel) {
      throw new Error("RabbitMQ kanal ni inicializiran.");
    }
    console.log("Pošiljam sporočilo v queue:", QUEUE_NAME);
    channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });
    console.log("Sporočilo uspešno poslano.");
  } catch (error) {
    console.error("Napaka pri pošiljanju sporočila v RabbitMQ:", error);
    if (!connection) await connectRabbitMQ();
  }
};

// 2. Startamo listener, ki bo sporočila "nabiral" v messageQueue
const startQueueListener = async () => {
  if (isListening) {
    console.log("RabbitMQ poslušalec že teče.");
    return;
  }

  try {
    console.log("Zagon RabbitMQ poslušalca...");
    if (!connection) {
      await connectRabbitMQ();
    }

    channel.consume(
      QUEUE_NAME,
      (msg) => {
        const event = JSON.parse(msg.content.toString());
        console.log("Prejeto sporočilo:", event);

        // Namesto takojšnjega pošiljanja vsem, 
        // sporočilo dodamo v interno vrsto
        messageQueue.push({ event, msg });
      },
      { noAck: false } // Rabimo ack, da potrdimo obdelavo
    );

    isListening = true;

    connection.on("close", () => {
      console.log("RabbitMQ povezava zaprta. Poslušalec zaustavljen.");
      isListening = false;
    });

    // 3. Uvedemo časovni interval za pošiljanje sporočil po WebSocket:
    setInterval(() => {
      if (messageQueue.length > 0) {
        // Vzamemo prvo sporočilo iz vrste
        const { event, msg } = messageQueue.shift();

        // Pošljemo sporočilo naprej po WebSocket
        broadcastToClients(event);

        // Tu lahko izvedeš ack, ko je sporočilo uspešno posredovano
        channel.ack(msg);

        console.log("Sporočilo poslano vsem clientom (z zamikom):", event);
      }
    }, 3000); // Vsake 3 sekunde (poljubno prilagodi)
  } catch (err) {
    console.error("Napaka pri zagonu RabbitMQ poslušalca:", err);
  }
};

module.exports = { connectRabbitMQ, sendToQueue, startQueueListener };