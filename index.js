const { Client, LocalAuth } = require("whatsapp-web.js");
const express = require("express");
const app = express();

app.use(express.json());

// إعداد عميل الواتساب مع حل مشكلة قفل المتصفح على الاستضافات
const client = new Client({
    authStrategy: new LocalAuth({
        // هنغير اسم الفولدر لاسم جديد تماماً ملمسهوش السيرفر قبل كده
        dataPath: './wwebjs_new_session' 
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
            "--single-process",
            // السطر ده هيجبر كروميوم يفتح بروفايل معزول تماماً جوة السيرفر بعيد عن الـ Volume
            "--user-data-dir=/tmp/puppeteer_profile" 
        ]
    }
});

let qrHtml = "<h1>جاري توليد كود الـ QR... اعمل تحديث كمان ثواني</h1>";

client.on("qr", (qr) => {
    console.log("كود QR جديد جاهز على المتصفح!");
    // توليد صفحة كود الـ QR
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
    qrHtml = "<h1 style='text-align:center; margin-top:50px; color:green; font-family:Arial;'>WhatsApp Connected Successfully!</h1>";
    console.log("WhatsApp Connected!");
});

// الصفحة الرئيسية لعرض الـ QR كود أو حالة الاتصال
app.get("/", (req, res) => {
    res.send(qrHtml);
});

// API إرسال الرسائل
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

// تشغيل العميل
client.initialize();

const port = process.env.PORT || 8080;
app.listen(port, () => console.log("Server running on port " + port));
