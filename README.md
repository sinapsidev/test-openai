# test-openai
## indice
- assistant: script per interagire con un assistant
- aws-deployment: directory dove usate per il deploy del chatbot e della coversione vocale con serverless
- chatbotDemo: applicazione web che implementa un chatbot usando chatGPT con la possibilità di interagire con API  
    non c'è ancora memoria delle conversazioni -> ogni messaggio viene risposto indipendentemente dagli altri
- datatestAPI: api per gli endpoint di prova
- fineTuning: file per fare il fine tuning di un modello di openai e chatbot dopo il finetuning

gli script per funzionare necessitano di una chiave per l'API

## Deployment
Le chiavi api di openai sono salvate in aws ssm
(Se necessario cambiare le configurazioni per il login su aws e serverless)  
Dalla cartella aws-deployment/otello-chatbot lanciare 'npm i && npx  serverless deploy'  ('--stage prod' per la produzione)
Dalla cartella aws-deployment/chat-to-speech lanciare 'npm i && npx  serverless deploy'  ('--stage prod' per la produzione)

## Ricerca
### superagent:
- framework per la creazione di assistenti AI
- alternativa opensource, free e con possibilità di hostarla privatamente di openai assistant
- mette a disposizione molti strumenti tra cui quelli per fetchare URL e fare workflow
- permettere di connettere altri strumenti, tra cui DB per fare RAG (weaviate, supabase), servizi di analisi dei costi e di uso
    (https://medium.com/@muhilvarnan.v/building-a-rag-based-customer-support-ai-bot-in-a-distributed-domain-teams-e31ab1527790)
### customGPT:
- non hanno un API per interagirci, ma si possono hostare con servizi terzi
- con un account premium si può creare il propio GPT e dargli funzionalità extra, tra cui le chiamate all'API
- non è possibile fare fine tuning, nè usare gli altri metodi, ma i prezzi sono ridotti e la knowledge base può cambiare dinamicamente   
    (https://help.openai.com/en/articles/8673914-gpts-vs-assistants)
### Assistant:
- si può assegnare un thread ad ogni utente, in modo che il modello abbia taraccia delle conversazioni passate 
- per fargli leggere dei file il costo è di 0.2$/GB per assistant per day  
    (https://serpapi.com/blog/assistant-api-openai-beginner-tutorial/)  
### Function calling:
- è uno dei tool a disposizione, fa si che chatGPT faccia chiamate all'API 
- servono il doppio delle chiamate: una per valutare se serva la funzione, poi se serve il backend la chiama e invia i dati in una nuova richiesta
    (https://sourajit16-02-93.medium.com/call-your-own-api-from-chatgpt-natural-language-to-action-47cbaf568b56)    
### Fine Tuning:
- è possibile a pagamento, fornendo al modello i dati in JSONL su cui vogliamo allenarlo (tra i 10 e i 100 esempi) 
- prezzo: 100.000 token per 3 epoche: 2.40 $ 
- è possibile anche fare fine tuning in base alle conversazioni passate 
- permette di avere un modello fedele anche con meno esempi e messaggi più corti -> riduzione dei costi futuri 
- è possibile farlo anche su un modello su cui è già stato fatto per migliorarlo ancora 
- è possibile farlo anche con function calling
    (https://www.linkedin.com/pulse/how-fine-tune-chatgpt-gpt-35-turbo-utilizing-new#:~:text=Prepare%20Your%20Data,of%2050%20to%20100%20examples.)
    (https://sintra.ai/blog/chatgpt-fine-tuning)
    (https://help.openai.com/en/articles/6811186-how-do-i-format-my-fine-tuning-data)
### RAG e ricreca semantica
- sono tecniche che vengono applicate all'input dei LLM per avere risposte migliori
- la RAG consente ai LLM di sfruttare risorse di dati aggiuntive senza bisogno di retraining
### l'uso della quota a disposizione è visibile dal sito, ma ogni chiamata ad openAI ritorna anche il numero di token usati, quindi è possibile sommarli;
- per il fine tuning è possibile fare una stima piuttosto accurata contando i token
