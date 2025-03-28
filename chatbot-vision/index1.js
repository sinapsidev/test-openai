const fs = require('fs');
const OpenAI = require('openai');

const openai = new OpenAI();
const base64Image = fs.readFileSync("test.jpg", "base64");

/* make a request to openai using an image as knowledge base */
const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{
        role: "user",
        content: [
            {
                type: "image_url",
                image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`,
                },
            },
            { type: "text", text: "what's in this image?" },
        ],
    }],
});

console.log(completion.choices[0].message.content);
/*
    * È richiesto un modello che supporti la visione artificiale, come gpt-4o-mini o gpt-4o.
    * Il file deve essere in base 64 o un url.
    * È possibile usare altri formati ma solo se caricati nel vector store.
*/
