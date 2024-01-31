const OpenAI = require('openai');
const fs = require('fs');
const { LogicaLogin, LogicaFetch } = require('./logicaAPI');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

let assistant_id = 'asst_WZjTVTFa3byJBgVb8eQk9eZR';
let assistantF_id = 'asst_xkM3V2sEngbh8y1wvKw2WDRJ';

let sessions = {};
// let uploaded_files = {
//     '10173.json': 'file-YXt8OlSNfN7OwsiZAZ8s0UuN',
// };


module.exports.askGPT = async (user_request, session_id) => {
    thread_id = sessions[session_id];
    if (thread_id) {
        const message = await openai.beta.threads.messages.create(
            thread_id,
            {
                role: "user",
                content: user_request,
            }
        );
        const run = await openai.beta.threads.runs.create(
            thread_id,
            { assistant_id }
        );

        return res = await askAssistant(thread_id, run.id, user_request);
    }
}

module.exports.createThread = async () => {
    const assistant = await openai.beta.assistants.retrieve(assistant_id);
    assistant_id = assistant.id;
    thread = await openai.beta.threads.create();
    session_id = crypto.randomUUID();
    sessions[session_id] = thread.id;
    deleteFiles(thread.id);
    console.log("thread created for: " + session_id);

    if (!LogicaLogin()) throw new Error('Cannot Login');

    return session_id;
}

module.exports.deleteThread = async (session_id) => {
    if (sessions[session_id]) {
        const response = await openai.beta.threads.del(sessions[session_id]);
        console.log("thread deleted for: " + session_id);
        sessions[session_id] = '';
        if (response.ok) return true;
        else return false;
    }
    else return false;
}

/* Funzioni ausiliarie */
const deleteFiles = async (threadId) => {
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

const getAgentId = () => { return 15 }

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

/* ritorna l'output dall'API al bot */
const sendOutput = async (thread_id, run_id, tool_call_id, output_text) => {
    await openai.beta.threads.runs.submitToolOutputs(
        thread_id,
        run_id,
        {
            tool_outputs: [{
                "tool_call_id": tool_call_id,
                "output": output_text,
            }]
        }
    )
}

/* aggiunge lle citazioni all'output */
const addCitations = async (thread_id, message_id) => {
    // Retrieve the message object
    const message = await openai.beta.threads.messages.retrieve(thread_id, message_id);

    // Extract the message content
    const messageContent = message.content[0].text;
    const annotations = messageContent.annotations;
    const citations = [];

    // Iterate over the annotations and add footnotes
    for (let index = 0; index < annotations.length; index++) {
        const annotation = annotations[index];

        // Replace the text with a footnote
        messageContent.value = messageContent.value.replace(annotation.text, `[${index}]`);

        // Gather citations based on annotation attributes
        if (annotation.file_citation) {
            const citedFile = openai.files.retrieve(annotation.file_citation.file_id);
            citations.push(`[${index}] ${annotation.file_citation.quote} from ${citedFile.filename}`);
        } else if (annotation.file_path) {
            const citedFile = openai.files.retrieve(annotation.file_path.file_id);
            citations.push(`[${index}] Click <here> to download ${citedFile.filename}`);
            // Note: File download functionality not implemented above for brevity
        }
    }

    // if (annotations.length > 0) {
        console.log('annotations: ');
        console.log(annotations);
        console.log('citations: ');
        console.log(citations);
    // }

    // Add footnotes to the end of the message before displaying to the user
    messageContent.value += '\n' + citations.join('\n');
    return messageContent.value;
}


/* chiamate agli assistenti */

/* ritorna una risposta se non servono file o indica quali file servano */
const askAssistant = async (thread_id, run_id, user_request) => {
    let run = { status: '', id: run_id }
    let requires_file = false;
    let output_files = [];

    do {
        run = await openai.beta.threads.runs.retrieve(thread_id, run.id);
        console.log(run.status)

        /* La run necessita di file */
        if (requires_file && (run.status === 'completed' || run.status === 'failed')) {
            // await openai.beta.threads.runs.cancel(thread_id, run.id);
            return await askFileAssistant(user_request, output_files);
        }
        /* la run è terminata con successo */
        else if (run.status === 'completed') {
            const messages = await openai.beta.threads.messages.list(thread_id)
            // prendere solo l'ultimo messaggio non è il massimo ma per casi semplici va bene
            return messages.data[0].content[0].text.value
        }
        /* la run è fallita o ha prodotto un risultato insoddisfacente */
        else if (run.status === 'failed') {
            const messages = await openai.beta.threads.messages.list(thread_id)
            return false;
        }
        /* la run ha bisogno dell'output di una funzione */
        else if (run.status === 'requires_action' && run.required_action.type == 'submit_tool_outputs') {
            // console.log(run.required_action.submit_tool_outputs.tool_calls.length);
            const output = await getOutput(run.required_action.submit_tool_outputs.tool_calls[0].function.name, run.required_action.submit_tool_outputs.tool_calls[0].function.arguments);

            if (output.type === 'file') {
                requires_file = true;
                output_files.push(output);
                const output_text = 'non ci sono ' + run.required_action.submit_tool_outputs.tool_calls[0].function.name + ' disponibili.'
                await sendOutput(thread_id, run.id, run.required_action.submit_tool_outputs.tool_calls[0].id, output_text);
            }
            else {
                await sendOutput(thread_id, run.id, run.required_action.submit_tool_outputs.tool_calls[0].id, output.text);
            }
        }

        await sleep(1000);

    } while (run.status !== 'completed')

    return false;
}

/* analizza i file necessari e ritorna una risposta */
const askFileAssistant = async (user_request, output_files) => {
    console.log('--------')

    if (output_files.length === 0) throw new Error('Cannot call file assistant without files');

    // const redirection = `Answer the following request knowing that the data you need are contained in the file i have uploaded rather than in the API: '${user_request}'`;
    const redirection = ". Know that the data you need are contained in the file i have uploaded rather than in the API, but this must be transparent to the user";
    let file_ids = [];

    for (let i = 0; i < output_files.length; i++) {
        const file = await openai.files.create({ file: output_files[i].file, purpose: "assistants" });
        file_ids.push(file.id);
        await openai.beta.assistants.files.create(assistantF_id, { file_id: file.id });
    }
    console.log(file_ids);
    const thread = await openai.beta.threads.create();
    await openai.beta.threads.messages.create(
        thread.id,
        {
            role: "user",
            content: user_request + redirection,
            file_ids
        }
    );

    let run = await openai.beta.threads.runs.create(thread.id, { assistant_id: assistantF_id });

    do {
        run = await openai.beta.threads.runs.retrieve(thread.id, run.id);
        console.log(run.status)

        if (run.status === 'completed') {
            const messages = await openai.beta.threads.messages.list(thread.id);

            addCitations(thread.id, messages.data[0].id);
            return messages.data[0].content[0].text.value;
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