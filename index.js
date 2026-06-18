const { Client, LocalAuth } = require("whatsapp-web.js");
const express = require("express");
const qrcode = require("qrcode-terminal");
const app = express();

app.use(express.json());

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    }
});

let qrCode = "";

client.on("qr", (qr) => {
    qrCode = qr;
    qrcode.generate(qr, { small: true });
    console.log("QR_RECEIVED_SUCCESS");
});

client.on("ready", () => {
    qrCode = "READY";
    console.log("WhatsApp Connected Successfully!");
});

app.get("/", (req, res) => {
    if (qrCode === "READY") res.send("WhatsApp Connected!");
    else if (qrCode) res.send(`<pre>${qrCode}</pre>`);
    else res.send("Generating QR...");
});

app.post("/api/send-message", async (req, res) => {
    const { number, message } = req.body;
    try {
        const chatId = number.includes("@c.us") ? number : `${number}@c.us`;
        await client.sendMessage(chatId, message);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

client.initialize();

const port = process.env.PORT || 8080;
app.listen(port, () => console.log("Server running on port " + port));
