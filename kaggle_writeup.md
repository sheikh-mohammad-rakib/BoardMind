# Build With Gemma @ Bangladesh - BoardMind Submission

## 1. Problem Statement
In Bangladesh, university students and researchers frequently rely on dense, messy whiteboard sessions to collaborate on complex topics like calculus, system architecture, or machine learning algorithms (like Linear Regression). However, capturing and digitizing these multi-lingual (Bangla and English) notes is a highly manual, error-prone process. Students often take photos of whiteboards that end up lost in their camera rolls, never converted into actionable study material. This creates a barrier to effective revision and knowledge sharing, especially when preparing for exams.

## 2. Solution Overview
**BoardMind** is an interactive, AI-powered study guide application. It allows students to simply snap a photo of any messy whiteboard and instantly digitizes it. The app doesn't just extract text; it interprets diagrams, extracts pseudocode, and structures the chaotic board into a clean Markdown summary. Furthermore, it provides an interactive chat interface where students can ask follow-up questions, generate flashcards, or ask for explanations in conversational Bangla.

## 3. How Gemma is Used
We utilized **Gemma 4 Vision** (via the Google AI Studio multimodal endpoint for this prototype) as the core engine of our application. 
- **Why Gemma:** Gemma's lightweight nature and powerful vision-to-text capabilities make it perfect for edge/on-device educational tools in the future. 
- **Prompting:** We carefully prompted the model to act as an expert study assistant, instructing it to not only transcribe but to intelligently structure the output into headers, code blocks, and bullet points.

## 4. Technical Architecture
- **Frontend:** Next.js 16 (App Router) with React, built for lightning-fast edge deployment.
- **Styling:** A custom, highly editorial UI using Tailwind CSS and raw CSS variables, designed to feel human, warm, and academic (moving away from generic "AI" aesthetics).
- **Backend:** Next.js Serverless API Routes.
- **AI Integration:** `@google/generative-ai` SDK handling multimodal (image + text) payloads.

## 5. Impact and Validation
Our prototype successfully translates complex, hand-drawn diagrams (e.g., a Linear Regression graph with formulas) into highly accurate Markdown text. This drastically reduces the time students spend manually typing out notes, allowing them to focus entirely on understanding the material. 

### Limitations and Future Work
Currently, the application relies on cloud APIs. In the future, we plan to utilize optimized Gemma 2B variants running locally via WebGPU (using tools like WebLLM) to allow this tool to function completely offline during internet outages or load-shedding in rural Bangladesh.
