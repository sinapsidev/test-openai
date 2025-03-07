var fs = require('fs');


const url = 'https://logicawebdev2.snps.it/';    //dev
// const url = 'https://app.logicasolutions.it/';      //prod
const base_url = url + 'api/v2/';
const limit = 100;


module.exports.LogicaFetch = async (resource, credentials) => {
    let { tenant, access_token, id_addetto, id_persona } = credentials
    tenant = tenant || '0';

    if (resource === 'dati_personali') {
        let res = await fetch(base_url + tenant + '/data/me', {
            headers: {
                'Authorization': 'Bearer ' + access_token
            }
        })
        if (res.ok) {
            res = await res.json();
            return {
                type: 'file',
                file: await resToFile({ addetto: res.addetto, persona: res.persona }),
                label: 'dati_personali',
            }
        }
        else {
            err_msg = (await res.json()).message
            if (err_msg)
                throw new Error(`Couldn't fetch the API, response status: ${res.status}, response error: ${err_msg}`);
            else
                throw new Error(`Couldn't fetch the API, response status: ${res.status}`);
        }
    }
    else if (resource === 'documenti') {
        const idVista1 = 109;   // documenti addetto
        const idVista2 = 10025; // documenti persona
        let documenti_addetto = [], documenti_persona = [];

        let [res1, res2] = await Promise.all([
            fetch(base_url + tenant + `/data/vista-scheda-rows/${idVista1}?limit=${limit / 4}&offset=0&idRecord=${id_addetto}`, {
                headers: {
                    'Authorization': 'Bearer ' + access_token
                }
            }),
            fetch(base_url + tenant + `/data/vista-scheda-rows/${idVista2}?limit=${limit / 4}&offset=0&idRecord=${id_persona}`, {
                headers: {
                    'Authorization': 'Bearer ' + access_token
                }
            })
        ]);

        if (res1.ok) {
            res1 = await res1.json();
            documenti_addetto = JSON.stringify(res1.records, null, 0);
        }
        else await throwErrorMsg(res1);
        
        if (res2.ok) {
            res2 = await res2.json();
            documenti_persona = JSON.stringify(res2.records, null, 0);
        }
        else await throwErrorMsg(res2);

        if (documenti_addetto.length == 0 && documenti_persona.length == 0) {
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
                file: await resToFile({
                    documenti_addetto,
                    documenti_persona,
                }, resource),
                name: `${idVista1}, ${idVista2}`,
                label: resource
            }
        }
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
        let res = await fetch(base_url + tenant + `/data/vista-scheda-rows/${idVista}?limit=${limit}&offset=0&idRecord=${id_addetto}`, {
            headers: {
                'Authorization': 'Bearer ' + access_token
            }
        })
        if (res.ok) {
            res = await res.json();
            const records = new String(res.records);
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
            err_msg = (await res.json()).message
            if (err_msg)
                throw new Error(`Couldn't fetch the API, response status: ${res.status}, response error: ${err_msg}`);
            else
                throw new Error(`Couldn't fetch the API, response status: ${res.status}`);
        }
    }
}

async function resToFile(records, resource) {
    fs.writeFile(`/tmp/temp.json`, JSON.stringify(records, null, 2), 'utf8', function (err) {
        if (err) throw err;
    });
    return fs.createReadStream(`/tmp/temp.json`);
}

async function throwErrorMsg(res) {
    err_msg = (await res.json()).message
    if (err_msg)
        throw new Error(`Couldn't fetch the API, response status: ${res.status}, response error: ${err_msg}`);
    else
        throw new Error(`Couldn't fetch the API, response status: ${res.status}`);
}