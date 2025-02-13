import os
from dotenv import load_dotenv
import google.generativeai as genai
from prompts.prompt import prompt

load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

def get_gemini_response(query: str, text: str) -> str:
    """Generate a response using Gemini with query context."""
    model = genai.GenerativeModel('gemini-pro')
    formatted_prompt = prompt.format(query=query, text=text)
    response = model.generate_content(formatted_prompt)
    return response.text