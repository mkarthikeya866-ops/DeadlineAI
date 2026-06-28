import express from "express";
import http from "http";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

dotenv.config();

const app = express();
const server = http.createServer(app);
app.use(express.json());

const PORT = 3000;
console.log("GEMINI_API_KEY is present:", !!process.env.GEMINI_API_KEY);
const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ 
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
        headers: {
        'User-Agent': 'aistudio-build',
        }
    }
}) : null;

const getGeminiClient = () => ai;
async function generateWithFallback(aiClient: any, prompt: string) {
    if (!aiClient) throw new Error("Gemini AI client not initialized");
    return await aiClient.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
}

// Global state check for frontend banner
app.get("/api/config", (req, res) => {
  const hasKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY";
  res.json({
    hasGeminiKey: hasKey,
    appUrl: process.env.APP_URL || "http://localhost:3000"
  });
});

// AI TIME MACHINE Route
app.post("/api/gemini/time-machine", async (req, res) => {
  const { taskName, priority, complexity, hoursNeeded } = req.body;
  const ai = getGeminiClient();

  const getFallback = () => {
    return {
      scenarios: [
        {
          type: "Delay 1 Day",
          probability: 92,
          workload: 45,
          stress: 25,
          prediction: `Delaying "${taskName}" by 1 day has minimal impact on your master timeline. It allocates a buffer, but keep an eye on upcoming dependencies.`
        },
        {
          type: "Delay 2 Days",
          probability: 65,
          workload: 70,
          stress: 55,
          prediction: `Delaying "${taskName}" by 2 days starts compressing your milestones. Expected stress increases as deadlines converge.`
        },
        {
          type: "Delay 1 Week",
          probability: 25,
          workload: 95,
          stress: 90,
          prediction: `Delaying "${taskName}" by 1 week pushes it into critical backlog territory. Completion probability drops sharply due to high dependency collision.`
        },
        {
          type: "Skip Task",
          probability: 35,
          workload: 20,
          stress: 80,
          prediction: `Skipping "${taskName}" entirely relieves immediate execution pressure but creates a long-term technical or academic penalty.`
        }
      ],
      isDemo: true
    };
  };

  if (!ai) {
    return res.json(getFallback());
  }

  try {
    const prompt = `Analyze the task "${taskName}" (Priority: ${priority}, Complexity: ${complexity || "medium"}, Estimated hours: ${hoursNeeded || 3}). 
Predict success probabilities, workload scores (1-100), stress scores (1-100), and custom descriptions for four "What If" scenarios:
1. Delay 1 Day (expect around 92% success probability)
2. Delay 2 Days (expect around 65% success probability)
3. Delay 1 Week (expect around 25% success probability)
4. Skip Task (expect around 35% success probability)

Return exactly a JSON object conforming to this TypeScript schema (do not wrap in anything else, just pure JSON):
{
  "scenarios": [
    { "type": "string", "probability": number, "workload": number, "stress": number, "prediction": "string" }
  ]
}`;

    const response = await generateWithFallback(ai, prompt);

    const text = response.text || "{}";
    const data = JSON.parse(text);
    res.json({ ...data, isDemo: false });
  } catch (error: any) {
    console.log("[Gemini Time Machine Note] Model experienced brief unavailability. Using default mock scenario.");
    res.json({ ...getFallback(), apiError: error.message || "Model busy" });
  }
});

