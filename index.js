const { Client, LocalAuth } = require("whatsapp-web.js");
const express = require("express");
const app = express();

app.use(express.json());

// كودك الأصلي كما هو مع توجيه بروفايل كروميوم بعيداً عن الـ Volume لتخطي القفل
const client = new Client({
    authStrategy: new LocalAuth(), // كودك الأصلي والداتا القديمة محفوظة ومحمية هنا
    puppeteer: {
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
            "--blink-settings=imagesEnabled=false",
            // السطرين دول هما اللي هيحلوا مشكلة المتصفح المعلق نهائياً من غير ما يلمسوا داتا الواتساب:
            "--user-data-dir=/tmp/chromium_clean_profile",
            "--disable-single-click-autofill"
        ]
    }
});

let qrHtml = "<h1>جاري توليد كود الـ QR... اعمل تحديث كمان ثواني</h1>";

client.on("qr", (qr) => {
    console.log("كود QR جديد جاهز على المتصفح!");
    qrHtml = `
        <div style="text-align: center; margin-top: 50px; font-family: Arial, sans-serif;">
            <h1>اسكان لكود الـ QR لربط الواتساب</h1>
            <p>افتح الواتساب > الأجهزة المرتبطة > ربط جهاز</p>
            <div style="margin: 20px auto;">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}" alt="QR Code" style="border: 10px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.1);"/>
            </div>
            <p style="color: red;">يعاد التوليد تلقائياً إذا تغير الكود</p>
        </div>
    `;
});

client.on("ready", () => {
    qrHtml = "<h1>WhatsApp Connected Successfully!</h1>";
    console.log("WhatsApp Connected!");
});

app.get("/", (req, res) => {
    res.send(qrHtml);
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
