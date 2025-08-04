# VibeCheck - VS Code Extension

A VS Code extension that promotes mindful coding practices by requiring developers to explain their code before pasting or using autocomplete features. VibeCheck integrates with AI-powered feedback systems to evaluate code explanations and provides a comprehensive learning experience.

## 🎯 Overview

VibeCheck is designed to encourage developers to think critically about the code they're writing. It intercepts paste operations and autocomplete insertions, requiring users to provide explanations before allowing the code to be inserted. The extension uses AI feedback to evaluate these explanations and provides constructive criticism to help developers improve their understanding.

## ✨ Features

### 🔐 Authentication System

- **User Login/Logout**: Secure authentication using Supabase
- **API Key Management**: Personalized API keys for each user
- **Session Persistence**: Automatic login state management

### 📋 Paste Detection & Analysis

- **Smart Paste Interception**: Detects when code is pasted into the editor
- **Context-Aware Analysis**: Considers surrounding code context for better evaluation
- **AI-Powered Feedback**: Uses Google Gemini to evaluate code explanations
- **Similarity Detection**: Bypasses explanation for previously seen similar code
- **Visual Feedback**: Color-coded decorations and progress bars

### 🤖 Autocomplete Monitoring

- **Tab Detection**: Monitors large text insertions (likely from autocomplete)
- **Explanation Requirements**: Requires explanation for autocompleted code
- **Automatic Deletion**: Removes code with poor explanations (score < 4)
- **Context Preservation**: Maintains surrounding code context for analysis

### 👁️ Spectator Mode

- **Silent Monitoring**: Tracks code without requiring explanations
- **Data Collection**: Still logs activity for analysis purposes
- **Toggle Functionality**: Easy enable/disable through command palette

### 📊 Data Analytics

- **Embedding Storage**: Stores code embeddings for similarity detection
- **Activity Logging**: Comprehensive logging of all code activities
- **Performance Tracking**: Monitors explanation quality over time

## 🏗️ Architecture

### Core Components

```
src/
├── api/                    # External API integrations
│   ├── pasteGemini.ts     # Google Gemini API for feedback
│   └── tabGemini.ts       # Gemini API for tab detection
├── commands/              # VS Code command implementations
│   ├── login.ts          # User authentication
│   ├── logout.ts         # User logout
│   ├── inlinePasteDetection.ts  # Paste interception logic
│   ├── tabDetection.ts   # Autocomplete monitoring
│   ├── spectatorMode.ts  # Spectator mode toggle
│   └── currentTime.ts    # Utility command
├── lib/                   # Core libraries and utilities
│   ├── supabase.ts       # Database client
│   ├── getEmbedding.ts   # Code embedding generation
│   └── saveEmbedding.ts  # Embedding storage
├── utilities/            # Helper functions
│   ├── computeCosineSimilarity.ts  # Similarity calculations
│   ├── findSimilarEmbedding.ts     # Similar code detection
│   ├── getAsciiProgressBar.ts      # Visual feedback
│   └── getSurroundingContext.ts    # Context extraction
└── views/                # UI components
    ├── reflectionSidebar.ts        # Sidebar interface
    └── webViewContent.ts           # Webview content
```

### Data Flow

1. **User Action**: User pastes code or receives autocomplete
2. **Interception**: Extension intercepts the action
3. **Context Analysis**: Surrounding code context is extracted
4. **Similarity Check**: Code is compared against previous embeddings
5. **Explanation Request**: User provides explanation (if needed)
6. **AI Evaluation**: Gemini API evaluates the explanation
7. **Feedback Display**: Visual feedback is shown to user
8. **Action Decision**: Code is inserted, modified, or deleted
9. **Data Storage**: Activity is logged to database

## 🚀 Installation

### Prerequisites

- VS Code 1.100.0 or higher
- Node.js and npm
- Supabase account (for backend services)
- Google Gemini API key

### Setup Instructions

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd toolbox
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory:

   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Compile the extension**

   ```bash
   npm run compile
   ```

5. **Run in development mode**
   - Press `F5` in VS Code to launch the extension development host
   - Or use `npm run watch` for continuous compilation

## 📖 Usage

### Getting Started

1. **Login**: Use the command `VibeCheck: Login` to authenticate
2. **Paste Code**: Use `Ctrl+V` (or `Cmd+V` on Mac) to paste code
3. **Provide Explanation**: Enter your explanation when prompted
4. **Review Feedback**: Check the feedback in the output panel
5. **Iterate**: Improve your explanation if needed

### Commands

| Command                             | Description                   | Keyboard Shortcut  |
| ----------------------------------- | ----------------------------- | ------------------ |
| `VibeCheck: Login`                  | Authenticate with VibeCheck   | -                  |
| `VibeCheck: Logout`                 | Sign out of VibeCheck         | -                  |
| `VibeCheck: Inline Paste Detection` | Manual paste detection        | `Ctrl+V` / `Cmd+V` |
| `VibeCheck: Toggle Spectator Mode`  | Enable/disable spectator mode | -                  |
| `VibeCheck: Tab Detection`          | Manual tab detection trigger  | -                  |

### Modes

#### Normal Mode

- Requires explanation for all pasted/autocompleted code
- Provides AI feedback on explanations
- Stores embeddings for similarity detection
- Deletes code with poor explanations

#### Spectator Mode

- Tracks code activity without requiring explanations
- Still logs data for analysis
- Useful for learning sessions or demonstrations

### Feedback System

The extension provides feedback through:

- **Score Display**: 0-10 rating with visual progress bar
- **Emoji Indicators**: 🟢 Good Job, 🟡 Could be better, 🔴 Poor Explanation
- **Detailed Critique**: Specific feedback on explanation quality
- **Suggestions**: Recommendations for improvement
- **Visual Decorations**: Color-coded line decorations

## 🔧 Configuration

### Extension Settings

The extension can be configured through VS Code settings:

```json
{
  "vibeCheck.enablePasteDetection": true,
  "vibeCheck.enableTabDetection": true,
  "vibeCheck.similarityThreshold": 0.8,
  "vibeCheck.minimumScore": 7,
  "vibeCheck.contextRadius": 5
}
```

### Database Schema

The extension uses Supabase with the following tables:

- **users**: User authentication and profile data
- **pastes**: Logged paste operations with explanations
- **autocompletes**: Logged autocomplete operations
- **embeddings**: Code embeddings for similarity detection

## 🛠️ Development

### Building

```bash
# Compile TypeScript
npm run compile

# Watch for changes
npm run watch

# Run tests
npm test

# Lint code
npm run lint
```

### Testing

```bash
# Run unit tests
npm test

# Run extension tests
npm run pretest
```

### Debugging

1. Set breakpoints in the TypeScript files
2. Press `F5` to launch the extension development host
3. Use the Developer Tools to inspect the extension

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow TypeScript best practices
- Use ESLint configuration provided
- Write meaningful commit messages
- Add tests for new features
