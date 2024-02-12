let session_id = '';
// const server_url = 'http://localhost:8080';
const server_url = 'https://jz7gbb70nb.execute-api.us-east-1.amazonaws.com/dev';
const loader = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" class="h-10 w-10 text-sky-600"><circle fill = "none" stroke-opacity="1" stroke = "#0284C7" stroke - width=".5" cx = "100" cy = "100" r = "0" ><animate attributeName="r" calcMode="spline" dur="2" values="1;80" keyTimes="0;1" keySplines="0 .2 .5 1"repeatCount="indefinite"></animate><animate attributeName="stroke-width" calcMode="spline" dur="2" values="0;25" keyTimes="0;1"keySplines="0 .2 .5 1" repeatCount="indefinite"></animate><animate attributeName="stroke-opacity" calcMode="spline" dur="2" values="1;0" keyTimes="0;1"keySplines="0 .2 .5 1" repeatCount="indefinite"></animate></ ></svg > ';
const token = ''


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