const res = 'chatgpt response';

async function sendMessage() {
    let messageInput = document.getElementById('message-input');
    let message = messageInput.value.trim();

    if (message !== '') {
        appendMessage('user', message);
        // fa la richiesa al chatbot
        let res = await fetch('http://localhost:8000/chat', {
            method: 'POST',
            body: JSON.stringify({ botReq: message }),
            headers: {
                "Content-Type": "application/json",
            },
        })

        if (res.ok) {
            res = await res.json();

            appendMessage('bot', res.botRes);
            messageInput.value = '';
        }
    }
}

const user_msg_classes = "user-message w-full my-0.5 flex justify-end"
const bot_msg_classes = "bot-message w-full my-0.5 flex justify-start"
const user_inner_msg_classes = "w-fit max-w-[80vw] bg-sky-600 mr-2 px-4 py-2 rounded-xl"
const bot_inner_msg_classes = "w-fit max-w-[80vw] bg-gray-100 ml-2 px-4 py-2 rounded-xl"

function appendMessage(sender, text) {
    let chatMessages = document.getElementById('chat-messages');
    let messageDiv = document.createElement('div');
    messageDiv.className = sender === 'user' ? user_msg_classes : bot_msg_classes;
    chatMessages.appendChild(messageDiv);
    let innerDiv = document.createElement('div');
    innerDiv.className = sender === 'user' ? user_inner_msg_classes : bot_inner_msg_classes;
    innerDiv.innerText = text;
    messageDiv.appendChild(innerDiv);

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

let sendBtn = document.getElementById('send-btn');
sendBtn.addEventListener("click", () => sendMessage());
