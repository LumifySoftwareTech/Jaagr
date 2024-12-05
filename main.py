from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from langchain_ollama import OllamaLLM
from textblob import TextBlob
import random
import json

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize Ollama model using LangChain
model = OllamaLLM(model="llama3")

# Define the psychologist persona
system_message = """
You are a compassionate and empathetic psychologist who incorporates the philosophy of Alfred Adler, 
especially concepts from "The Courage to Be Disliked," and Viktor Frankl from "Man’s Search for Meaning." 
You listen actively and respond in a gentle, understanding, and non-judgmental way. When someone shares 
their feelings, you validate their emotions and, when appropriate, share insights from Adlerian and 
Franklian psychology, including themes like the separation of tasks, finding meaning in suffering, living 
in the here and now, and interpersonal relationships.
"""
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/test_static')
def test_static():
    return app.send_static_file('styles.css')  # Replace with any static file name



# Load knowledge bases from JSON files
def load_knowledge_bases():
    knowledge_base = []
    try:
        with open("courage_to_be_disliked.json", "r") as adler_file:
            knowledge_base.extend(json.load(adler_file))
        with open("mans_search_for_meaning.json", "r") as frankl_file:
            knowledge_base.extend(json.load(frankl_file))
    except Exception as e:
        print(f"Error loading knowledge bases: {e}")
    return knowledge_base

knowledge_base = load_knowledge_bases()

# Function to detect sentiment
def analyze_sentiment(text):
    blob = TextBlob(text)
    sentiment = blob.sentiment.polarity  # Returns a value between -1 (negative) and 1 (positive)

    if sentiment < -0.3:
        return 'sad'
    elif sentiment > 0.3:
        return 'happy'
    else:
        return 'neutral'

# Function to match user input to the knowledge base
def match_to_knowledge(user_input):
    for entry in knowledge_base:
        if any(keyword.lower() in user_input.lower() for keyword in entry.get("keywords", [])):
            return entry
    return None

# Function to generate diverse responses
def get_diverse_response(user_input):
    responses = [
        "I understand how you feel, can you tell me more about it?",
        "I'm here for you, it's okay to feel like that. How has your day been?",
        "I'm listening, would you like to share what’s been on your mind?",
        "It's tough, but you're doing great by talking about it. What else is bothering you?"
    ]
    return random.choice(responses)

@app.route('/chat', methods=['POST'])
def chat_with_ollama():
    user_input = request.json.get('message')
    
    if not user_input:
        return jsonify({"error": "Message is required"}), 400

    try:
        # Analyze sentiment
        sentiment = analyze_sentiment(user_input)

        # Match user input to the knowledge base
        knowledge_entry = match_to_knowledge(user_input)

        # Generate a response based on the knowledge base or sentiment
        if knowledge_entry:
            response = (
                f"Here's an insight inspired by {knowledge_entry['category']} that might help: "
                f"{knowledge_entry['takeaway']}"
            )
        elif sentiment == 'sad':
            response = "I'm really sorry you're feeling down. Let's talk more about what's going on."
        elif sentiment == 'happy':
            response = "That's wonderful to hear! What’s been going well in your life?"
        else:
            response = get_diverse_response(user_input)

        # Combine the system message with the user input to guide the model's response
        prompt = system_message + "\nUser: " + user_input + "\nPsychologist: " + response

        # Use OllamaLLM to get a response
        result = model.invoke(input=prompt)
        return jsonify({"response": result})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
