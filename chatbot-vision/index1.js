const fs = require('fs');
const OpenAI = require('openai');

async function openaiCall() {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const base64Image = fs.readFileSync("./test-files/test2.jpg", "base64");

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
                { type: "text", text: "Che cosa contiene l'immagine?" },
            ],
        }],
    });

    console.log(completion.choices[0].message.content);
}
openaiCall().catch(console.error);

/*
    * È richiesto un modello che supporti la visione artificiale, come gpt-4o-mini o gpt-4o.
    * Il file deve essere in base 64 o un url.
    * È possibile usare altri formati ma solo se caricati nel vector store.
*/

/* 
    * Risposta:
    * This image shows an Italian identity card (Carta di Identità). It contains personal details such as the holder's name, surname, 
    * place and date of birth, and expiration date.
    * To determine if the ID is valid, you would need to consider several factors:
    * 1. **Expiration Date:** Check if the current date is before the expiration date.
    * 2. **Physical Condition:** Look for signs of tampering or damage.
    * 3. **Security Features:** Identify any holograms, watermarks, or other security measures typical for official IDs.
    * For a definitive validation, it is best to consult the relevant authorities.
*/

/*
**Fronte della carta:**
- REPUBBLICA ITALIANA
- MINISTERO DELL'INTERNO
- CARTA DI IDENTITÀ / IDENTITY CARD
- COMUNE DI / MUNICIPALITY
- SERENELLA MARITTIMA
- COGNOME / SURNAME: ROSSI
- NOME / NAME: BIANCA
- LUOGO E DATA DI NASCITA / PLACE AND DATE OF BIRTH: PINO SULLA SPONDA DEL LAGO MAGGIORE (VA) 30.12.1964
- SESSO / SEXO: F
- STATURA / HEIGHT: 180
- EMISSIONE / ISSUING: 30.05.2012
- SCADENZA / EXPIRY: 30.12.2022
- 123456
- NON VALIDA PER L'ESPATRIO

**Retro della carta:**
- COGNOME E NOME DEI GENITORI O DI CHI NE FA LE VECI / PARENTS' TUTORS NAME: ROSSI MARIA
- CODICE FISCALE / FISCAL CODE: RSSBNC64T07G677R
- INDIRIZZO DI RESIDENZA / RESIDENCE: VIA SALARIA 12
- ESTREMI ATTO DI NASCITA: 00000.0.A00

Sì, è presente una data di scadenza: **30.12.2022**.
*/

/*
    * Yes, there are signatures on the certificate. There are two signatures from individuals identified as "Il Responsabile del Progetto Formativo"
    * and "Il formatore," as well as a third signature from "Il legale rappresentante."
*/