const express = require('express');
const app = express();
const sls = require('serverless-http');
const { askGPT } = require("./gptapiTuned");

// const cors = require('cors');
// app.use(cors())
app.use(express.json());

app.get('/', async (req, res, next) => {
    res.send('ping');
})

app.post('/askGPT', async (req, res, next) => {
    const { botReq, access_token, id_addetto } = req.body;

    try {
        const msg = await askGPT(botReq, access_token, id_addetto);

        if (msg)
            res.status(200).json({ botRes: msg });
        else
            res.status(500).send();
    } catch (e) {
        console.log(e);
        res.status(500).send();
    }
})

// app.listen(8080, () => console.log('http://localhost:8080'))
   module.exports.server = sls(app)
