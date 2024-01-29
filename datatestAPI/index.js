const express = require("express");
const path = require("path");
const cors = require("cors");
const app = express();
const PORT = 80;

app.use(express.json());
app.use(cors());

app.use(express.static(__dirname + '/resources/logica'));



app.get("/file", async (req, res) => {
    try {
        res.sendFile(path.join(__dirname + '/resources/data1.json'));
    } catch (e) {
        console.log('Error:' + e);
    }
});
app.get("/data", async (req, res) => {
    try {
        res.json({name: "weather", type:"API"});
    } catch (e) {
        console.log('Error:' + e);
    }
});


app.listen(PORT, () => {
    console.log(`API live on: http://localhost:${PORT}`);
});