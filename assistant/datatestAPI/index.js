const express = require("express");
const path = require("path");
const cors = require("cors");
const app = express();
const PORT = 80;

app.use(express.json());
app.use(cors());


app.get("/data", async (req, res) => {
    try {
        res.sendFile(path.join(__dirname + '/data.csv'));
    } catch (e) {
        console.log('Error:' + e);
    }
});


app.listen(PORT, () => {
    console.log(`API live on: http://localhost:${PORT}`);
});