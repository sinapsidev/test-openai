var fs = require('fs');


const url = 'https://logicadev2.snps.it/';
const base_url = url + 'api/v2/0';
let access_token = '';
const limit = 100;

module.exports.LogicaLogin = async () => {
    let res = await fetch(url + 'login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            username: process.env.LOGICA_USER,
            password: process.env.LOGICA_PSW,
            grant_type: 'password',
            client_id: 'xdbAuthClient'
        })
    })

    if (res.ok) {
        res = await res.json();
        access_token = res.access_token;
        return true;
    }
    else
        return false;
}


module.exports.LogicaFetch = async (resource, idAgente) => {
    let idVista;
    switch (resource) {
        case 'dotazioni_strumenti':
            idVista = 78;
            break;
        case 'dotazioni_consumo':
            idVista = 82;
            break;
        case 'dotazioni_automezzi':
            idVista = 103;
            break;
        case 'buste_paga':
            idVista = 10028;
            break;
        case 'rapporti':
            idVista = 10024;
            break;
        case 'ruoli':
            idVista = 10060;
            break;
        case 'presenze_non_bloccate':
            idVista = 10106;
            break;
        case 'presenze_bloccate':
            idVista = 10074;
            break;
        case 'presenze':
            idVista = 10075;
            break;
        case 'rimborsi':
            idVista = 10173;
            break;
        case 'non_conformità':
            idVista = 10340;
            break;
        case 'riconoscimenti':
            idVista = 10357;
            break;
        default:
            idVista = -1;
            break;
    }
    let res = await fetch(base_url + `/data/vista-scheda-rows/${idVista}?limit=${limit}&offset=0&idRecord=${idAgente}`, {
        headers: {
            'Authorization': 'Bearer ' + access_token
        }
    })

    if (res.ok) {
        res = await res.json();
        const records = new String(res.records)
        if (records.length > 1000) {
console.log('file')
            return {
                type: 'file',
                file: await resToFile(res.records),
                name: idVista,
                label: res.etichietta
            }
        }
        else if (records.length == 0) {
console.log('vuoto')
            return {
                type: 'text',
                text: `non ci sono ${resource} disponibili`,
            }
        }
        else {
console.log('text')
            return {
                type: 'text',
                text: JSON.stringify(res.records),
            }
        }
    }
    else throw new Error("Couldn't fetch the API");
}


async function resToFile(records) {
    fs.writeFile('temp.json', JSON.stringify(records), 'utf8', function (err) {
        if (err) throw err;
    });
    return fs.createReadStream('temp.json');
}