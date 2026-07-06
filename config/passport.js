// const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const FacebookStrategy = require('passport-facebook').Strategy;
// const User = require('../models/User');

// // Google Strategy
// passport.use(
//     new GoogleStrategy(
//         {
//             clientID: process.env.GOOGLE_CLIENT_ID,
//             clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//             callbackURL: '/api/auth/google/callback'
//         },
//         async (accessToken, refreshToken, profile, done) => {
//             try {
//                 // Check if user exists
//                 let user = await User.findOne({ googleId: profile.id });

//                 if (user) {
//                     return done(null, user);
//                 }

//                 // Create new user
//                 user = await User.create({
//                     googleId: profile.id,
//                     email: profile.emails[0].value,
//                     name: profile.displayName,
//                 });

//                 done(null, user);
//             } catch (error) {
//                 done(error, null);
//             }
//         }
//     )
// )

// // Passport Strategy
// passport.use(
//     new FacebookStrategy(
//         {
//             clientID: process.env.FACEBOOK_APP_ID,
//             clientSecret: process.env.FACEBOOK_APP_SECRET,
//             callbackURL: '/api/auth/facebook/callback',
//             profileFields: ['id', 'emails', 'name'] // Request email and name
//         },
//         async (accessToken, refreshToken, profile, done) => {
//             try {
//                 let user = await User.findOne({ facebookId: profile.id });

//                 if (user) {
//                     return done(null, user);
//                 }

//                 user = await User.create({
//                     facebookId: profile.id,
//                     email: profile.emails[0].value,
//                     name: `${profile.name.givenName} ${profile.name.familyName}`
//                 });

//                 done(null, user);
//             } catch (error) {
//                 done(error, null);
//             }
//         }
//     )
// )
// module.exports = passport;
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');

// Google Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback'
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                console.log('📱 Google Profile:', profile);

                // CHECK 1: Verify email exists
                if (!profile.emails || !profile.emails.length) {
                    return done(new Error('No email provided by Google'), null);
                }

                const email = profile.emails[0].value;
                const emailVerified = profile.emails[0].verified;

                // CHECK 2: Reject if NOT verified by Google
                if (!emailVerified) {
                    return done(new Error('Email not verified by Google. Please verify your email first.'), null);
                }

                // CHECK 3: Valid email format
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    return done(new Error('Invalid email format'), null);
                }

                // Email is verified - proceed
                let user = await User.findOne({ googleId: profile.id });

                if (user) {
                    user.isVerified = true;
                    await user.save();
                    return done(null, user);
                }

                // Check if user exists by email
                user = await User.findOne({ email: email });

                if (user) {
                    user.googleId = profile.id;
                    user.isVerified = true;
                    await user.save();
                    return done(null, user);
                }

                // Create new user with verified flag
                user = await User.create({
                    googleId: profile.id,
                    email: email,
                    name: profile.displayName,
                    isVerified: true,
                    role: null,
                    roleSelected: false
                });
                done(null, user);
            } catch (error) {
                done(error, null);
            }
        }
    )
);

// Facebook Strategy
passport.use(
    new FacebookStrategy(
        {
            clientID: process.env.FACEBOOK_APP_ID,
            clientSecret: process.env.FACEBOOK_APP_SECRET,
            callbackURL: process.env.FACEBOOK_CALLBACK_URL || '/api/auth/facebook/callback',
            profileFields: ['id', 'emails', 'name', 'displayName']
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                console.log('📱 Facebook Profile:', profile);

                // CHECK 1: Verify email exists
                if (!profile.emails || !profile.emails.length) {
                    console.error('❌ No email provided by Facebook');
                    return done(new Error('No email provided by Facebook. Please add a verified email to your Facebook account.'), null);
                }

                const email = profile.emails[0].value;

                console.log(`📧 Email: ${email}`);
                console.log(`✅ Email from Facebook (verified)`);

                // CHECK 2: Valid email format
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    console.error(`❌ Invalid email format: ${email}`);
                    return done(new Error('Invalid email format'), null);
                }

                // CHECK 3: Not empty
                if (!email || email.trim() === '') {
                    console.error('❌ Empty email');
                    return done(new Error('Invalid email provided'), null);
                }

                // Email is verified - proceed
                let user = await User.findOne({ facebookId: profile.id });

                if (user) {
                    user.isVerified = true;  // ← UPDATE flag
                    await user.save();
                    console.log('✅ Existing user logged in - verified');
                    return done(null, user);
                }

                // Check if user exists by email
                user = await User.findOne({ email: email });

                if (user) {
                    user.facebookId = profile.id;
                    user.isVerified = true;
                    await user.save();
                    return done(null, user);
                }

                // Create new user with verified flag
                user = await User.create({
                    facebookId: profile.id,
                    email: email,
                    name: profile.displayName || `${profile.name.givenName} ${profile.name.familyName}`,
                    isVerified: true,
                    role: null,
                    roleSelected: false 
                });

                done(null, user);
            } catch (error) {
                done(error, null);
            }
        }
    )
);

module.exports = passport;