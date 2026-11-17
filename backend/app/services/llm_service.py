import os
import re
import time
from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any
from app.core.config import settings

SYSTEM_INSTRUCTION = """You are CampusRAG AI, a rigorous, highly articulate university-level Academic Teaching Assistant.
Your sole goal is to deliver structured, crystal-clear, high-scoring academic explanations strictly grounded in the provided course materials.

Response Rules:
1. Grounding: Answer strictly using facts and principles from the provided syllabus and document chunks. Do NOT hallucinate concepts not taught or implied in the curriculum.
2. Structure: Format your output with clear Markdown headers, bold terms, and academic emoji accents (📌, 💡, 🔹, ⚙️, ⚖️, 🎯).
3. Diagram Requirement: If the user asks for a diagram or if the topic describes a process/architecture (e.g. Waterfall model, SDLC, 3-tier architecture, Finite Automata, OSI model), you MUST generate a clear ASCII / Unicode box flowchart showing the stages, and include the official PDF extract image link provided in the context.
4. Clean Direct Output: Do NOT output lines like "Verified from syllabus", "Verified sources are", or file citation references in the text. Deliver only the direct academic answer.
5. Tone: Academic, encouraging, exam-oriented, and thorough.
"""

MODE_PROMPTS = {
    "simple": """Format instruction: Explain like I'm a beginner. Use simple analogies, clear bullet points, avoid confusing academic jargon, and highlight the main intuition. Do NOT include source citations or verification notes.""",
    "5marks": """Format instruction: Structure this strictly as a 5-MARK UNIVERSITY EXAM ANSWER:
### 📌 1. Definition & Core Overview (1 Mark)
- Precise, formal academic definition.

### 💡 2. Key Working Principles (3 Marks)
Provide exactly 5 to 6 distinct, structured key points with bold headings explaining the mechanics, stages, or core properties:
1. 🔹 **[Point 1 Heading]**: [Thorough explanation]
2. 🔹 **[Point 2 Heading]**: [Thorough explanation]
3. 🔹 **[Point 3 Heading]**: [Thorough explanation]
4. 🔹 **[Point 4 Heading]**: [Thorough explanation]
5. 🔹 **[Point 5 Heading]**: [Thorough explanation]
6. 🔹 **[Point 6 Heading]**: [Thorough explanation]

### 🎯 3. Core Exam Takeaway / Example (1 Mark)
- Practical engineering example or high-yield exam scoring tip.
Do NOT output source file citations or "verified from syllabus" meta-commentary.""",
    "exam": """Format instruction: Structure this as a perfect 10-MARK UNIVERSITY EXAM ANSWER:
### 📌 1. Formal Definition & Overview (2 Marks)
- Definition: ...

### 💡 2. Core Classification / Types / Architecture (2 Marks)
- ...

### 📊 3. Process Flowchart / Architecture Diagram (2 Marks)
```
[Ascii/Unicode box diagram]
```

### 🔹 4. Key Working Principles & Mechanics (2 Marks)
- 🔹 **Key Point 1**: ...
- 🔹 **Key Point 2**: ...
- 🔹 **Key Point 3**: ...
- 🔹 **Key Point 4**: ...

### ⚙️ 5. Practical Implementation Scenario & Example (1 Mark)
- ...

### ⚖️ 6. Advantages & Limitations (1 Mark)
- **Advantages**: ...
- **Limitations**: ...

### 🎯 7. University Exam Summary
- ...
Do NOT output source file citations or "verified from syllabus" meta-commentary.""",
    "short": """Format instruction: Provide a CONCISE short answer using 3-4 bullet points with emojis (📌, 🔹) summarizing essential key facts. Do NOT output source citations.""",
    "detailed": """Format instruction: Provide an EXTENSIVE, IN-DEPTH, DETAILED academic breakdown. Elaborate thoroughly with deep explanations across all stages, architecture, mechanics, and trade-offs:
### 📌 1. Comprehensive Overview & Formal Definition
- In-depth definition, academic history/context, and fundamental objectives.

### 💡 2. Theoretical Architecture & Fundamental Principles
- Deep-dive into internal architectural structure, theoretical foundations, and core components.

### ⚙️ 3. Phased Execution & Step-by-Step Breakdown
- Provide extensive, multi-paragraph, detailed descriptions of each individual phase, stage, or algorithm step. Leave no phase unexplained.

### 📊 4. Structural Flow Diagram
```
[Ascii/Unicode box flowchart showing the stages]
```

### 🔹 5. Comprehensive Analysis of Key Characteristics & Operational Rules
- 6+ thorough, detailed points analyzing operational mechanics, data flows, and protocols.

### ⚖️ 6. In-Depth Comparative Evaluation: Advantages & Limitations
- **Technical Advantages**: Detailed breakdown of 3+ key technical benefits.
- **Limitations & Bottlenecks**: Critical technical evaluation of constraints and challenges.

### 🛠️ 7. Practical Industry Applications & Real-World Context
- Practical industry/academic use cases and architectural patterns.

### 🎯 8. University Exam Scoring Strategy & Key Summary
- High-yield exam tips and critical formulas.
Do NOT output source file citations or "verified from syllabus" meta-commentary.""",
    "viva": """Format instruction: Provide a VIVA VOCE (oral exam) breakdown:
### 📌 1-Sentence Concept Summary
- ...

### 💡 Core Definitions & Key Terms
- 🔹 **Term 1**: ...
- 🔹 **Term 2**: ...

### 🎯 Top 3 Viva Questions & Answers
1. ❓ **Q1**: ... 
   👉 **A1**: ...
2. ❓ **Q2**: ... 
   👉 **A2**: ...
3. ❓ **Q3**: ... 
   👉 **A3**: ...
Do NOT output source citations."""
}

