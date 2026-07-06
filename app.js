// const express = require('express');
// const passport = require('./config/passport');
// const authRoutes = require('./routes/authRoutes');

// const app = express();

// // Body parser middleware
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));

// // Passport middleware
// app.use(passport.initialize());

// // Routes
// app.use('/api/auth', authRoutes);

// // Test route
// app.get('/', (req, res) => {
//   res.send(`
//     <h1>OAuth Authentication API</h1>
//     <a href="/api/auth/google">Login with Google</a><br>
//     <a href="/api/auth/facebook">Login with Facebook</a>
//   `);
// });

// module.exports = app;



const express = require('express');
const passport = require('./config/passport');
const authRoutes = require('./routes/authRoutes');
const cors = require('cors');
const app = express();

app.use(cors());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);


// Home route
app.get('/login', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>OAuth Authentication</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .container {
          text-align: center;
          background: white;
          padding: 50px;
          border-radius: 10px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }
        h1 { color: #333; margin-bottom: 30px; }
        .btn {
          display: inline-block;
          padding: 15px 40px;
          margin: 10px;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          font-size: 18px;
          transition: all 0.3s;
        }
        .google { background: #4285f4; }
        .google:hover { background: #357ae8; }
        .facebook { background: #1877f2; }
        .facebook:hover { background: #145dbf; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🔐 Welcome!</h1>
        <p style="color: #666; margin-bottom: 30px;">Sign in to continue</p>
        <a href="/api/auth/google" class="btn google">
          🔍 Login with Google
        </a>
        <br>
        <a href="/api/auth/facebook" class="btn facebook">
          📱 Login with Facebook
        </a>
      </div>
    </body>
    </html>
  `);
});

// Role selection page
app.get('/select-role', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Select Your Role</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .container {
          text-align: center;
          background: white;
          padding: 50px;
          border-radius: 10px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          max-width: 500px;
        }
        h1 { color: #333; margin-bottom: 10px; }
        .required {
          color: #e74c3c;
          font-weight: bold;
          font-size: 14px;
          margin-bottom: 20px;
        }
        p { color: #666; margin-bottom: 40px; }
        .role-btn {
          display: block;
          width: 100%;
          padding: 20px;
          margin: 15px 0;
          border: 2px solid #e0e0e0;
          background: white;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s;
          text-align: left;
        }
        .role-btn:hover {
          border-color: #667eea;
          background: #f8f9ff;
          transform: translateY(-2px);
        }
        .role-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .role-btn h3 {
          margin: 0 0 10px 0;
          color: #333;
        }
        .role-btn p {
          margin: 0;
          color: #999;
          font-size: 14px;
        }
        .role-icon {
          font-size: 40px;
          margin-bottom: 10px;
        }
        #message {
          margin-top: 20px;
          padding: 15px;
          border-radius: 5px;
          display: none;
        }
        .success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }
        .error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>⚠️ One More Step!</h1>
        <div class="required">* REQUIRED</div>
        <p>Choose your account type to continue</p>

        <button class="role-btn" onclick="selectRole('freelancer')" id="btn-freelancer">
          <div class="role-icon">💼</div>
          <h3>Freelancer</h3>
          <p>I want to offer my services and find work</p>
        </button>

        <button class="role-btn" onclick="selectRole('client')" id="btn-client">
          <div class="role-icon">👤</div>
          <h3>Client</h3>
          <p>I want to hire freelancers for my projects</p>
        </button>

        <button class="role-btn" onclick="selectRole('agency')" id="btn-agency">
          <div class="role-icon">🏢</div>
          <h3>Agency</h3>
          <p>I represent an agency looking for talent</p>
        </button>

        <div id="message"></div>
      </div>

      <script>
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        if (!token) {
          alert('Please login first');
          window.location.href = '/';
        }

        function disableButtons() {
          document.getElementById('btn-freelancer').disabled = true;
          document.getElementById('btn-client').disabled = true;
          document.getElementById('btn-agency').disabled = true;
        }

        async function selectRole(role) {
          const messageDiv = document.getElementById('message');
          disableButtons();
          
          try {
            const response = await fetch('/api/auth/select-role', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
              },
              body: JSON.stringify({ role: role })
            });

            const data = await response.json();

            if (data.success) {
              messageDiv.className = 'success';
              messageDiv.textContent = '✅ ' + data.message;
              messageDiv.style.display = 'block';

              setTimeout(() => {
                window.location.href = '/dashboard?token=' + token;
              }, 1500);
            } else {
              messageDiv.className = 'error';
              messageDiv.textContent = '❌ ' + data.message;
              messageDiv.style.display = 'block';
            }
          } catch (error) {
            messageDiv.className = 'error';
            messageDiv.textContent = '❌ Error. Please try again.';
            messageDiv.style.display = 'block';
          }
        }
      </script>
    </body>
    </html>
  `);
});

// Dashboard
app.get('/dashboard', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Dashboard</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .container {
          text-align: center;
          background: white;
          padding: 50px;
          border-radius: 10px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          max-width: 600px;
        }
        h1 { color: #333; }
        #user-info {
          margin-top: 20px;
          padding: 30px;
          background: #f8f9ff;
          border-radius: 10px;
          text-align: left;
        }
        .info-row {
          padding: 10px 0;
          border-bottom: 1px solid #e0e0e0;
        }
        .label { font-weight: bold; color: #667eea; }
        .value { color: #333; margin-left: 10px; }
        .role-badge {
          display: inline-block;
          padding: 5px 15px;
          background: #667eea;
          color: white;
          border-radius: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🎉 Dashboard</h1>
        <div id="user-info">Loading...</div>
      </div>

      <script>
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        if (!token) {
          alert('Please login first');
          window.location.href = '/';
        }

        fetch('/api/auth/me', {
          headers: { 'Authorization': 'Bearer ' + token }
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            document.getElementById('user-info').innerHTML = \`
              <h2>Welcome, \${data.user.name}!</h2>
              <div class="info-row">
                <span class="label">Email:</span>
                <span class="value">\${data.user.email}</span>
              </div>
              <div class="info-row">
                <span class="label">Role:</span>
                <span class="role-badge">\${data.user.role.toUpperCase()}</span>
              </div>
              <div class="info-row">
                <span class="label">Verified:</span>
                <span class="value">\${data.user.isVerified ? '✅' : '❌'}</span>
              </div>
            \`;
          } else if (data.needsRoleSelection) {
            window.location.href = '/select-role?token=' + token;
          }
        });
      </script>
    </body>
    </html>
  `);
});

module.exports = app;