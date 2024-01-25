const OpenAI = require("openai");


const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
let assistant_id = 'asst_xkM3V2sEngbh8y1wvKw2WDRJ';
let sessions = {}


module.exports.askGPT = async (user_request, session_id) => {
    thread_id = sessions[session_id];
    if (thread_id) {
        const message = await openai.beta.threads.messages.create(
            thread_id,
            { role: "user", content: user_request }
        );
        const run = await openai.beta.threads.runs.create(
            thread_id,
            { assistant_id }
        );

        const res = await getResponse(thread_id, run.id);
        return res;
    }
}

module.exports.createThread = async () => {
    // console.log(await openai.beta.assistants.list({
    //     order: "desc",
    //     limit: "20",
    // }))
    const assistant = await openai.beta.assistants.retrieve(assistant_id);
    assistant_id = assistant.id;
    thread = await openai.beta.threads.create();
    session_id = crypto.randomUUID();
    sessions[session_id] = thread.id;
    console.log("thread created for: " + session_id);
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

const deleteAllThreads = async (session_id) => {
    console.log(sessions)
    for (session in Object.keys(sessions)) {
        if (sessions[session_id] !== '')
            await openai.beta.threads.del(sessions[session]);
    }
}

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

const getResponse = async (thread_id, run_id) => {
    let run = { status: '' }
    do {
        run = await openai.beta.threads.runs.retrieve(thread_id, run_id);
        // console.log(run.status)

        if (run.status === 'completed') {
            const messages = await openai.beta.threads.messages.list(thread_id)
            let res = []
            for (let i = 0; i < messages.data.length; i++) {
                res.push(messages.data[i].content[0].text.value)
            }
            // prendere solo l'ultimo messaggion non è il massimo ma per casi semplici va bene
            return res[0]
        }
        if (run.status === 'failed') {
            return false;
        }

        await sleep(500)

    } while (run.status !== 'completed')

    return false;
}