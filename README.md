# AI Agent Coder

A mobile-friendly web app where you describe your project and an AI generates the code (HTML/CSS/JS), runs it in a live preview, and supports real-time edits.

## 🧠 Powered by Gemini AI

### 🚀 Features

- 📦 Generates full web projects from your prompt
- 🖼 Live preview
- 🛠 File view + Edit via prompt
- 🐛 Auto error fixing by AI

## 🛠 How to Deploy on Render

1. Fork or upload this repo to GitHub.
2. Go to [https://render.com](https://render.com)
3. Create new Web Service.
4. Set:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: Node
5. Add Environment Variable:
   - `GEMINI_API_KEY=your_key_here`

You're ready to go!

## 📁 Folder Structure

- `server.js` - Main backend logic
- `public/` - Frontend UI
- `user_projects/` - Generated code files
- `utils/gemini.js` - Gemini API wrapper