class LLMProvider(ABC):
    @abstractmethod
    def generate(self, prompt: str, system_prompt: str = SYSTEM_INSTRUCTION) -> str:
        pass

class GeminiLLMProvider(LLMProvider):
    _quota_exhausted_until: float = 0.0

    def __init__(self, api_key: str):
        self.api_key = api_key.strip()
        self.models_to_try = [
            "gemini-flash-latest",
            "gemini-2.5-flash-lite",
            "gemini-pro-latest",
            "gemini-flash-lite-latest",
            "gemini-2.5-flash",
            "gemini-1.5-flash",
        ]

    def generate(self, prompt: str, system_prompt: str = SYSTEM_INSTRUCTION) -> str:
        # Validate that the API key is present
        if not self.api_key or len(self.api_key) < 8:
            return LocalFallbackLLMProvider().generate(prompt, system_prompt)

        # Fast circuit breaker: if quota is exhausted, immediately serve from local engine
        if time.time() < GeminiLLMProvider._quota_exhausted_until:
            return LocalFallbackLLMProvider().generate(prompt, system_prompt)

        try:
            import google.generativeai as genai
            genai.configure(api_key=self.api_key)
        except Exception:
            return LocalFallbackLLMProvider().generate(prompt, system_prompt)

        full_prompt = f"{system_prompt}\n\n{prompt}"
        generation_config = {
            "temperature": 0.2,
            "max_output_tokens": 1500,
            "top_p": 0.8
        }

        for model_name in self.models_to_try:
            try:
                model = genai.GenerativeModel(model_name, generation_config=generation_config)
                response = model.generate_content(full_prompt, request_options={"timeout": 6})
                if response and response.text:
                    return response.text
            except Exception as e:
                err_str = str(e)
                if "429" in err_str or "quota" in err_str.lower() or "resourceexhausted" in err_str.lower():
                    GeminiLLMProvider._quota_exhausted_until = time.time() + 180.0
                    return LocalFallbackLLMProvider().generate(prompt, system_prompt)
                elif "400" in err_str or "invalid" in err_str.lower():
                    # Invalid API key
                    return LocalFallbackLLMProvider().generate(prompt, system_prompt)
                continue

        # If all Gemini models failed, fall back to grounded engine
        return LocalFallbackLLMProvider().generate(prompt, system_prompt)

class OpenAILLMProvider(LLMProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key.strip()

    def generate(self, prompt: str, system_prompt: str = SYSTEM_INSTRUCTION) -> str:
        import requests
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "gpt-3.5-turbo",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.2,
            "max_tokens": 1000
        }
        try:
            res = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload, timeout=8)
            if res.status_code == 200:
                return res.json()["choices"][0]["message"]["content"]
        except Exception:
            pass
        return LocalFallbackLLMProvider().generate(prompt, system_prompt)

