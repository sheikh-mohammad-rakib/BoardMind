"use client";

import { useState, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { ImageIcon, Sparkles, Upload, X, BookOpen, FileText, HelpCircle, Sigma, Download, Languages } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
type TabId = "notes" | "flashcards" | "quiz" | "formulas";

interface TabContent {
  id: TabId;
  label: string;
  labelBn: string;
  icon: React.ReactNode;
  prompt: string;
  promptBn: string;
}

// ── Tab definitions ────────────────────────────────────────────────────────
const TABS: TabContent[] = [
  {
    id: "notes",
    label: "Study Notes",
    labelBn: "পড়ার নোট",
    icon: <BookOpen size={14} />,
    prompt:
      "Analyze this whiteboard image thoroughly. Digitize all visible text, describe diagrams and flowcharts, extract formulas and code, and produce a clean, well-structured Markdown study guide with proper ## headers and - bullet points.",
    promptBn:
      "এই হোয়াইটবোর্ডের ছবিটি বিশ্লেষণ করুন। সমস্ত দৃশ্যমান লেখা ডিজিটাইজ করুন, ডায়াগ্রাম বর্ণনা করুন, সূত্র ও কোড বের করুন এবং একটি পরিষ্কার, সুসংগঠিত বাংলা স্টাডি গাইড তৈরি করুন।",
  },
  {
    id: "flashcards",
    label: "Flashcards",
    labelBn: "ফ্ল্যাশকার্ড",
    icon: <FileText size={14} />,
    prompt:
      "Based on this whiteboard image, generate 8–10 study flashcards. Format each card as:\n\n**Q:** [Question]\n**A:** [Answer]\n\nSeparate each card with a `---` divider. Make the questions test deep understanding, not just recall.",
    promptBn:
      "এই হোয়াইটবোর্ডের বিষয়বস্তু থেকে ৮-১০টি ফ্ল্যাশকার্ড তৈরি করুন বাংলায়।\n\nপ্রতিটি কার্ড এভাবে লিখুন:\n\n**প্রশ্ন:** [প্রশ্ন]\n**উত্তর:** [উত্তর]\n\nপ্রতিটি কার্ড `---` দিয়ে আলাদা করুন।",
  },
  {
    id: "quiz",
    label: "Practice Quiz",
    labelBn: "অনুশীলন কুইজ",
    icon: <HelpCircle size={14} />,
    prompt:
      "Based on this whiteboard image, create a 5-question multiple-choice quiz. For each question:\n1. State the question clearly\n2. Provide options **(A)**, **(B)**, **(C)**, **(D)**\n3. After all 5 questions, add an **Answer Key** section.\n\nMake the distractors plausible.",
    promptBn:
      "এই হোয়াইটবোর্ডের বিষয়বস্তু থেকে ৫টি বহুনির্বাচনী প্রশ্ন তৈরি করুন বাংলায়। প্রতিটির জন্য **(ক)**, **(খ)**, **(গ)**, **(ঘ)** বিকল্প দিন। শেষে উত্তরপত্র যোগ করুন।",
  },
  {
    id: "formulas",
    label: "Formula Sheet",
    labelBn: "সূত্র পত্র",
    icon: <Sigma size={14} />,
    prompt:
      "Extract ONLY the mathematical formulas, equations, and key constants visible in this whiteboard image. Present them in a clean formula sheet format using LaTeX ($ for inline, $$ for block equations). Group related formulas under ## headers. Include a brief one-line explanation for each.",
    promptBn:
      "এই হোয়াইটবোর্ড থেকে শুধু গাণিতিক সূত্র ও সমীকরণগুলো বের করুন বাংলায়। LaTeX ফরম্যাটে লিখুন এবং প্রতিটির সংক্ষিপ্ত ব্যাখ্যা দিন।",
  },
];

// ── Component ──────────────────────────────────────────────────────────────
export default function Home() {
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>("image/jpeg");
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("notes");
  const [isBangla, setIsBangla] = useState(false);
  const [results, setResults] = useState<Partial<Record<TabId, string>>>({});
  const [loading, setLoading] = useState<TabId | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);

  // ── File handling ──────────────────────────────────────────────────────
  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setImageMime(file.type);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImageBase64(dataUrl.split(",")[1]);
      setImagePreviewUrl(dataUrl);
      setResults({});
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageBase64(null);
    setImagePreviewUrl(null);
    setResults({});
    if (fileRef.current) fileRef.current.value = "";
  };

  // ── AI Analysis ────────────────────────────────────────────────────────
  const analyze = async (tabId: TabId) => {
    if (!imageBase64) {
      alert("Please upload a whiteboard image first.");
      return;
    }

    const tab = TABS.find((t) => t.id === tabId)!;
    const prompt = isBangla ? tab.promptBn : tab.prompt;

    setActiveTab(tabId);
    setLoading(tabId);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          imageBase64,
          imageMimeType: imageMime,
          mode: tabId,
          bangla: isBangla,
        }),
      });

      const data = await res.json();
      setResults((prev) => ({ ...prev, [tabId]: data.message }));
    } catch {
      setResults((prev) => ({
        ...prev,
        [tabId]: "⚠️ Something went wrong. Please try again.",
      }));
    } finally {
      setLoading(null);
    }
  };

  // ── Download ───────────────────────────────────────────────────────────
  const downloadNotes = () => {
    const content = results[activeTab];
    if (!content) return;
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `boardmind-${activeTab}-${isBangla ? "bn" : "en"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentResult = results[activeTab];
  const currentTab = TABS.find((t) => t.id === activeTab)!;
  const isLoading = loading === activeTab;

  return (
    <div className="boardmind-root">
      {/* ── Header ── */}
      <header className="boardmind-header">
        <div className="boardmind-logo">
          <span className="logo-icon">✦</span>
          <span className="logo-text">BoardMind</span>
          <span className="logo-sub">your whiteboard tutor</span>
        </div>
        <div className="header-badges">
          <span className="badge badge-blue">Gemma 4</span>
          <span className="badge badge-green">READY</span>
          <span className="badge badge-amber">Google AI Studio</span>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="boardmind-main">
        {/* Left: Image canvas */}
        <section className="board-panel">
          <div
            className={`board-canvas${dragging ? " dragging" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => !imageBase64 && fileRef.current?.click()}
          >
            {imagePreviewUrl ? (
              <div className="image-preview-wrapper">
                <img src={imagePreviewUrl} alt="Uploaded whiteboard" className="preview-img" />
                <button className="remove-image" onClick={clearImage} title="Remove image">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="upload-prompt">
                <div className="upload-icon-wrap">
                  <ImageIcon size={38} strokeWidth={1.5} />
                </div>
                <p className="upload-title">Drop your whiteboard photo here</p>
                <p className="upload-sub">Supports JPG, PNG, WEBP · Works with Bangla &amp; English</p>
                <button className="upload-btn" onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}>
                  <Upload size={14} />
                  Choose Image
                </button>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} />
          </div>

          {/* Language toggle */}
          <div className="lang-toggle-row">
            <span className="lang-label">Output language:</span>
            <button
              id="lang-toggle"
              className={`lang-toggle${isBangla ? " active" : ""}`}
              onClick={() => { setIsBangla(!isBangla); setResults({}); }}
            >
              <Languages size={13} />
              {isBangla ? "বাংলা (সক্রিয়)" : "Switch to বাংলা"}
            </button>
          </div>

          {/* Action buttons */}
          <div className="action-grid">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                id={`analyze-${tab.id}`}
                className={`action-btn${activeTab === tab.id && results[tab.id] ? " active" : ""}${results[tab.id] ? " done" : ""}`}
                disabled={!imageBase64 || loading !== null}
                onClick={() => analyze(tab.id)}
              >
                {tab.icon}
                {isBangla ? tab.labelBn : tab.label}
                {results[tab.id] && <span className="done-dot" />}
              </button>
            ))}
          </div>
        </section>

        {/* Right: Output panel */}
        <section className="chat-panel">
          {/* Tab bar */}
          <div className="tab-bar">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`tab-btn${activeTab === tab.id ? " active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                <span>{isBangla ? tab.labelBn : tab.label}</span>
                {results[tab.id] && <span className="tab-dot" />}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="chat-messages">
            {isLoading ? (
              <div className="chat-empty">
                <div className="analyzing-spinner">
                  <Sparkles size={24} className="spin-icon" />
                  <p>Analyzing with Gemma 4…</p>
                </div>
              </div>
            ) : currentResult ? (
              <div className="markdown-content">
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                  {currentResult}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="chat-empty">
                <div className="empty-tab-hint">
                  {currentTab.icon}
                  <p>
                    {imageBase64
                      ? `Click "${isBangla ? currentTab.labelBn : currentTab.label}" on the left to generate.`
                      : "Upload a whiteboard image to get started."}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Download bar */}
          {currentResult && !isLoading && (
            <div className="download-bar">
              <span className="download-info">
                ✦ {isBangla ? currentTab.labelBn : currentTab.label} ready
              </span>
              <button id="download-btn" className="download-btn" onClick={downloadNotes}>
                <Download size={13} />
                Download .md
              </button>
            </div>
          )}
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="boardmind-footer">
        Built for <strong>Build With Gemma @ Bangladesh</strong> · Multimodal Track · Powered by Gemma 4 &amp; Google AI Studio
      </footer>
    </div>
  );
}
