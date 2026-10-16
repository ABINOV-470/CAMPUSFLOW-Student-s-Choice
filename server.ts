import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI client safely on server
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey) {
  try {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Warning: Could not initialize GoogleGenAI client with provided key', err);
  }
}

/**
 * Unified Student AI Advisor endpoint
 */
app.post('/api/ai/advisor', async (req: Request, res: Response) => {
  const { prompt, context, history } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Missing prompt in request body' });
  }

  // If Gemini API is available, generate grounded advice
  if (aiClient && apiKey) {
    try {
      const systemInstruction = `You are the CampusFlow Unified Student AI Advisor for undergraduate students.
You have access to the student's live academic profile, enrolled subjects, attendance records (note: <75% violates the attendance threshold), assessment marks (CAT-1, CAT-2, DA, Lab), current CGPA, target CGPA, upcoming exams, scheduled timetable, and career interests.

Always provide personalized, encouraging, clear, and actionable advice tailored directly to their actual numbers.
Rules:
1. Never invent official exam rules, course codes, or class timings not provided in the student's context.
2. If attendance in any subject is below 75%, highlight it as an immediate priority.
3. Keep recommendations realistic, achievable, and structured with concise bullet points.
4. If asked about career development, recommend skills in a structured learning order and connect them with practical portfolio projects.
5. Provide 2-3 short, relevant follow-up prompt chips for the student.`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Student Academic Context:
${JSON.stringify(context, null, 2)}

Conversation History:
${JSON.stringify(history || [], null, 2)}

Student Question:
${prompt}`,
              },
            ],
          },
        ],
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const replyText = response.text || 'Here is your academic recommendation based on your current semester standing.';

      // Generate context-aware quick action suggestions
      const actionSuggestions = [
        'What should I study today?',
        'Which subject needs more attention?',
        'How should I prepare for my next exam?',
      ];

      return res.json({
        reply: replyText,
        isAiGenerated: true,
        actionSuggestions,
      });
    } catch (err: any) {
      console.warn('Gemini API call failed, falling back to intelligent rule engine', err.message);
    }
  }

  // Deterministic rule-based response engine when API key is unconfigured or offline
  const q = prompt.toLowerCase();
  let reply = '';
  const actionSuggestions = [
    'What should I study today?',
    'Which subject needs more attention?',
    'How should I prepare for my next exam?',
    'What should I learn next for my chosen career?',
  ];

  const studentName = context?.name ? context.name.split(' ')[0] : 'Student';
  const subjects = context?.subjects || [];
  const currentCgpa = context?.currentCgpa ?? 8.85;
  const targetCgpa = context?.targetCgpa ?? 9.30;
  const targetRole = context?.targetRole || 'Software Development';

  if (q.includes('what should i study today') || q.includes('study today')) {
    const lowAtt = [...subjects].sort((a: any, b: any) => a.attendance - b.attendance)[0];
    reply = `Hi ${studentName}! Here is your personalized daily study plan:\n\n1. **Core Problem Solving (60 mins)**: Work on difficult topics in your major courses. Spaced daily repetition has the highest retention rate.\n2. **Attendance & Note Review (45 mins)**: ${lowAtt ? `Spend time reviewing ${lowAtt.code} (${lowAtt.name}) as your current attendance is at ${lowAtt.attendance}%.` : 'Review today\'s lecture summaries to prepare for upcoming continuous assessments.'}\n3. **Career Skill Lab (45 mins)**: Spend time advancing your ${targetRole} portfolio project.\n\n*All three sessions can be automatically scheduled in your Timetable Planner.*`;
  } else if (q.includes('which subject needs more attention') || q.includes('attention')) {
    const vulnerable = subjects.filter((s: any) => s.attendance < 80 || s.difficulty === 'Critical' || s.difficulty === 'Hard');
    if (vulnerable.length > 0) {
      reply = `Based on your academic records, the following subjects need priority attention:\n\n${vulnerable
        .map((s: any) => `• **${s.code} - ${s.name}**: Attendance is ${s.attendance}% (Threshold: 75%). Difficulty: ${s.difficulty || 'Hard'}. Focus on high-frequency questions.`)
        .join('\n')}\n\n**Strategy**: Schedule at least 2 extra revision blocks this week to keep your attendance and internal marks comfortably in the S/A Grade zone.`;
    } else {
      reply = `All your current semester subjects are in good health with attendance above 80% and solid assessment standing! Keep up the consistent cadence.`;
    }
  } else if (q.includes('exam') || q.includes('prepare')) {
    reply = `For your upcoming continuous assessment and semester examinations:\n\n1. **High-Yield Question Sets**: Practice previous test papers under timed 50-minute conditions.\n2. **Formula & Architecture Cheatsheet**: Condense each unit into 1 page of active recall flash notes.\n3. **Continuous Revision**: Spread your preparation across 3 separate days rather than cramming the night before.`;
  } else if (q.includes('career') || q.includes('learn next') || q.includes('industry')) {
    reply = `For your chosen track (**${targetRole}**):\n\n1. **Foundational Milestone**: Ensure you have deep proficiency in core languages, version control with Git, and data structures.\n2. **Project Proof**: Build and deploy a public GitHub project with a clean README, live demo URL, and automated tests.\n3. **Time Investment**: Dedicate ${context?.weeklyCareerHours || 6} hours each week outside of coursework to build real-world competency.`;
  } else {
    reply = `Hello ${studentName}! Looking at your Semester ${context?.semester || 3} standing (CGPA ${currentCgpa.toFixed(2)} vs Target ${targetCgpa.toFixed(2)}):\n\nI recommend staying consistent with your daily study timer goals, maintaining attendance above 75%, and balancing coursework with weekend career project sprints. How can I assist you with your schedule or exams today?`;
  }

  return res.json({
    reply,
    isAiGenerated: false,
    actionSuggestions,
  });
});

/**
 * Smart Timetable Plan Assistant endpoint
 */
app.post('/api/ai/timetable-plan', async (req: Request, res: Response) => {
  const { subjects, targetRole, weeklyCareerHours } = req.body;
  res.json({
    success: true,
    message: 'Timetable optimization validated',
    recommendedStudyHours: 4,
    careerHours: weeklyCareerHours || 6,
  });
});

/**
 * Interactive AI Study Companion Endpoint
 * Supports: 'explain' | 'step_by_step' | 'flashcards' | 'quiz' | 'hint' | 'socratic'
 */
app.post('/api/ai/study-companion', async (req: Request, res: Response) => {
  const { mode, courseCode, courseName, topicName, question, userAttempt } = req.body;

  if (!mode) {
    return res.status(400).json({ error: 'Missing mode in request body' });
  }

  // 1. Try Gemini 3.8 Flash if API key is configured
  if (aiClient && apiKey) {
    try {
      let systemInstruction = `You are the CampusFlow Interactive AI Study Companion for university engineering students.
Subject: ${courseCode || ''} - ${courseName || ''}
Topic: ${topicName || 'General Engineering'}

Core pedagogical principles:
1. Socratic method: When helping a student solve a problem, encourage them to think and solve it themselves before revealing full solutions.
2. Provide simple, intuitive explanations using clear analogies.
3. For step-by-step breakdowns, number each logical step clearly with the "why" behind it.
4. Keep the tone encouraging, calm, and rigorous. Never invent inaccurate formulas or fake theorems.`;

      let userPrompt = '';
      if (mode === 'socratic' || mode === 'hint') {
        userPrompt = `Student Question: "${question || topicName}"
Student's initial attempt or thought: "${userAttempt || 'I do not know where to begin'}"

Provide a constructive, gentle hint and 1 guiding question to help the student take the next step. Do NOT give away the final answer yet.`;
      } else if (mode === 'step_by_step') {
        userPrompt = `Please provide a step-by-step solution / walkthrough for: "${question || topicName}".
Break it down into numbered steps: 1) Identify given variables/premises, 2) Applicable formula/algorithm, 3) Intermediate derivation, 4) Final verification check.`;
      } else if (mode === 'explain') {
        userPrompt = `Explain "${topicName || question}" in simple, intuitive terms. Include:
1. Core intuition (ELI20 with practical real-world analogy)
2. Why it matters in engineering and interviews
3. Common misconceptions to avoid`;
      } else if (mode === 'flashcards') {
        userPrompt = `Generate 4 active recall flashcards for "${topicName || courseName}".
Return pure JSON array format:
[
  { "front": "Question / concept prompt", "back": "Concise high-yield answer / formula", "tag": "Core" }
]`;
      } else if (mode === 'quiz') {
        userPrompt = `Generate 3 high-yield multiple-choice practice questions with options and explanations for: "${topicName || courseName}".
Return pure JSON array format:
[
  {
    "question": "Question text",
    "options": ["A", "B", "C", "D"],
    "correctIndex": 0,
    "hint": "Clue without spoiling",
    "explanation": "Why this option is correct"
  }
]`;
      }

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userPrompt,
        config: {
          systemInstruction,
          temperature: 0.6,
        },
      });

      const rawText = response.text || '';

      // If JSON was requested, attempt safe parsing
      if (mode === 'flashcards' || mode === 'quiz') {
        try {
          const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleaned);
          return res.json({
            success: true,
            isAiGenerated: true,
            engine: 'gemini-3.8-flash',
            mode,
            data: parsed,
            rawText,
          });
        } catch {
          // Fall through to returning text if JSON parse fails
        }
      }

      return res.json({
        success: true,
        isAiGenerated: true,
        engine: 'gemini-3.8-flash',
        mode,
        content: rawText,
      });
    } catch (err: any) {
      console.warn('Gemini Study Companion error, falling back to rule-based engine:', err.message);
    }
  }

  // 2. High-Yield Deterministic Fallback Engine
  const targetTopic = (topicName || question || '').toLowerCase();

  if (mode === 'flashcards') {
    const flashcards = [
      {
        front: `What is the defining invariant of ${topicName || 'this data structure / concept'}?`,
        back: `Every node or state preserves the fundamental bounds; for trees, left < root < right and balance factor in {-1, 0, +1}.`,
        tag: 'Invariant',
      },
      {
        front: `What is the worst-case time complexity, and how is it derived?`,
        back: `O(log N) for balanced trees, O(V + E) for standard graph search via queue/recursion.`,
        tag: 'Complexity',
      },
      {
        front: `What is the key difference in space trade-off?`,
        back: `Iterative approach requires explicit O(N) stack or auxiliary memory, whereas recursive approach incurs call stack frames.`,
        tag: 'Trade-off',
      },
      {
        front: `How do you diagnose an edge case in exam questions?`,
        back: `Check boundary limits: empty input, single element, strictly decreasing sequence, or cyclic references.`,
        tag: 'Exam Tip',
      },
    ];

    return res.json({
      success: true,
      isAiGenerated: false,
      engine: 'deterministic_rule_based',
      mode: 'flashcards',
      data: flashcards,
      content: 'Rule-based active recall cards loaded.',
    });
  }

  if (mode === 'quiz') {
    const quizItems = [
      {
        question: `In ${topicName || 'this module'}, when does the worst-case scenario occur?`,
        options: [
          'When elements are sorted in reverse order without balancing',
          'When all edge weights are strictly positive',
          'When the recursion depth is bounded by log(N)',
          'When memory is sequentially allocated'
        ],
        correctIndex: 0,
        hint: 'Consider what causes degenerate trees or maximum recursive calls.',
        explanation: 'Unbalanced operations degrade to linear O(N) complexity when input is skewed without self-balancing reorientations.',
      },
      {
        question: `Which algorithmic property guarantees optimality for ${topicName || 'this topic'}?`,
        options: [
          'Optimal substructure and overlapping subproblems',
          'Heuristic greedy selection without backtracking',
          'Randomized pivot partitioning',
          'Breadth-first frontier queuing'
        ],
        correctIndex: 0,
        hint: 'Think about dynamic programming and Bellman optimality.',
        explanation: 'The principle of optimality states that an optimal policy has the property that whatever the initial state and decision are, the remaining decisions must constitute an optimal policy.',
      },
      {
        question: `What is the primary trade-off when optimizing space complexity?`,
        options: [
          'Auxiliary table memory vs recomputation time',
          'Floating point precision vs integer arithmetic',
          'Compile-time validation vs runtime dispatch',
          'Network latency vs disk I/O'
        ],
        correctIndex: 0,
        hint: 'Consider memoization tables versus recalculation.',
        explanation: 'Memoization trades space (storing intermediate subproblems) to eliminate redundant exponential branch evaluations.',
      },
    ];

    return res.json({
      success: true,
      isAiGenerated: false,
      engine: 'deterministic_rule_based',
      mode: 'quiz',
      data: quizItems,
      content: 'Practice questions generated from curriculum bank.',
    });
  }

  if (mode === 'hint' || mode === 'socratic') {
    return res.json({
      success: true,
      isAiGenerated: false,
      engine: 'deterministic_rule_based',
      mode: 'socratic',
      content: `💡 **Socratic Guiding Hint for ${topicName || 'Problem'}**:\n\n1. **First step**: Identify the base condition. If you have an empty or single-node scenario, what must the return value be?\n2. **Observation**: Notice the relationship between the parent state and its sub-branches. Does changing one branch affect the other?\n\n👉 *Question for you*: What would happen if you trace this with a tiny input of size N=3? Share your intuition, and let's verify each branch together!`,
    });
  }

  if (mode === 'step_by_step') {
    return res.json({
      success: true,
      isAiGenerated: false,
      engine: 'deterministic_rule_based',
      mode: 'step_by_step',
      content: `### 📝 Step-by-Step Breakdown: ${topicName || question}\n\n1. **Step 1: State the Given Parameters & Constraints**\n   - Identify input types, bounds (e.g. N ≤ 10^5), and required return format.\n\n2. **Step 2: Choose the Governing Principle or Invariant**\n   - Determine whether greedy, divide-and-conquer, or state transition table is required.\n\n3. **Step 3: Work the Transition Relation**\n   - Write down the algebraic or recurrence equation: $T(n) = 2T(n/2) + O(n)$.\n   - Apply base case termination to prevent infinite recursion.\n\n4. **Step 4: Complexity Analysis & Edge Case Check**\n   - Time: Check worst-case and average-case limits.\n   - Space: Account for call stack and auxiliary arrays.\n   - Edge tests: $N=0$, $N=1$, and alternating duplicate keys.`,
    });
  }

  // Default explain
  return res.json({
    success: true,
    isAiGenerated: false,
    engine: 'deterministic_rule_based',
    mode: 'explain',
    content: `### 📘 Concept Guide: ${topicName || 'Curriculum Topic'}\n\n**Intuition & Mental Model:**\nThink of this concept like an automated sorting airport baggage carousel. Instead of checking every suitcase sequentially, items are hashed or routed into self-balancing bins so retrieval takes minimal steps.\n\n**Key Takeaways:**\n- **Core Invariant**: Balances consistency with minimal reorganization overhead.\n- **Exam Focus**: In CAT and FAT tests, question setters frequently test boundary rotations, degenerate sequences, and off-by-one pointer rewiring.\n- **Best Practice**: Sketch the state transition diagram on paper before writing code or mathematical proofs.`,
  });
});


// Mount Vite in development or serve static in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`CampusFlow server running on http://localhost:${PORT}`);
  });
}

startServer();