// AI BURNOUT DETECTOR Route
app.post("/api/gemini/burnout", async (req, res) => {
  const { pendingTasks, deadlineDensity, workload, focusHours } = req.body;
  const ai = getGeminiClient();

  const getFallback = () => {
    const score = Math.min(100, Math.max(10, (pendingTasks * 8) + (deadlineDensity * 12) + (workload / 2) - (focusHours * 3)));
    let riskLevel: "Low" | "Medium" | "High" = "Low";
    if (score > 70) riskLevel = "High";
    else if (score > 40) riskLevel = "Medium";

    return {
      riskLevel,
      burnoutScore: Math.round(score),
      factors: {
        tasks: pendingTasks > 8 ? "Queue overloading cognitive storage." : "Task velocity is in a stable, manageable state.",
        density: deadlineDensity > 7 ? "Extreme tight clustering in next 72 hrs." : "Adequate breathing room between milestones.",
        focus: focusHours < 3 ? "Fragmented focus windows, causing attention residue." : "Strong dedicated flow states observed."
      },
      insights: [
        "Your task volume is elevated compared to your historical completion baseline.",
        focusHours < 4 ? "Frequent context switching is degrading mental energy." : "Your deep work discipline is shielding you, but cognitive limits approach."
      ],
      recommendations: [
        "Initiate a 90-minute strict offline focus block to resolve quick wins.",
        "Decline or defer non-essential status alignment syncs today.",
        "Optimize your recovery cycle with a 20-minute cognitive decompression walk."
      ],
      isDemo: true
    };
  };

  if (!ai) {
    return res.json(getFallback());
  }

  try {
    const prompt = `Analyze cognitive burnout risk with these current stats:
- Pending Tasks: ${pendingTasks}
- Deadline Density (tasks due within 3 days): ${deadlineDensity}
- Workload Score (1-100 scale, subjective): ${workload}
- Focus Hours Today: ${focusHours}

Return exactly a JSON object matching this schema (pure JSON only):
{
  "riskLevel": "Low" | "Medium" | "High",
  "burnoutScore": number, (0-100)
  "factors": {
    "tasks": "string summary",
    "density": "string summary",
    "focus": "string summary"
  },
  "insights": ["string"],
  "recommendations": ["string"]
}`;

    const response = await generateWithFallback(ai, prompt);

    const data = JSON.parse(response.text || "{}");
    res.json({ ...data, isDemo: false });
  } catch (error: any) {
    console.log("[Gemini Burnout Note] Model experienced brief unavailability. Using default mock scenario.");
    res.json({ ...getFallback(), apiError: error.message || "Model busy" });
  }
});

// AI RISK RADAR Route
app.post("/api/gemini/risk-radar", async (req, res) => {
  const { tasks } = req.body;
  const ai = getGeminiClient();

  const getFallback = () => {
    const analyzed = (tasks || []).map((t: any) => {
      let riskLevel: "Low" | "Medium" | "High" = "Low";
      let riskScore = 20;
      let reason = "This task has ample lead time and a steady progress path.";
      let mitigation = "Continue normal workflow. Schedule a 30-minute review tomorrow.";

      if (t.priority === "high" || t.complexity === "hard") {
        riskLevel = "Medium";
        riskScore = 55;
        reason = "Elevated complexity or high priority demands structural staging.";
        mitigation = "Carve out an initial 45-minute focus window to map dependencies.";
      }

      // Check dates
      const daysLeft = t.dueDate ? Math.max(1, Math.ceil((new Date(t.dueDate).getTime() - Date.now()) / (1000 * 3600 * 24))) : 5;
      if (daysLeft <= 2 && t.priority === "high") {
        riskLevel = "High";
        riskScore = 88;
        reason = "Crucial deadline is imminent. Current completion rate indicates risk of spillover.";
        mitigation = "Declare state of emergency. Postpone low-priority tasks and execute deep work immediately.";
      } else if (daysLeft <= 2) {
        riskLevel = "Medium";
        riskScore = 65;
        reason = "Deadline is approaching. Task is moderately scoped but has zero buffer left.";
        mitigation = "Lock down the next available focus slot to resolve remaining criteria.";
      }

      return {
        id: t.id,
        name: t.name,
        riskLevel,
        riskScore,
        reason,
        mitigation
      };
    });

    return { analyzedTasks: analyzed, isDemo: true };
  };

  if (!ai || !tasks || tasks.length === 0) {
    return res.json(getFallback());
  }

  try {
    const prompt = `Analyze the risk profile of these tasks:
${JSON.stringify(tasks, null, 2)}

Evaluate risk based on priority, complexity, and deadline proximity.
For each task, output a riskLevel ("High" | "Medium" | "Low"), a riskScore (0 to 100), a descriptive reason, and an actionable mitigation strategy.

Return exactly a JSON object conforming to:
{
  "analyzedTasks": [
    { "id": "string (the task id)", "name": "string", "riskLevel": "High" | "Medium" | "Low", "riskScore": number, "reason": "string", "mitigation": "string" }
  ]
}`;

    const response = await generateWithFallback(ai, prompt);

    const data = JSON.parse(response.text || "{}");
    res.json({ ...data, isDemo: false });
  } catch (error: any) {
    console.log("[Gemini Risk Radar Note] Model experienced brief unavailability. Using default mock scenario.");
    res.json({ ...getFallback(), apiError: error.message || "Model busy" });
  }
});

