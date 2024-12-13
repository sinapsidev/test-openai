const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
let assistant_id = process.env.ASSISTANT_ID;
let vectorStore_id = process.env.VECTOR_STORE_ID;



/* analizza i file necessari e ritorna una risposta */
module.exports.askFileAssistant = async (user_request, output_files) => {
    deleteFiles();

    let redirection = '';
    const file_id = await uploadFile(output_files);

    redirection = `I dati che ti servono su ${output_files[0].label} sono nel file: ${file_id}`;

    console.log("uploading to asisstant files:", [file_id]);

    const thread = await openai.beta.threads.create();

    await openai.beta.threads.messages.create(
        thread.id,
        {
            role: "user",
            content: user_request + redirection,
            content: `${user_request}. ${redirection}`,
            // attachments: [{ file_id: file_id, tools: [{ type: "file_search" }] }],
        }
    );

    await sleep(2000);

    let run = await openai.beta.threads.runs.create(thread.id, { assistant_id });

    do {
        run = await openai.beta.threads.runs.retrieve(thread.id, run.id);
        console.log(run.status)

        if (run.status === 'completed') {
            const messages = await openai.beta.threads.messages.list(thread.id);
            const res = noSources(messages.data[0].content[0].text.value);
            console.log("answer", res);

            return res
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


const deleteFiles = async () => {
    // Elimina i file
    const list = await openai.files.list();
    if (!openai.files)
        return
    for await (const file of list) {
        await openai.files.del(file.id);
    }

    // Rimuove i file dal vs
    for await (const file of list) {
        await openai.beta.vectorStores.files.create(vectorStore_id, { file_id: file.id });
    }

    // Rimuove i file dagli assistenti
    if (!openai.beta.assistants.files)
        return
    const assistantFiles = await openai.beta.assistants.files.list(
        assistant_id
    );
    for await (const file of assistantFiles.data) {
        await openai.beta.assistants.files.del(
            assistant_id,
            file.id
        );
    }
}

const deleteVS = async () => {
    // // Elimina i vs
    let vectorStores = await openai.beta.vectorStores.list();
    vectorStores.data.forEach(async vs => {
        const deletedVectorStore = await openai.beta.vectorStores.del(vs.id);
    });
}

const uploadFile = async (output_files) => {
    if (output_files.length === 0) throw new Error('Cannot call file assistant without files');

    if (output_files.length > 1) throw new Error("There shouldn't be that may files");

    let file = await openai.files.create({ file: output_files[0].file, purpose: "assistants" });
    file = await openai.beta.vectorStores.files.create(vectorStore_id, file.id);
    console.log("file upload:", file);

    return file.id;
}

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

/* rimuove le fonti */
const noSources = (text) => {
    const regex = /【[^【】]*】/g;
    return text.replace(regex, '');
}