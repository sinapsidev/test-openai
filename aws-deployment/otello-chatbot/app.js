const express = require('express');
const app = express();
const sls = require('serverless-http');
const { askGPT } = require("./lib/openaiApi");

// const cors = require('cors');
// app.use(cors())
app.use(express.json());

app.get('/', async (req, res, next) => {
    res.send('ping');
})

app.post('/askGPT', async (req, res, next) => {
    const { botReq, tenant, access_token, id_addetto } = req.body;
    const credentials = { tenant, access_token, id_addetto }
    res.set({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
    })

    try {
        const msg = await askGPT(botReq, credentials);
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