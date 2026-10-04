# Closure
Built for the **Hacktoberfest Weekend Challenge: Build for a Friend**, Closure is an AI-assisted personal workspace that passively tracks background activity to organize projects, extract deadlines, and close "open loops." 

Traditional to-do lists fail for chronically busy students and developers because they require manual, rigid upkeep. Closure solves this by observing actual work (GitHub commits, LeetCode practice, YouTube research) and autonomously categorizing it into an actionable desk layout.

## ✨ Features

* **The Relevance Engine:** A background AI pipeline that maps raw activity signals (browser tabs, commits) to your active projects, or pushes brand new discoveries straight to your Inbox.
* **Brain Dump Extraction:** Type a messy paragraph of thoughts, and Gemma 4 structures them into categorized projects, recurring goals, and tasks.
* **Passive Context Observer:** Includes a custom Chrome Extension that quietly collects metadata from allowed domains (e.g., GitHub, LeetCode) without leaving the browser.
* **Smart Deadline Extraction:** Upload course syllabi, hackathon rules, or project briefs (PDFs). The server natively parses the text and uses Gemma to hunt for critical due dates, automatically attaching them to your loops.
* **Explainable "Evidence Trail":** Click on any project to see exactly *why* the AI flagged it, citing the background signals it observed and its confidence score.
* **"Clean My Desk":** An AI evaluator that suggests which stagnant projects to "Park" and which active ones to keep on your desk.

## 🛠️ Tech Stack

* **Framework:** Next.js (App Router)
* **Database:** MongoDB & Mongoose
* **AI Model:** Gemma 4 31B-it via the Google GenAI SDK (`@google/genai`)
* **Document Parsing:** `pdf-parse` (Native Node handling via custom `createRequire` to bypass Turbopack conflicts)
* **Styling:** Tailwind CSS & Lucide React

## 🔒 Privacy & Permissions
Closure is designed to be privacy-first.

The browser extension only tracks domains explicitly approved by the user in the Settings panel.

Unlisted domains are ignored locally and never leave the browser.

Activity logs (Signals) operate on a strict, customizable retention policy (default 30 days) before automatic deletion.

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
