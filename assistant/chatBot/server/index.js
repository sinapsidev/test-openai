const express = require("express");
const path = require("path");
const cors = require("cors");
const { askGPT, createThread, deleteThread } = require("./gptapi");
const app = express();


// server
app.use(express.json());
app.use(cors());
app.use(express.static(__dirname + '/../client'));


// endpoints
app.post("/askGPT", async (req, res) => {
    const { botReq, session_id } = req.body;

    try {
        const msg = await askGPT(botReq, session_id);

        if(msg)
            res.status(200).json({ botRes: msg });
        else
            res.status(500).send();
    } catch (e) {
        console.log(e);
    }
});
app.post("/createChat", async (req, res) => {
    try {
        const session_id = await createThread();

        res.status(200).json({ session_id });

    } catch (e) {
        console.log(e);
    }
});
app.post("/deleteChat", async (req, res) => {
    const { session_id } = req.body;

    try {
        if (await deleteThread(session_id))
            res.status(200).send();
        else
            res.status(500).send();

    } catch (e) {
        console.log(e);
    }
});


app.listen(process.env.PORT, () => {
    console.log(`live on: http://localhost:${process.env.PORT}`);
});