// PRODUCTIVITY DNA Route
app.post("/api/gemini/productivity-dna", async (req, res) => {
  const { completionRate, focusHoursPerWeek, taskDelayRate, commonTags } = req.body;
  const ai = getGeminiClient();

  const getFallback = () => {
    // Generate gorgeous mock personality based on inputs
    let archetype = "Strategic Planner";
    let title = "The Master Architect";
    let desc = "You thrive on structure, mapping out dependencies with architectural precision. However, you risk over-planning and stalling momentum.";
    let strengths = ["Impeccable structural organization", "Dependency mapping", "Consistent pace"];
    let weaknesses = ["Analysis paralysis", "Slight resistance to rapid pivot challenges", "Schedules over execution bias"];
    let superpower = "Timeline Foresight";
    let tip = "Inject a 'Sprint Wednesday' where you execute 3 fast tasks without any pre-planning.";
    let match = 88;

    if (taskDelayRate > 40) {
      archetype = "Last Minute Sprinter";
      title = "The Pressure-Activated Engine";
      desc = "You use deadlines as direct rocket fuel. When pressure mounts, you enter a state of hyper-focus that is nearly unmatched, though it leads to spikey fatigue profiles.";
      strengths = ["Elite emergency hyper-focus", "Decisiveness under severe crunch", "Rapid problem solving"];
      weaknesses = ["Pre-deadline procrastination", "High post-deadline fatigue", "Vulnerable to sudden scope creep"];
      superpower = "Eleventh-Hour Flow State";
      tip = "Artificially segment major deadlines into 3-day milestone spikes to simulate deadline pressure earlier.";
      match = 94;
    } else if (completionRate > 85 && focusHoursPerWeek > 15) {
      archetype = "Productivity Ninja";
      title = "The Silent Executioner";
      desc = "You strike down tasks with silent, relentless velocity. Your discipline is clockwork, and context switches bounce off your focus barrier.";
      strengths = ["Sustained task completion", "Ironclad focus barrier", "High volume management"];
      weaknesses = ["Neglecting recovery cycles", "Extreme task focus can blur relational/health signals", "Perfectionist exhaustion"];
      superpower = "Frictionless Velocity";
      tip = "Schedule mandatory 'blank blocks' where you are forbidden from opening your list.";
      match = 91;
    } else if (focusHoursPerWeek > 25) {
      archetype = "Deep Focus Performer";
      title = "The Deep Diver";
      desc = "You seek deep flow states and hate fragmented time. One beautiful, fully resolved focus block is worth ten quick task check-offs to you.";
      strengths = ["Exceptional quality output", "Complex concept synthesis", "High cognitive endurance"];
      weaknesses = ["Dislikes rapid administrative tasks", "Struggles with short micro-windows", "Vulnerable to interruptions"];
      superpower = "Monolithic Cognitive Flow";
      tip = "Batch administrative tasks into a single 30-minute 'Speed Run' block at the end of the day.";
      match = 85;
    }

    return {
      archetype,
      title,
      percentageMatch: match,
      description: desc,
      strengths,
      weaknesses,
      superpower,
      improvementTip: tip,
      isDemo: true
    };
  };

  if (!ai) {
    return res.json(getFallback());
  }

  try {
    const prompt = `Based on these metrics, analyze the user's Productivity DNA.
- Task Completion Rate: ${completionRate}%
- Focus Hours Logged/Week: ${focusHoursPerWeek} hours
- Task Postponement/Delay Rate: ${taskDelayRate}%
- Frequently Used Categories/Tags: ${JSON.stringify(commonTags || [])}

Pick one of these specific archetypes:
1. "Deep Focus Performer" (The Deep Diver)
2. "Strategic Planner" (The Master Architect)
3. "Productivity Ninja" (The Silent Executioner)
4. "Last Minute Sprinter" (The Pressure-Activated Engine)

Return exactly a JSON object conforming to:
{
  "archetype": "string",
  "title": "string title suffix",
  "percentageMatch": number, (1-100)
  "description": "string (narrative analysis)",
  "strengths": ["string"],
  "weaknesses": ["string"],
  "superpower": "string",
  "improvementTip": "string"
}`;

    const response = await generateWithFallback(ai, prompt);

    const data = JSON.parse(response.text || "{}");
    res.json({ ...data, isDemo: false });
  } catch (error: any) {
    console.log("[Gemini Productivity DNA Note] Model experienced brief unavailability. Using default mock scenario.");
    res.json({ ...getFallback(), apiError: error.message || "Model busy" });
  }
});

