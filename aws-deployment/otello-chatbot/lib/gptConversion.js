const { BedrockRuntimeClient, ConverseCommand } = require("@aws-sdk/client-bedrock-runtime");

const client = new BedrockRuntimeClient({ region: "eu-central-1" });


const tool_context = "Sei un operatore del servizio clienti. Puoi rispondere alle domande solo con informazioni dalle seguenti risorse: dati_personali, dotazioni_strumenti, dotazioni_consumo, dotazioni_automezzi, buste_paga, rapporti, ruoli, presenze_non_bloccate, presenze_bloccate, presenze,rimborsi, non_conformità, riconoscimenti, abilitazioni_assegnate, mansioni_per_addetti, documenti, fasi_interventi_non_completate, fasi_verifiche_non_completate.Non devi rispondere a domande al di fuori dell'ambito delle risorse.";
const assistant_context = "Sei un operatore del servizio clienti, rispondi alle domande solo con le informazioni che ti vengono fornite. ";


/* ritorna una risposta se non servono file o indica quali file servano */
module.exports.askConversionTool = async (user_request, history) => {
    const command = new ConverseCommand({
        modelId: "amazon.nova-lite-v1:0",
        messages: processHistory(user_request, history),
        system: [{ content: tool_context }],
        tool_config: {
            tools: [{
                toolSpec: {
                    "name": "logica_fetch",
                    "description": "fa una fetch all' api di logica e ritorna la risorsa richiesta",
                    "inputSchema": {
                        "json": {
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
            }]
        }
    });
    const response = await client.send(command);

    switch (response.stopReason) {
        case "end_turn" || "max_tokens" || "stop_sequence" || "guardrail_intervened" || "content_filtered":
            throw new Error(`Conversion stopped: ${response.stopReason}`);
        case "tool_use":
            const tool_use = response.output.message.content[0].toolUse;
            return {
                needsApiFetch: true,
                functionName: tool_use.toolName,
                functionArgs: tool_use.input,
                error: false
            }
        default:
            return {
                needsApiFetch: false,
                response: response.output.message.content[0].text,
                error: false
            }
    }
}

/* risponde come l'assistente ma per domande brevi, senza bisogno dei file */
module.exports.askConversion = async (user_request, history, data) => {
    if (!data || !data.text) {
        throw Error("No data provided for completion");
    }
    const prompt = `${user_request} ${data.label} disponibili: ${data.text}`;

    const command = new ConverseCommand({
        modelId: "amazon.nova-lite-v1:0",
        messages: processHistory(prompt, history),
        system: [{ content: assistant_context }]
    });
    const response = await client.send(command);

    switch (response.stopReason) {
        case "end_turn" || "max_tokens" || "stop_sequence" || "guardrail_intervened" || "content_filtered":
            throw new Error(`Conversion stopped: ${response.stopReason}`);
        case "tool_use":
            throw new Error("Conversion stopped: tool_use, but no tools were provided");
        default:
            const res = response.output.message.content[0].text;
            console.log("answer", res);
            return res;
    }
}


const processHistory = (user_request, history) => {
    messages = [];

    if (history) {
        for (let i = 0; i < history.length; i++) {
            messages.push({
                role: i % 2 === 0 ? 'user' : 'assistant',
                content: [{ text: history[i] }]
            })
        }
    }

    messages.push({
        role: 'user',
        content: [{ text: user_request }]
    });

    return messages;
}