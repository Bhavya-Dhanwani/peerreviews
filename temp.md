# 🧠 React Project Assignment: Smart Todo App

## 📌 Objective

Build a fully functional Smart Todo Application using React that goes beyond a basic todo list by including reminders, categorization, search optimization, and user analytics.

---

## 🚀 Features to Implement

### 1. ✅ Core Todo Features

* Add a new task
* Edit an existing task
* Delete a task
* Mark task as Done / Not Done (toggle)

---

### 2. 🔁 Reminder System

Students must implement:

* Daily reminders
* Custom interval reminders (e.g. every 2 days, every 3 days)

**Example:**

* "Drink water" → Reminder: Every 2 days
* "Workout" → Reminder: Daily

---

### 3. 💾 Local Storage Persistence

* Store all tasks in `localStorage`
* On refresh → data should persist
* Sync UI with stored data

---

### 4. 📊 User Activity Summary

Display stats like:

* Total tasks
* Completed tasks
* Pending tasks
* Completion percentage

---

### 5. 🗂️ Task Categorization

Allow users to assign categories:

* Health
* Work
* Study
* Personal
* Custom category (optional)

---

### 6. 🔍 Search & Filter

* Search tasks by text
* Filter by:

  * Completed / Pending
  * Category

---

### 7. ⚡ Optimization Using DSA

Students must apply Data Structures & Algorithms concepts

**Expected Concepts:**

* Efficient search (avoid unnecessary re-renders)
* Use:

  * Hashing (Object / Map for fast lookup)
  * Filtering algorithms
  * Sorting (optional)

**Example:**

* Store tasks in a Map or Object
* Use efficient filtering instead of nested loops

---

## 🧱 Suggested Component Structure

```bash
src/
└── components/
    ├── Navbar.jsx
    ├── TodoForm.jsx
    ├── TodoItem.jsx
    ├── TodoList.jsx
    ├── Filters.jsx
    ├── Summary.jsx
    └── ReminderSettings.jsx
---
```

## 🧩 State Management

Students can use:

* React `useState`
* React `useReducer` (recommended)
* Context API (bonus)

---

## 🗃️ Data Structure Example

```json
{
  "id": "123",
  "title": "Workout",
  "completed": false,
  "category": "Health",
  "createdAt": "Date",
  "reminder": {
    "type": "interval",
    "intervalDays": 2
  }
}
```

---

## ⏰ Reminder Logic Hint

* Use `setInterval` or `setTimeout`
* OR calculate next reminder time manually

**Bonus:**

* Show upcoming reminders

---

## 🎯 Bonus Features (Optional)

* Dark mode 🌙
* Drag & drop tasks
* Browser notifications
* Sorting (date, category)
* Priority levels

---

## 🧪 Evaluation Criteria (Main)

| Criteria             | Marks |
| -------------------- | ----- |
| Functionality (CRUD) | 20    |
| Reminder System      | 20    |
| LocalStorage         | 10    |
| UI/UX                | 10    |
| Search & Filters     | 10    |
| DSA Optimization     | 15    |
| Code Structure       | 10    |
| Bonus Features       | 5     |

---

## 🧪 Peer Review Criteria

| Criteria          | Marks |
| ----------------- | ----- |
| Folder Structure  | 5     |
| UI/UX             | 5     |
| Code Quality      | 5     |
| README Quality    | 5     |
| Code Optimization | 5     |

---

## 🧠 How to Review a Project (Simple & Effective)

### 1. Folder Structure (5 marks)

✔ Check:

* Proper separation (components, hooks, utils)
* No messy files

💬 Example:

* "Good structure, components are well separated."
* "Move logic into separate folders."

---

### 2. UI/UX (5 marks)

✔ Check:

* Clean design
* Easy to use
* Responsive

💬 Example:

* "UI is clean and easy to use."
* "Improve spacing and button visibility."

---

### 3. Code Quality (5 marks)

✔ Check:

* Clean naming
* No unnecessary code
* Reusable components

💬 Example:

* "Code is readable and structured."
* "Avoid repetition, create reusable functions."

---

### 4. README Quality (5 marks)

✔ Check:

* Description
* Setup steps
* Features

💬 Example:

* "README is clear."
* "Add screenshots and setup steps."

---

### 5. Code Optimization (5 marks)

✔ Check:

* Efficient filtering/search
* No unnecessary re-renders
* Good state handling

💬 Example:

* "Filtering is good."
* "Use Map/Object for faster lookup."

---

## ✨ What is a Good Review?

A good review is:

* Short
* Clear
* Helpful
* Not rude

---

## ⚡ Perfect Review Format

1. ✅ What is good
2. ❌ What can improve
3. 💡 Suggestion

---

### 🔥 Example

UI is clean and easy to use.
Search works fine but code is repeating.
Try creating reusable functions.

---

### ❌ Avoid

* "Bad code"
* "Not good"

---

### ✅ Good Short Reviews

* "Good UI, improve spacing"
* "Logic works, optimize filtering"
* "Clean code, naming can be better"

---

## 🎯 Pro Tips

* Keep review within 3–4 lines
* Focus on impact, not long explanations

---

## ⚠️ Rules

* No copy-paste from internet
* Clean code required
* Proper folder structure
* Meaningful variable names
* Comments where needed

---

## 🚫 AI Usage Policy

* Use of AI tools (ChatGPT, Copilot, etc.) is strictly **prohibited**
* Students must write code on their own
* If AI-generated code is found → marks will be deducted or submission rejected

---

## 📦 Submission

* GitHub repository link
* Live demo (optional)
* README including:

  * Features
  * How to run
  * Screenshots

---

## 💡 Final Hint

Think like a product builder:

* Fast search ⚡
* Clean UI 🎨
* Smart logic 🧠

---