// WHAT-IF ANALYZER Route
app.post("/api/gemini/what-if", async (req, res) => {
  const { scenario, tasks } = req.body;
  const ai = getGeminiClient();

  const getFallback = () => {
    return {
      consequence: `If you execute "${scenario}", your backlog will reorganize. This changes your focus layout and shifts task density.`,
      downstreamDelayRisk: "Medium",
      downstreamDelayScore: 58,
      impactedTasks: tasks && tasks.length > 0 ? [tasks[0].name] : ["Upcoming high-priority milestones"],
      mitigation: "Carve out an immediate 20-minute planning window tomorrow morning to verify structural dependencies and protect your calendar.",
      isDemo: true
    };
  };

  if (!ai) {
    return res.json(getFallback());
  }

  try {
    const prompt = `Analyze this What-If scenario:
Scenario text: "${scenario}"

Current active tasks:
${JSON.stringify(tasks, null, 2)}

Predict consequences: What happens to task deadlines, cognitive load, and overall schedule buffer?
Return exactly a JSON object conforming to:
{
  "consequence": "string (detailed prediction of consequence)",
  "downstreamDelayRisk": "High" | "Medium" | "Low",
  "downstreamDelayScore": number, (0-100)
  "impactedTasks": ["string"],
  "mitigation": "string (clear mitigation suggestion)"
}`;

    const response = await generateWithFallback(ai, prompt);

    const data = JSON.parse(response.text || "{}");
    res.json({ ...data, isDemo: false });
  } catch (error: any) {
    console.log("[Gemini What If Note] Model experienced brief unavailability. Using default mock scenario.");
    res.json({ ...getFallback(), apiError: error.message || "Model busy" });
  }
});

