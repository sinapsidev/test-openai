# test-openai

Applicazione web che implementa un chatbot usando chatGPT3.5 come LLM  

per funzionare necessita di una chiave per l'API in un file .env

### Idee
- con un assitente si può assegnare un thread ad ogni utente, in modo che il modello abbia taraccia delle conversazioni passate (https://serpapi.com/blog/assistant-api-openai-beginner-tutorial/)  
- è possibile che charGPT faccia chiamate all'API (https://sourajit16-02-93.medium.com/call-your-own-api-from-chatgpt-natural-language-to-action-47cbaf568b56)    
- fare fine tuning è possibile a pagamento, fornendo al modello i dati in JSONL su cui vogliamo allenarlo (https://www.linkedin.com/pulse/how-fine-tune-chatgpt-gpt-35-turbo-utilizing-new#:~:text=Prepare%20Your%20Data,of%2050%20to%20100%20examples.)