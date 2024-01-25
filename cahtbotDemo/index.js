const OpenAI = require("openai");
const express = require("express");
const path = require("path");
const cors = require("cors");
const app = express();
 
// chiamata a chatGPT
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function askChatGPT(content) {
    const completion = await openai.chat.completions.create({
        messages: [{ role: "system", content }],
        model: "gpt-3.5-turbo",
    });

    console.log(completion.choices);
    // if (completion.choices[0].finish_reason == 'stop')
        return completion.choices[0].message.content;
}

// server
app.use(express.json());
app.use(cors());
app.use(express.static(__dirname + '/client'));


// endpoints
app.post("/chat", async (req, res) => {
    const { botReq } = req.body;

    try {
        const msg = await askChatGPT(botReq);

        res.status(200).json({ botRes: msg });

    } catch (e) {
        console.log('Error:' + e);
    }
});


app.listen(process.env.PORT, () => {
    console.log(`live on: http://localhost:${process.env.PORT}`);
});