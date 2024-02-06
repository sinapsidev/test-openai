const OpenAI = require('openai');
const fs = require('fs');
const { LogicaLogin, LogicaFetch } = require('./logicaAPI');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


const context = "Sei un operatore del servizio clienti.Puoi rispondere alle domande solo con informazioni dalle seguenti risorse:dati_personali, dotazioni_strumenti, dotazioni_consumo, dotazioni_automezzi, buste_paga, rapporti, ruoli, presenze_non_bloccate, presenze_bloccate, presenze,rimborsi, non_conformità, riconoscimenti, abilitazioni_assegnate, mansioni_per_addetti, documenti, fasi_interventi_non_completate, fasi_verifiche_non_completate.Non devi rispondere a domande al di fuori dell'ambito delle risorse.";
let assistantF_id = 'asst_xkM3V2sEngbh8y1wvKw2WDRJ';
const sessions = {}
const chats = {}


module.exports.askGPT = async (user_request, session_id) => {
    return res = await askCompletion(user_request, session_id);
}

module.exports.createThread = async () => {
    thread = await openai.beta.threads.create();
    session_id = crypto.randomUUID();
    sessions[session_id] = thread.id;

    if (!LogicaLogin()) throw new Error('Cannot Login');

    return session_id;
}

module.exports.deleteThread = async (session_id) => {
    deleteFiles();

    if (sessions[session_id]) {
        const response = await openai.beta.threads.del(sessions[session_id]);
        sessions[session_id] = '';
        if (response.ok) return true;
        else return false;
    }
    else return false;
}

/* Funzioni ausiliarie */
const deleteFiles = async (thradId) => {
    const list = await openai.files.list();
    for await (const file of list) {
        await openai.files.del(file.id);
    }

    const assistantFiles = await openai.beta.assistants.files.list(
        assistantF_id
    );

    for await (const file of assistantFiles.data) {
        await openai.beta.assistants.files.del(
            assistantF_id,
            file.id
        );
    }
}

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

const getAgentId = () => { return 433 }

/* prende i risultati delle ciamate all' API, per ora legge un file */
const getOutput = async (function_name, function_args) => {
    let parameters = JSON.parse(function_args);
    parameters = Object.keys(parameters).map((key) => parameters[key]);
    let output = {};
    console.log(parameters)
    if (function_name === 'logica_fetch') {
        output = LogicaFetch(parameters[0], getAgentId());
    }

    return output;
}

/* rimuove le fonti */
const noSources = (text) => {
    // let trim;

    // let i = 0, s, f;
    // while (i < text.length) {
    //     if (text[i] === '【') {
    //         s = i;
    //         trim = true;
    //     }
    //     else if (text[i] === '】' && !!trim) {
    //         f = i;

    //         text = text.slice(0, s) + text.slice(s + f, text.length);
    //         console.log('trimmed')
    //         trim = false;
    //         i = s; s = 0; f = 0;
    //     }
    //     i++;
    // }

    // return text

    const regex = /【[^【】]*】/g;
    return text.replace(regex, '');
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


/* ritorna una risposta se non servono file o indica quali file servano */
const askCompletion = async (user_request, session_id) => {
    if (chats[session_id]) chats[session_id].push({ role: "user", content: user_request });
    else chats[session_id] = [{ role: "system", content: context }, { role: "user", content: user_request }];

    const completion = await openai.chat.completions.create({
        messages: chats[session_id],
        // model: "ft:gpt-3.5-turbo-0613:personal::8oqepVTI",
        // model: "ft:gpt-3.5-turbo-0613:personal::8ovGZ0x0",
        model: "ft:gpt-3.5-turbo-0613:personal::8oveFtmG",
        tools: [
            {
                "type": "function",
                "function": {
                    "name": "logica_fetch",
                    "description": "fa una fetch all' api di logica e ritorna la risorsa richiesta",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "resource": {
                                "type": "string",
                                "description": "nome della risorsa richiesta"
                            }
                        },
                        "required": [
                            "resources"
                        ]
                    }
                }
            }
        ],
        tool_choice: "auto",
    });

    // tool requested
    if (!completion.choices[0].message.content && completion.choices[0].message.tool_calls) {
        const output = await getOutput(completion.choices[0].message.tool_calls[0].function.name, completion.choices[0].message.tool_calls[0].function.arguments);

        user_request = requestProcessing(user_request, completion.choices[0].message.tool_calls[0].function.arguments);

        if (output.type === 'file') {
            const output_files = [output];
            return askFileAssistant(user_request, output_files, session_id);
        }

        chats[session_id].push({ role: 'assistant', content: output.text });
        return output.text;
    }
    else if (completion.choices[0].message.content) {
        chats[session_id].push({ role: 'assistant', content: completion.choices[0].message.content });
        return completion.choices[0].message.content
    }
    else console.log('response empty')
}

/* analizza i file necessari e ritorna una risposta */
const askFileAssistant = async (user_request, output_files) => {
    console.log('--------')

    if (output_files.length === 0) throw new Error('Cannot call file assistant without files');

    let redirection = '';
    let file_ids = [];

    if (output_files.length > 1) throw new Error("There shouldn't be that may files");
    let file = await openai.files.create({ file: output_files[0].file, purpose: "assistants" });
    file = await openai.beta.assistants.files.create(assistantF_id, { file_id: file.id });
    file_ids.push(file.id);
    redirection = `I dati che ti servono su ${output_files[0].label} sono nel file: ${file.id}`;
    // redirection = `. I dati che ti servono su ${output_files[i].label} sono nel file: che ho caricato`;

    console.log(file_ids);

    const thread = { id: sessions[session_id] }

    await openai.beta.threads.messages.create(
        thread.id,
        {
            role: "user",
            content: user_request + redirection,
            content: `${user_request}. ${redirection}`,
            file_ids
        }
    );

    await sleep(2000);

    let run = await openai.beta.threads.runs.create(thread.id, { assistant_id: assistantF_id });

    do {
        run = await openai.beta.threads.runs.retrieve(thread.id, run.id);
        console.log(run.status)

        if (run.status === 'completed') {
            const messages = await openai.beta.threads.messages.list(thread.id);
            const res = noSources(messages.data[0].content[0].text.value);

            chats[session_id].push({ role: 'assistant', content: res });
            return res
            // return messages.data[0].content[0].text.value;
        }
        else if (run.status === 'failed') {
            const messages = await openai.beta.threads.messages.list(thread.id);
            if (messages.data[0].role === "assistant")
                return messages.data[0].content[0].text.value;
            else {
                return false;
            }
        }
        await sleep(1000);

    } while (run.status !== 'completed');
}