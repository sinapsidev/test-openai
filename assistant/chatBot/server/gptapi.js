const OpenAI = require("openai");


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});
const assistantId = 'asst_xkM3V2sEngbh8y1wvKw2WDRJ';
let sessions = {}


module.exports.askGPT = async () => {

}

module.exports.createThread = async () => {
    // const Assistant = await openai.beta.assistants.retrieve(assistantId);
    thread = client.beta.threads.create();
    session_id = crypto.randomUUID();
    sessions[session_id] = thread.id;
    console.log("thread created");
    return session_id;
}

module.exports.deleteThread = async (session_id) => {
    const response = await client.beta.threads.del(sessions[session_id]);
    console.log("thread deleted");
    if(response.ok) return true;
}
