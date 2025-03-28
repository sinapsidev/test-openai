const fs = require('fs');
const OpenAI = require('openai');
const openai = new OpenAI();

const base64Pdf = fs.readFileSync("test.pdf", "base64");

/* make a request to openai using a pdf file as knowledge base */
const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
        {
            role: "user",
            content: [
                {
                    type: "file",
                    file: {
                        filename: "bolla.pdf",
                        file_data: `data:application/pdf;base64,${base64Pdf}`
                    }
                },
                {
                    type: "text",
                    text: "What is the invoice number?",
                },
            ],
        },
    ],
});

console.log(completion.choices[0].message.content);

/*
    * È richiesto un modello che supporti la visione artificiale, come gpt-4o-mini o gpt-4o.
    * Il file deve essere in base 64 e può essere solo di tipo pdf.
    * È possibile usare altri formati ma solo se caricati nel vector store.
*/
