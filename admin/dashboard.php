<?php
session_start();

// Check if admin is logged in
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Location: login.php');
    exit();
}

// Handle photo upload
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['photos'])) {
    $upload_dir = '../gallery-images/';
    
    // Create directory if it doesn't exist
    if (!file_exists($upload_dir)) {
        mkdir($upload_dir, 0755, true);
    }
    
    $uploaded_files = [];
    $errors = [];
    
    foreach ($_FILES['photos']['tmp_name'] as $key => $tmp_name) {
        if ($_FILES['photos']['error'][$key] === UPLOAD_ERR_OK) {
            $file_name = $_FILES['photos']['name'][$key];
            $file_size = $_FILES['photos']['size'][$key];
            $file_tmp = $_FILES['photos']['tmp_name'][$key];
            $file_type = $_FILES['photos']['type'][$key];
            
            // Validate file type
            $allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            if (!in_array($file_type, $allowed_types)) {
                $errors[] = "File $file_name is not a valid image type.";
                continue;
            }
            
            // Validate file size (5MB max)
            if ($file_size > 5 * 1024 * 1024) {
                $errors[] = "File $file_name is too large. Max size is 5MB.";
                continue;
            }
            
            // Generate unique filename
            $file_extension = pathinfo($file_name, PATHINFO_EXTENSION);
            $unique_name = uniqid() . '_' . time() . '.' . $file_extension;
            $upload_path = $upload_dir . $unique_name;
            
            // Move file to upload directory
            if (move_uploaded_file($file_tmp, $upload_path)) {
                $uploaded_files[] = $unique_name;
            } else {
                $errors[] = "Failed to upload $file_name.";
            }
        }
    }
    
    if (!empty($uploaded_files)) {
        $success_message = "Successfully uploaded " . count($uploaded_files) . " photo(s).";
    }
    
    if (!empty($errors)) {
        $error_message = implode("<br>", $errors);
    }
}

// Handle photo deletion
if (isset($_GET['delete']) && !empty($_GET['delete'])) {
    $file_to_delete = '../gallery-images/' . basename($_GET['delete']);
    if (file_exists($file_to_delete) && is_file($file_to_delete)) {
        if (unlink($file_to_delete)) {
            $success_message = "Photo deleted successfully.";
        } else {
            $error_message = "Failed to delete photo.";
        }
    }
}

