# 🎥 VideoMate AI

🚀 **VideoMate AI** is an intelligent tool that extracts transcriptions from YouTube videos and returns relevant timestamps based on user queries. It also provides a clickable YouTube link and a short summary to highlight key points.

## ✨ Features
- 📌 **YouTube Video Transcription**: Extracts transcriptions along with timestamps.
- 🔍 **Intelligent Query Search**: Finds relevant sections based on user queries.
- ⏱️ **Timestamp-Based Navigation**: Returns clickable YouTube URLs to jump directly to relevant parts.
- 📝 **Concise Summaries**: Generates short summaries highlighting the main points related to the query.

## 🛠️ Technologies Used
- 🐍 **Python** - Core language for backend processing
- 🎬 **YouTube Transcript API** - Fetches transcriptions from YouTube videos
- 📏 **Fixed-Size Chunking** - Splits text into manageable segments
- 🧠 **Sentence Transformers** - Generates embeddings for efficient query retrieval
- 📦 **Qdrant Vector Store** - Stores and retrieves embeddings efficiently
- 🤖 **Gemini 2.0 LLM** - Processes queries and generates relevant responses
- 🌐 **FastAPI** - Backend framework for API development
- 🎨 **HTML, CSS, JavaScript** - Frontend technologies for user interface

## 🏗️ Installation & Setup

### 1️⃣ Clone the Repository
```bash
  git clone https://github.com/adityadeshpande03/VideoMate-AI
  cd VideoMate-AI
```

### 2️⃣ Create a Virtual Environment & Install Dependencies
```bash
  python -m venv venv
  source venv/bin/activate  # On Windows use `venv\Scripts\activate`
  pip install -r requirements.txt
```

### 3️⃣ Run the Backend
```bash
  cd src
  python run_app.py
```

### 4️⃣ Run the Frontend (if applicable)
Navigate to the frontend directory and start a local server:
```bash
  cd frontend
  click on index.html to run the file
```
### NOTE - PLEASE ADD GOOGLE API KEY IN .env FILE (API KEY IS AVAIALABLE FOR FREE ON GOOGLE AI STUDIO)

## 🐳 Using Docker

### Pull the Docker Image
```bash
  docker pull adityadeshpande03/video-mate-ai:latest
```

### Run the Container
```bash
  docker run -p 8000:8000 adityadeshpande03/video-mate-ai:latest
```

## 🛠️ Usage
#### 1️⃣ Enter the YouTube video URL in the input field.
#### 2️⃣ Submit a query related to the video content.
#### 3️⃣ Get relevant timestamps, clickable YouTube links, and a concise summary!

## 🎯 Future Enhancements
✅ Support for multiple languages
✅ Real-time speech-to-text transcription
✅ Improved UI/UX with interactive charts

---

💡 **Transform the way you explore YouTube videos with VideoMate AI!** 🎥🚀

---

Made with ❤️ by Adi | [GitHub Repository](https://github.com/adityadeshpande03/VideoMate-AI)
