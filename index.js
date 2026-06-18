const { Client, LocalAuth } = require("whatsapp-web.js");
const express = require("express");
const app = express();

app.use(express.json());

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    }
});

let codeRequested = false;

// أول ما السيرفر يلقط كود الـ QR المخفي، يستنى 5 ثواني ويطلب كود الأرقام براحته
client.on("qr", async (qr) => {
    if (!codeRequested) {
        codeRequested = true;
        console.log("تنبيه: المتصفح جاهز.. جاري طلب كود الأرقام الآن...");
        
        // تأخير لمدة 5 ثواني عشان نضمن استقرار الاتصال مع سيرفر الواتساب
        setTimeout(async () => {
            try {
                // اكتب رقم موبايل الشغل هنا بكود الدولة (مثال: 201272631855)
                const myNumber = "201272631855"; 
                
                const pairingCode = await client.requestPairingCode(myNumber);
                console.log("\n==========================================");
                console.log(`كود الربط (Pairing Code) الخاص بك هو: ${pairingCode}`);
                console.log("==========================================\n");
            } catch (err) {
                console.log("خطأ في طلب كود الربط:", err.message);
                codeRequested = false; // عشان يعيد المحاولة لو فشل
            }
        }, 5000);
    }
});

client.on("ready", () => {
    console.log("WhatsApp Connected Successfully!");
});

app.get("/", (req, res) => {
    res.send("السيرفر شغال، بص على الـ Logs عشان تشوف كود الأرقام الجديد!");
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
