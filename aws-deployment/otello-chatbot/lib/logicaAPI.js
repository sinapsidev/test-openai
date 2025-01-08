var fs = require('fs');


const url = 'https://logicawebdev2.snps.it/';
const base_url = url + 'api/v2/0';
const limit = 100;


module.exports.LogicaFetch = async (resource, access_token, idAgente) => {
    if (resource === 'dati_personali') {
        let res = await fetch(base_url + '/data/me', {
            headers: {
                'Authorization': 'Bearer ' + access_token
            }
        })
        if (res.ok) {
            res = await res.json();
            return {
                type: 'file',
                file: await resToFile({ addetto: res.addetto, persona: res.persona }),
                name: 'dati_personali',
            }
        }
        else throw new Error("Couldn't fetch the API");
    }
    else {
        let idVista;

        switch (resource) {
            case 'abilitazioni_assegnate':
                idVista = 30;
                break;
            case 'dotazioni_strumenti':
                idVista = 78;
                break;
            case 'dotazioni_consumo':
                idVista = 82;
                break;
            case 'dotazioni_automezzi':
                idVista = 103;
                break;
            case 'documenti':
                idVista = 109;
                break;
            case 'rapporti':
                idVista = 10024;
                break;
            case 'buste_paga':
                idVista = 10028;
                break;
            case 'fasi_interventi_non_completate':
                idVista = 10038;
                break;
            case 'ruoli_organigramma':
                idVista = 10060;
                break;
            case 'presenze_non_bloccate':
                idVista = 10074;
                break;
            case 'presenze_bloccate':
                idVista = 10075;
                break;
            case 'presenze_giornaliere':
                idVista = 10106;
                break;
            case 'rimborsi':
                idVista = 10173;
                break;
            case 'mansioni':
                idVista = 10251;
                break;
            case 'non_conformità':
                idVista = 10340;
                break;
            case 'riconoscimenti':
                idVista = 10357;
                break;
            case 'fasi_verifiche_non_completate':
                idVista = 10699;
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
            if (records.length == 0) {
                console.log("Fetched Logica api succesfully, requested resources not found or empty");
                return {
                    type: 'text',
                    text: `non ci sono ${resource} disponibili.`,
                }
            }
            else {
                console.log("Fetched Logica api succesfully");
                return {
                    type: 'file',
                    file: await resToFile(res.records, resource),
                    name: idVista,
                    label: resource
                }
            }
        }
        else {
            throw new Error("Couldn't fetch the API");
        }
    }
}

async function resToFile(records, resource) {
    fs.writeFile(`/tmp/temp.json`, JSON.stringify(records, null, 2), 'utf8', function (err) {
        if (err) throw err;
    });
    return fs.createReadStream(`/tmp/temp.json`);  
}