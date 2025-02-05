# studysync-ai
Creates a summary, quiz, and flash cards from a text using LLM

# Getting started

1. Download the LLM:
    1. Visit: https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.1-GGUF
    1. Download a quantized model like mistral-7b-instruct-v0.1.Q4_K_M.gguf
    1. Put the downloaded file in the backend folder and make sure `model_path` in app.py matches the file name

1. Start the Python backend:
    1. Download and install Python
    1. Open a terminal and navigate to the backend folder, then run:
    1. `pip install -r requirements.txt`
    1. `python app.py`

1. Start the React frontend:
    1. Download and install NodeJS
    1. Open a terminal and navigate to the frontend folder, then run:
    1. `npm install`
    1. `npm run dev`

Open the URL in the terminal (typically http://localhost:5173/) in a browser. Select a text file to upload (try the "example-study-text.txt" as an example) and let the local LLM work it's magic. It may take some time!