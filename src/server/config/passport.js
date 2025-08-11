const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const OAuth2Strategy = require('passport-oauth2');
const { getContext } = require('../context');

// Ensure fetch is available (for Node.js < 18)
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

function setupPassport(passportInstance = passport) {
  console.log('🔧 Setting up passport strategies...');

  // Local strategy
  passportInstance.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const context = getContext();
        const mongoose = context.getMongoose();
        const User = context.getModel('User');

        // Check if mongoose is connected
        if (mongoose.connection.readyState !== 1) {
          console.error('❌ Database not connected. Cannot authenticate user.');
          return done(new Error('Database connection not available'));
        }

        const user = await User.findOne({ email: username });
        if (!user) {
          return done(null, false, { message: 'Incorrect username.' });
        }

        // Check if user has a password (not OAuth-only user)
        if (!user.password) {
          return done(null, false, {
            message: 'This account requires OAuth login.'
          });
        }

        // Use bcrypt directly since passport-local-mongoose authenticate has issues
        const bcrypt = require('bcrypt');
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          return done(null, false, { message: 'Incorrect password.' });
        }

        return done(null, user);
      } catch (error) {
        console.error('Local strategy error:', error);
        return done(error);
      }
    })
  );

  console.log('✅ Local strategy registered');

  // OAuth2 strategy
  try {
    if (process.env.OAUTH_CLIENT_ID && process.env.OAUTH_CLIENT_SECRET) {
      passportInstance.use(
        'oauth2',
        new OAuth2Strategy(
          {
            authorizationURL: process.env.OAUTH_AUTH_URL,
            tokenURL: process.env.OAUTH_TOKEN_URL,
            clientID: process.env.OAUTH_CLIENT_ID,
            clientSecret: process.env.OAUTH_CLIENT_SECRET,
            callbackURL: process.env.OAUTH_CALLBACK_URL
          },
          async (accessToken, refreshToken, profile, done) => {
            try {
              const context = getContext();
              const mongoose = context.getMongoose();
              const User = context.getModel('User');

              // Check if mongoose is connected
              if (mongoose.connection.readyState !== 1) {
                console.error('❌ Database not connected. Cannot authenticate user.');
                return done(new Error('Database connection not available'));
              }

              // Call the userinfo endpoint to get detailed user information
              const res = await fetch(process.env.OAUTH_USERINFO_URL, {
                headers: { Authorization: `Bearer ${accessToken}` }
              });

              if (!res.ok) {
                throw new Error(
                  `Failed to fetch user info: ${res.status} ${res.statusText}`
                );
              }

              const profileData = await res.json();
              const email = profileData.email;

              if (!email) {
                return done(new Error('Email not provided by OAuth provider'));
              }

              // Try to find existing user by email or OAuth ID
              let user = await User.findOne({
                $or: [{ email }, { oauthId: profileData.sub || profileData.id }]
              });

              if (!user) {
                // Create new user with OAuth data
                user = new User({
                  email,
                  name: profileData.name,
                  firstName: profileData.given_name || profileData.first_name,
                  lastName: profileData.family_name || profileData.last_name,
                  picture: profileData.picture || profileData.avatar_url,
                  oauthProvider: 'oauth2',
                  oauthId: profileData.sub || profileData.id,
                  metadata: profileData
                });
                await user.save();
                console.log('Created new user from OAuth:', user.email);
              } else {
                // Update existing user with latest OAuth data
                if (user.updateFromOAuthProfile) {
                  await user.updateFromOAuthProfile(profileData);
                }
                console.log('Updated existing user from OAuth:', user.email);
              }

              return done(null, user);
            } catch (err) {
              console.error('OAuth strategy error:', err);
              return done(err);
            }
          }
        )
      );
      console.log('✅ OAuth2 strategy registered');
    } else {
      console.log('⚠️ OAuth2 strategy not registered - missing environment variables');
    }
  } catch (error) {
    console.error('❌ Error registering OAuth2 strategy:', error);
  }

  passportInstance.serializeUser((user, done) => {
    console.log('🔍 Serializing user:', user.email, 'with ID:', user._id);
    done(null, user._id);
  });

  passportInstance.deserializeUser(async (id, done) => {
    try {
      const context = getContext();
      const mongoose = context.getMongoose();
      const User = context.getModel('User');

      // Check if mongoose is connected
      if (mongoose.connection.readyState !== 1) {
        console.error('❌ Database not connected. Cannot deserialize user.');
        return done(new Error('Database connection not available'));
      }
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      console.error('🔍 Deserialization error:', err);
      done(err);
    }
  });

  console.log('🔧 Passport setup completed');
}

module.exports = { setupPassport };