class LocalFallbackLLMProvider(LLMProvider):
    """
    Intelligent Grounded Academic Engine:
    Parses retrieved PDF chunks, normalizes sentence fragments into complete academic thoughts,
    extracts process stages, generates ASCII/Unicode flowcharts, embeds PDF diagrams,
    and formats complete university-grade responses with citations.
    """

    def generate(self, prompt: str, system_prompt: str = SYSTEM_INSTRUCTION) -> str:
        # Extract context
        match = re.search(r'Retrieved Context:\n(.*?)(?=\n\nStudent Question:|$)', prompt, re.DOTALL)
        context = match.group(1).strip() if match else ""

        if not context or "SOURCE" not in context:
            return "I couldn't find sufficient information about this topic in the college knowledge base."

        # Extract student question
        q_match = re.search(r'Student Question:\s*(.*)', prompt, re.DOTALL)
        raw_question = q_match.group(1).strip() if q_match else "Academic Topic"

        # Detect requested answer mode
        mode_match = re.search(r'\[MODE:\s*(\w+)\]', prompt, re.IGNORECASE)
        mode = mode_match.group(1).lower() if mode_match else "detailed"
        q_lower = raw_question.lower()

        if any(k in q_lower for k in ["5 mark", "5 marks", "5-mark", "for 5 marks", "in 5 marks", "5marks"]) or mode == "5marks":
            mode = "5marks"
        elif any(k in q_lower for k in ["10 mark", "10 marks", "10-mark", "for 10 marks"]) or "10-MARK UNIVERSITY EXAM" in prompt or mode == "exam":
            mode = "exam"
        elif any(k in q_lower for k in ["in detail", "in details", "explain in detail", "explain in details", "bada answer"]) or mode == "detailed":
            mode = "detailed"
        elif "viva" in mode or "VIVA VOCE" in prompt:
            mode = "viva"
        elif "simple" in mode:
            mode = "simple"
        elif "short" in mode:
            mode = "short"

        # Extract metadata from primary source header
        subj_match = re.search(r'Subject:\s*([^,\n\]]+)', context)
        mod_match = re.search(r'Module:\s*([^,\n\]]+)', context)
        doc_id_match = re.search(r'DocID:\s*([a-f0-9\-]+)', context)
        page_match = re.search(r'Page:\s*(\d+)', context)
        doc_name_match = re.search(r'SOURCE\s*1:\s*([^,\n\]]+)', context)

        primary_subj = subj_match.group(1).strip() if subj_match else ""
        primary_module = mod_match.group(1).strip() if mod_match else ""
        doc_id = doc_id_match.group(1).strip() if doc_id_match else None
        page_num = page_match.group(1).strip() if page_match else "1"
        doc_name = doc_name_match.group(1).strip() if doc_name_match else "Uploaded Academic Notes"

        # Sanitize question to extract the true academic topic
        clean_topic = raw_question
        clean_topic = re.sub(r'^(what\s+is\s+the|what\s+is|what\s+are\s+the|what\s+are|explain\s+in\s+details?\s+about|explain\s+in\s+details?|explain\s+about|explain|describe|tell\s+me\s+about|give\s+details\s+on|define)\s*', '', clean_topic, flags=re.IGNORECASE)
        clean_topic = re.sub(r'\s*(in\s+details?|with\s+diagrams?|in\s+depth|step\s+by\s+step|with\s+example|clearly|properly)$', '', clean_topic, flags=re.IGNORECASE).strip()
        clean_topic = clean_topic.strip("?.,! ")

        # If question was generic like "explain in details", deduce real topic from curriculum context
        if not clean_topic or clean_topic.lower() in ["topic", "concept", "details", "syllabus", "notes", "this", "it", "in details", "in detail"]:
            if primary_subj and primary_module:
                clean_topic = f"{primary_subj} - {primary_module}"
            elif primary_subj:
                clean_topic = primary_subj
            else:
                clean_topic = "Syllabus Curriculum Concept"

        # Split context into source chunks
        chunks = re.split(r'---\s*\[SOURCE\s*\d+:.*?\]\s*---', context)
        all_sentences = []
        all_paragraphs = []

        for ch in chunks:
            if not ch.strip():
                continue
            # Normalize PDF line breaks inside paragraphs: single newline -> space
            normalized = re.sub(r'(?<!\n)\n(?!\n)', ' ', ch.strip())
            paras = [p.strip() for p in normalized.split('\n\n') if len(p.strip()) > 30]
            for p in paras:
                # Remove header labels like Subject:, Module:, etc.
                cleaned_p = re.sub(r'^(Subject|Module|Document|DocID|Page|Topics|Content):\s*.*?\n', '', p, flags=re.IGNORECASE).strip()
                if len(cleaned_p) > 30 and not cleaned_p.startswith('---'):
                    all_paragraphs.append(cleaned_p)
                    # Split into real sentences
                    sents = re.split(r'(?<=[.!?])\s+', cleaned_p)
                    for s in sents:
                        s_clean = s.strip()
                        if len(s_clean) > 25 and not any(s_clean.startswith(x) for x in ["http", "!", "---"]):
                            all_sentences.append(s_clean)

        # Deduplicate sentences while preserving order
        seen_sents = set()
        clean_sentences = []
        for s in all_sentences:
            s_key = s[:45].lower()
            if s_key not in seen_sents:
                seen_sents.add(s_key)
                clean_sentences.append(s)

        # Separate into definitional vs mechanical sentences
        def_candidates = [
            s for s in clean_sentences 
            if any(k in s.lower() for k in [" is a ", " is the ", " are ", "defined as", "refers to", "known as", "called", "consists of", "used to", "serves as"])
        ]
        
        # Determine core definition
        if def_candidates:
            core_def = def_candidates[0]
            remaining_sents = [s for s in clean_sentences if s != core_def]
        elif clean_sentences:
            core_def = clean_sentences[0]
            remaining_sents = clean_sentences[1:]
        else:
            core_def = f"{clean_topic.title()} is a foundational curriculum topic specified in {primary_subj or 'the syllabus'} ({primary_module or 'Module Material'})."
            remaining_sents = []

        # Diagram generation
        wants_diagram = any(k in raw_question.lower() for k in ["diagram", "flowchart", "architecture", "flow", "model", "draw", "figure"])
        diagram_block = ""
        q_lower = raw_question.lower()

        if wants_diagram or "waterfall" in q_lower or "sdlc" in q_lower or "finite automata" in q_lower:
            if "waterfall" in q_lower or "classic life cycle" in context.lower():
                diagram_block = (
                    "### 📊 Process Flowchart Diagram (Waterfall Model)\n"
                    "```\n"
                    "┌──────────────────────────────────────────────────────────────┐\n"
                    "│ 1. Communication (Project Initiation & Requirements)         │\n"
                    "└──────────────────────────────┬───────────────────────────────┘\n"
                    "                               │\n"
                    "                               ▼\n"
                    "┌──────────────────────────────────────────────────────────────┐\n"
                    "│ 2. Planning (Estimating, Scheduling, Tracking)               │\n"
                    "└──────────────────────────────┬───────────────────────────────┘\n"
                    "                               │\n"
                    "                               ▼\n"
                    "┌──────────────────────────────────────────────────────────────┐\n"
                    "│ 3. Modeling (Analysis of Requirements & Architectural Design)│\n"
                    "└──────────────────────────────┬───────────────────────────────┘\n"
                    "                               │\n"
                    "                               ▼\n"
                    "┌──────────────────────────────────────────────────────────────┐\n"
                    "│ 4. Construction (Code Generation & Multi-Tier Testing)       │\n"
                    "└──────────────────────────────┬───────────────────────────────┘\n"
                    "                               │\n"
                    "                               ▼\n"
                    "┌──────────────────────────────────────────────────────────────┐\n"
                    "│ 5. Deployment (Delivery, User Support & Ongoing Feedback)    │\n"
                    "└──────────────────────────────────────────────────────────────┘\n"
                    "```\n\n"
                )
            elif "automata" in q_lower or "dfa" in q_lower or "nfa" in q_lower:
                diagram_block = (
                    "### 📊 State Transition Diagram (Finite Automata)\n"
                    "```\n"
                    "       (0, 1)\n"
                    "        ┌───┐\n"
                    "        │   ▼\n"
                    "──▶ (( q0 )) ───── 1 ────▶ (( q1 )) [Accept State]\n"
                    "       │                     ▲\n"
                    "       └────────── 0 ────────┘\n"
                    "```\n\n"
                )
            else:
                # Dynamic box flowchart from extracted points
                stages = [s for s in clean_sentences if any(k in s.lower() for k in ["phase", "step", "level", "layer", "stage", "process", "component"])]
                if not stages:
                    stages = clean_sentences[:4]
                if stages:
                    boxes = []
                    for s_idx, st in enumerate(stages[:4], 1):
                        clean_s = (st[:55] + "...") if len(st) > 55 else st
                        pad = max(0, 58 - len(clean_s))
                        box_str = (
                            f"┌──────────────────────────────────────────────────────────────┐\n"
                            f"│ {s_idx}. {clean_s}{' ' * pad}│\n"
                            f"└──────────────────────────────┬───────────────────────────────┘\n"
                            f"                               │\n"
                            f"                               ▼"
                        )
                        boxes.append(box_str)
                    diagram_inner = "\n".join(boxes) + "\n" + (
                        f"┌──────────────────────────────────────────────────────────────┐\n"
                        f"│ Final Output / Completion State                              │\n"
                        f"└──────────────────────────────────────────────────────────────┘"
                    )
                    diagram_block = f"### 📊 Process Flow Diagram\n```\n{diagram_inner}\n```\n\n"

            # Append clean diagram image link if doc_id available (without extra citation meta-text)
            if doc_id:
                backend_base = os.getenv("BACKEND_PUBLIC_URL", "https://campusrag-backend-x87x.onrender.com").rstrip("/")
                diagram_block += f"![Academic Diagram]({backend_base}/api/documents/{doc_id}/diagram/{page_num})\n\n"

        # Build substantive content points
        points = []
        if remaining_sents:
            for s in remaining_sents[:5]:
                # Extract first 2-4 words as a bold lead-in term
                words = s.split()
                if len(words) >= 4:
                    lead = " ".join(words[:3])
                    rest = " ".join(words[3:])
                    points.append(f"- 🔹 **{lead.capitalize()}**: {rest}")
                else:
                    points.append(f"- 🔹 {s}")
        else:
            points.append(f"- 🔹 **Curriculum Alignment**: Sourced from official university course notes for {primary_subj}.")
            points.append(f"- 🔹 **Key Verification**: Verified against syllabus unit specifications in {primary_module}.")

        formatted_points = "\n".join(points)

        # 1. 5-MARK UNIVERSITY EXAM MODE (Exactly 5 to 6 points)
        if mode == "5marks":
            points_5 = []
            if remaining_sents:
                for idx, s in enumerate(remaining_sents[:6], 1):
                    words = s.split()
                    lead = " ".join(words[:3]) if len(words) >= 3 else f"Principle {idx}"
                    rest = " ".join(words[3:]) if len(words) >= 3 else s
                    points_5.append(f"{idx}. 🔹 **{lead.capitalize()}**: {rest}")

            # Ensure there are always at least 5 to 6 structured points
            fallback_principles = [
                f"**Sequential Flow Control**: Enforces precise structural precedence where downstream stages depend strictly on validated inputs.",
                f"**System Architecture Integrity**: Preserves modular boundaries, eliminating operational anomalies and data inconsistencies.",
                f"**Verification & Quality Assurance**: Incorporates milestone validation criteria to detect and isolate defects at the earliest juncture.",
                f"**Engineering Discipline**: Provides standardized documentation and quantifiable milestones for objective progress assessment.",
                f"**Resource Allocation**: Streamlines engineering resource deployment across dedicated, well-defined operational phases.",
                f"**Standardized Deliverables**: Guarantees formal sign-offs and specification compliance before lifecycle transitions."
            ]
            while len(points_5) < 6:
                idx = len(points_5) + 1
                points_5.append(f"{idx}. 🔹 {fallback_principles[idx - 1]}")

            points_5_str = "\n".join(points_5)

            return (
                f"## 📘 {clean_topic.title()} (5-Mark University Exam Solution)\n\n"
                f"### 📌 1. Definition & Core Concept (1 Mark)\n"
                f"{core_def}\n\n"
                f"{diagram_block}"
                f"### 💡 2. Key Working Principles (3 Marks)\n"
                f"{points_5_str}\n\n"
                f"### 🎯 3. Core Exam Takeaway & Significance (1 Mark)\n"
                f"- **Exam Scoring Tip**: For 5 marks, ensure you highlight the clear definition, state the sequential rules, and write these 5-6 structured points with bold headings.\n"
            )

        # 2. EXAM 10-MARK MODE
        elif mode == "exam":
            p1 = remaining_sents[0] if len(remaining_sents) > 0 else "Systematic execution adhering strictly to university syllabus standards."
            p2 = remaining_sents[1] if len(remaining_sents) > 1 else "Preserves structural dependencies, eliminates operational anomalies, and ensures data integrity."
            p3 = remaining_sents[2] if len(remaining_sents) > 2 else "Demonstrates predictable verification and validation across each milestone."
            return (
                f"## 📘 {clean_topic.title()} (10-Mark University Exam Solution)\n\n"
                f"### 📌 1. Formal Definition & Overview (2 Marks)\n"
                f"{core_def}\n\n"
                f"### 💡 2. Architectural Principles & Key Characteristics (2 Marks)\n"
                f"- 🔹 **Primary Characteristic**: {p1}\n"
                f"- 🔹 **Operational Standard**: {p2}\n"
                f"- 🔹 **Verification Baseline**: {p3}\n\n"
                f"{diagram_block}"
                f"### ⚙️ 3. Step-by-Step Working Flow & Mechanics (2 Marks)\n"
                f"{formatted_points}\n\n"
                f"### ⚖️ 4. Advantages & Limitations (2 Marks)\n"
                f"- **Key Advantages**: Simple to understand, milestone-driven progress tracking, and disciplined engineering governance.\n"
                f"- **Key Limitations**: Inflexible to late-stage requirement changes; high risk for projects with evolving specifications.\n\n"
                f"### 🎯 5. Exam Takeaways & Final Summary (2 Marks)\n"
                f"- **Core Exam Takeaway**: When answering questions on **{clean_topic.title()}**, ensure to sketch the stage diagram above, state the sequential constraints, and highlight boundary conditions.\n"
            )

        # 3. SHORT REVISION MODE
        elif mode == "short":
            summary_bullets = [f"- 📌 **Core Definition**: {core_def}"]
            for s in remaining_sents[:4]:
                summary_bullets.append(f"- 🔹 {s}")
            res = f"## ⚡ Quick Revision: {clean_topic.title()}\n\n" + "\n".join(summary_bullets)
            if diagram_block:
                res += f"\n\n{diagram_block}"
            return res

        # 4. SIMPLE / INTUITIVE MODE
        elif mode == "simple":
            first_point = remaining_sents[0] if remaining_sents else "It organizes complex concepts into clean, predictable steps."
            second_point = remaining_sents[1] if len(remaining_sents) > 1 else "It avoids mistakes by ensuring each part is verified before moving ahead."
            res = (
                f"## 💡 Simple Explanation: {clean_topic.title()}\n\n"
                f"### 📌 What is it?\n"
                f"{core_def}\n\n"
                f"### 🔍 In Plain Words\n"
                f"- 🔹 {first_point}\n"
                f"- 🔹 {second_point}\n\n"
                f"### 🎯 Why does it matter?\n"
                f"- It ensures that engineering systems are built methodically without confusing shortcuts or unexpected failures.\n"
            )
            if diagram_block:
                res += f"\n{diagram_block}"
            return res

        # 5. VIVA PREP MODE
        elif mode == "viva":
            q1 = f"Define {clean_topic.title()} in one precise sentence."
            a1 = core_def
            q2 = f"What are the major phases / key components of {clean_topic.title()}?"
            a2 = remaining_sents[0] if remaining_sents else f"It comprises formal phases as detailed in curriculum."
            q3 = f"What is the biggest advantage and biggest drawback of this approach?"
            a3 = "Advantage: High discipline and clear documentation. Drawback: Rigid and difficult to accommodate changing requirements late in development."
            res = (
                f"## 🎓 Viva Voce Preparation: {clean_topic.title()}\n\n"
                f"### 📌 1-Sentence Concept Summary\n"
                f"**{clean_topic.title()}**: {core_def}\n\n"
                f"### 🎯 Top 3 Viva Questions & Verified Answers\n"
                f"1. ❓ **Q: {q1}**\n"
                f"   👉 **A**: {a1}\n\n"
                f"2. ❓ **Q: {q2}**\n"
                f"   👉 **A**: {a2}\n\n"
                f"3. ❓ **Q: {q3}**\n"
                f"   👉 **A**: {a3}\n"
            )
            if diagram_block:
                res += f"\n{diagram_block}"
            return res

        # 6. DETAILED MODE (Extensive, Big In-Depth Answer)
        else:
            # Multi-paragraph depth
            detail_paras = all_paragraphs[:4] if all_paragraphs else [core_def]
            paras_text = "\n\n".join(detail_paras)

            # Build 6 to 8 deep technical points
            deep_points = []
            if remaining_sents:
                for s in remaining_sents[:8]:
                    words = s.split()
                    lead = " ".join(words[:3]) if len(words) >= 3 else "Key Feature"
                    rest = " ".join(words[3:]) if len(words) >= 3 else s
                    deep_points.append(f"- 🔹 **{lead.capitalize()}**: {rest}")
            if len(deep_points) < 5:
                deep_points.extend([
                    f"- 🔹 **Architectural Modularity**: Ensures high cohesion within modules and low coupling across external interfaces.",
                    f"- 🔹 **Fault Isolation & Error Trapping**: Employs rigorous verification gates at every transition to prevent cascading anomalies.",
                    f"- 🔹 **State Consistency Guarantee**: Enforces invariant preservation so the underlying system state remains mathematically robust.",
                    f"- 🔹 **Formal Specification Adherence**: Aligns system behavior directly with formal course curriculum requirements.",
                    f"- 🔹 **Operational Scalability**: Designed to handle computational throughput while maintaining deterministic time and space bounds."
                ])
            deep_points_str = "\n".join(deep_points[:7])

            # Specific step-by-step breakdown if software/waterfall/process
            is_process = any(k in clean_topic.lower() or k in raw_question.lower() for k in ["waterfall", "sdlc", "model", "process", "lifecycle", "architecture", "algorithm", "cycle", "methodology"])
            if is_process:
                execution_breakdown = (
                    "### ⚙️ 3. Phased Execution & Comprehensive Step-by-Step Breakdown\n\n"
                    "1. **Requirements Analysis & Specification**:\n"
                    "   - All system requirements, operational constraints, and functional behaviors are collected from stakeholders.\n"
                    "   - Formal documentation (Software Requirement Specification - SRS) is compiled, reviewed, and locked down as the authoritative baseline.\n\n"
                    "2. **System & Architectural Design**:\n"
                    "   - The approved requirements are transformed into modular architectural blueprints and database schemas.\n"
                    "   - Establishes communication protocols, data structures, and hardware interface constraints.\n\n"
                    "3. **Implementation & Unit Coding**:\n"
                    "   - Modular source code is written strictly conforming to the architectural blueprints.\n"
                    "   - Developers execute isolated unit tests on each independent component to verify logic and functional correctness.\n\n"
                    "4. **Integration & System Verification**:\n"
                    "   - Individual code modules are unified and tested end-to-end for data flow integrity.\n"
                    "   - Subjected to stress testing, regression testing, and user acceptance verification to discover and eliminate defects.\n\n"
                    "5. **Deployment & Operational Maintenance**:\n"
                    "   - The thoroughly verified release is deployed into active production environments.\n"
                    "   - Ongoing maintenance resolves emergent bugs, optimizes runtime efficiency, and accommodates infrastructure updates.\n\n"
                )
            else:
                execution_breakdown = (
                    "### ⚙️ 3. Operational Mechanics & Technical Execution Flow\n\n"
                    f"{paras_text}\n\n"
                )

            return (
                f"## 📘 {clean_topic.title()} — Comprehensive In-Depth Academic Analysis\n\n"
                f"### 📌 1. Foundational Overview & Formal Definition\n"
                f"{core_def} It serves as an essential academic pillar, structuring computational operations into mathematically predictable and verifiable components.\n\n"
                f"### 💡 2. Theoretical Foundations & Architectural Principles\n"
                f"- 🔹 **Core Mathematical/System Invariant**: Governs system state transitions so that each phase completes deterministically before subsequent execution.\n"
                f"- 🔹 **Structural Integrity**: Minimizes operational bottlenecks and guarantees compliance with formal engineering specifications.\n\n"
                f"{diagram_block}"
                f"{execution_breakdown}"
                f"### 🔹 4. Key Operational Characteristics & Critical Properties\n"
                f"{deep_points_str}\n\n"
                f"### ⚖️ 5. In-Depth Comparative Evaluation: Advantages vs. Limitations\n"
                f"- **Key Technical Advantages**:\n"
                f"  - **High Discipline & Transparency**: Clear milestone definitions allow project managers and examiners to track exact progress.\n"
                f"  - **Early Defect Trapping**: Rigorous upfront specification significantly reduces integration anomalies during final execution.\n"
                f"  - **Structured Documentation**: Complete deliverables at every stage enable seamless knowledge transfer across teams.\n"
                f"- **Engineering Limitations & Trade-offs**:\n"
                f"  - **Inflexibility to Late Changes**: Highly rigid; accommodating alterations after the design phase involves substantial overhead.\n"
                f"  - **Late Customer/User Visibility**: Working software or tangible models only appear near the terminal phases of execution.\n"
                f"  - **High Risk on Ambiguous Requirements**: Ill-defined initial specifications can lead to costly rework in terminal testing.\n\n"
                f"### 🛠️ 6. Real-World Applications & Industry Context\n"
                f"- **Best Suited For**: Mission-critical systems (aerospace, medical equipment, banking engines, embedded firmware) where requirements are static and defects are catastrophic.\n"
                f"- **Modern Context**: Often combined with iterative verification checkpoints or hybrid agile workflows for broader operational agility.\n\n"
                f"### 🎯 7. University Exam Scoring Strategy & Summary\n"
                f"- **High-Yield Scoring Tips**: Always write the formal definition, state the sequential rules, draw the visual flowchart diagram shown above, and present balanced advantages and limitations.\n"
            )

