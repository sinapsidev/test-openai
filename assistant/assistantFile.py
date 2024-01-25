import os
from openai import OpenAI
import requests
import json
import time


# def get_data_from_DEMOAPI():
#     """fetch the api and returns data"""
#     response_API = requests.get('https://6d69-93-149-39-162.ngrok-free.app/data')
#     data = response_API.text
#     return data


client = OpenAI(
  api_key=os.environ['OPENAI_API_KEY'],
)

assistant_id = 'asst_wwLNZpXMlHIQYSFJR2EaJVOF'
request = 'Give me an analyis of the data from the DEMOAPI'


def callFunction(functionName):
    if functionName == 'get_data_from_DEMOAPI':
        return ' '

def createEntities(assistantId, userRequest):
    # assistant = client.beta.assistants.create(
    #     instructions="You are a customer support chatbot. Use your knowledge base to best respond to customer queries.",
    #     model="gpt-4-1106-preview",
    #     tools=[{"type": "retrieval"}]
    # )
    assistant = client.beta.assistants.retrieve(assistantId)
    thread = client.beta.threads.create()
    message = client.beta.threads.messages.create(
        Thread.id,
        role="user",
        content=userRequest,
    )
    run = client.beta.threads.runs.create(
        thread_id=Thread.id,
        assistant_id=Assistant.id
    )
    return (assistant, thread, run)

def deleteRun(threadId, runId):
    run = client.beta.threads.runs.cancel(
        thread_id=threadId,
        run_id=runId
    )
    # check
    assert run.id == runId

def deleteEntities(threadId, runId):
    response = client.beta.threads.delete(Thread.id)
    run = client.beta.threads.runs.cancel(
        thread_id=threadId,
        run_id=runId
    )
    # check
    assert response.id == threadId
    assert run.id == runId

def assistantRequest(threadId, runId):
    # Polling 
    done = False
    while not done:
        r = client.beta.threads.runs.retrieve(thread_id=threadId, run_id=runId)

        print(r.status)    
        if r.status == 'completed':
            done = True
            messages = client.beta.threads.messages.list(thread_id=threadId)

            chat = []

            for message in messages:
                chat.push({message.role: message.content[0].text.value})
            return (False, chat.reverse())
    
        elif r.status == 'requires_action':
            if r.required_action.type == 'submit_tool_outputs':
                done = True
                deleteRun(threadId, runId)

                # for lista delle chiamate, nel nostro caso è una sola => non serve
                return [r.required_action.submit_tool_outputs.tool_calls[0].function.name]

        time.sleep(0.500)

def assistantFileRequest(threadId, userRequest):
    file = client.files.create(
        file=open("./datatestAPI/data.csv", "rb"),
        purpose='assistants'
    )
    message = client.beta.threads.messages.create(
        thread_id=threadId,
        role="user",
        content=userRequest,
        file_ids=[file.id]
    )
    run = client.beta.threads.runs.create(
        thread_id=threadId,
        assistant_id=Assistant.id
    )

    runId = run.id

    # Polling 
    done = False
    while not done:
        r = client.beta.threads.runs.retrieve(thread_id=threadId, run_id=runId)

        print(r.status)    
        if r.status == 'completed':
            done = True
            messages = client.beta.threads.messages.list(thread_id=threadId)

            chat = []
            for message in messages:
                chat.push({message.role: message.content[0].text.value})
            return chat.reverse()
    
        time.sleep(0.500)

def returnChat(chat):
    print(chat)

(Assistant, Thread, Run) = createEntities(assistant_id, request)
(requireFunction, chat) = assistantRequest(Run)

if requireFunction():
    functionResults = []
    for func in chat:
        functionResults.push(callFunction(func))

    chat = assistantFileRequest(request)
    returnChat(chat)
else:
    returnChat(chat)



"""
Output:


"""