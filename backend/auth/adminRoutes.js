const express = require('express');
const bcrypt = require('bcrypt');
const { signAdminToken } = require('./token');
const { authenticateAdmin, loginRateLimiter } = require('./middleware');
const path = require('path');

function normalizeEmail(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function validateLoginInputs(email, password) {
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return 'Please enter a valid email address.';
  }
  if (!password || typeof password !== 'string' || password.length < 8) {
    return 'Password must be at least 8 characters long.';
  }
  return null;
}

function createAdminRouter({ supabase, readJson, writeJson, dataDir }) {
  const router = express.Router();

  async function findAdminByEmail(email) {
    const normalizedEmail = normalizeEmail(email);
    const adminFile = path.join(dataDir, 'admins.json');
    
    const loadLocalAdmin = async () => {
      console.log(`[admin-lookup] Loading local credentials from admins.json for: ${normalizedEmail}`);
      try {
        const admins = (await readJson(adminFile, [])).filter(Boolean);
        const matchedAdmin = admins.find((admin) => normalizeEmail(admin.email) === normalizedEmail);
        return matchedAdmin || null;
      } catch (err) {
        console.error(`[admin-lookup] Error reading local admins.json:`, err.message);
        return null;
      }
    };

    const isSupabaseConfigured = !!supabase;

    if (isSupabaseConfigured) {
      try {
        console.log(`[admin-lookup] Querying Supabase database for admin: ${normalizedEmail}`);
        const { data, error } = await supabase
          .from('admins')
          .select('id,name,email,password_hash,role')
          .eq('email', normalizedEmail)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            console.log(`[admin-lookup] Admin not found in Supabase: ${normalizedEmail}`);
            return null;
          }
          console.warn(`[admin-lookup] Supabase query returned error, falling back to local storage:`, error.message);
          return await loadLocalAdmin();
        }

        console.log(`[admin-lookup] Admin record found in Supabase: ${normalizedEmail}`);
        return data || null;
      } catch (dbErr) {
        console.error(`[admin-lookup] Supabase connection exception for ${normalizedEmail}, falling back to local admins.json:`, dbErr.message);
        return await loadLocalAdmin();
      }
    }

    console.log('[admin-lookup] Supabase not configured, defaulting to local admins.json');
    return loadLocalAdmin();
  }

  router.post('/login', loginRateLimiter, async (req, res) => {
    const { email, password } = req.body || {};
    const validationError = validateLoginInputs(email, password);
    if (validationError) {
      console.warn(`[admin-login] Validation failed for login attempt:`, validationError);
      return res.status(400).json({ error: validationError });
    }

    const normalizedEmail = normalizeEmail(email);
    console.log(`[admin-login] Attempting login for email: ${normalizedEmail}`);
    
    let admin;
    try {
      admin = await findAdminByEmail(email);
    } catch (lookupErr) {
      console.error(`[admin-login] Critical exception during admin lookup for ${normalizedEmail}:`, lookupErr.message);
      return res.status(503).json({ error: 'Database/Authentication service is temporarily unavailable. Please try again.' });
    }

    if (!admin || !admin.password_hash) {
      console.warn(`[admin-login] Failed: Admin not found or missing password hash for: ${normalizedEmail}`);
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Compare password (do not log passwords)
    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, admin.password_hash);
    } catch (err) {
      console.error(`[admin-login] Failed: Bcrypt comparison exception for ${normalizedEmail}:`, err.message);
      return res.status(500).json({ error: 'Internal server error.' });
    }

    if (!isMatch) {
      console.warn(`[admin-login] Failed: Password mismatch for: ${normalizedEmail}`);
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    try {
      const token = signAdminToken(admin);
      console.log(`[admin-login] Success: Admin logged in successfully: ${normalizedEmail}`);
      return res.json({
        token,
        expiresIn: process.env.JWT_EXPIRES_IN || '2h',
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      });
    } catch (tokenErr) {
      console.error(`[admin-login] Failed: JWT signing exception for ${normalizedEmail}:`, tokenErr.message);
      return res.status(500).json({ error: 'Failed to generate session token.' });
    }
  });

  router.get('/verify', authenticateAdmin, (req, res) => {
    try {
      // Issue a fresh rolling token to implement session extension
      const freshToken = signAdminToken(req.admin);
      console.log(`[admin-auth] Token verify success: Extended session for ${req.admin.email}`);
      return res.json({ 
        admin: req.admin,
        token: freshToken
      });
    } catch (err) {
      console.error(`[admin-auth] Token verify succeeded but failed to generate rolling session:`, err.message);
      return res.json({ admin: req.admin });
    }
  });

  router.get('/profile', authenticateAdmin, (req, res) => {
    return res.json({ admin: req.admin });
  });

  return router;
}

module.exports = createAdminRouter;