// Get all uploaded photos
$gallery_images = [];
$gallery_dir = '../gallery-images/';
if (file_exists($gallery_dir)) {
    $files = scandir($gallery_dir);
    foreach ($files as $file) {
        if ($file !== '.' && $file !== '..') {
            $file_path = $gallery_dir . $file;
            if (is_file($file_path)) {
                $file_info = [
                    'name' => $file,
                    'path' => $file_path,
                    'size' => filesize($file_path),
                    'date' => filemtime($file_path)
                ];
                $gallery_images[] = $file_info;
            }
        }
    }
    
    // Sort by date (newest first)
    usort($gallery_images, function($a, $b) {
        return $b['date'] - $a['date'];
    });
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - Snehaspad Foundation</title>
    <link rel="stylesheet" href="../style.css">
    <style>
        .dashboard-container {
            min-height: 100vh;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        }
        
        .dashboard-header {
            background: white;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            padding: 1rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .dashboard-title {
            color: #1a2d5a;
            font-family: 'Playfair Display', serif;
            font-size: 1.8rem;
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .admin-logo {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #e8a020, #d4a017);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
        }
        
        .header-actions {
            display: flex;
            gap: 1rem;
            align-items: center;
        }
        
        .btn-logout {
            background: #dc3545;
            color: white;
            text-decoration: none;
            padding: 0.5rem 1.5rem;
            border-radius: 8px;
            transition: all 0.3s ease;
            font-weight: 500;
        }
        
        .btn-logout:hover {
            background: #c82333;
            transform: translateY(-1px);
        }
        
        .btn-view-site {
            background: #1a2d5a;
            color: white;
            text-decoration: none;
            padding: 0.5rem 1.5rem;
            border-radius: 8px;
            transition: all 0.3s ease;
            font-weight: 500;
        }
        
        .btn-view-site:hover {
            background: #2d4a7c;
            transform: translateY(-1px);
        }
        
        .dashboard-content {
            padding: 2rem;
            max-width: 1400px;
            margin: 0 auto;
        }
        
        .dashboard-grid {
            display: grid;
            grid-template-columns: 1fr 2fr;
            gap: 2rem;
            margin-bottom: 2rem;
        }
        
        .upload-section, .stats-section {
            background: white;
            border-radius: 16px;
            padding: 2rem;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
        }
        
        .section-title {
            color: #1a2d5a;
            font-family: 'Playfair Display', serif;
            font-size: 1.5rem;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .upload-area {
            border: 2px dashed #cbd5e1;
            border-radius: 12px;
            padding: 3rem 2rem;
            text-align: center;
            transition: all 0.3s ease;
            cursor: pointer;
            background: #f8fafc;
        }
        
        .upload-area:hover {
            border-color: #e8a020;
            background: #fff8e1;
        }
        
        .upload-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
            opacity: 0.6;
        }
        
        .upload-text {
            color: #64748b;
            margin-bottom: 1rem;
        }
        
        .file-input {
            display: none;
        }
        
        .btn-upload {
            background: linear-gradient(135deg, #e8a020, #d4a017);
            color: white;
            border: none;
            padding: 0.8rem 2rem;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        
        .btn-upload:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(232, 160, 32, 0.3);
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
        }
        
        .stat-card {
            background: #f8fafc;
            padding: 1.5rem;
            border-radius: 12px;
            text-align: center;
            border-left: 4px solid #e8a020;
        }
        
        .stat-number {
            font-size: 2rem;
            font-weight: bold;
            color: #1a2d5a;
            margin-bottom: 0.5rem;
        }
        
        .stat-label {
            color: #64748b;
            font-size: 0.9rem;
        }
        
        .gallery-section {
            background: white;
            border-radius: 16px;
            padding: 2rem;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
        }
        
        .gallery-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 1.5rem;
            margin-top: 1.5rem;
        }
        
        .gallery-item {
            position: relative;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
        }
        
        .gallery-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }
        
        .gallery-item img {
            width: 100%;
            height: 150px;
            object-fit: cover;
        }
        
        .gallery-item-info {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(26, 45, 90, 0.9);
            color: white;
            padding: 0.5rem;
            font-size: 0.8rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .delete-btn {
            background: #dc3545;
            color: white;
            border: none;
            padding: 0.3rem 0.6rem;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.7rem;
            transition: all 0.3s ease;
        }
        
        .delete-btn:hover {
            background: #c82333;
        }
        
        .empty-gallery {
            text-align: center;
            padding: 3rem;
            color: #94a3b8;
        }
        
        .empty-gallery-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
            opacity: 0.5;
        }
        
        .alert {
            padding: 1rem 1.5rem;
            border-radius: 8px;
            margin-bottom: 1.5rem;
        }
        
        .alert-success {
            background: #d4edda;
            color: #155724;
            border-left: 4px solid #28a745;
        }
        
        .alert-error {
            background: #f8d7da;
            color: #721c24;
            border-left: 4px solid #dc3545;
        }
        
        @media (max-width: 768px) {
            .dashboard-grid {
                grid-template-columns: 1fr;
            }
            
            .stats-grid {
                grid-template-columns: 1fr;
            }
            
            .gallery-grid {
                grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            }
            
            .dashboard-header {
                padding: 1rem;
                flex-direction: column;
                gap: 1rem;
            }
            
            .dashboard-content {
                padding: 1rem;
            }
        }
    </style>
</head>
<body>
    <div class="dashboard-container">
        <header class="dashboard-header">
            <div class="dashboard-title">
                <div class="admin-logo">S</div>
                Admin Dashboard
            </div>
            <div class="header-actions">
                <a href="../index.html" class="btn-view-site">View Website</a>
                <a href="logout.php" class="btn-logout">Logout</a>
            </div>
        </header>
        
        <div class="dashboard-content">
            <?php if (isset($success_message)): ?>
                <div class="alert alert-success">
                    ✓ <?php echo htmlspecialchars($success_message); ?>
                </div>
            <?php endif; ?>
            
            <?php if (isset($error_message)): ?>
                <div class="alert alert-error">
                    ✗ <?php echo $error_message; ?>
                </div>
            <?php endif; ?>
            
            <div class="dashboard-grid">
                <div class="upload-section">
                    <h2 class="section-title">📤 Upload Photos</h2>
                    <form method="POST" enctype="multipart/form-data">
                        <div class="upload-area" onclick="document.getElementById('photos').click()">
                            <div class="upload-icon">📸</div>
                            <p class="upload-text">Click to select photos or drag and drop</p>
                            <p style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 1rem;">
                                Supported formats: JPG, PNG, GIF (Max 5MB per file)
                            </p>
                            <input type="file" id="photos" name="photos[]" multiple accept="image/*" class="file-input">
                            <button type="button" class="btn-upload" onclick="event.stopPropagation(); document.getElementById('photos').click()">
                                Choose Photos
                            </button>
                        </div>
                        <button type="submit" class="btn-upload" style="width: 100%; margin-top: 1rem;">
                            Upload Selected Photos
                        </button>
                    </form>
                </div>
                
                <div class="stats-section">
                    <h2 class="section-title">📊 Gallery Statistics</h2>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-number"><?php echo count($gallery_images); ?></div>
                            <div class="stat-label">Total Photos</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">
                                <?php 
                                $total_size = array_sum(array_column($gallery_images, 'size'));
                                echo round($total_size / 1024 / 1024, 2) . ' MB';
                                ?>
                            </div>
                            <div class="stat-label">Total Size</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">
                                <?php 
                                $recent_count = count(array_filter($gallery_images, function($img) {
                                    return $img['date'] > (time() - 7*24*60*60); // Last 7 days
                                }));
                                echo $recent_count;
                                ?>
                            </div>
                            <div class="stat-label">This Week</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">
                                <?php 
                                if (!empty($gallery_images)) {
                                    $oldest = min(array_column($gallery_images, 'date'));
                                    echo date('M j', $oldest);
                                } else {
                                    echo 'None';
                                }
                                ?>
                            </div>
                            <div class="stat-label">Oldest Upload</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="gallery-section">
                <h2 class="section-title">🖼️ Gallery Management</h2>
                
                <?php if (empty($gallery_images)): ?>
                    <div class="empty-gallery">
                        <div class="empty-gallery-icon">📷</div>
                        <h3>No photos uploaded yet</h3>
                        <p>Upload some photos to get started!</p>
                    </div>
                <?php else: ?>
                    <div class="gallery-grid">
                        <?php foreach ($gallery_images as $image): ?>
                            <div class="gallery-item">
                                <img src="<?php echo '../gallery-images/' . htmlspecialchars($image['name']); ?>" alt="Gallery Photo">
                                <div class="gallery-item-info">
                                    <span>
                                        <?php 
                                        $size_kb = round($image['size'] / 1024);
                                        echo $size_kb . ' KB';
                                        ?>
                                    </span>
                                    <a href="?delete=<?php echo htmlspecialchars($image['name']); ?>" 
                                       class="delete-btn" 
                                       onclick="return confirm('Are you sure you want to delete this photo?')">
                                        Delete
                                    </a>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
    
    <script>
        // Handle drag and drop
        const uploadArea = document.querySelector('.upload-area');
        const fileInput = document.getElementById('photos');
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, preventDefaults, false);
        });
        
        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, highlight, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, unhighlight, false);
        });
        
        function highlight(e) {
            uploadArea.style.borderColor = '#e8a020';
            uploadArea.style.background = '#fff8e1';
        }
        
        function unhighlight(e) {
            uploadArea.style.borderColor = '#cbd5e1';
            uploadArea.style.background = '#f8fafc';
        }
        
        uploadArea.addEventListener('drop', handleDrop, false);
        
        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            
            fileInput.files = files;
            
            // Update upload area text
            const uploadText = document.querySelector('.upload-text');
            if (files.length > 0) {
                uploadText.textContent = `${files.length} file(s) selected`;
            }
        }
        
        // Update upload area when files are selected
        fileInput.addEventListener('change', function() {
            const uploadText = document.querySelector('.upload-text');
            if (this.files.length > 0) {
                uploadText.textContent = `${this.files.length} file(s) selected`;
            } else {
                uploadText.textContent = 'Click to select photos or drag and drop';
            }
        });
    </script>
</body>
</html>
