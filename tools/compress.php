<?php
/**
 * Image Compression Script
 * Converts PNG/JPG to WebP and resizes to reduce file size.
 * Run once via: http://localhost/Git-Baru/ibaaaadd/compress.php
 * Delete this file after use.
 */

$quality  = 80;   // WebP quality (0–100)
$maxWidth = 1200; // Max width in px for project images
$maxWidthCert = 900; // Max width for certificate images

$dirs = [
    'Img/project'   => $maxWidth,
    'Img/sertifikat' => $maxWidthCert,
];

if (!function_exists('imagewebp')) {
    die('<b>Error:</b> GD WebP support not enabled. Enable <code>extension=gd</code> in php.ini and ensure GD was compiled with WebP.');
}

header('Content-Type: text/html; charset=utf-8');
echo '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Image Compressor</title>';
echo '<style>body{font-family:monospace;padding:20px;background:#111;color:#eee}';
echo '.ok{color:#4ade80}.skip{color:#94a3b8}.fail{color:#f87171}.info{color:#60a5fa}</style></head><body>';
echo '<h2>Image Compression — WebP Generator</h2><pre>';

$total = ['ok' => 0, 'skip' => 0, 'fail' => 0, 'saved' => 0];

foreach ($dirs as $dir => $mw) {
    $path = __DIR__ . '/' . $dir;
    if (!is_dir($path)) {
        echo "<span class='fail'>DIR NOT FOUND: $dir</span>\n";
        continue;
    }

    echo "\n<span class='info'>📁 $dir</span>\n";

    $files = glob($path . '/*.{png,jpg,jpeg,PNG,JPG,JPEG}', GLOB_BRACE);
    if (!$files) {
        echo "  (no images found)\n";
        continue;
    }

    foreach ($files as $file) {
        $webpPath = preg_replace('/\.(png|jpg|jpeg)$/i', '.webp', $file);
        $basename = basename($file);

        if (file_exists($webpPath)) {
            echo "  <span class='skip'>SKIP  $basename</span>\n";
            $total['skip']++;
            continue;
        }

        $info = @getimagesize($file);
        if (!$info) {
            echo "  <span class='fail'>FAIL  $basename (unreadable)</span>\n";
            $total['fail']++;
            continue;
        }

        [$origW, $origH, $type] = $info;

        if ($origW > $mw) {
            $newW = $mw;
            $newH = (int) round($origH * ($mw / $origW));
        } else {
            $newW = $origW;
            $newH = $origH;
        }

        $src = match ($type) {
            IMAGETYPE_JPEG => @imagecreatefromjpeg($file),
            IMAGETYPE_PNG  => @imagecreatefrompng($file),
            default        => false,
        };

        if (!$src) {
            echo "  <span class='fail'>FAIL  $basename (cannot decode)</span>\n";
            $total['fail']++;
            continue;
        }

        $dst = imagecreatetruecolor($newW, $newH);

        if ($type === IMAGETYPE_PNG) {
            imagealphablending($dst, false);
            imagesavealpha($dst, true);
            $transparent = imagecolorallocatealpha($dst, 255, 255, 255, 127);
            imagefilledrectangle($dst, 0, 0, $newW, $newH, $transparent);
        }

        imagecopyresampled($dst, $src, 0, 0, 0, 0, $newW, $newH, $origW, $origH);

        if (imagewebp($dst, $webpPath, $quality)) {
            $origKB  = round(filesize($file) / 1024);
            $newKB   = round(filesize($webpPath) / 1024);
            $saved   = $origKB - $newKB;
            $pct     = $origKB > 0 ? round($saved / $origKB * 100) : 0;
            $total['ok']++;
            $total['saved'] += $saved;
            echo "  <span class='ok'>OK    $basename → {$origKB}KB → {$newKB}KB (−{$pct}%)</span>\n";
        } else {
            echo "  <span class='fail'>FAIL  $basename (imagewebp failed)</span>\n";
            $total['fail']++;
        }

        imagedestroy($src);
        imagedestroy($dst);
    }
}

$savedMB = round($total['saved'] / 1024, 1);
echo "\n<span class='info'>─────────────────────────────────────────────────</span>\n";
echo "<span class='ok'>Done! ✓ {$total['ok']} converted  ⊘ {$total['skip']} skipped  ✗ {$total['fail']} failed</span>\n";
echo "<span class='info'>Total saved: ~{$total['saved']}KB ({$savedMB}MB)</span>\n";
echo "</pre></body></html>";
