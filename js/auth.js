/**
 * AyoSim Auth Engine (Supabase + Demo Fallback)
 *
 * Manages user authentication state, session persistence, and social OAuth.
 * Dispatches custom DOM events:
 * - 'ayosim:auth:change' ({ user, session, event, isDemo })
 * - 'ayosim:auth:error' ({ message, error })
 * - 'ayosim:auth:message' ({ message, type })
 */

(function () {
  'use strict';

  var client = null;
  var currentUser = null;
  var currentSession = null;
  var isDemo = true;
  var initialized = false;

  var DEMO_STORAGE_KEY = 'ayosim_demo_session';

  var AyoSimAuth = {
    /**
     * Initialize auth engine
     */
    init: async function () {
      if (initialized) return this;
      initialized = true;

      var config = window.AYOSIM_SUPABASE_CONFIG;
      var hasSupabaseSdk = typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function';

      if (hasSupabaseSdk && config && config.isConfigured()) {
        try {
          client = window.supabase.createClient(config.url, config.anonKey, {
            auth: {
              persistSession: true,
              autoRefreshToken: true,
              detectSessionInUrl: true
            }
          });

          isDemo = false;

          // Listen to live auth changes
          client.auth.onAuthStateChange(function (event, session) {
            currentSession = session;
            currentUser = session ? session.user : null;
            AyoSimAuth._dispatchAuthChange(event);
          });

          // Fetch initial session
          var res = await client.auth.getSession();
          if (res && res.data && res.data.session) {
            currentSession = res.data.session;
            currentUser = res.data.session.user;
          }
          AyoSimAuth._dispatchAuthChange('INITIAL_SESSION');
        } catch (err) {
          console.warn('[AyoSimAuth] Live Supabase initialization failed, falling back to Demo Mode:', err);
          this._initDemoMode();
        }
      } else {
        this._initDemoMode();
      }

      return this;
    },

    /**
     * Initialize Demo Auth Mode using localStorage
     */
    _initDemoMode: function () {
      isDemo = true;
      try {
        var raw = localStorage.getItem(DEMO_STORAGE_KEY);
        if (raw) {
          var parsed = JSON.parse(raw);
          if (parsed && parsed.user) {
            currentUser = parsed.user;
            currentSession = parsed;
          }
        }
      } catch (e) {
        console.error('[AyoSimAuth] Failed reading demo session from localStorage', e);
      }
      this._dispatchAuthChange('INITIAL_SESSION');
    },

    /**
     * Dispatch custom DOM auth change event
     */
    _dispatchAuthChange: function (eventName) {
      var evt = new CustomEvent('ayosim:auth:change', {
        detail: {
          user: currentUser,
          session: currentSession,
          event: eventName,
          isDemo: isDemo
        }
      });
      window.dispatchEvent(evt);
    },

    /**
     * Dispatch error message
     */
    _dispatchError: function (message, rawError) {
      var evt = new CustomEvent('ayosim:auth:error', {
        detail: {
          message: message,
          error: rawError
        }
      });
      window.dispatchEvent(evt);
    },

    /**
     * Dispatch informational message
     */
    _dispatchMessage: function (message, type) {
      var evt = new CustomEvent('ayosim:auth:message', {
        detail: {
          message: message,
          type: type || 'info'
        }
      });
      window.dispatchEvent(evt);
    },

    /**
     * Sign Up with Email & Password
     */
    signUp: async function (email, password, fullName) {
      if (!email || !password) {
        this._dispatchError('Please provide both email and password.');
        return { error: new Error('Missing fields') };
      }

      if (password.length < 6) {
        this._dispatchError('Password must be at least 6 characters.');
        return { error: new Error('Password too short') };
      }

      if (!isDemo && client) {
        try {
          var res = await client.auth.signUp({
            email: email,
            password: password,
            options: {
              data: {
                full_name: fullName || email.split('@')[0]
              }
            }
          });

          if (res.error) {
            this._dispatchError(res.error.message, res.error);
            return { error: res.error };
          }

          if (res.data.session) {
            currentUser = res.data.user;
            currentSession = res.data.session;
            this._dispatchAuthChange('SIGNED_IN');
          } else {
            this._dispatchMessage('Account created! Please check your email inbox to confirm your account.', 'success');
          }
          return { data: res.data };
        } catch (err) {
          this._dispatchError(err.message, err);
          return { error: err };
        }
      } else {
        // Demo Mode Sign Up
        var demoUser = {
          id: 'demo-' + Date.now(),
          email: email,
          user_metadata: {
            full_name: fullName || email.split('@')[0],
            avatar_url: null
          },
          created_at: new Date().toISOString()
        };
        var demoSession = {
          access_token: 'demo-token-' + Date.now(),
          user: demoUser
        };
        currentUser = demoUser;
        currentSession = demoSession;
        try {
          localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoSession));
        } catch (e) {}

        this._dispatchAuthChange('SIGNED_IN');
        this._dispatchMessage('Demo mode: Successfully created and signed in as ' + email, 'success');
        return { data: { user: demoUser, session: demoSession } };
      }
    },

    /**
     * Sign In with Email & Password
     */
    signInWithPassword: async function (email, password) {
      if (!email || !password) {
        this._dispatchError('Please provide both email and password.');
        return { error: new Error('Missing fields') };
      }

      if (!isDemo && client) {
        try {
          var res = await client.auth.signInWithPassword({
            email: email,
            password: password
          });

          if (res.error) {
            this._dispatchError(res.error.message, res.error);
            return { error: res.error };
          }

          currentUser = res.data.user;
          currentSession = res.data.session;
          this._dispatchAuthChange('SIGNED_IN');
          return { data: res.data };
        } catch (err) {
          this._dispatchError(err.message, err);
          return { error: err };
        }
      } else {
        // Demo Mode Sign In
        var demoUser = {
          id: 'demo-' + Date.now(),
          email: email,
          user_metadata: {
            full_name: email.split('@')[0],
            avatar_url: null
          },
          created_at: new Date().toISOString()
        };
        var demoSession = {
          access_token: 'demo-token-' + Date.now(),
          user: demoUser
        };
        currentUser = demoUser;
        currentSession = demoSession;
        try {
          localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoSession));
        } catch (e) {}

        this._dispatchAuthChange('SIGNED_IN');
        this._dispatchMessage('Demo mode: Successfully signed in as ' + email, 'success');
        return { data: { user: demoUser, session: demoSession } };
      }
    },

    /**
     * Sign In with Social OAuth (Google or GitHub)
     */
    signInWithOAuth: async function (provider) {
      if (!isDemo && client) {
        try {
          var res = await client.auth.signInWithOAuth({
            provider: provider,
            options: {
              redirectTo: window.location.origin
            }
          });
          if (res.error) {
            this._dispatchError(res.error.message, res.error);
            return { error: res.error };
          }
          return { data: res.data };
        } catch (err) {
          this._dispatchError(err.message, err);
          return { error: err };
        }
      } else {
        // Demo Mode OAuth Simulation
        var name = provider === 'google' ? 'Google Explorer' : 'GitHub Maker';
        var email = provider === 'google' ? 'explorer@gmail.com' : 'maker@github.com';
        var demoUser = {
          id: 'demo-' + provider + '-' + Date.now(),
          email: email,
          user_metadata: {
            full_name: name,
            avatar_url: null,
            provider: provider
          },
          created_at: new Date().toISOString()
        };
        var demoSession = {
          access_token: 'demo-oauth-token-' + Date.now(),
          user: demoUser
        };
        currentUser = demoUser;
        currentSession = demoSession;
        try {
          localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoSession));
        } catch (e) {}

        this._dispatchAuthChange('SIGNED_IN');
        this._dispatchMessage('Demo mode: Simulated ' + provider.toUpperCase() + ' OAuth sign-in', 'success');
        return { data: { user: demoUser, session: demoSession } };
      }
    },

    /**
     * Request Password Reset Email
     */
    resetPassword: async function (email) {
      if (!email) {
        this._dispatchError('Please enter your email address.');
        return { error: new Error('Missing email') };
      }

      if (!isDemo && client) {
        try {
          var res = await client.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin
          });
          if (res.error) {
            this._dispatchError(res.error.message, res.error);
            return { error: res.error };
          }
          this._dispatchMessage('Password reset link sent! Please check your email.', 'success');
          return { data: res.data };
        } catch (err) {
          this._dispatchError(err.message, err);
          return { error: err };
        }
      } else {
        this._dispatchMessage('Demo mode: Password reset email simulated for ' + email, 'success');
        return { data: true };
      }
    },

    /**
     * Sign Out
     */
    signOut: async function () {
      if (!isDemo && client) {
        try {
          await client.auth.signOut();
        } catch (err) {
          console.warn('[AyoSimAuth] Live sign out error:', err);
        }
      }

      currentUser = null;
      currentSession = null;
      try {
        localStorage.removeItem(DEMO_STORAGE_KEY);
      } catch (e) {}

      this._dispatchAuthChange('SIGNED_OUT');
      this._dispatchMessage('You have been signed out.', 'info');
      return { data: true };
    },

    /**
     * Getters
     */
    getCurrentUser: function () {
      return currentUser;
    },

    getSession: function () {
      return currentSession;
    },

    isDemoMode: function () {
      return isDemo;
    }
  };

  window.AyoSimAuth = AyoSimAuth;
})();
