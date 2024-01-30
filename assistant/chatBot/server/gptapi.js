const OpenAI = require('openai');
const fs = require('fs');
const { LogicaLogin, LogicaFetch } = require('./logicaAPI');
const { threadId } = require('worker_threads');


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

        const res = await getResponse(thread_id, run.id, user_request);
        return res;
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

// const deleteAllThreads = async (session_id) => {
//     console.log(sessions)
//     for (session in Object.keys(sessions)) {
//         if (sessions[session_id] !== '')
//             await openai.beta.threads.del(sessions[session]);
//     }
// }

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

const getResponse = async (thread_id, run_id, user_request) => {
    let run = { status: '', id: run_id }

    do {
        run = await openai.beta.threads.runs.retrieve(thread_id, run.id);
        console.log(run.status)

        /* la run è terminata con successo */
        if (run.status === 'completed') {
            const messages = await openai.beta.threads.messages.list(thread_id)
            let res = []
            for (let i = 0; i < messages.data.length; i++) {
                res.push(messages.data[i].content[0].text.value)
            }
            // prendere solo l'ultimo messaggion non è il massimo ma per casi semplici va bene
            return res[0]
        }
        /* la run è fallita o ha prodotto un risultato insoddisfacente */
        else if (run.status === 'failed') {
            const messages = await openai.beta.threads.messages.list(thread_id)
            console.log(messages.data[0]);
            return false;
        }
        /* la run ha bisogno dell'output di una funzione */
        else if (run.status === 'requires_action' && run.required_action.type == 'submit_tool_outputs') {
// console.log(run.required_action.submit_tool_outputs.tool_calls.length);
            const output = await getOutput(run.required_action.submit_tool_outputs.tool_calls[0].function.name, run.required_action.submit_tool_outputs.tool_calls[0].function.arguments);

            if (output.type === 'file') {
                await openai.beta.threads.runs.cancel(thread_id, run.id);
                return await askFileAssistant(user_request, output.file, output.name);
            }
            else
                await sendOutput(thread_id, run.id, run.required_action.submit_tool_outputs.tool_calls[0].id, output.text);
        }

        await sleep(1000);

    } while (run.status !== 'completed')

    return false;
}

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

// const isFileCached = (file_name) => {
//     const file_id = uploaded_files[file_name]
//     if (file_id) return file_id;
//     else return false;
// }

/* forward the request to the assistant F */
const askFileAssistant = async (user_request, output_file, file_name) => {
    console.log('--------')
    // const redirection = `Answer the following request knowing that the data you need are contained in the file i have uploaded rather than in the API: '${user_request}'`;
    const redirection = ". Know that the data you need are contained in the file i have uploaded rather than in the API";
    let file = {}
    // file.id = isFileCached(file_name)
    // if (!file.id) {
    file = await openai.files.create({
        file: output_file,
        purpose: "assistants"
    });
    // uploaded_files[file_name] = file.id;
    await openai.beta.assistants.files.create(
        assistantF_id,
        {
            file_id: file.id
        }
    );
    // }

    const thread = await openai.beta.threads.create();
    await openai.beta.threads.messages.create(
        thread.id,
        {
            role: "user",
            content: user_request + redirection,
            file_ids: [file.id],
        }
    );

    let run = await openai.beta.threads.runs.create(
        thread.id,
        { assistant_id: assistantF_id }
    );

    do {
        run = await openai.beta.threads.runs.retrieve(thread.id, run.id);
        console.log(run.status)

        if (run.status === 'completed') {
            const messages = await openai.beta.threads.messages.list(thread.id);
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

    } while (run.status == 'in_progress');
}

/* ritorna i file presi dall'API al bot */      // in disuso
const sendFile = async (thread_id, output_file, user_request) => {
    const redirection = ". Know that the data you need are contained in the file i have uploaded rather than in the API";

    /* if the file is already uploaded references it */
    // TODO

    /* else uploads it */
    const file = await openai.files.create({
        file: output_file,
        purpose: "assistants"
    });
    const message = await openai.beta.threads.messages.create(
        thread_id,
        {
            role: "user",
            content: user_request + redirection,
            file_ids: [file.id]
            // file_ids: ["file-ESP1Mh54l8iPCkMF610Zrdjo"]
        }
    );
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