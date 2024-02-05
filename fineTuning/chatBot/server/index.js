const fastify = require('fastify')({ logger: true });
// const { askGPT, createThread, deleteThread } = require("./gptapi");
const { askGPT, createThread, deleteThread } = require("./gptapiTuned");
const path = require('path');


fastify.register(require('@fastify/static'), {
    root: path.join(__dirname, '../client'),
    // prefix: '/public/', 
    // constraints: { host: 'example.com' } 
})
fastify.register(require('@fastify/cors'), {})


fastify.post('/askGPT', async function (request, reply) {
    const { botReq, session_id } = request.body;

    try {
        const msg = await askGPT(botReq, session_id);

        if (msg)
            reply.code(200).send({ botRes: msg });
        else
            reply.code(500).send();
    } catch (e) {
        console.log(e);
        reply.code(500).send();
    }
})
fastify.post('/createChat', async function (request, reply) {
    try {
        const session_id = await createThread();

        reply.code(200).send({ session_id });

    } catch (e) {
        reply.code(500).send();
        console.log(e);
    }
})
fastify.post('/deleteChat', async function (request, reply) {
    const { session_id } = request.body;

    try {
        if (await deleteThread(session_id))
            reply.code(200).send();
        else
            reply.status(500).send();

    } catch (e) {
        console.log(e);
        reply.status(500).send();
    }
})

fastify.listen({ port: process.env.PORT }, function (err, address) {
    if (err) {
        fastify.log.error(err)
        process.exit(1)
    }
})