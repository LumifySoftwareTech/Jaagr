document.addEventListener('DOMContentLoaded', () => {
    const sendButton = document.getElementById('send-button');
    const messageInput = document.getElementById('message-input');
    const chatDisplay = document.getElementById('chat-display');
    const newChatButton = document.getElementById('new-chat');
    const chatHistory = document.getElementById('chat-history');

    // Dynamic backend URL for deployment
    const backendUrl = window.location.origin;

    // Chat history array
    let previousChats = [];

    // Initialize chat history on page load
    loadChatHistory();

    // Event listener for sending a message
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    });

    // Event listener for starting a new chat
    newChatButton.addEventListener('click', startNewChat);

    // Load chat history from the backend
    function loadChatHistory() {
        fetch(`${backendUrl}/chat-history`)
            .then((response) => response.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    previousChats = data; // Assuming data is an array of chat summaries
                    initializeChatHistory();
                } else {
                    throw new Error("Invalid chat history data");
                }
            })
            .catch((error) => {
                console.error('Error loading chat history:', error);
                displayMessage('Unable to load chat history. Please try again later.', 'ai');
            });
    }

    function initializeChatHistory() {
        chatHistory.innerHTML = ''; // Clear existing items

        previousChats.forEach((chat) => {
            const listItem = document.createElement('li');
            listItem.textContent = chat.title;
            listItem.dataset.chatId = chat.id;

            // Click event to load a specific chat
            listItem.addEventListener('click', () => {
                loadChatContent(chat.id);
            });

            chatHistory.appendChild(listItem);
        });
    }

    function loadChatContent(chatId) {
        fetch(`${backendUrl}/chat/${chatId}`)
            .then((response) => response.json())
            .then((data) => {
                chatDisplay.innerHTML = ''; // Clear current chat
                if (data.messages && Array.isArray(data.messages)) {
                    data.messages.forEach((message) => {
                        displayMessage(message.text, message.sender);
                    });
                    messageInput.value = '';
                } else {
                    throw new Error("Invalid chat content data");
                }
            })
            .catch((error) => {
                console.error('Error loading chat content:', error);
                displayMessage('Unable to load this chat. Please try again later.', 'ai');
            });
    }

    function startNewChat() {
        chatDisplay.innerHTML = ''; // Clear current chat
        messageInput.value = ''; // Clear input
        displayMessage('Hey, How can I help you today?', 'ai');
    }

    let isFetching = false;

    function sendMessage() {
        const message = messageInput.value.trim();
        if (!message || isFetching) return;

        isFetching = true; // Block additional requests
        displayMessage(message, 'user');

        fetch(`${backendUrl}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.response) {
                    displayMessage(data.response, 'ai');
                } else {
                    throw new Error('No response from server');
                }
            })
            .catch((error) => {
                displayMessage('Oops! Something went wrong. Please try again later.', 'ai');
                console.error(error);
            })
            .finally(() => {
                isFetching = false; // Allow new requests
            });

        messageInput.value = ''; // Clear the message input after sending
    }

    function displayMessage(message, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}`;
        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'bubble';
        bubbleDiv.textContent = message;
        messageDiv.appendChild(bubbleDiv);
        chatDisplay.appendChild(messageDiv);
        chatDisplay.scrollTop = chatDisplay.scrollHeight;
    }

    function displayTypingIndicator() {
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'chat-message ai typing-indicator';
        typingIndicator.id = 'typing-indicator';
        typingIndicator.innerHTML = `
            <div class="bubble">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
            </div>
        `;
        chatDisplay.appendChild(typingIndicator);
        chatDisplay.scrollTop = chatDisplay.scrollHeight;
    }

    function removeTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
});