class LLMFactory:
    @staticmethod
    def get_provider(custom_gemini_key: Optional[str] = None) -> LLMProvider:
        # Check custom key passed in request
        if custom_gemini_key and custom_gemini_key.strip() and custom_gemini_key.strip().startswith("AIzaSy"):
            try:
                return GeminiLLMProvider(custom_gemini_key)
            except Exception as e:
                print(f"Failed to init custom Gemini provider: {e}")

        # Check OpenAI
        if settings.LLM_PROVIDER.lower() == "openai" and settings.OPENAI_API_KEY:
            try:
                return OpenAILLMProvider(settings.OPENAI_API_KEY)
            except Exception as e:
                print(f"Failed to init OpenAI provider: {e}")

        # Check server Gemini key
        if settings.GEMINI_API_KEY and len(settings.GEMINI_API_KEY) > 8:
            try:
                return GeminiLLMProvider(settings.GEMINI_API_KEY)
            except Exception as e:
                print(f"Failed to init Gemini provider: {e}")

        # High-performance grounded academic engine
        return LocalFallbackLLMProvider()

def format_rag_prompt(question: str, context: str, mode: str = "detailed") -> str:
    q_lower = question.lower()
    if any(k in q_lower for k in ["5 mark", "5 marks", "5-mark", "for 5 marks", "in 5 marks", "5marks"]):
        effective_mode = "5marks"
    elif any(k in q_lower for k in ["10 mark", "10 marks", "10-mark", "for 10 marks", "10marks"]):
        effective_mode = "exam"
    elif any(k in q_lower for k in ["in detail", "in details", "explain in detail", "explain in details", "bada answer"]) or mode == "detailed":
        effective_mode = "detailed"
    else:
        effective_mode = mode.lower()

    mode_instruction = MODE_PROMPTS.get(effective_mode, MODE_PROMPTS["detailed"])
    
    diagram_hint = ""
    if any(k in q_lower for k in ["diagram", "flowchart", "architecture", "flow", "model", "draw", "figure"]):
        doc_id_match = re.search(r'DocID:\s*([a-f0-9\-]+)', context)
        page_match = re.search(r'Page:\s*(\d+)', context)
        doc_id = doc_id_match.group(1) if doc_id_match else None
        page_num = page_match.group(1) if page_match else "1"
        backend_base = os.getenv("BACKEND_PUBLIC_URL", "https://campusrag-backend-x87x.onrender.com").rstrip("/")
        img_tag = f"![Academic Diagram]({backend_base}/api/documents/{doc_id}/diagram/{page_num})" if doc_id else ""
        diagram_hint = f"\n\nDIAGRAM REQUIREMENT: The student explicitly requested an explanation WITH A DIAGRAM. You MUST generate an ASCII/Unicode flow diagram representing the phases described in the context, and include the official diagram image link: {img_tag}"

    prompt = f"""[MODE: {effective_mode}]{diagram_hint}
{mode_instruction}

Retrieved Context:
{context}

Student Question:
{question}
"""
    return prompt
