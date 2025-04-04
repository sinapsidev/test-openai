const fs = require('fs');
const OpenAI = require('openai');

async function openaiCall() {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const base64Pdf = fs.readFileSync("./test-files/test1.pdf", "base64");

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
                        // text: "What is  this document about, what is the invoice number?",
                        text: "Quali sono i codici istat e fiscale presenti nel documento?",
                    },
                ],
            },
        ],
    });

    console.log(completion.choices[0].message.content);
}
openaiCall().catch(console.error);

/*
    * È richiesto un modello che supporti la visione artificiale, come gpt-4o-mini o gpt-4o.
    * Il file deve essere in base 64 e può essere solo di tipo pdf.
    * È possibile usare altri formati ma solo se caricati nel vector store.
*/

/* 
    * Risposta:
    * This document is an invoice related to machinery for the ceramic industry. The invoice number is **2023202941**. 
    * The invoice details goods being delivered to "ZORKA KERAMIKA DOO" with various items listed, including a five-channel horizontal dryer, 
    * electric cables, and other equipment. The total net amount is €471,195.00. The invoice is issued by "SACMI IMOLA S.C." and is dated 2023-10-03.
    * The document also includes a note about the delivery of goods and the payment terms, which are 30 days from the invoice date. 
    * The invoice is sent to "ZORKA KERAMIKA DOO" at their address in Serbia.
    * The invoice is issued by "SACMI IMOLA S.C." and is dated 2023-10-03. 
    * The document also includes a note about the delivery of goods and the payment terms, which are 30 days from the invoice date. 
    * The invoice is sent to "ZORKA KERAMIKA DOO" at their address in Serbia.    
*/

/*
Here's the extracted text from the document:

---

**Page 1:**

Nato a LUGO il 7.01.1975  
Residente in LUGO Via VIA CANALETTO 17  
Cittadinanza: ITALIANA  
Titolo di studio: LICENZA MEDIA  
Iscritto nelle liste di collocamento o di mobilità della SCI di dal  
Iscritto nel libro matricola al numero d’ordine (1) 00003

---

**TIPOLOGIA CONTRATTUALE:**

L. 608 del 28 novembre 1996, art.9 bis
Tempo indeterminato [X]
Tempo determinato [ ] Durata:
Apprendist. (2) [ ] Contratto form.lav. (2) [ ] Lav.dom. (2) [ ]
...

Tempo parziale [ ] Orario medio settimanale (3):
...

**QUALIFICHE DI ASSUNZIONE:**

OPERAIO QUALIF.
CCNL applicato: METALMECC. Livello: 5
...
E) Contratto primo.

Per la richiesta di agevolazioni previste per l’assunzione va compilato, tranne che per i contratti di apprendistato e formazione lavoro, il modello C/ASS/AG.

(1) In caso di assunzione di apprendisti da parte di imprese artigiane, la comunicazione alla SCI del numero d’ordine di iscrizione nel libro matricola, sarà effettuata nel medesimo giorno di effettiva adibizione al lavoro dell’apprendista (v. art. 9 D.P.R. 30.12.1956 n. 1668).
(2) Riempiere il relativo quadro sottostante.
(3) L’orario medio si ottiene dividendo l’orario annuale per 52.
(4) La casella va barrata solo se il datore di lavoro non applica il CCNL. In tal caso va riempito il quadro D sottostante, salvo l’assunzione riguardi un dirigente.       

---

**Page 2:**

Finale
Autorizz. Ministero Lavoro n. del
Approv. Comm. regionale impiego n. del
Accordo collettivo o progetto tipo di riferimento:
Dichiarazione di conformità del

- Nei 24 mesi precedenti sono stati trasformati a tempo indeterminato non meno del 60% dei cfl venuti a scadenza nel medesimo periodo.
- Si dichiara altresì, che non vi sono sospensioni dal lavoro in atto, né, nei 12 mesi precedenti, sono avvenute riduzioni di personale con la medesima qualifica.

**LAVORO A DOMICILIO**
Iscriz. reg. committ. n. del
Tipo lavoraz.: Tariffa appl.:
...

**TRATTAMENTO ECONOMICO E NORMATIVO CONVENUTO**
Retrib. mensile: Ore di lavoro settim.
Ferite retribuite giorni:
[ ] SI [X] NO Motivi: NON COMPUTABILE

---

**ALLEGATI: [ ] [ ] Attestato di disoccupazione (mod. C/1):**
- [ ] Copia permesso di soggiorno
- [ ] Altro

Data 2.01.2003 timbro e firma DRAGONI/GIANFRANCO

(5) In caso di assunzione di apprendisti da parte di imprese artigiane, gli estremi della visita medica saranno comunicati alla SCI nel medesimo giorno di effettiva adibizione al lavoro dell’apprendista.

---

This is the complete text extracted from the document. If you need any further processing or information, let me know!
*/