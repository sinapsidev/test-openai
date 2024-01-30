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
    //     name: "Stock Assistant",
    //     description: "Useful for answering questions about a specific stock",
    //     avatar: "https://mylogo.com/logo.png", // Replace with a real image
    //     isActive: true,
    //     llmModel: "GPT_3_5_TURBO_16K_0613",
    //     initialMessage: "Hi there, how can I help you?",
    //     prompt: "Use the Stock API to answer the users question."
    // })

    // // Your custom tool
    // const { data: tool } = await client.tool.create({
    //     name: "Stock API",
    //     description: "Useful for answering questions about a specific stock",
    //     type: "FUNCTION",
    //     returnDirect: false,
    //     metadata: {
    //         functionName: "get_stock",
    //         args: {
    //             ticker: {
    //                 type: "string",
    //                 description: "The stock ticker to search for"
    //             }
    //         }
    //     }
    // })

    // await client.agent.addTool(agent.id, {
    //     toolId: tool.id
    // })

    // await client.agent.addLlm(agent.id, {
    //     llmId: llm.id
    // })

    const agent = { id: 'b3e486c7-26a2-4f58-ae13-e91d9d58f9fc' }

    const { data: prediction } = await client.agent.invoke(agent.id, {
        enableStreaming: true,
        // input: "What's a stock?",
        input: "What's the current stock price of Apple?",
        sessionId: "my_session_id"
    })

    const output = prediction.output
    const steps = prediction.intermediate_steps

    // Implementation of the getStock function
    function getStock({ ticker }) {
        console.log(`Getting stock information for ${ticker}`);
    };

    // Create a tool dispatch mapping
    const toolDispatch = {
        "get_stock": getStock,
        // Add more tools here as needed
    };

    // Implement a handler for running functions
    function handleToolActions(steps) {
        steps.forEach(([item, _]) => {
            const toolName = item.tool;
            const toolFunction = toolDispatch[toolName];

            if (toolFunction) {
                const toolInput = item.tool_input || {};
                toolFunction(toolInput);
            } else {
                console.log(`No function defined for tool: ${toolName}`);
            }
        });
    };

    console.log('ok')

    // Run your custom tool/function
    handleToolActions(steps);

    console.log(output)
    console.log(steps)
}
main();