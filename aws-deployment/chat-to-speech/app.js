const express = require('express');
const app = express();
const sls = require('serverless-http');
const { text2speech, text2ssml, ssml2speech, getSpeech } = require("./lib/awsPolly");

// const cors = require('cors');
// app.use(cors())
app.use(express.json());

app.get('/', async (req, res, next) => {
    res.send('ping');
})

app.post('/text2speech', async function (req, res) {
    const { text } = JSON.parse(req.body);
    res.set({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
    })

    try {
        // const id = await text2speech(text);
        const ssml = text2ssml(text);
        const id = await ssml2speech(ssml);

        if (!id)
            throw new Error("Text to speech conversion failed");

        res.status(200).json({ speechTaskId: id });
    }
    catch (e) {
        res.status(500);
    }
})

app.get('/speech', async function (req, res) {
    const { speechTaskId } = req.query;
    res.set({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
    })

    try {
        const awsRes = await getSpeech(speechTaskId);

        if (!awsRes)
            throw new Error("Get speech request failed");

        res.status(200).json(awsRes);
    } catch (e) {
        res.status(500);
    }
})

// app.listen(3000, () => console.log('http://localhost:3000'))
module.exports.server = sls(app)
