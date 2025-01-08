const { LogicaFetch } = require('./logicaAPI');
const { askCompletion } = require('./gptCompletion');
const { askFileAssistant } = require('./gptAssistant');


/* Interroga chatGPT con la domanda dell'utente, ritornando direttamente la risposta se 
  possibile, altrimenti prendendo i dati necessari dall API di Logica */ 
module.exports.askGPT = async (user_request, access_token, id_addetto) => {
    const res = await askCompletion(user_request, access_token, id_addetto);
    
    if (!res.needsApiFetch) {
        console.log(`Response: ${res.response}`);
        return res.response;
    }
    else {
        if(!res.functionName || !res.functionArgs)
            throw Error("Not enough information to fetch the Openai api");
        
        console.log(`Required function call: {name: ${res.functionName}, args: ${res.functionArgs}}`);
        const output = await getOutput(res.functionName, res.functionArgs, access_token, id_addetto);

        user_request = requestProcessing(user_request, res.functionArgs);

        if (output.type === 'file') {
            const output_files = [output];
            return askFileAssistant(user_request, output_files);
        }
        else 
            return output.text;
    }
}

/* prende i risultati delle chiamate all' API */
const getOutput = async (function_name, function_args, access_token, id_addetto) => {
    let parameters = JSON.parse(function_args);

    parameters = Object.keys(parameters).map((key) => parameters[key]);
    let output = {};

    if (function_name === 'logica_fetch') {
        console.log("fetching Logica API for: ", parameters)
        output = LogicaFetch(parameters[0], access_token, id_addetto);
    }

    return output;
}

const requestProcessing = (request, function_args) => {
    let parameters = JSON.parse(function_args);
    parameters = Object.keys(parameters).map((key) => parameters[key]);

    switch (parameters[0]) {
        case 'buste_paga':
        case 'presenze':
        case 'presenze_bloccate':
        case 'presenze_non_bloccate':
            const date = new Date();
            request = request + `. Oggi è il ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}.`
            break;
        default:
            break;
    }

    return request;
}
