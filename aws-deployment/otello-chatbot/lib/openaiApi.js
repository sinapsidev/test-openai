const { LogicaFetch } = require('./logicaAPI');
const { askCompletion } = require('./gptCompletion');
const { askFileAssistant } = require('./gptAssistant');


/* Interroga chatGPT con la domanda dell'utente, ritornando direttamente la risposta se 
  possibile, altrimenti prendendo i dati necessari dall API di Logica */
module.exports.askGPT = async (user_request, credentials) => {
    const res = await askCompletion(user_request, credentials);

    if (!res.needsApiFetch) {
        console.log(`Response: ${res.response}`);
        return res.response;
    }
    else {
        if (!res.functionName || !res.functionArgs)
            throw Error("Not enough information to fetch the Openai api");

        console.log(`Required function call: {name: ${res.functionName}, args: ${res.functionArgs}}`);
        const output = await getOutput(res.functionName, res.functionArgs, credentials);

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
const getOutput = async (function_name, function_args, credentials) => {
    let parameters = JSON.parse(function_args);

    parameters = Object.keys(parameters).map((key) => parameters[key]);
    let output = {};

    if (function_name === 'logica_fetch') {
        console.log("fetching Logica API for: ", parameters)
        output = LogicaFetch(parameters[0], credentials);
    }

    return output;
}

const requestProcessing = (request, function_args) => {
    let parameters = JSON.parse(function_args);
    parameters = Object.keys(parameters).map((key) => parameters[key]);

    const date = new Date();
    request = request + `. Oggi è il ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}.`

    return request;
}
