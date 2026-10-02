# CODIE Client - Collaborative Editor & Live Teaching Platform

The frontend for **CODIE** is built using **Next.js 15 (App Router)** and **React 19**, designed to deliver low-latency real-time code editing, live WebRTC video/audio huddles, instant code execution, and interactive live teaching tools.

## ✨ Highlights & New Editor Features

- 🎥 **WebRTC Video Huddle**: Integrated peer-to-peer video streaming with host controls and participant tile layouts.
- 🎙️ **Audio Huddle & Waveform**: Real-time voice huddle with active speaker audio waveform animations and hand-raising notifications.
- ⚡ **Live Code Execution Console**: Instant code compilation and output rendering powered by Piston API.
- 🔒 **Selection & Line Locking**: Interactive line locking enabling teachers and leads to highlight, protect, and demonstrate code in real-time.
- 💬 **In-Editor Room Chat**: Integrated messaging for live discussion without leaving the workspace.
- 🤝 **Multi-Cursor Monaco Editor**: Real-time collaborative code editing with presence indicators powered by WebSockets.
- 🎓 **Live Teaching & Mentorship Workflow**: Designed for practical coding sessions where teachers can guide students, fix errors live, and let peers observe in real-time.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI & Components**: React 19, Radix UI Primitives, Lucide Icons, Framer Motion
- **Styling**: Tailwind CSS 4
- **Editor**: Monaco Editor (`@monaco-editor/react`)
- **State Management**: Zustand, TanStack Query (React Query v5)
- **Real-Time Communication**: Socket.io-client, PeerJS / Native WebSockets
- **Audio Visualizer**: HTML5 Canvas Audio API

## 🚦 Development Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   Create a `.env.local` file with the following variables:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
   NEXT_PUBLIC_PISTON_URL=https://piston-4hy6.onrender.com
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open in Browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Directory Structure

```text
client/
├── src/
│   ├── apis/         # API client functions (User, Room, Project, Subscription)
│   ├── app/          # Next.js App Router pages
│   │   ├── (auth)/   # Authentication pages (login, register, otp)
│   │   ├── (protected)/ # Dashboard, Editor, Discover, Plan, Contributor pages
│   │   └── page.tsx  # Hero landing page
│   ├── components/   # Reusable UI components & Editor panels
│   ├── context/      # WebRTC & Socket context providers
│   ├── hooks/        # Custom React hooks (Queries, WebRTC, Sockets)
│   ├── lib/          # Utilities & validations
│   ├── providers/    # App providers (React Query, Transitions)
│   ├── stores/       # Zustand stores (Editor state, Code store, User store)
│   └── types/        # TypeScript declarations
```
