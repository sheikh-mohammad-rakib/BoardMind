# ✦ BoardMind: Your AI Whiteboard Tutor

<div align="center">
  <p><strong>Transform messy whiteboard photos into structured, interactive study guides instantly.</strong></p>
  <p><i>Built for the <b>Build With Gemma @ Bangladesh</b> Hackathon (Multimodal Track)</i></p>
</div>

---

## 📖 Overview

In fast-paced lectures, students often snap photos of dense, complex whiteboards filled with diagrams, math, and messy handwriting. **BoardMind** is an intelligent web application that automates the tedious process of transcribing and organizing these notes.

Powered by Google's **Gemma 4 Multimodal API**, BoardMind ingests photos of educational materials and instantly generates a comprehensive, interactive "Study Pack" with a single click.

## ✨ Features

- **🎓 Multimodal Intelligence:** Understands handwritten text, complex mathematical formulas (LaTeX), diagrams, and flowcharts.
- **⚡ Automated Study Workflows:** Generates specific, highly-structured outputs based on what you need:
  - **📝 Study Notes:** Clean, formatted Markdown summaries with headers and bullet points.
  - **🃏 Flashcards:** Auto-generates deep-understanding Q&A flashcards for spaced repetition.
  - **🎯 Practice Quiz:** Creates a 5-question multiple-choice quiz based purely on the board's content.
  - **📐 Formula Sheet:** Extracts only the math and variables into a clean LaTeX cheat sheet.
- **🌍 Bilingual Support:** Native toggle to generate all study materials in either **English** or **Bangla** to bridge the language gap for local students.
- **🛡️ Built-in Guardrails:** Automatically detects and rejects non-educational images (selfies, memes, etc.) to ensure the tool remains strictly academic.
- **💾 Export Ready:** One-click download of your generated notes as a `.md` file.

## 🛠️ Tech Stack

- **Frontend:** Next.js 16 (App Router), React, Tailwind CSS
- **Styling:** Custom "Editorial Academic" design system (raw CSS)
- **AI Model:** Gemma-4-31b-it (via Google AI Studio / Generative AI SDK)
- **Markdown Rendering:** `react-markdown` with `remark-math` and `rehype-katex` for beautiful LaTeX formula rendering.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- A [Google AI Studio API Key](https://aistudio.google.com/)

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/yourusername/boardmind.git
   cd boardmind
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up Environment Variables**
   Create a \`.env.local\` file in the root directory and add your API key:
   \`\`\`env
   GEMINI_API_KEY=your_google_ai_studio_api_key
   \`\`\`

4. **Run the Development Server**
   \`\`\`bash
   npm run dev
   \`\`\`
   Open [http://localhost:3000](http://localhost:3000) in your browser to start studying!

## 🤝 Contribution
Feel free to open an issue or submit a pull request if you have ideas on how to improve BoardMind!

## 📜 License
This project is open-source and available under the [MIT License](LICENSE).
