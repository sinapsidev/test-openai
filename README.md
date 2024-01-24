# test-openai

## Applicazione web che implementa un chatbot usando chatGPT3.5 come LLM  
non c'è ancora memoria delle conversazioni -> ogni messaggio viene risposto indipendentemente dagli altri 

per funzionare necessita di una chiave per l'API in un file .env

### Idee
- con un assitente si può assegnare un thread ad ogni utente, in modo che il modello abbia taraccia delle conversazioni passate (https://serpapi.com/blog/assistant-api-openai-beginner-tutorial/)  
- Assistant:
- Function calling:
    è uno dei tool a disposizione, fa si che chatGPT faccia chiamate all'API 
    servono il doppio delle chiamate: una per valutare se serva la funzione, poi se serve il backend la chiama e invia i dati in una nuova richiesta
    (https://sourajit16-02-93.medium.com/call-your-own-api-from-chatgpt-natural-language-to-action-47cbaf568b56)    
- Fine Tuning:
    è possibile a pagamento, fornendo al modello i dati in JSONL su cui vogliamo allenarlo (tra i 10 e i 100 esempi) 
    prezzo: 100.000 token per 3 epoche: 2.40 $ 
    è possibile anche fare fine tuning in base alle conversazioni passate 
    permette di avere un modello fedele anche con meno esempi e messaggi più corti -> riduzione dei costi futuri 
    è possibile farlo anche su un modello su cui è già stato fatto per migliorarlo ancora 
    (https://www.linkedin.com/pulse/how-fine-tune-chatgpt-gpt-35-turbo-utilizing-new#:~:text=Prepare%20Your%20Data,of%2050%20to%20100%20examples.)
    (https://sintra.ai/blog/chatgpt-fine-tuning)
    (https://help.openai.com/en/articles/6811186-how-do-i-format-my-fine-tuning-data)
- l'uso della quota a disposizione è visibile dal sito, ma ogni chiamata ad openAI ritorna anche il numero di token usati, quindi è possibile sommarli;
  per il fine tuning è possibile fare una stima piuttosto accurata contando i token
