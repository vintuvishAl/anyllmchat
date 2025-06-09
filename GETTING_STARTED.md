# 🚀 Getting Started with LLM Chat App

*Complete setup guide for the Convex community*

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** installed ([Download here](https://nodejs.org/))
- **Git** for version control
- **Expo CLI** installed globally: `npm install -g @expo/cli`
- A **Convex account** (free at [convex.dev](https://convex.dev))
- At least one **AI API key** (OpenAI, Anthropic, or Google)

### 📱 For Mobile Testing
- **iOS**: Expo Go app from App Store + macOS with Xcode (for simulator)
- **Android**: Expo Go app from Play Store + Android Studio (for emulator)

## 🛠️ Step-by-Step Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/llm-app.git
cd llm-app
```

### 2. Install Dependencies
```bash
npm install
```

This installs all required packages including:
- Expo SDK and React Native
- Convex client and components
- AI SDK providers
- UI and animation libraries

### 3. Set Up Convex Backend

#### First-time Convex setup:
```bash
# Install Convex CLI globally
npm install -g convex

# Login to your Convex account
npx convex auth

# Initialize and deploy your backend
npx convex dev
```

This will:
1. Create a new Convex project in your dashboard
2. Generate a unique deployment URL
3. Deploy the database schema and functions
4. Start watching for changes

#### What gets deployed:
- **Database Schema** (`convex/schema.ts`): Tables for chats, messages, users, and preferences
- **AI Agents** (`convex/agents.ts`): LLM integration with tool calling
- **Chat Functions** (`convex/chat.ts`): Message handling and chat management
- **HTTP Endpoints** (`convex/http.ts`): Streaming API for real-time responses
- **User Preferences** (`convex/userPreferences.ts`): Model selection and settings

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Required: Convex Configuration
EXPO_PUBLIC_CONVEX_URL=https://your-deployment-url.convex.cloud

# Required: At least one AI provider API key
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_GENERATIVE_AI_API_KEY=AI...

# Optional: Enhanced features
SEARCH_API_KEY=your_search_api_key
FILE_SYSTEM_ACCESS=enabled
```

#### 🔑 How to get AI API keys:

**OpenAI (Recommended)**
1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up/login and go to API Keys
3. Create a new secret key
4. Add billing information (pay-per-use)

**Anthropic Claude**
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up/login and navigate to API Keys  
3. Create a new key
4. Add credits to your account

**Google Gemini**
1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Get an API key
3. Enable the Generative AI API

### 5. Start Development

#### Terminal 1 - Convex Backend:
```bash
npx convex dev
```
Keep this running! It watches for changes and redeploys automatically.

#### Terminal 2 - Expo Frontend:
```bash
npx expo start
```

You'll see a QR code and options to open the app.

### 6. Test the App

#### On Your Phone:
1. Install **Expo Go** from your app store
2. Scan the QR code from the terminal
3. The app will load on your device

#### In Browser (Web):
1. Press `w` in the terminal
2. The app opens at `http://localhost:8081`

#### iOS Simulator (macOS only):
1. Press `i` in the terminal
2. Requires Xcode to be installed

#### Android Emulator:
1. Press `a` in the terminal  
2. Requires Android Studio with an emulator

## ✅ Verification Steps

### 1. Test Basic Chat
1. Open the app
2. Type: "Hello, how are you?"
3. You should see a streaming response from the AI

### 2. Test Model Switching
1. Tap the model selector at the bottom
2. Choose a different AI model
3. Send another message
4. Verify the response comes from the new model

### 3. Test Chat History
1. Send a few messages
2. Tap the menu icon (☰) in the top-left
3. Your chat should appear in the history
4. Create a new chat with the + button

### 4. Test Agent Features (Advanced)
1. Try: "What's 25 * 47?"
2. The calculator tool should be used
3. Try: "Search for the latest AI news"
4. The web search tool should activate

## 🔧 Troubleshooting

### Common Issues:

#### "Convex functions not found"
- Make sure `npx convex dev` is running
- Check that `.env.local` has the correct `EXPO_PUBLIC_CONVEX_URL`
- Verify the Convex dashboard shows your deployment

#### "No AI response" 
- Check your AI API keys in `.env.local`
- Verify you have billing/credits set up with your AI provider
- Check the Convex logs for errors: `npx convex logs`

#### "App won't load on device"
- Ensure your phone and computer are on the same WiFi network
- Try restarting Expo: `npx expo start --clear`
- Check if Expo Go is up to date

#### "Build errors"
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Expo cache: `npx expo start --clear`

### Getting Help:

1. **Check the logs**: `npx convex logs` for backend issues
2. **Expo docs**: [docs.expo.dev](https://docs.expo.dev)
3. **Convex docs**: [docs.convex.dev](https://docs.convex.dev)
4. **Discord**: Join the [Convex Discord](https://convex.dev/community)

## 🎯 Next Steps

### Immediate Improvements:
1. **Customize the UI**: Modify colors in `constants/Colors.ts`
2. **Add More Models**: Extend the model list in `ChatInput.tsx`
3. **Enhance Prompts**: Improve AI behavior in `convex/agents.ts`

### Advanced Features:
1. **Camera Integration**: Add `expo-camera` for image analysis
2. **Voice Input**: Implement `expo-speech` for voice chat
3. **File Upload**: Add document processing capabilities
4. **Push Notifications**: Real-time chat notifications
5. **Location Features**: GPS-based contextual assistance

### Production Deployment:
1. **Build for App Stores**: `npx expo build`
2. **Set up CI/CD**: Automate builds and deployments
3. **Add Analytics**: Track usage and performance
4. **Implement Authentication**: User accounts and data privacy

## 🌟 Understanding the Architecture

### Frontend Flow:
```
User Input → ChatView → useChat Hook → Convex Mutation → AI Agent → Response Stream
```

### Backend Flow:
```
HTTP Request → Convex Function → AI Provider API → Tool Execution → Streaming Response
```

### Key Files to Understand:
- `components/ChatView.tsx` - Main chat interface
- `hooks/useChat.ts` - Chat state management
- `convex/agents.ts` - AI agent configuration
- `convex/chat.ts` - Backend chat logic
- `convex/http.ts` - Streaming API endpoint

## 🎉 You're Ready!

You now have a fully functional AI chat app running on:
- ✅ **Mobile devices** (iOS & Android)
- ✅ **Web browsers** 
- ✅ **Development simulators**

With real-time AI responses, multiple model support, and a beautiful native mobile interface!

## 🤝 Contributing

Want to contribute? Check out:
- Open issues on GitHub
- Feature requests from the community
- Documentation improvements
- New AI integrations and tools

Welcome to the future of mobile AI development with Convex! 🚀
