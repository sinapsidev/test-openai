const express = require("express");
const path = require("path");
const cors = require("cors");
const app = express();
const PORT = 80;

app.use(express.json());
app.use(cors());

// app.use(express.static(__dirname + '/resources/logica'));



app.get("/", async (req, res) => {
    res.json('ping');
});
app.get("/file", async (req, res) => {
    try {
        res.sendFile(path.join(__dirname + '/resources/data1.json'));
    } catch (e) {
        console.log('Error:' + e);
    }
});
app.get("/data", async (req, res) => {
    try {
        res.json({
            records: [{
                "ID": 285,
                "identificativo": ". Alessandro 2022/    37 11 novembre",
                " ID addetto": 15,
                "addetto": ". Alessandro",
                "anno": 2022,
                "numero": 37,
                "mese": "11 novembre",
                "importo addetto": 140.00000,
                "importo carta": 0.00000,
                "importo totale": 140.00000,
                "totale km": 0.00,
                " invisibilerimborsato9": false,
                "Row": 1
            }]
        });
    } catch (e) {
        console.log('Error:' + e);
    }
});


app.listen(PORT, () => {
    console.log(`API live on: http://localhost:${PORT}`);
});