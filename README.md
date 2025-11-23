# Telegram Chat Cleaner

Web application for preparing Telegram chat history for NotebookLM and other LLMs. Processes Telegram JSON exports, anonymizes data, and converts to optimized text formats. Everything runs locally in your browser — your data never leaves your computer.

## ✨ Features

-   🔒 **100% Privacy** — all processing happens locally in your browser
-   🎭 **Anonymization** — automatic replacement of user names with "User 1", "User 2", etc.
-   📦 **Smart Chunking** — automatic splitting of large chats into parts for working with context limits
-   🎯 **NotebookLM Optimization** — special output format with grouping of messages from the same user
-   📄 **Multiple Formats** — support for NotebookLM, Plain Text, and JSON Lines formats
-   📥 **Flexible Export** — download individual chunks, combined file, or ZIP archive

## 🚀 Quick Start

### Requirements

-   Node.js 18+
-   npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/telegram-chat-cleaner.git
cd telegram-chat-cleaner
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the dev server:

```bash
npm run dev
# or
yarn dev
```

The application will open at `http://localhost:3000`

## 📖 Usage

1. **Export data from Telegram:**

    - Open Telegram Desktop
    - Settings → Advanced → Export chat history
    - Select a chat and export in JSON format

2. **Upload file to the application:**

    - Drag and drop `result.json` into the upload area or select a file via the button

3. **Configure processing settings:**

    - **Output Format:** NotebookLM (recommended), Plain Text, or JSON Lines
    - **Chunk Size:** adjust the number of characters per chunk (default: 50,000)
    - **Anonymization:** enable to replace user names
    - **System Messages:** enable to remove service messages

4. **Download the result:**
    - **Download ZIP** — all chunks as separate files (ideal for NotebookLM)
    - **Download Combined** — one combined file
    - **JSON** — download in JSON Lines format

## 🏗️ Building for Production

```bash
npm run build
# or
yarn build
```

Built files will be in the `dist/` folder

## 🌐 Deploying to GitHub Pages

1. Make sure the correct `base` path (your repository name) is set in `vite.config.ts`

2. Build the project:

```bash
npm run build
```

3. Configure GitHub Pages:

    - Go to Settings → Pages in your repository
    - Select source: "Deploy from a branch"
    - Select the `gh-pages` branch and `/ (root)` folder
    - Or use GitHub Actions for automatic deployment

4. Upload the contents of the `dist/` folder to the `gh-pages` branch

## 🛠️ Technologies

-   **React 19** — UI library
-   **TypeScript** — type safety
-   **Vite** — build tool and dev server
-   **Tailwind CSS** — styling
-   **Lucide React** — icons
-   **JSZip** — ZIP archive creation

## 📝 Output Formats

### NotebookLM Optimized

Special format for NotebookLM with grouping of messages from the same user:

```
**User 1** (2024-01-15):
Message 1
Message 2

**User 2** (2024-01-15):
Reply
```

### Plain Text

Simple text format:

```
[2024-01-15] User 1: Message 1
[2024-01-15] User 2: Reply
```

### JSON Lines

Structured format, each line is a JSON object:

```json
{"id":1,"date":"2024-01-15","user":"User 1","content":"Message 1"}
{"id":2,"date":"2024-01-15","user":"User 2","content":"Reply"}
```

## 🔒 Privacy

This application works completely locally:

-   ✅ No data is sent to any server
-   ✅ All processing happens in your browser
-   ✅ You can use the application offline after loading
-   ✅ Source code is open for inspection

## 📄 License

MIT

## 🤝 Contributing

Pull requests are welcome! If you have ideas for improvements, create an issue or send a PR.
