const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const fetch = require('node-fetch');  // Ensure this is installed
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const API_KEY = "AIzaSyBHUxcsjVtXaD5Zh3Z9ZZxOvTlB5KBO6BM"; // Ideally move it to .env
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

const PROJECT_DIR = './user_projects/project1';
const PREVIEW_DIR = './public/preview';

// ✅ FIXED generateContent function
async function generateContent(prompt) {
  const body = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: prompt
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024
    }
  };

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  // Get generated content from Gemini response
  const content = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  return content;
}

// ✅ /generate route
app.post('/generate', async (req, res) => {
  const { prompt } = req.body;

  try {
    const fullPrompt = `
User wants this project: ${prompt}
Create these 3 files:
- index.html
- style.css
- script.js

Use --- filename --- before each file.
Give only the code.
    `;

    const response = await generateContent(fullPrompt);

    await fs.ensureDir(PROJECT_DIR);

    const matches = [...response.matchAll(/--- (.*?) ---\n([\s\S]*?)(?=(---|$))/g)];
    for (const match of matches) {
      const filename = match[1].trim();
      const code = match[2].trim();
      const filePath = path.join(PROJECT_DIR, filename);
      await fs.outputFile(filePath, code);
      await fs.copy(filePath, path.join(PREVIEW_DIR, filename));
    }

    res.json({ message: 'Project created successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error generating project.', details: err.message });
  }
});

// ✅ /files route
app.get('/files', async (req, res) => {
  const files = await fs.readdir(PROJECT_DIR);
  const result = {};
  for (const file of files) {
    const content = await fs.readFile(path.join(PROJECT_DIR, file), 'utf-8');
    result[file] = content;
  }
  res.json(result);
});

// ✅ /edit route
app.post('/edit', async (req, res) => {
  const { file, instruction } = req.body;
  const content = await fs.readFile(path.join(PROJECT_DIR, file), 'utf-8');
  const prompt = `
This is the file ${file}:
${content}

Apply this change: ${instruction}
Return only the new version of the file.
  `;
  const newContent = await generateContent(prompt);
  await fs.outputFile(path.join(PROJECT_DIR, file), newContent);
  await fs.copy(path.join(PROJECT_DIR, file), path.join(PREVIEW_DIR, file));
  res.json({ message: 'File edited successfully.' });
});

// ✅ Preview static files
app.use('/preview', express.static(PREVIEW_DIR));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