// SMART TIME OPTIMIZER Route
app.post("/api/gemini/smart-optimize", async (req, res) => {
  const { tasks, wakeTime, sleepTime } = req.body;
  const ai = getGeminiClient();

  const getFallback = () => {
    const startHour = parseInt((wakeTime || "08:00").split(":")[0]);
    const endHour = parseInt((sleepTime || "22:00").split(":")[0]);
    const duration = endHour - startHour;

    const blocks = [
      {
        label: "Morning Peak Flow Block",
        startTime: `${String(startHour + 1).padStart(2, "0")}:00`,
        endTime: `${String(startHour + 3).padStart(2, "0")}:30`,
        type: "focus",
        durationMinutes: 150,
        tip: "Your cognitive energy is highest here. Direct this to your most complex tasks."
      },
      {
        label: "Cognitive Decompression / Rest",
        startTime: `${String(startHour + 4).padStart(2, "0")}:00`,
        endTime: `${String(startHour + 4).padStart(2, "0")}:45`,
        type: "rest",
        durationMinutes: 45,
        tip: "Hydrate, move away from monitors, and allow your subconscious memory to consolidate."
      },
      {
        label: "Strategic Alignment / Collaboration",
        startTime: `${String(startHour + 5).padStart(2, "0")}:00`,
        endTime: `${String(startHour + 6).padStart(2, "0")}:30`,
        type: "collaboration",
        durationMinutes: 90,
        tip: "Ideal slot for emails, coordination, quick check-ins, and administrative items."
      },
      {
        label: "Sunset Deep Work Block",
        startTime: `${String(startHour + 8).padStart(2, "0")}:00`,
        endTime: `${String(startHour + 10).padStart(2, "0")}:00`,
        type: "focus",
        durationMinutes: 120,
        tip: "A quiet, low-noise period perfect for structured technical execution or creative work."
      }
    ];

    return { blocks, isDemo: true };
  };

  if (!ai) {
    return res.json(getFallback());
  }

  try {
    const prompt = `Create an optimized daily schedule based on:
- Wake up time: ${wakeTime || "08:00"}
- Sleep time: ${sleepTime || "22:00"}
- Tasks needing slot allocation: ${JSON.stringify(tasks || [])}

Generate 3-5 smart, structured schedule blocks (focus work, rest, collaboration, administrative).
Return exactly a JSON object matching this schema (pure JSON only):
{
  "blocks": [
    {
      "label": "string",
      "startTime": "string (HH:MM)",
      "endTime": "string (HH:MM)",
      "type": "focus" | "rest" | "collaboration",
      "durationMinutes": number,
      "tip": "string"
    }
  ]
}`;

    const response = await generateWithFallback(ai, prompt);

    const data = JSON.parse(response.text || "{}");
    res.json({ ...data, isDemo: false });
  } catch (error: any) {
    console.log("[Gemini Smart Optimize Note] Model experienced brief unavailability. Using default mock scenario.");
    res.json({ ...getFallback(), apiError: error.message || "Model busy" });
  }
});

// AI COACH Route
app.post("/api/gemini/coach", async (req, res) => {
  const { message, history, context } = req.body;
  const ai = getGeminiClient();

  const getFallback = () => {
    let reply = "Hello! I am your DeadlineAI. Let's analyze your current workload and plan a perfect, stress-free execution sequence. What shall we tackle first?";
    let suggestedAction = "";
    let suggestedActionLabel = "";

    const msg = message.toLowerCase();
    if (msg.includes("burnout") || msg.includes("stressed") || msg.includes("tired")) {
      reply = "I detect elevated cognitive pressure. Looking at your metrics, I highly suggest activating **Focus Bubble Mode** for your most critical task right now. This hides all distractions. Would you like to enter deep flow, or shall we defer some lower-priority deadlines first?";
      suggestedAction = "trigger_bubble";
      suggestedActionLabel = "Activate Focus Bubble";
    } else if (msg.includes("optimize") || msg.includes("schedule") || msg.includes("plan")) {
      reply = "I've scanned your current task queues and priority structures. I can compile an optimized daily timeline allocating deep work blocks to high-complexity items. Let's run the **Smart Time Optimizer** to frame your day.";
      suggestedAction = "trigger_optimize";
      suggestedActionLabel = "Run Optimizer";
    } else if (msg.includes("delay") || msg.includes("what if") || msg.includes("tomorrow")) {
      reply = "Pushing timelines shifts your structural safety buffers. We can simulate the downstream impact using our **What-If Analyzer** or check success probabilities via the **AI Time Machine**. Just let me know which task you're thinking of adjusting!";
      suggestedAction = "trigger_whatif";
      suggestedActionLabel = "Open What-If Analyzer";
    } else if (msg.includes("hello") || msg.includes("hi ") || msg.includes("hey")) {
      reply = "Welcome back, Karthikeya! I am your DeadlineAI. I can help you **detect burnout, run what-if simulations, optimize focus blocks, and design your daily missions**. How can I assist your productivity flow today?";
    } else {
      reply = `Understood. Analyzing your request. To support your momentum, I recommend setting an absolute **'Mission of the Day'** for your highest-impact task, then using the **Focus Bubble** timer (25 min blocks) to log pure flow hours. Let me know if you'd like me to draft a step-by-step timeline!`;
    }

    return {
      reply,
      suggestedAction,
      suggestedActionLabel,
      isDemo: true
    };
  };

  if (!ai) {
    return res.json(getFallback());
  }

  try {
    const prompt = `You are the DeadlineAI Coach, an elite AI productivity expert, task strategist, and mental buffer guardian.
The user is talking to you from their dashboard.
User message: "${message}"

Context of current app:
- Active tasks: ${JSON.stringify(context.tasks || [])}
- Burnout risk: ${context.burnoutRisk || "Medium"}
- Productivity archetype: ${context.archetype || "Strategic Planner"}

Previous conversation brief history:
${JSON.stringify((history || []).slice(-4))}

Formulate an elegant, empowering, conversational, and highly actionable response. Use markdown bold text for emphasis. Keep it under 130 words.
Optionally, if the conversation naturally matches an action, return a suggestedAction name ('trigger_bubble' | 'trigger_optimize' | 'trigger_whatif') and a suggestedActionLabel.

Return exactly a JSON object with this schema (pure JSON only):
{
  "reply": "string",
  "suggestedAction": "string (optional)",
  "suggestedActionLabel": "string (optional)"
}`;

    const response = await generateWithFallback(ai, prompt);

    const data = JSON.parse(response.text || "{}");
    res.json({ ...data, isDemo: false });
  } catch (error: any) {
    console.log("[Gemini Coach Note] Model experienced brief unavailability. Using default mock scenario.");
    res.json({ ...getFallback(), apiError: error.message || "Model busy" });
  }
});

