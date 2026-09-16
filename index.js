require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const swaggerUi = require('swagger-ui-express');

const prisma = require('./src/lib/prisma');
const swaggerSpec = require('./src/config/swagger');
const adminRoutes = require('./src/routes/admin');
const { error: sendError } = require('./src/lib/response');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
// Prefer service role key for backend verification, fallback to anon key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// ─── Swagger UI ──────────────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'TantraFiesta Admin API Docs',
}));

// Expose raw OpenAPI spec as JSON
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ─── Existing endpoints ──────────────────────────────────────────

// Expose public configuration for the mock frontend
app.get('/api/config', (req, res) => {
  res.json({
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    databaseConfigured: !!process.env.DATABASE_URL,
    supabaseConfigured: !!supabase,
    timestamp: new Date().toISOString(),
  });
});

// Synchronize authenticated Supabase user with PostgreSQL database
app.post('/api/auth/sync', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or malformed Authorization header (Bearer token required).' });
    }

    if (!supabase) {
      return res.status(500).json({ error: 'Supabase client is not configured on the server. Please check .env.' });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: authError ? authError.message : 'Invalid or expired token.' });
    }

    const metadata = user.user_metadata || {};
    const fullName = (metadata.full_name || metadata.name || '').trim();
    const nameParts = fullName ? fullName.split(/\s+/) : [];
    const firstName = metadata.given_name || nameParts[0] || 'User';
    const lastName = metadata.family_name || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : '');

    // Upsert into Prisma User table
    let syncedUser;
    try {
      syncedUser = await prisma.user.upsert({
        where: { email: user.email },
        update: {
          authProvider: 'google',
          verified: true,
          firstName,
          lastName,
        },
        create: {
          id: user.id,
          email: user.email,
          firstName,
          lastName,
          authProvider: 'google',
          verified: true,
        },
      });
    } catch (dbError) {
      console.error('Database sync error:', dbError);
      return res.status(500).json({
        error: 'Supabase authentication succeeded, but database sync failed. Make sure DATABASE_URL is set and migrations are applied.',
        details: process.env.NODE_ENV === 'production' ? undefined : dbError.message,
      });
    }

    // Exclude password from response for security best practice
    const { password, ...safeUser } = syncedUser;

    return res.json({
      message: 'Authentication verified and user synced successfully.',
      user: safeUser,
    });
  } catch (err) {
    console.error('Unhandled error in /api/auth/sync:', err);
    return res.status(500).json({ 
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message 
    });
  }
});

// ─── Admin API ───────────────────────────────────────────────────
app.use('/api/admin', adminRoutes);

// ─── Global error handler ────────────────────────────────────────
// Catches errors thrown by services (NotFoundError, ValidationError, etc.)
app.use((err, req, res, _next) => {
  console.error(`[${req.method}] ${req.originalUrl} →`, err.message);

  const statusCode = err.statusCode || 500;
  const message =
    statusCode === 500 && process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message;

  return sendError(res, message, statusCode, err.details);
});

// ─── Static files & SPA fallback ─────────────────────────────────
// Serve static mock frontend
app.use(express.static(path.join(__dirname, 'public')));

// Fallback to index.html for single-page routing
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Swagger UI:   http://localhost:${port}/api-docs`);
  console.log(`Admin API:    http://localhost:${port}/api/admin`);
  console.log(`Open http://localhost:${port} in your browser to test Google OAuth.`);
});
