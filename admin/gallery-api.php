<?php
// Gallery API - Returns list of images from gallery-images folder
header('Content-Type: application/json');

$galleryDir = '../gallery-images/';
$images = [];

// Check if directory exists
if (is_dir($galleryDir)) {
    // Get all image files from directory
    $files = scandir($galleryDir);
    
    foreach ($files as $file) {
        // Skip . and .. directories
        if ($file !== '.' && $file !== '..') {
            $filePath = $galleryDir . $file;
            
            // Check if it's a file and has valid image extension
            if (is_file($filePath)) {
                $extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));
                if (in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
                    // Get file info
                    $fileSize = filesize($filePath);
                    $fileModTime = filemtime($filePath);
                    
                    $images[] = [
                        'filename' => $file,
                        'path' => 'gallery-images/' . $file,
                        'size' => $fileSize,
                        'modified' => $fileModTime,
                        'size_formatted' => formatBytes($fileSize),
                        'date_formatted' => date('d M Y, H:i', $fileModTime)
                    ];
                }
            }
        }
    }
    
    // Sort images by modification time (newest first)
    usort($images, function($a, $b) {
        return $b['modified'] - $a['modified'];
    });
}

// Return JSON response
echo json_encode([
    'success' => true,
    'images' => $images,
    'total' => count($images)
]);

// Helper function to format bytes
function formatBytes($bytes, $precision = 2) {
    $units = ['B', 'KB', 'MB', 'GB'];
    
    for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
        $bytes /= 1024;
    }
    
    return round($bytes, $precision) . ' ' . $units[$i];
}
?>
