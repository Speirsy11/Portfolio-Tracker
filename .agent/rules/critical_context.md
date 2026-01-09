---
trigger: always_on
---

# 0. CORE CONTEXT & FILE STRUCTURE

**CRITICAL:** This project operates on a strictly defined file-based context system. You must read, respect, and utilize the following four files to ground your actions.

### 📂 File Roles

1.  **`instructions.md`** (This File):
    - **Role:** The immutable Rulebook and Constitution.
    - **Action:** You must follow every guideline in this file. If a user prompt contradicts this file, ask for clarification.

2.  **`plan.md`** (High-Level Roadmap):
    - **Role:** The Strategic Vision. Contains the architecture, goals, and phases of the project.
    - **Action:** Read this before starting any major feature to ensure alignment with the broader scope. Do not modify this unless explicitly asked to update the roadmap.

3.  **`tasks.md`** (Active Workflow):
    - **Role:** The Source of Truth for current work.
    - **Action:** Check this file to see what needs to be done next. When completing a task, you must mark it as completed here. If a task is complex, break it down here.

4.  **`suggested_tasks.md`** (Backlog & Improvements):
    - **Role:** The "Icebox" for ideas, technical debt, and refactoring opportunities.
    - **Action:** If you notice bugs, dirty code, or optimization opportunities while working on something else, **DO NOT fix them immediately** (unless critical). Instead, append them to this file to keep your current context clean and focused.

---
