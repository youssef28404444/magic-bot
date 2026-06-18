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

let qrCodeText = "";

// كل ما الواتساب يولد كود QR جديد أو يجدده، السطر ده هيلقطه أوتوماتيك
client.on("qr", (qr) => {
    qrCodeText = qr;
    
    // 1. هيطبعه لك كـ QR مرسوم جوه الـ Logs في Railway عشان تسكانه علطول
    console.log("\n--- كود QR جديد جاهز للمسح ---");
    qrcode.generate(qr, { small: true });
    console.log("-------------------------------\n");
});

client.on("ready", () => {
    qrCodeText = "READY";
    console.log("WhatsApp Connected Successfully!");
});

// لو حبيت تشوف الكود بنص عدي برضه من المتصفح
app.get("/", (req, res) => {
    if (qrCodeText === "READY") {
        res.send("<h1>WhatsApp Connected!</h1>");
    } else if (qrCodeText) {
        res.send(`<h1>السيرفر شغال</h1><p>بص على الـ Logs في Railway هتلاقي الـ QR كود بيتحدث هناك أوتوماتيك.</p>`);
    } else {
        res.send("<h1>جاري توليد كود الـ QR... بص على اللوجز</h1>");
    }
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
