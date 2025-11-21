import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { RAGService } from './rag.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Security Middleware
// Helmet helps secure Express apps by setting various HTTP headers
app.use(helmet({
    contentSecurityPolicy: false, // Disabled for development to allow external images (Google profile)
    crossOriginEmbedderPolicy: false
}));

// Trust Proxy for Render/Heroku
app.set('trust proxy', 1);

// CORS Configuration
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));

// Rate limiting to prevent abuse
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." }
});

// Apply rate limiting to API routes
app.use('/api/', limiter);

console.log("Environment Check:");
console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? `Loaded (${process.env.GOOGLE_CLIENT_ID.substring(0, 5)}...)` : "Missing");
console.log("GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET ? "Loaded" : "Missing");
console.log("SESSION_SECRET:", process.env.SESSION_SECRET ? "Loaded" : "Missing");
console.log("GOOGLE_CALLBACK_URL:", process.env.GOOGLE_CALLBACK_URL || "NOT SET - will use relative path");
console.log("CLIENT_URL:", process.env.CLIENT_URL || "NOT SET - will use localhost:5173");

// Setup Multer
const upload = multer({ dest: 'uploads/' });

// Initialize RAG Service
const ragService = new RAGService();

// Middleware
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true, // Helps prevent XSS
        secure: true, // Always use secure cookies (HTTPS required)
        sameSite: 'none', // Allow cross-site cookies for Vercel <-> Render
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));
app.use(passport.initialize());
app.use(passport.session());

// Passport Config
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback',
    proxy: true
},
    function (accessToken, refreshToken, profile, cb) {
        return cb(null, profile);
    }
));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// Auth Middleware
const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'Unauthorized' });
};

// API Routes

// Auth Routes
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: process.env.CLIENT_URL || 'http://localhost:5173' }),
    function (req, res) {
        // Successful authentication, redirect home.
        res.redirect(process.env.CLIENT_URL || 'http://localhost:5173');
    });

app.get('/api/user', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ user: req.user });
    } else {
        res.json({ user: null });
    }
});

app.post('/api/logout', (req, res) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.json({ success: true });
    });
});

// Ingestion Routes
app.post('/api/upload', ensureAuthenticated, upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    try {
        const result = await ragService.ingestPDF(req.file.path, req.user.id);
        res.json({ message: 'PDF processed successfully', ...result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/ingest/web', ensureAuthenticated, async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });
    try {
        const result = await ragService.ingestWeb(url, req.user.id);
        res.json({ message: 'Website processed successfully', ...result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/ingest/youtube', ensureAuthenticated, async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });
    try {
        const result = await ragService.ingestYouTube(url, req.user.id);
        res.json({ message: 'YouTube video processed successfully', ...result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// User Data Management
app.post('/api/user/delete-data', ensureAuthenticated, async (req, res) => {
    try {
        const userId = req.user.id;
        await ragService.deleteUserData(userId);
        res.json({ success: true, message: 'All your data has been deleted' });
    } catch (error) {
        console.error('Error deleting user data:', error);
        res.status(500).json({ error: 'Failed to delete data' });
    }
});

// Chat Route
app.post('/api/chat', ensureAuthenticated, async (req, res) => {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: 'Question is required' });
    try {
        const answer = await ragService.query(question, req.user.id);
        res.json({ answer });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
