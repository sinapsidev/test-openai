let session_id = '';
// const server_url = 'http://localhost:8080';
const server_url = 'https://jz7gbb70nb.execute-api.us-east-1.amazonaws.com/dev';
const loader = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" class="h-10 w-10 text-sky-600"><circle fill = "none" stroke-opacity="1" stroke = "#0284C7" stroke - width=".5" cx = "100" cy = "100" r = "0" ><animate attributeName="r" calcMode="spline" dur="2" values="1;80" keyTimes="0;1" keySplines="0 .2 .5 1"repeatCount="indefinite"></animate><animate attributeName="stroke-width" calcMode="spline" dur="2" values="0;25" keyTimes="0;1"keySplines="0 .2 .5 1" repeatCount="indefinite"></animate><animate attributeName="stroke-opacity" calcMode="spline" dur="2" values="1;0" keyTimes="0;1"keySplines="0 .2 .5 1" repeatCount="indefinite"></animate></ ></svg > ';
const token = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJQa094dmpyLUpBVzRDR0l2V0tlNUhCNi01aGpNX2RnVVd1aldfT2ktVEVJIn0.eyJleHAiOjE3MDc0OTAzNjksImlhdCI6MTcwNzQ4ODU2OSwianRpIjoiMGEwYzg4NzctM2Y4Ny00OTY3LWJmZjgtOTdlNTc5YWEzNGUzIiwiaXNzIjoiaHR0cHM6Ly9sb2dpY2FkZXYyLnNucHMuaXQvYXV0aC9yZWFsbXMvbG9naWNhIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6IjY3NGFhYWMxLWRhNDYtNDMxYS1hNTM1LWM5ZWZlYzAzNzQ4NiIsInR5cCI6IkJlYXJlciIsImF6cCI6InhkYkF1dGhDbGllbnQiLCJzZXNzaW9uX3N0YXRlIjoiOTg5OTJhYTMtYjk3NS00MDczLTk3OGUtOTI1Yzk4ZThjYWMwIiwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbInRlbmFudHMtb3duZWQtbWFuYWdlciIsIm9mZmxpbmVfYWNjZXNzIiwidGVuYW50cy1hbGwtcmVhZC13cml0ZSIsInRlbmFudHMtb3duZWQtd3JpdGUiLCJ1bWFfYXV0aG9yaXphdGlvbiIsInRlbmFudHMtb3duZWQtcmVhZCIsInRlbmFudHMtb3duZWQtcmVhZC13cml0ZSIsInRlbmFudHMtYWxsLW1hbmFnZXIiXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6ImVtYWlsIHByb2ZpbGUiLCJzaWQiOiI5ODk5MmFhMy1iOTc1LTQwNzMtOTc4ZS05MjVjOThlOGNhYzAiLCJ0ZW5hbnRzIjpbIiEwIiwiITIiLCIhNCIsIiE5OSIsIiExMCIsIiExMDAiLCIhMjQiXSwiZW1haWxfdmVyaWZpZWQiOnRydWUsImFjY291bnRfaWQiOiI2NzRhYWFjMS1kYTQ2LTQzMWEtYTUzNS1jOWVmZWMwMzc0ODYiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJhbGVzc2FuZHJvc3Bhc2lhbm9Ac25wcy5pdCIsImdpdmVuX25hbWUiOiIiLCJmYW1pbHlfbmFtZSI6IiIsImVtYWlsIjoiYWxlc3NhbmRyb3NwYXNpYW5vQHNucHMuaXQifQ.cWUOWS5jcfcfZ2NGBrDJdt24VqtRAKVKcAjf6BmETJXtiK4Jxcu4NogOHc4cBIewJA-s1i4OubDQKnSaWxoZgkE2JZPhG6z2qJLAuf1Xngh0nOTAGfs9YAI6eP04hyou-_q4dj52Zwultaj_Vdc9uc0IsfV477G5MTYfL74ATZK5fUQx3_-D74pnYr8iJ2bQPMC4VXy65Wcsj3EpHwsqtQmKN-X7FhutM4VQtYwcrk4fiG5QuxMpKRLpZI-pwgTQVY-r2krD7N1jSaGNe_C1r5HRAQwuySHPd9Xd6wPEnDSdYmbt8RUq75RIvy3d0k0m5ToRlz3o46my9uTAXRiSbw'


// fetch functions
async function sendMessage() {
    let messageInput = document.getElementById('message-input');
    let message = messageInput.value.trim();

    if (message !== '') {
        appendMessage('user', message);
        appendMessage('bot', ' ', loader);
        // fa la richiesa al chatbot
        messageInput.value = '';
        let res = await fetch(server_url + '/askGPT', {
            method: 'POST',
            body: JSON.stringify({ botReq: message, access_token:token, id_addetto:433 }),
            headers: {
                "Content-Type": "application/json",
            },
        })

        if (res.ok) {
            res = await res.json();
            deleteMessage();
            appendMessage('bot', res.botRes);
        }
        else 
        deleteMessage();
        // appendMessage('bot', 'Errore nella risposta');
    }
}


async function createChat() {
    let res = await fetch(server_url + '/createChat', {
        method: 'POST'
    })

    if (res.ok) {
        res = await res.json();
        session_id = res.session_id;
    }
}

async function deleteChat() {
    let res = await fetch(server_url + '/deleteChat', {
        method: 'POST',
        body: JSON.stringify({ session_id }),
        headers: {
            "Content-Type": "application/json",
        },
    })

    if (res.ok) {
        console.log('session deleted');
    }
}

// other functions
const user_msg_classes = "user-message w-full -my-1 flex flex-col items-end"
const bot_msg_classes = "bot-message w-full -my-1 flex flex-col items-start"
const user_inner_msg_classes = "w-fit max-w-[80vw] bg-sky-600 mr-2 px-4 py-2 rounded-xl"
const user_profile_pic_classes = "h-12 w-12 mr-2 -mt-2 mb-2 rounded-full"
const bot_inner_msg_classes = "w-fit max-w-[80vw] bg-gray-100 ml-2 px-4 py-2 rounded-xl"
const bot_profile_pic_classes = "h-10 w-10 ml-2 -mt-2 mb-2 rounded-full"

function appendMessage(sender, text, html = '') {
    let chatMessages = document.getElementById('chat-messages');
    let messageDiv = document.createElement('div');
    messageDiv.className = sender === 'user' ? user_msg_classes : bot_msg_classes;
    chatMessages.appendChild(messageDiv);
    let innerDiv = document.createElement('div');
    innerDiv.className = sender === 'user' ? user_inner_msg_classes : bot_inner_msg_classes;
    innerDiv.innerText = text;
    // innerDiv.innerHtml = html;
    innerDiv.insertAdjacentHTML( 'beforeend', html)
    messageDiv.appendChild(innerDiv);
    
    let profilePic = document.createElement('img');
    profilePic.className = sender === 'user' ? user_profile_pic_classes : bot_profile_pic_classes;
    profilePic.src = sender === 'user' ? './images/user_avatar1.png' : './images/Otello_principale.png'
    messageDiv.appendChild(profilePic);

    chatMessages.scrollTop = chatMessages.scrollHeight;
}
function deleteMessage() {
    const element = document.querySelector('#chat-messages > div:last-of-type ');
    element.remove();
}


// events: 
let sendBtn = document.getElementById('send-btn');
sendBtn.addEventListener("click", async () => await sendMessage());
// window.onload = async () => await createChat();
// window.addEventListener("beforeunload", async () => await deleteChat());