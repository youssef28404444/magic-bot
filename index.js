const { Client, LocalAuth } = require("whatsapp-web.js");
const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();

app.use(express.json());

// الكود ده بيمسح ملف القفل الملعون تلقائياً أول ما السيرفر يفتح وقبل ما المتصفح يشتغل
const lockPath = path.join(__dirname, '.wwebjs_auth', 'session', 'SingletonLock');
if (fs.existsSync(lockPath)) {
    try {
        fs.unlinkSync(lockPath);
        console.log("تم حذف ملف الـ Lock القديم بنجاح، الداتا القديمة راجعة...");
    } catch (err) {
        console.log("فشل حذف ملف الـ Lock أو أنه ممسوح بالفعل:", err.message);
    }
}

const client = new Client({
    // رجعنا للفولدر القديم بتاعك الأصلي اللي فيه الداتا
    authStrategy: new LocalAuth({
        dataPath: './' 
    }),
    puppeteer: {
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
            "--blink-settings=imagesEnabled=false",
            "--no-zygote",
            "--single-process"
        ]
    }
});

let qrHtml = "<h1>جاري توليد كود الـ QR... اعمل تحديث كمان ثواني</h1>";

client.on("qr", (qr) => {
    console.log("كود QR جديد جاهز!");
    qrHtml = `
        <div style="text-align: center; margin-top: 50px; font-family: Arial, sans-serif;">
            <h1>اسكان لكود الـ QR لربط الواتساب</h1>
            <p>افتح الواتساب > الأجهزة المرتبطة > ربط جهاز</p>
            <div style="margin: 20px auto;">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}" alt="QR Code" style="border: 10px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.1);"/>
            </div>
        </div>
    `;
});

client.on("ready", () => {
    qrHtml = "<h1 style='text-align:center; margin-top:50px; color:green; font-family:Arial;'>WhatsApp Connected Successfully!</h1>";
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
