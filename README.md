# Corthyx AI - Your Personal Second Brain

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-19.2.0-blue.svg)

Corthyx AI is an intelligent RAG (Retrieval-Augmented Generation) application that allows you to chat with your own data. Upload PDFs, scrape websites, or ingest YouTube videos, and ask questions to get contextual answers powered by AI.

## 🌟 Features

- **Multi-Source Ingestion**: Upload PDFs, scrape websites, or add YouTube videos
- **Semantic Search**: Uses vector embeddings for intelligent context retrieval
- **Secure Authentication**: Google OAuth integration with session management
- **Multi-Tenancy**: Strict data isolation - your data stays yours
- **Source Attribution**: AI responses cite which source the information came from
- **Link Extraction**: Automatically extracts and indexes links from web pages
- **Dark Mode**: Beautiful UI with dark mode support
- **Responsive Design**: Works seamlessly on desktop and mobile

## 🛠️ Tech Stack

### Frontend
- **React** 19.2.0 - Component-based UI
- **Vite** - Lightning-fast build tool
- **TailwindCSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Axios** - HTTP client

### Backend
- **Node.js** + **Express** - Server framework
- **Passport.js** - Google OAuth authentication
- **LangChain.js** - AI orchestration framework
- **OpenAI** - GPT-4o-mini for generation, text-embedding-3-small for embeddings
- **Qdrant Cloud** - Vector database for semantic search

### Data Processing
- **PDF Parsing**: `@langchain/community/document_loaders/fs/pdf`
- **Web Scraping**: `CheerioWebBaseLoader`
- **YouTube Transcripts**: `YoutubeLoader`
- **Text Splitting**: `RecursiveCharacterTextSplitter`

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm or yarn
- Google OAuth credentials
- OpenAI API key
- Qdrant Cloud instance

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/piyushgoswami015/CorthyxAI.git
cd CorthyxAI
```

2. **Install dependencies**
```bash
npm install
cd client && npm install && cd ..
```

3. **Set up environment variables**

Create a `.env` file in the root directory:
```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Session
SESSION_SECRET=your_random_session_secret

# AI Services
OPENAI_API_KEY=your_openai_api_key

# Vector Database
QDRANT_URL=https://your-cluster.cloud.qdrant.io:6333
QDRANT_API_KEY=your_qdrant_api_key

# Environment
NODE_ENV=development
```

4. **Build the client**
```bash
npm run build
```

5. **Start the server**
```bash
npm start
```

The app will be available at `http://localhost:3000`

## 📖 Usage

1. **Login**: Click "Sign in with Google"
2. **Upload Data**: 
   - Upload a PDF file
   - Paste a website URL
   - Add a YouTube video link
3. **Chat**: Ask questions about your uploaded content
4. **Logout**: Your data is automatically deleted when you log out

## 🏗️ Architecture

### RAG Pipeline
1. **Ingestion**: Documents are split into 1000-character chunks with 200-character overlap
2. **Embedding**: Each chunk is converted to a 1536-dimensional vector using OpenAI embeddings
3. **Storage**: Vectors are stored in Qdrant with metadata (userId, sourceType, etc.)
4. **Retrieval**: User queries are converted to vectors and matched against stored chunks
5. **Generation**: Top 15 relevant chunks are sent to GPT-4o-mini to generate the answer

### Security
- Google OAuth for authentication
- Session-based state management
- Strict data isolation via metadata filtering
- Rate limiting on API routes
- Helmet.js for security headers

## 🌐 Deployment

### Render (Recommended)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the following:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
4. Add all environment variables from `.env`
5. Deploy!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Piyush Goswami**
- Age: 25
- Location: Bangalore, India
- GitHub: [@piyushgoswami015](https://github.com/piyushgoswami015)

## 🙏 Acknowledgments

- OpenAI for GPT-4 and embeddings
- LangChain for the RAG framework
- Qdrant for vector database
- The open-source community

---

Built with ❤️ by Piyush Goswami
