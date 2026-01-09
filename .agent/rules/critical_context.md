---
trigger: always_on
---

# 0. CORE CONTEXT & AGENT FILE STRUCTURE

**CRITICAL:** This project operates on a strictly defined file-based context system. You must read, respect, and utilize the following four files to ground your actions.

### 📂 File Roles

1.  **`rules.md`** (This File):
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

## 📂 INTERNAL PACKAGE STRUCTURE (Micro-Architecture)

**CRITICAL:** Every package (Feature or Shared) must maintain strict internal organization. Do not mix concerns. Use the following standard directory layout within `src/`:

### 1. The Public Boundary (`index.ts`)

- **Role:** The ONLY entry point for the package.
- **Rule:** This file must **only** contain exports.
- **Prohibited:** Do not write implementation logic (functions, classes, components) inside `index.ts`.
- **Example:** `export * from './hooks/useUser';`

### 2. Standard Directories

Organize files into these specific folders based on their technical role:

- **`schemas/`**: Zod schemas, validation logic, and DTOs. (e.g., `user.schema.ts`)
- **`data/`**: data files (e.g. questions.ts)
- **`hooks/`**: Custom React hooks. (e.g., `use-auth.ts`) which do things like perform API calls and fetch data
- **`components/`**: React UI components. Each component gets its own file. (e.g., `UserProfile.tsx`)
- **`utils/`**: Helper functions (non-React). (e.g., `date-formatter.ts`)

### 3. File Separation Rules

- **One Primary Export Per File:** Do not bundle multiple distinct utilities or components into a single file just because they are small.
- **Colocation:** If a component needs a specific helper that is _never_ used elsewhere, you may keep it in the same file (bottom), but prefer separation if it grows >50 lines.

### 4. File Naming Rules

- ** Descriptive File Names: ** Make sure file names are simple but descriptive so people understand what they do.
- ** Snake Case: ** Use snake case for all filenames and variables.
