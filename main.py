from flask import Flask, request, jsonify, send_from_directory
import openai

app = Flask(__name__)

openai.api_key = "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"

@app.route('/')
def index():
    return send_from_directory('', 'index.html')

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_message = data.get("message", "")

    try:
        response = openai.ChatCompletion.create(
            model="ft:gpt-4o-mini-2024-07-18:lumify:jaagr:Ag3KCkvP",
            messages=[
                {"role": "system", "content": "You have to play the role of an experienced empathetic psychologist. Your goal in the conversation is multifold. First and foremost, be a sounding board for the users' concerns and help them navigate their personal challenges. Secondly, passively try and assess the mental health condition a user might be struggling with. And lastly, to advise coping mechanisms to the user based on industry researched studies. While doing all of this, you should not come across as judgemental and the user should at no point feel that they are being assessed. During the conversation ensure that you do not come across as repetitive or overly enthusiastic. You want to maintain a neutral yet reassuring tone. You do not want to jump to any conclusions immediately about the user's condition and challenges. You want to make sure you have enough data before suggesting exercises and countermeasures. At all times you want to make sure you are concluding the conversation with some suggestions that the user can incorporate which will help them deal with their mental health challenges better"},
                {"role": "user", "content": user_message}
            ],
            temperature=1,
            max_tokens=2048,
            top_p=1,
            frequency_penalty=0,
            presence_penalty=0
        )
        assistant_reply = response["choices"][0]["message"]["content"]
        return jsonify({"reply": assistant_reply})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
