import os
from openai import OpenAI
import requests
import json
import time


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
    time.sleep(0.500)

response = client.beta.threads.delete(Thread.id)

# check
assert response.id == Thread.id

"""
Output:

"""