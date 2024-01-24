import os
from openai import OpenAI
import requests
import json


function_description = [
    {
        'name': 'get_data_from_DEMOAPI',
        'description': 'fetch the DEMOAPI and get the data as a csv file',
        'parameters': {
            'type': 'object',
            'properties': {}
        }
    }
]

def get_data_from_DEMOAPI():
    """fetch the api and returns data"""
    response_API = requests.get('https://6d69-93-149-39-162.ngrok-free.app/data')
    data = response_API.text
    return data


# gpt response
client = OpenAI(
  api_key=os.environ['OPENAI_API_KEY'],
)

# Generating response back from gpt-3.5-turbo
request = 'Give me an analyis of the data from the DEMOAPI'

response1 = client.chat.completions.create(
        model = 'gpt-3.5-turbo',
        messages = [{'role': 'user', 'content': request}],
        functions = function_description,
        function_call = 'auto'
)

response_message = response1.choices[0].message
if dict(response_message).get('function_call'):
    function_call = response1.choices[0].message.function_call
    function_arguments = json.loads(function_call.arguments)
    
    data = get_data_from_DEMOAPI()
    
    response_2 = client.chat.completions.create(
      model="gpt-3.5-turbo",
      messages=[
            {"role": "user", "content": request},
            {"role": "assistant", "content": None, "function_call": {"name": "get_current_weather", "arguments": json.dumps(function_arguments)}},
            {"role": "function", "name": "get_data_from_DEMOAPI", "content": json.dumps(data)}
        ],
      functions=function_description
    )

    # Finally, we print the assistant's response
    print(response_2.choices[0].message.content)
else:
    print(response_message.content)


"""
Risposta:

The data from the DEMOAPI is in CSV format and contains information about different interventions related to various types of equipment. Here is a summary of the 
available data:

- Group: Information about the group or category the intervention belongs to.
- Anteprima, Identificativo, Avvisi, Sede, Cliente, Località luogo, Tipologia intervento, Durata, Luogo, Inizio, Data Inizio Prevista, Data Fine Prevista, Modello Oggetto, Oggetto, Codice 1 Oggetto, Codice 2 Oggetto, Lavorazione Prevista, Nr Fasi, Richiesta, Commessa, Chiamante Richiesta, Tipologia Richiesta, Settore Unità di Business, Data Prima Fase Non Completata, Mese Prima Fase Non Completata, Anno Prima Fase Non Completata, Gruppo Contratto di Manutenzione, Situazione Materiale, Ordine Cliente, Data Ordine Cliente, Urgenza, Grafico: Details about the intervention, including its identification, location, duration, requested work, and other relevant information.

Based on this information, it appears that the data includes interventions related to maintenance and repair tasks on different types of equipment. The interventions have various durations, locations, and urgency levels.

Please note that further analysis of the data may be required to derive more insights or specific information based on your needs.
"""