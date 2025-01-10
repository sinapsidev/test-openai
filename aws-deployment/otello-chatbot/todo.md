# Bug:
## Fronted
- all' aggiornamento della pagina sparisce l'icona di Otello nella pagina Profilo utente
- ad ogni chiamata alla lambda che fallisce si interrome la conversazione ed è necessario ricaricare la pagina (basterebbe un messaggio di errore)

# Milgioramenti:
## Fronted
- usare i servizi appositi del client per le chiamate fetch in modo da avere l'aggiornamento automatico dei token
## Lambda
- rendere le chat con otello continue all'interno di un contesto (per ora ogni messaggio è a sè)
- aggiungere uan soglia di caratteri per la fetch a Logica al di sotto della quale non usa file ma include i dati nella risposta