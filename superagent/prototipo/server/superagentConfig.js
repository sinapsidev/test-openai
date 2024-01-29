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
    // const agent = { id: '09abfbb9-d02a-4cc4-9898-4fb1a49518e6' }
    const agent1 = { id: '99e0a72e-9470-464c-a730-8bfc4a3b7bc7' }
    const agent2 = { id: 'f5c34d5a-53e2-46d9-aeb1-e566059589ce' }

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
    // const { data: prediction } = await client.agent.invoke(agent.id, {
    //     input: "a quale url trovo le presenze?",
    //     enableStreaming: false,
    //     sessionId: "my_session_id",
    //     outputSchema:"{userQuery: string, sourcesUrls: [string]}"
    // })
    // console.log(prediction.output);


    /* Workflow */
    // const {data: workflow} = await client.workflow.create({
    //     name: "chatbot",
    //     description: "...",
    // })
    // const workflow = { id: 'd860548a-7fb2-4e20-9ec3-69d3a4154512' }
    const workflow = { id: '2e3fda9a-bfff-4add-8cb2-79b70df889c6' }

    // const { data: step1 } = await client.workflow.addStep(workflow.id, {
    //     agentId: agent1.id,
    //     order: 0
    // })

    // const { data: step2 } = await client.workflow.addStep(workflow.id, {
    //     agentId: agent2.id,
    //     order: 1
    // })

    const response = await client.agent.invoke(workflow.id, {
        enableStreaming: false,
        input: "Quali sono le presenze da 8 ore?",
    })
    console.log(response)

}

main();