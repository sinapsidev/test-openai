const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
let finetuned_model_id = process.env.FINETUNED_MODEL_ID;

const tool_context = "Sei un operatore del servizio clienti. Puoi rispondere alle domande solo con informazioni dalle seguenti risorse: dati_personali, dotazioni_strumenti, dotazioni_consumo, dotazioni_automezzi, buste_paga, rapporti, ruoli, presenze_non_bloccate, presenze_bloccate, presenze,rimborsi, non_conformità, riconoscimenti, abilitazioni_assegnate, mansioni_per_addetti, documenti, fasi_interventi_non_completate, fasi_verifiche_non_completate.Non devi rispondere a domande al di fuori dell'ambito delle risorse.";
const assistant_context = "Sei un operatore del servizio clienti, rispondi alle domande solo con le informazioni che ti vengono fornite. ";


/* ritorna una risposta se non servono file o indica quali file servano */
module.exports.askCompletionTool = async (user_request, history) => {
    const completion = await openai.chat.completions.create({
        messages: [{ role: "system", content: tool_context }].concat(processHistory(user_request, history)),
        model: finetuned_model_id,
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

    if (!completion.choices[0].message.content && completion.choices[0].message.tool_calls) {
        return {
            needsApiFetch: true,
            functionName: completion.choices[0].message.tool_calls[0].function.name,
            functionArgs: completion.choices[0].message.tool_calls[0].function.arguments,
            error: false
        }
    }
    else if (completion.choices[0].message.content) {
        return {
            needsApiFetch: false,
            response: completion.choices[0].message.content,
            error: false
        }
    }
    else {
        throw Error("Error while fetching Openai api for completion, response empty");
    }
}

/* risponde come l'assistente ma per domande brevi, senza bisogno dei file */
module.exports.askCompletion = async (user_request, history, data) => {
    if(!data || !data.text) {
        throw Error("No data provided for completion");
    }
    const prompt = `${user_request} ${data.label} disponibili: ${data.text}`;
    const completion = await openai.chat.completions.create({
        messages: [{ role: "system", content: assistant_context }].concat(processHistory(prompt, history)),
        model: 'o4-mini-2025-04-16',
    });

    const res = completion.choices[0].message.content;
    console.log("answer", res);
    return res;
}


const processHistory = (user_request, history) => {
    messages = [];

    if (history) {
        for (let i = 0; i < history.length; i++) {
            messages.push({
                role: i % 2 === 0 ? 'user' : 'assistant',
                content: history[i]
            })
        }
    }

    messages.push({
        role: 'user',
        content: user_request
    });

    return messages;
}