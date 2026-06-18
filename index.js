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

// هنا بنقول للسيرفر أول ما يطلع كود الـ QR، اطلب كود ربط مباشر للرقم ده
client.on("qr", async (qr) => {
    console.log("تنبيه: السيرفر جاهز للربط بالكود!");
    try {
        // اكتب رقم موبايل الشغل هنا بكود الدولة وبدون علامة +
        // مثال: "201272631855"
        const myNumber = "20XXXXXXXXXX"; 
        
        const pairingCode = await client.requestPairingCode(myNumber);
        console.log("==========================================");
        console.log(`كود الربط الخاص بك هو: ${pairingCode}`);
        console.log("==========================================");
    } catch (err) {
        console.log("خطأ في طلب كود الربط:", err.message);
    }
});

client.on("ready", () => {
    console.log("WhatsApp Connected Successfully!");
});

app.get("/", (req, res) => {
    res.send("السيرفر شغال، بص على الـ Logs عشان تشوف كود الربط!");
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
