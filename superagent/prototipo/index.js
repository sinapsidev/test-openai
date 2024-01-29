const { SuperAgentClient } = require("superagentai-js");

async function main() {
    const client = new SuperAgentClient({
        environment: "https://api.beta.superagent.sh",
        token: process.env.SUPERAGENT_API_KEY
    })

    // const { data: llm } = await client.llm.create({
    //     provider: "OPENAI",
    //     apiKey: process.env.OPENAI_API_KEY
    // })

    // const { data: agent } = await client.agent.create({
    //     name: "Browser Assistant",
    //     description: "An Assistant that has access to the Browser tool",
    //     avatar: "https://mylogo.com/logo.png", // Replace with a real image
    //     isActive: true,
    //     llmModel: "GPT_3_5_TURBO_16K_0613",
    //     initialMessage: "Hi there, how can I help you?",
    //     prompt: "You are a customer service assistant, you can fetch url with base: https://a5b5-93-149-39-162.ngrok-free.app."
    // })
    const agent = { id: '09abfbb9-d02a-4cc4-9898-4fb1a49518e6' }


    // const { data: tool } = await client.tool.create({
    //     name: "API fetcher",
    //     description: "Useful for answering questions about urls.",
    //     type: "BROWSER",
    //     returnDirect: false,
    // })

    // await client.agent.addLlm(agent.id, {
    //     llmId: llm.id
    // })

    // await client.agent.addTool(agent.id, {
    //     toolId: tool.id
    // })
    
    console.log('starting prediction');

    const { data: prediction } = await client.agent.invoke(agent.id, {
        input: "summerize me the data from https://1440-93-149-39-162.ngrok-free.app/data1.json",
        enableStreaming: false,
        sessionId: "my_session_id",
    })

    console.log(prediction.output);
}

main();