// WEEKLY WEEKLY INSIGHTS Route
app.post("/api/gemini/insights", async (req, res) => {
  const { history } = req.body;
  const ai = getGeminiClient();

  const getFallback = () => {
    return {
      productivityTrendScore: 78,
      focusTrendScore: 84,
      growthReport: "Your completion velocity has increased by 14% week-over-week. You logged substantial deep work on Tuesday, which reduced stress. However, task delay is rising slightly on Thursdays. Restructure afternoon loads to prevent late-week drag.",
      weeklyRecap: "You mastered 8 key deadlines this week. Your top focused area was Development, accounting for 62% of focus metrics.",
      chartData: [
        { day: "Mon", completed: 3, focusHours: 4.5 },
        { day: "Tue", completed: 5, focusHours: 6.0 },
        { day: "Wed", completed: 2, focusHours: 3.5 },
        { day: "Thu", completed: 4, focusHours: 5.0 },
        { day: "Fri", completed: 6, focusHours: 7.2 },
        { day: "Sat", completed: 1, focusHours: 1.5 },
        { day: "Sun", completed: 0, focusHours: 0.5 }
      ],
      isDemo: true
    };
  };

  if (!ai) {
    return res.json(getFallback());
  }

  try {
    const prompt = `Analyze this user's task history and log items to generate a weekly insight report:
${JSON.stringify(history || [])}

Predict weekly trends. Generate:
1. Productivity trend score (0-100)
2. Focus trend score (0-100)
3. A detailed paragraphs growth report summarizing accomplishments, bottlenecks, and feedback
4. A quick 1-sentence weekly recap
5. Chart series data for 7 days (Mon-Sun) reflecting mock/derived completed tasks count and focus hours.

Return exactly a JSON object conforming to:
{
  "productivityTrendScore": number,
  "focusTrendScore": number,
  "growthReport": "string",
  "weeklyRecap": "string",
  "chartData": [
    { "day": "string (Mon, Tue, etc.)", "completed": number, "focusHours": number }
  ]
}`;

    const response = await generateWithFallback(ai, prompt);

    const data = JSON.parse(response.text || "{}");
    res.json({ ...data, isDemo: false });
  } catch (error: any) {
    console.log("[Gemini Insights Note] Model experienced brief unavailability. Using default mock scenario.");
    res.json({ ...getFallback(), apiError: error.message || "Model busy" });
  }
});


// Serve Vite or static files based on environment
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`[DEADLINEAI SERVER] Running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode.`);
  });
}

start().catch((err) => {
  console.error("Failed to start fullstack server:", err);
});
