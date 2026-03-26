<?php
session_start();

// If already logged in, redirect to dashboard
if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
    header('Location: dashboard.php');
    exit();
}

// Handle login submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $password = $_POST['password'] ?? '';
    
    // Simple password check (you can change this)
    $admin_password = 'admin123'; // Change this to your desired password
    
    if ($password === $admin_password) {
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['login_time'] = time();
        header('Location: dashboard.php');
        exit();
    } else {
        $error = 'Invalid password. Please try again.';
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login - Snehaspad Foundation</title>
    <link rel="stylesheet" href="../style.css">
    <style>
        .admin-login-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #1a2d5a 0%, #2d4a7c 100%);
            padding: 2rem;
        }
        
        .admin-login-card {
            background: white;
            border-radius: 20px;
            padding: 3rem;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 400px;
            width: 100%;
            text-align: center;
        }
        
        .admin-logo {
            width: 80px;
            height: 80px;
            margin: 0 auto 2rem;
            background: linear-gradient(135deg, #e8a020, #d4a017);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            color: white;
            font-weight: bold;
        }
        
        .admin-login-title {
            color: #1a2d5a;
            font-family: 'Playfair Display', serif;
            font-size: 2rem;
            margin-bottom: 0.5rem;
        }
        
        .admin-login-subtitle {
            color: #64748b;
            margin-bottom: 2rem;
            font-size: 0.95rem;
        }
        
        .login-form {
            text-align: left;
        }
        
        .form-group {
            margin-bottom: 1.5rem;
        }
        
        .form-group label {
            display: block;
            color: #1a2d5a;
            font-weight: 600;
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
        }
        
        .form-group input {
            width: 100%;
            padding: 0.8rem 1rem;
            border: 2px solid #e2e8f0;
            border-radius: 10px;
            font-size: 1rem;
            transition: all 0.3s ease;
            box-sizing: border-box;
        }
        
        .form-group input:focus {
            outline: none;
            border-color: #e8a020;
            box-shadow: 0 0 0 3px rgba(232, 160, 32, 0.1);
        }
        
        .login-btn {
            width: 100%;
            background: linear-gradient(135deg, #e8a020, #d4a017);
            color: white;
            border: none;
            padding: 1rem;
            border-radius: 10px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-top: 1rem;
        }
        
        .login-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(232, 160, 32, 0.3);
        }
        
        .error-message {
            background: #fee;
            color: #dc3545;
            padding: 1rem;
            border-radius: 10px;
            margin-bottom: 1.5rem;
            border-left: 4px solid #dc3545;
            font-size: 0.9rem;
        }
        
        .back-link {
            position: absolute;
            top: 2rem;
            left: 2rem;
            color: white;
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            opacity: 0.8;
            transition: opacity 0.3s ease;
        }
        
        .back-link:hover {
            opacity: 1;
        }
        
        .security-note {
            margin-top: 2rem;
            padding-top: 1.5rem;
            border-top: 1px solid #e2e8f0;
            font-size: 0.8rem;
            color: #94a3b8;
        }
        
        @media (max-width: 480px) {
            .admin-login-card {
                padding: 2rem;
            }
            
            .admin-login-title {
                font-size: 1.5rem;
            }
            
            .back-link {
                top: 1rem;
                left: 1rem;
            }
        }
    </style>
</head>
<body>
    <a href="../index.html" class="back-link">
        ← Back to Website
    </a>
    
    <div class="admin-login-container">
        <div class="admin-login-card">
            <div class="admin-logo">S</div>
            <h1 class="admin-login-title">Admin Login</h1>
            <p class="admin-login-subtitle">Snehaspad Foundation Admin Panel</p>
            
            <?php if (isset($error)): ?>
                <div class="error-message">
                    <?php echo htmlspecialchars($error); ?>
                </div>
            <?php endif; ?>
            
            <form method="POST" class="login-form">
                <div class="form-group">
                    <label for="password">Admin Password</label>
                    <input 
                        type="password" 
                        id="password" 
                        name="password" 
                        placeholder="Enter admin password"
                        required
                        autocomplete="current-password"
                    >
                </div>
                
                <button type="submit" class="login-btn">
                    Login to Dashboard
                </button>
            </form>
            
            <div class="security-note">
                🔒 Secure admin access. Unauthorized access is prohibited.
            </div>
        </div>
    </div>
</body>
</html>