import os
from openai import OpenAI
import requests
import json
import time


client = OpenAI(
  api_key=os.environ['OPENAI_API_KEY'],
)

# assistant_id = 'asst_wwLNZpXMlHIQYSFJR2EaJVOF'    # Frank0
assistant_id = 'asst_xkM3V2sEngbh8y1wvKw2WDRJ'  # O
request = 'Give me an analyis of the data from the DEMOAPI'
disclaimer = ' knowing that you can\'t make call to the API, but such data are contained in the file i have uploaded'


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
        thread.id,
        role="user",
        content=userRequest,
    )
    run = client.beta.threads.runs.create(
        thread_id=thread.id,
        assistant_id=assistant.id
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
            print(messages)
            print(' ')
            print(' ')
            chat = []

            for message in messages:
                chat.append({message.role: message.content[0].text.value})
            return (False, chat.reverse())
    
        elif r.status == 'requires_action':
            if r.required_action.type == 'submit_tool_outputs':
                print(client.beta.threads.messages.list(thread_id=threadId))
                done = True
                deleteRun(threadId, runId)
                # for lista delle chiamate, nel nostro caso è una sola => non serve
                return (True, [r.required_action.submit_tool_outputs.tool_calls[0].function.name])
        elif r.status == 'failed':
            done = True
            messages = client.beta.threads.messages.list(thread_id=threadId)
            print(messages)

        time.sleep(0.500)

def assistantFileRequest(threadId, userRequest):
    path = os.path.join(os.getcwd(), "test-openai/assistant/datatestAPI/data.csv")
    with open(path, 'rb') as file:
        data = file.read()
    file = client.files.create(
        file=data,
        purpose='assistants'
    )
    message = client.beta.threads.messages.create(
        thread_id=threadId,
        role="user",
        content=userRequest+disclaimer,
        file_ids=[file.id]
        # file_ids=['file-Y384ns5dlaXNPp7Oy7hVJ9jV']
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
            # done = True
            messages = client.beta.threads.messages.list(thread_id=threadId)
            print(messages)

            # chat = []
            # for message in messages:
            #     chat.append({message.role: message.content[0].text.value})
            # return chat.reverse()
        elif r.status == 'failed':
            done = True
            messages = client.beta.threads.messages.list(thread_id=threadId)
            print(messages)

        time.sleep(0.500)

def returnChat(chat):
    print('chat:')
    print(chat)

(Assistant, Thread, Run) = createEntities(assistant_id, request)
(requireFunction, chat) = assistantRequest(Thread.id, Run.id)

if requireFunction:
    functionResults = []
    for func in chat:
        functionResults.append(callFunction(func))

    chat = assistantFileRequest(Thread.id, request)
    returnChat(chat)
else:
    returnChat(chat)



"""
Output:


"""