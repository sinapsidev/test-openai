import os
from openai import OpenAI
import requests
import json
import time


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

assistant_id = 'asst_wwLNZpXMlHIQYSFJR2EaJVOF'

# Creazione delle entità
Assistant = client.beta.assistants.retrieve(assistant_id)
Thread = client.beta.threads.create()
Message = client.beta.threads.messages.create(
  Thread.id,
  role="user",
  content="How does AI work? Explain it in 50 simple words",
)
Run = client.beta.threads.runs.create(
  thread_id=Thread.id,
  assistant_id=Assistant.id
#   instructions=""
)

done = False
while not done:
    run = client.beta.threads.runs.retrieve(
        thread_id=Thread.id,
        run_id=Run.id
    )
    if run.status == 'completed':
        done = True
        messages = client.beta.threads.messages.list(
            thread_id=Thread.id
        )

        iter_messages = iter(messages)
        
        def reversePrint(iterator):
            message = next(iter_messages, '-1')
            if(not message == '-1'):
                reversePrint(iter_messages)
                print(message.role+':')
                print(message.content[0].text.value)
            
        reversePrint(iter_messages)
        # while not iter_messages:
        #     message = next(iter_messages, '-1')
        #     print(message.role+':')
        #     print(message.content[0].text.value)
        # for message in messages:
        #     print(message.role+':')
        #     print(message.content[0].text.value)
    time.sleep(0.500)

response = client.beta.threads.delete(Thread.id)

# check
print('\nSuccess: ' + (response.id == Thread.id))

"""

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
            {"role": "assistant", "content": None, "function_call": {"name": "get_data_from_DEMOAPI", "arguments": json.dumps(function_arguments)}},
            {"role": "function", "name": "get_data_from_DEMOAPI", "content": json.dumps(data)}
        ],
      functions=function_description
    )

    # Finally, we print the assistant's response
    print(response_2.choices[0].message.content)
else:
    print(response_message.content)

"""