const { Client, LocalAuth } = require("whatsapp-web.js");
const express = require("express");
const qrcode = require("qrcode-terminal");
const app = express();

app.use(express.json());

// إعدادات خاصة لتسريع المتصفح 100% على السيرفرات الضعيفة
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-accelerated-2d-canvas",
            "--no-first-run",
            "--no-zygote",
            "--single-process",
            "--disable-gpu",
            "--disable-extensions",
            "--blink-settings=imagesEnabled=false" // السطر ده بيقفل الصور تماماً عشان الصفحة تبقى خفيفة ريشة
        ]
    }
});

// أول ما الكود يجهز هيطبع علطول جوه اللوجز
client.on("qr", (qr) => {
    console.log("\n==========================================");
    console.log("الـ QR كود جاهز.. افتح الموبايل واسكن حالا:");
    console.log("==========================================\n");
    
    qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
    console.log("WhatsApp Connected Successfully!");
});

app.get("/", (req, res) => {
    res.send("السيرفر شغال وزي الفل.. بص على اللوجز عشان تسكش الـ QR!");
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
