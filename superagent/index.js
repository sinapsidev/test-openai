const { SuperAgentClient } = require("superagentai-js");

async function main() {
    const client = new SuperAgentClient({
        environment: "https://api.beta.superagent.sh",
        token: process.env.SUPERAGENT_API_KEY
    })

    const { data: llm } = await client.llm.create({
        provider: "OPENAI",
        apiKey: process.env.OPENAI_API_KEY
    })

    // const { data: agent } = await client.agent.create({
    //     name: "API fetcher",
    //     description: "An Assistant that has access to the API",
    //     avatar: "https://mylogo.com/logo.png", // Replace with a real image
    //     isActive: true,
    //     llmModel: "GPT_3_5_TURBO_16K_0613",
    //     initialMessage: "Hi there, how can I help you?",
    //     prompt: `You are a helpful ai assistant. You can make HTTP requests.`
    //     // Whenever the user wants data from DEMOAPI you should make an http GET request to: URL: https://3129-93-149-39-162.ngrok-free.app`
    // })
    const agent = { id: '2456b8ad-2930-41b0-ae11-e5dbe184ba57' }

    const { data: tool } = await client.tool.create({
        name: "http request",
        description: "useful for returning data from a url.",
        type: "HTTP",
        returnDirect: false,
        // metadata: {
        //     headers: {
        //         authorizations: '',
        //         apikey: ''
        //     }
        // }
    })

    await client.agent.addLlm(agent.id, {
        llmId: llm.id
    })

    await client.agent.addTool(agent.id, {
        toolId: tool.id
    })

    console.log('starting prediction')

    const { data: prediction } = await client.agent.invoke(agent.id, {
        input: "get me the data from the DEMOAPI",
        enableStreaming: true,
        sessionId: "my_session_id",
        llm_params: { "temperature": 0.0 }
    })

    console.log(prediction.output)
}

main();