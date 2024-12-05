document.addEventListener('DOMContentLoaded', () => {
    const sendButton = document.getElementById('send-button');
    const messageInput = document.getElementById('message-input');
    const chatDisplay = document.getElementById('chat-display');
    const newChatButton = document.getElementById('new-chat');
    const chatHistory = document.getElementById('chat-history');

    // Mock previous chats for sidebar
    const previousChats = [
        { id: 1, title: 'Chat with AI (Nov 14)' },
        { id: 2, title: 'Chat with AI (Nov 15)' },
    ];

    // Initialize chat history in the sidebar
    initializeChatHistory();

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

    function initializeChatHistory() {
        chatHistory.innerHTML = ''; // Clear any existing items

        previousChats.forEach((chat) => {
            const listItem = document.createElement('li');
            listItem.textContent = chat.title;
            listItem.dataset.chatId = chat.id;

            // Click event to simulate loading a previous chat
            listItem.addEventListener('click', () => {
                loadChatHistory(chat.id);
            });

            chatHistory.appendChild(listItem);
        });
    }

    function loadChatHistory(chatId) {
        // For now, just simulate loading chat history
        chatDisplay.innerHTML = '';
        const mockMessages = [
            { sender: 'ai', text: 'Hello! How can I assist you today?' },
            { sender: 'user', text: 'I’ve been feeling a bit stressed lately.' },
            { sender: 'ai', text: 'I’m sorry to hear that. Can you tell me more about what’s causing your stress?' },
        ];

        mockMessages.forEach((message) => {
            displayMessage(message.text, message.sender);
        });

        messageInput.value = '';
    }

    function startNewChat() {
        chatDisplay.innerHTML = ''; // Clear current chat
        messageInput.value = ''; // Clear input
        displayMessage('New chat started. How can I help you today?', 'ai');
    }

    function sendMessage() {
        const message = messageInput.value.trim();
        if (!message) return;

        // Display user's message
        displayMessage(message, 'user');

        // Simulate backend response
        simulateBackendResponse(message);

        messageInput.value = '';
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

    function simulateBackendResponse(userMessage) {
        displayTypingIndicator();
        
        fetch('http://127.0.0.1:5000/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: userMessage }),
        })
            .then((response) => response.json())
            .then((data) => {
                removeTypingIndicator();
                displayMessage(data.response, 'ai');
            })
            .catch((error) => {
                removeTypingIndicator();
                displayMessage('Error: Unable to fetch response.', 'ai');
                console.error(error);
            });
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
