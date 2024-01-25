import os
from openai import OpenAI
import requests
import json
import time


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
request = 'Give me an analyis of the data from the DEMOAPI'

# Creazione delle entità
Assistant = client.beta.assistants.create(
  instructions="You are a customer support chatbot. Use your knowledge base to best respond to customer queries.",
  model="gpt-4-1106-preview",
  tools=[{"type": "retrieval"}]
)
Thread = client.beta.threads.create()
File = client.files.create(
    file=open("./datatestAPI/data.csv", "rb"),
    purpose='assistants'
)
Message = client.beta.threads.messages.create(
  Thread.id,
  role="user",
  content=request,
  file_ids=[File.id]
)
Run = client.beta.threads.runs.create(
  thread_id=Thread.id,
  assistant_id=Assistant.id
#   instructions=""
)

# Polling 
done = False
while not done:
    run = client.beta.threads.runs.retrieve(
        thread_id=Thread.id,
        run_id=Run.id
    )
    print(run.status)    
    if run.status == 'completed':
        done = True
        messages = client.beta.threads.messages.list(
            thread_id=Thread.id
        )

        # stampa la chat
        iter_messages = iter(messages)
        def reversePrint(iterator):
            message = next(iter_messages, '-1')
            if(not message == '-1'):
                reversePrint(iter_messages)
                print(message.role+':')
                print(message.content[0].text.value)
            
        reversePrint(iter_messages)
    
    elif run.status == 'requires_action':
        if run.required_action.type == 'submit_tool_outputs':
            # for lista delle chiamate, nel nostro caso è una sola => non serve
            print(run.required_action.submit_tool_outputs.tool_calls[0].function.name)
                        
            run = client.beta.threads.runs.submit_tool_outputs(
                thread_id=Thread.id,
                run_id=Run.id,
                tool_outputs=[
                    {
                        "tool_call_id": run.required_action.submit_tool_outputs.tool_calls[0].id,
                        "output": data,
                    }
                ]
            )
    time.sleep(0.500)

response = client.beta.threads.delete(Thread.id)

# check
assert response.id == Thread.id

"""
Output:

in_progress
in_progress
get_data_from_API
queued
in_progress
in_progress
in_progress
in_progress
in_progress
in_progress
in_progress
in_progress
in_progress
in_progress
in_progress
in_progress
in_progress
in_progress
in_progress
in_progress
in_progress
in_progress
in_progress
in_progress
completed
user:
Give me an analyis of the data from the DEMOAPI
assistant:
Here is an analysis of the data from the DEMOAPI:

- There are 10 entries in the data.
- The data includes information about various interventions, such as "Sostituzione Viti Ralla" (Replacement of Rail Bolts) and "Riparazione Elettrica" (Electrical Repair).
- Each intervention has details such as duration, location, start and end dates, object model, and urgency level.
- The interventions are associated with different clients and locations.
- The data also includes additional information such as order details, urgency level, and customer orders.

Please let me know if you need any further analysis or specific information from the data.
"""