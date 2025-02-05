import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from llama_cpp import Llama

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Load the Mistral model (adjust path to where you've downloaded the model)
llm = Llama(
    model_path="mistral-7b-instruct-v0.1.Q4_K_M.gguf", 
    n_ctx=2048,  # Context window size
    n_batch=512  # Batch size
)

def generate_study_materials(text):
    try:
        # Truncate text if it's too long
        text = text[:4000]

        # Generate Summary with more explicit instructions
        summary_prompt = f"""You are an expert academic summarizer. Carefully read the following text and provide a clear, concise 3-4 paragraph summary that captures the most important ideas:

TEXT:
{text}

SUMMARY:"""
        summary_response = llm(
            prompt=summary_prompt, 
            max_tokens=500,
            stop=["TEXT:", "\n\n"],
            echo=False
        )
        summary = summary_response['choices'][0]['text'].strip()

        # Generate Quiz Questions with more structured prompting
        quiz_prompt = f"""Create 3 multiple-choice quiz questions about this text. 
IMPORTANT: Provide the output as a VALID JSON array of objects. Each object must have:
- "question": The quiz question text (string)
- "options": An array of 4 possible answers (strings)
- "correctAnswer": The index of the correct answer (integer 0-3)

TEXT:
{text}

JSON OUTPUT:"""
        
        quiz_response = llm(
            prompt=quiz_prompt, 
            max_tokens=500,
            stop=["TEXT:", "\n\n"],
            echo=False
        )
        quiz_text = quiz_response['choices'][0]['text'].strip()

        # Robust JSON parsing
        try:
            quiz_questions = json.loads(quiz_text)
        except:
            quiz_questions = [
                {
                    "question": "Sample quiz question about the text",
                    "options": ["Incorrect Option A", "Correct Option", "Incorrect Option B", "Incorrect Option C"],
                    "correctAnswer": 1
                }
            ]

        # Similar approach for flashcards
        flashcard_prompt = f"""Create 4 detailed flashcards for the most important terms and concepts in this text.
IMPORTANT: Provide the output as a VALID JSON array of objects. Each object must have:
- "term": The key term or concept (string)
- "definition": A detailed explanation of the term (string)

TEXT:
{text}

JSON OUTPUT:"""
        
        flashcard_response = llm(
            prompt=flashcard_prompt, 
            max_tokens=500,
            stop=["TEXT:", "\n\n"],
            echo=False
        )
        flashcard_text = flashcard_response['choices'][0]['text'].strip()

        # Robust JSON parsing for flashcards
        try:
            flashcards = json.loads(flashcard_text)
        except:
            flashcards = [
                {
                    "term": "Sample Term",
                    "definition": "Detailed explanation of the sample term"
                }
            ]

        return {
            "summary": summary,
            "quizQuestions": quiz_questions,
            "flashcards": flashcards
        }

    except Exception as e:
        return {"error": str(e)}

@app.route('/generate-materials', methods=['POST'])
def process_text():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    try:
        text = file.read().decode('utf-8')
        study_materials = generate_study_materials(text)
        return jsonify(study_materials)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)