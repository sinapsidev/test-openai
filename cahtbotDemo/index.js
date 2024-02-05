const OpenAI = require("openai");
const express = require("express");
const path = require("path");
const cors = require("cors");
const app = express();
 
// chiamata a chatGPT
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const context = "Sei un operatore del servizio clienti.Puoi rispondere alle domande solo con informazioni dalle seguenti risorse:dati_personali, dotazioni_strumenti, dotazioni_consumo, dotazioni_automezzi, buste_paga, rapporti, ruoli, presenze_non_bloccate, presenze_bloccate, presenze,rimborsi, non_conformità, riconoscimenti, abilitazioni_assegnate, mansioni_per_addetti, documenti, fasi_interventi_non_completate, fasi_verifiche_non_completate.Non devi rispondere a domande al di fuori dell'ambito delle risorse.";

async function askChatGPT(content) {
    const completion = await openai.chat.completions.create({
        messages: [{ role: "system", content:context }, { role: "user", content }],
        model: "gpt-3.5-turbo",
        // model: "ft:gpt-3.5-turbo-0613:personal::8oqepVTI",
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