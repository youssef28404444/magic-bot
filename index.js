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

// شيلنا طلب الكود التلقائي من هنا عشان ما يفضلش يجدد ويهنج

client.on("ready", () => {
    console.log("WhatsApp Connected Successfully!");
});

// الصفحة الرئيسية للسيرفر
app.get("/", (req, res) => {
    res.send("اضغط على الرابط ده عشان يطلعلك كود الربط: <a href='/get-code'>اضغط هنا</a>");
});

// الرابط ده مش هيطلع الكود غير لما أنت تفتحه بنفسك، وهيفضل ثابت على الشاشة!
app.get("/get-code", async (req, res) => {
    try {
        // اكتب رقم موبايل الشغل هنا بكود الدولة (مثال: 201272631855)
        const myNumber = "201272631855"; 
        
        const pairingCode = await client.requestPairingCode(myNumber);
        res.send(`<h1>كود الربط الخاص بك هو: <span style='color:red;'>${pairingCode}</span></h1><p>اكتبه في الموبايل حالا!</p>`);
    } catch (err) {
        res.status(500).send("خطأ في طلب الكود: " + err.message);
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
