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

let isCodeRequested = false;

// الحدث ده بيتنفذ أول ما صفحة الواتساب تفتح وتكون جاهزة تماماً لطلب الكود
client.on("qr", async (qr) => {
    if (!isCodeRequested) {
        isCodeRequested = true;
        console.log("الصفحة جاهزة ومستقرة تماماً.. جاري طلب كود الأرقام الآن...");
        
        try {
            // غير الرقم اللي تحت ده وحط رقم الشغل بتاعك بين علامتين التنصيص
            // مثال: const myNumber = "201272631855";
            const myNumber = "201272631855"; 
            
            const pairingCode = await client.requestPairingCode(myNumber);
            console.log("\n==========================================");
            console.log(`كود الربط (Pairing Code) الخاص بك هو: ${pairingCode}`);
            console.log("==========================================\n");
        } catch (err) {
            console.log("خطأ أثناء طلب كود الربط:", err.message);
            // لو حصل خطأ بنخليه يعيد المحاولة بعد 10 ثواني تلقائياً
            setTimeout(() => { isCodeRequested = false; }, 10000);
        }
    }
});

client.on("ready", () => {
    console.log("WhatsApp Connected Successfully!");
});

app.get("/", (req, res) => {
    res.send("السيرفر شغال!");
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
