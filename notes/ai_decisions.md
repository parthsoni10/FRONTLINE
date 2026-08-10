# Frontline Triage AI — System Architecture & AI Decision Log

## 1. System Architecture & Model Selection
- **Architecture**: MERN Stack (MongoDB, Express, React, Node.js) structured strictly under the **MVC (Model-View-Controller)** paradigm.
- **Model Choice**: Google Gemini 2.5 Flash / Gemini 1.5 (`@google/genai` SDK) utilizing forced JSON Schema / Structured Tool Output.
- **Persistence Strategy**: Append-Only `TriageResult` schema in MongoDB. Reruns and retries do not overwrite existing documents, keeping full audit logs intact.
- **Denormalization Strategy**: `TriageResult` embeds `rawTextSnapshot` directly to prevent expensive `$lookup` aggregation joins on dashboard page loads.

---

## 2. Multi-Stage Guardrail & Security Engineering

### A. Pre-Check Defense (Belt & Suspenders)
- **Prompt Injection Detection**: Inputs are evaluated against high-precision regular expressions detecting adversarial phrases (`ignore previous instructions`, `you are now FREEDOM_GPT`, `system prompt override`, `[ADMIN DEBUG MODE]`).
- **Delimiter Containment**: Customer messages are wrapped inside `<user_message>...</user_message>` tags in system prompts with explicit instructions to evaluate content purely as data to classify, never as instructions to execute.
- **Length Truncation**: Inputs > 2,000 characters are safely truncated to avoid context window flooding.
- **Non-English Pre-Tagging**: Detects Spanish, French, and German keywords and logs `non_english` audit events.

### B. Post-Check Defense & Server-Side Enforcement
- **Confidence Threshold Enforcement**: If model output `confidence < 0.55`, the server *overrides* `needsHuman` to `true` and sets `flagReason` regardless of what the model returned.
- **Zod Contract Validation**: Model outputs must pass `TriageDecisionSchema` Zod validation *before* persistence.
- **Auto-Retry & Fallback Generation**: If Zod validation fails, the engine retries once with schema error feedback. If it fails twice, a synthetic fallback doc is persisted with `confidence: 0` and `needsHuman: true`.

---

## 3. Evaluation & Correctness Benchmarking
- **Ground Truth Benchmark**: Hand-labeled gold standard dataset (`ground_truth.csv`, N=10) evaluated independently.
- **Scorecard Metrics**:
  - **Overall Agreement**: 80.0%
  - **Category Agreement**: 80.0%
  - **Priority Agreement**: 90.0%
  - **Needs Human Agreement**: 90.0%
  - **Avg Latency**: ~200 ms
  - **Est. Cost per Message**: ~$0.000001 USD
- **Disagreement Honesty**: Disagreements are logged explicitly (e.g. MSG-005 classification nuance between `billing` vs `account`) to enable continuous prompt tuning.

---

## 4. Q&A Defense Summary
1. **Why Zod before Mongoose?**
   Zod validates raw LLM tool output before touching the database to catch AI hallucination / bad output shapes. Mongoose schema enforces shape at rest to catch application logic bugs.
2. **Why append-only?**
   To maintain auditability of retries, confidence shifts over time, and prompt versioning.
3. **Why enforce confidence in server code?**
   Never trust an AI model to evaluate its own compliance or self-flag reliability.
