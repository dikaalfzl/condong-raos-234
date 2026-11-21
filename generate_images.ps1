Add-Type -AssemblyName System.Drawing

$imgDir = Join-Path $pwd "generated_images"
if (-not (Test-Path $imgDir)) {
    New-Item -ItemType Directory -Path $imgDir -Force | Out-Null
}

function New-Font([string]$name, [float]$size, [System.Drawing.FontStyle]$style = [System.Drawing.FontStyle]::Regular) {
    return New-Object System.Drawing.Font($name, $size, $style)
}

function Set-GraphicsQuality($g) {
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
}

# ==========================================
# GAMBAR 1: TAMPILAN AWAL HALAMAN LOGIN
# ==========================================
Write-Host "Rendering Gambar 1..."
$bmp1 = New-Object System.Drawing.Bitmap 1200, 750
$g1 = [System.Drawing.Graphics]::FromImage($bmp1)
Set-GraphicsQuality $g1

# Background
$g1.Clear([System.Drawing.Color]::FromArgb(240, 242, 245))

# Browser Header
$brushBrowserHeader = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(230, 233, 238))
$g1.FillRectangle($brushBrowserHeader, 0, 0, 1200, 50)
# Browser Dots
$g1.FillEllipse((New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 95, 86))), 20, 18, 14, 14)
$g1.FillEllipse((New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 189, 46))), 42, 18, 14, 14)
$g1.FillEllipse((New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(39, 201, 63))), 64, 18, 14, 14)
# Address Bar
$brushAddr = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
$g1.FillRectangle($brushAddr, 120, 10, 800, 30)
$fontAddr = New-Font "Segoe UI" 10
$g1.DrawString("🔒 http://localhost:5173/ (Aplikasi Web Condong Raos 234 - Form Login)", $fontAddr, [System.Drawing.Brushes]::DimGray, 130, 15)

# Back to Home Button
$fontBack = New-Font "Segoe UI" 10.5 ([System.Drawing.FontStyle]::Bold)
$g1.DrawString("← Kembali ke Beranda", $fontBack, [System.Drawing.Brushes]::Black, 80, 80)

# Modal Card Container (Width 1040, Height 560, X=80, Y=120)
$cardX = 80; $cardY = 120; $cardW = 1040; $cardH = 560
$brushCardBg = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
$g1.FillRectangle($brushCardBg, $cardX, $cardY, $cardW, $cardH)
$penCard = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(220, 224, 230)), 2
$g1.DrawRectangle($penCard, $cardX, $cardY, $cardW, $cardH)

# Left Panel (Brand side - X=80, Y=120, W=460, H=560)
$brushBrandSide = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(154, 16, 6)) # Maroon
$g1.FillRectangle($brushBrandSide, $cardX, $cardY, 460, $cardH)

# Brand Content
$brushPill = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 235, 235))
$g1.FillRectangle($brushPill, $cardX + 40, $cardY + 50, 220, 32)
$fontPill = New-Font "Segoe UI" 10 ([System.Drawing.FontStyle]::Bold)
$brushMaroonText = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(154, 16, 6))
$g1.DrawString("🍜 CONDONG RAOS 234", $fontPill, $brushMaroonText, $cardX + 50, $cardY + 56)

$fontTitleBrand = New-Font "Segoe UI" 20 ([System.Drawing.FontStyle]::Bold)
$g1.DrawString("Selamat Datang`nKembali!", $fontTitleBrand, [System.Drawing.Brushes]::White, $cardX + 40, $cardY + 110)

$fontDescBrand = New-Font "Segoe UI" 11
$strDesc = "Masuk ke akun Anda untuk menulis ulasan kuliner, berbagi foto momen bersantap, serta menikmati promo bakso dan mie ayam lezat kami."
$rectDesc = New-Object System.Drawing.RectangleF ($cardX + 40), ($cardY + 200), 380, 100
$g1.DrawString($strDesc, $fontDescBrand, [System.Drawing.Brushes]::WhiteSmoke, $rectDesc)

# Left side decorative badge
$brushImgBox = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(180, 30, 20))
$g1.FillRectangle($brushImgBox, $cardX + 40, $cardY + 320, 380, 180)
$fontDish = New-Font "Segoe UI" 14 ([System.Drawing.FontStyle]::Bold)
$g1.DrawString("🍲 Bakso Komplit & Mie Ayam", $fontDish, [System.Drawing.Brushes]::White, $cardX + 60, $cardY + 380)
$fontSubDish = New-Font "Segoe UI" 10
$g1.DrawString("Cita rasa legendaris asli Majalengka sejak 1995", $fontSubDish, [System.Drawing.Brushes]::Gold, $cardX + 60, $cardY + 415)

# Right Panel (Form Side - X=540, Y=120, W=580)
$formX = $cardX + 500
$fontFormTitle = New-Font "Segoe UI" 18 ([System.Drawing.FontStyle]::Bold)
$g1.DrawString("Halaman Masuk Akun", $fontFormTitle, [System.Drawing.Brushes]::Black, $formX, $cardY + 50)
$fontFormSub = New-Font "Segoe UI" 10.5
$g1.DrawString("Masukkan alamat email kedinasan/pribadi dan kata sandi Anda.", $fontFormSub, [System.Drawing.Brushes]::DimGray, $formX, $cardY + 90)

# Email Label & Input
$fontLabel = New-Font "Segoe UI" 11 ([System.Drawing.FontStyle]::Bold)
$g1.DrawString("Alamat Email *", $fontLabel, [System.Drawing.Brushes]::Black, $formX, $cardY + 140)
$penInput = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(200, 205, 215)), 1.5
$g1.DrawRectangle($penInput, $formX, $cardY + 170, 480, 45)
$fontInput = New-Font "Segoe UI" 11
$g1.DrawString("✉️  admin@condongraos.com", $fontInput, [System.Drawing.Brushes]::Black, $formX + 15, $cardY + 180)

# Password Label & Input
$g1.DrawString("Kata Sandi *", $fontLabel, [System.Drawing.Brushes]::Black, $formX, $cardY + 235)
$g1.DrawRectangle($penInput, $formX, $cardY + 265, 480, 45)
$g1.DrawString("🔒  ••••••••••••••", $fontInput, [System.Drawing.Brushes]::Black, $formX + 15, $cardY + 275)
$g1.DrawString("👁️", $fontInput, [System.Drawing.Brushes]::DimGray, $formX + 440, $cardY + 275)

# Submit Button
$brushBtn = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(154, 16, 6))
$g1.FillRectangle($brushBtn, $formX, $cardY + 340, 480, 48)
$fontBtn = New-Font "Segoe UI" 12 ([System.Drawing.FontStyle]::Bold)
$sfCenter = New-Object System.Drawing.StringFormat
$sfCenter.Alignment = [System.Drawing.StringAlignment]::Center
$g1.DrawString("Masuk ke Akun Sekarang →", $fontBtn, [System.Drawing.Brushes]::White, ($formX + 240), ($cardY + 352), $sfCenter)

# Switch Link
$fontSwitch = New-Font "Segoe UI" 10
$g1.DrawString("Belum punya akun pelanggan? ", $fontSwitch, [System.Drawing.Brushes]::DimGray, $formX + 70, $cardY + 420)
$fontSwitchLink = New-Font "Segoe UI" 10 ([System.Drawing.FontStyle]::Bold)
$g1.DrawString("Daftar Akun Dulu di Sini", $fontSwitchLink, $brushMaroonText, $formX + 260, $cardY + 420)

$bmp1.Save((Join-Path $imgDir "gambar1_login_awal.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$g1.Dispose(); $bmp1.Dispose()


# ==========================================
# GAMBAR 2: BUKTI LOGIN BERHASIL (ADMIN/PELANGGAN)
# ==========================================
Write-Host "Rendering Gambar 2..."
$bmp2 = New-Object System.Drawing.Bitmap 1200, 750
$g2 = [System.Drawing.Graphics]::FromImage($bmp2)
Set-GraphicsQuality $g2
$g2.Clear([System.Drawing.Color]::FromArgb(248, 249, 250))

# Browser Header
$g2.FillRectangle($brushBrowserHeader, 0, 0, 1200, 50)
$g2.FillEllipse((New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 95, 86))), 20, 18, 14, 14)
$g2.FillEllipse((New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 189, 46))), 42, 18, 14, 14)
$g2.FillEllipse((New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(39, 201, 63))), 64, 18, 14, 14)
$g2.FillRectangle($brushAddr, 120, 10, 800, 30)
$g2.DrawString("🔒 http://localhost:5173/ (Sesi Autentikasi Pengguna Aktif)", $fontAddr, [System.Drawing.Brushes]::DimGray, 130, 15)

# Navbar Condong Raos
$brushNav = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
$g2.FillRectangle($brushNav, 0, 50, 1200, 75)
$penBorder = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(230, 230, 230)), 1
$g2.DrawLine($penBorder, 0, 125, 1200, 125)

# Navbar Brand
$fontNavBrand = New-Font "Segoe UI" 16 ([System.Drawing.FontStyle]::Bold)
$g2.DrawString("🍜 CONDONG RAOS 234", $fontNavBrand, $brushMaroonText, 60, 72)

# Nav Links
$fontNavLink = New-Font "Segoe UI" 10.5
$g2.DrawString("Beranda", $fontNavLink, [System.Drawing.Brushes]::Black, 420, 78)
$g2.DrawString("Menu Pilihan", $fontNavLink, [System.Drawing.Brushes]::DimGray, 510, 78)
$g2.DrawString("Ulasan", $fontNavLink, [System.Drawing.Brushes]::DimGray, 630, 78)
$g2.DrawString("Lokasi & Kontak", $fontNavLink, [System.Drawing.Brushes]::DimGray, 710, 78)

# Admin Dashboard Button (Active)
$brushAdminBadge = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(154, 16, 6))
$g2.FillRectangle($brushAdminBadge, 860, 68, 140, 38)
$fontAdminBtn = New-Font "Segoe UI" 9.5 ([System.Drawing.FontStyle]::Bold)
$g2.DrawString("⚙️ Dashboard", $fontAdminBtn, [System.Drawing.Brushes]::White, 885, 78)

# User Profile Avatar
$g2.FillEllipse((New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(220, 235, 255))), 1020, 66, 42, 42)
$fontUserIcon = New-Font "Segoe UI" 12 ([System.Drawing.FontStyle]::Bold)
$g2.DrawString("DA", $fontUserIcon, [System.Drawing.Brushes]::DarkBlue, 1028, 76)
$fontUserName = New-Font "Segoe UI" 9.5 ([System.Drawing.FontStyle]::Bold)
$g2.DrawString("Dika (Admin)", $fontUserName, [System.Drawing.Brushes]::Black, 1070, 78)

# Floating Toast Notification (Bukti Sukses)
$toastX = 720; $toastY = 145; $toastW = 440; $toastH = 65
$brushToast = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(232, 245, 233))
$penToast = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(46, 125, 50)), 2
$g2.FillRectangle($brushToast, $toastX, $toastY, $toastW, $toastH)
$g2.DrawRectangle($penToast, $toastX, $toastY, $toastW, $toastH)

$g2.FillEllipse((New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(46, 125, 50))), $toastX + 20, $toastY + 16, 32, 32)
$fontCheck = New-Font "Segoe UI" 14 ([System.Drawing.FontStyle]::Bold)
$g2.DrawString("✓", $fontCheck, [System.Drawing.Brushes]::White, $toastX + 28, $toastY + 18)

$fontToastTitle = New-Font "Segoe UI" 11 ([System.Drawing.FontStyle]::Bold)
$brushToastText = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(27, 94, 32))
$g2.DrawString("Selamat datang kembali di Condong Raos 234!", $fontToastTitle, $brushToastText, $toastX + 65, $toastY + 14)
$fontToastSub = New-Font "Segoe UI" 9.5
$g2.DrawString("Sesi login Anda berhasil diverifikasi. Peran: Administrator", $fontToastSub, [System.Drawing.Brushes]::DimGray, $toastX + 65, $toastY + 36)

# Main Dashboard Content Preview
$fontDashTitle = New-Font "Segoe UI" 20 ([System.Drawing.FontStyle]::Bold)
$g2.DrawString("Panel Kontrol Pengelola Condong Raos 234", $fontDashTitle, [System.Drawing.Brushes]::Black, 60, 220)

# 3 Stat Cards
$card1X = 60; $card2X = 430; $card3X = 800
# Card 1
$g2.FillRectangle([System.Drawing.Brushes]::White, $card1X, 280, 340, 160)
$g2.DrawRectangle($penBorder, $card1X, 280, 340, 160)
$g2.DrawString("🍲 TOTAL MENU AKTIF", $fontAdminBtn, [System.Drawing.Brushes]::DimGray, $card1X + 25, 305)
$fontStatNum = New-Font "Segoe UI" 26 ([System.Drawing.FontStyle]::Bold)
$g2.DrawString("24 Menu", $fontStatNum, [System.Drawing.Brushes]::Black, $card1X + 25, 335)
$g2.DrawString("Bakso, Mie Ayam, Minuman Segar", $fontNavLink, [System.Drawing.Brushes]::DarkGreen, $card1X + 25, 395)

# Card 2
$g2.FillRectangle([System.Drawing.Brushes]::White, $card2X, 280, 340, 160)
$g2.DrawRectangle($penBorder, $card2X, 280, 340, 160)
$g2.DrawString("⭐ ULASAN PELANGGAN", $fontAdminBtn, [System.Drawing.Brushes]::DimGray, $card2X + 25, 305)
$g2.DrawString("142 Ulasan", $fontStatNum, [System.Drawing.Brushes]::Black, $card2X + 25, 335)
$g2.DrawString("Rating Rata-rata: 4.9 / 5.0", $fontNavLink, [System.Drawing.Brushes]::DarkOrange, $card2X + 25, 395)

# Card 3
$g2.FillRectangle([System.Drawing.Brushes]::White, $card3X, 280, 340, 160)
$g2.DrawRectangle($penBorder, $card3X, 280, 340, 160)
$g2.DrawString("🟢 STATUS OPERASIONAL", $fontAdminBtn, [System.Drawing.Brushes]::DimGray, $card3X + 25, 305)
$g2.DrawString("TOKO BUKA", $fontStatNum, [System.Drawing.Brushes]::DarkGreen, $card3X + 25, 335)
$g2.DrawString("Melayani Pesanan & Makan di Tempat", $fontNavLink, [System.Drawing.Brushes]::DimGray, $card3X + 25, 395)

# Table preview
$g2.FillRectangle([System.Drawing.Brushes]::White, 60, 480, 1080, 200)
$g2.DrawRectangle($penBorder, 60, 480, 1080, 200)
$g2.DrawString("Manajemen Data Terakhir (Akses Terbuka Karena Hak Admin)", $fontLabel, [System.Drawing.Brushes]::Black, 85, 505)
$g2.DrawString("1. Mie Ayam Bakso Urat Jumbo (Harga: Rp 22.000) - Status: Tersedia", $fontNavLink, [System.Drawing.Brushes]::Black, 85, 545)
$g2.DrawString("2. Es Teh Manis Segar Jumbo (Harga: Rp 5.000) - Status: Tersedia", $fontNavLink, [System.Drawing.Brushes]::Black, 85, 575)
$g2.DrawString("3. Ulasan Baru dari Pelanggan: 'Baksonya kenyal, kuahnya gurih mantap!' - Status: Tampil", $fontNavLink, [System.Drawing.Brushes]::DimGray, 85, 605)

$bmp2.Save((Join-Path $imgDir "gambar2_login_berhasil.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$g2.Dispose(); $bmp2.Dispose()


# ==========================================
# GAMBAR 3: BUKTI LOGIN GAGAL (BANNER ERROR)
# ==========================================
Write-Host "Rendering Gambar 3..."
$bmp3 = New-Object System.Drawing.Bitmap 1200, 750
$g3 = [System.Drawing.Graphics]::FromImage($bmp3)
Set-GraphicsQuality $g3
$g3.Clear([System.Drawing.Color]::FromArgb(240, 242, 245))

# Browser Header
$g3.FillRectangle($brushBrowserHeader, 0, 0, 1200, 50)
$g3.FillEllipse((New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 95, 86))), 20, 18, 14, 14)
$g3.FillEllipse((New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 189, 46))), 42, 18, 14, 14)
$g3.FillEllipse((New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(39, 201, 63))), 64, 18, 14, 14)
$g3.FillRectangle($brushAddr, 120, 10, 800, 30)
$g3.DrawString("🔒 http://localhost:5173/ (Percobaan Login Gagal - Kredensial Salah)", $fontAddr, [System.Drawing.Brushes]::DimGray, 130, 15)

# Modal Card
$g3.FillRectangle($brushCardBg, $cardX, $cardY, $cardW, $cardH)
$g3.DrawRectangle($penCard, $cardX, $cardY, $cardW, $cardH)

# Left Side
$g3.FillRectangle($brushBrandSide, $cardX, $cardY, 460, $cardH)
$g3.FillRectangle($brushPill, $cardX + 40, $cardY + 50, 220, 32)
$g3.DrawString("🍜 CONDONG RAOS 234", $fontPill, $brushMaroonText, $cardX + 50, $cardY + 56)
$g3.DrawString("Selamat Datang`nKembali!", $fontTitleBrand, [System.Drawing.Brushes]::White, $cardX + 40, $cardY + 110)
$g3.DrawString($strDesc, $fontDescBrand, [System.Drawing.Brushes]::WhiteSmoke, $rectDesc)
$g3.FillRectangle($brushImgBox, $cardX + 40, $cardY + 320, 380, 180)
$g3.DrawString("🍲 Bakso Komplit & Mie Ayam", $fontDish, [System.Drawing.Brushes]::White, $cardX + 60, $cardY + 380)
$g3.DrawString("Cita rasa legendaris asli Majalengka sejak 1995", $fontSubDish, [System.Drawing.Brushes]::Gold, $cardX + 60, $cardY + 415)

# Right Side Form with Error Banner
$g3.DrawString("Halaman Masuk Akun", $fontFormTitle, [System.Drawing.Brushes]::Black, $formX, $cardY + 40)
$g3.DrawString("Masukkan email dan kata sandi akun Anda.", $fontFormSub, [System.Drawing.Brushes]::DimGray, $formX, $cardY + 75)

# ERROR BANNER (NIST SP 800-63B Compliant)
$errBoxY = $cardY + 110
$brushErrBg = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 235, 238))
$penErrBorder = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(229, 57, 53)), 1.5
$g3.FillRectangle($brushErrBg, $formX, $errBoxY, 480, 60)
$g3.DrawRectangle($penErrBorder, $formX, $errBoxY, 480, 60)

$fontErrIcon = New-Font "Segoe UI" 14 ([System.Drawing.FontStyle]::Bold)
$g3.DrawString("⚠️", $fontErrIcon, [System.Drawing.Brushes]::Crimson, $formX + 12, $errBoxY + 16)
$fontErrText = New-Font "Segoe UI" 9.5 ([System.Drawing.FontStyle]::Bold)
$brushErrText = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(198, 40, 40))
$strErr = "Email atau kata sandi salah. Jika belum punya akun, silakan daftar terlebih dahulu."
$rectErr = New-Object System.Drawing.RectangleF ($formX + 45), ($errBoxY + 12), 425, 40
$g3.DrawString($strErr, $fontErrText, $brushErrText, $rectErr)

# Email Input
$g3.DrawString("Alamat Email *", $fontLabel, [System.Drawing.Brushes]::Black, $formX, $cardY + 190)
$g3.DrawRectangle($penInput, $formX, $cardY + 220, 480, 42)
$g3.DrawString("✉️  admin@condongraos.com", $fontInput, [System.Drawing.Brushes]::Black, $formX + 15, $cardY + 228)

# Password Input (Error highlighted border)
$penPassErr = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(229, 57, 53)), 2
$g3.DrawString("Kata Sandi *", $fontLabel, [System.Drawing.Brushes]::Black, $formX, $cardY + 280)
$g3.DrawRectangle($penPassErr, $formX, $cardY + 310, 480, 42)
$g3.DrawString("🔒  •••••••••••••••••", $fontInput, [System.Drawing.Brushes]::Black, $formX + 15, $cardY + 318)
$g3.DrawString("👁️", $fontInput, [System.Drawing.Brushes]::DimGray, $formX + 440, $cardY + 318)

# Submit Button
$g3.FillRectangle($brushBtn, $formX, $cardY + 380, 480, 46)
$g3.DrawString("Masuk ke Akun Sekarang →", $fontBtn, [System.Drawing.Brushes]::White, ($formX + 240), ($cardY + 392), $sfCenter)

$g3.DrawString("Belum punya akun pelanggan? ", $fontSwitch, [System.Drawing.Brushes]::DimGray, $formX + 70, $cardY + 450)
$g3.DrawString("Daftar Akun Dulu di Sini", $fontSwitchLink, $brushMaroonText, $formX + 260, $cardY + 450)

$bmp3.Save((Join-Path $imgDir "gambar3_login_gagal.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$g3.Dispose(); $bmp3.Dispose()


# ==========================================
# GAMBAR 4: FLOWCHART LOGIKA AUTENTIKASI
# ==========================================
Write-Host "Rendering Gambar 4 (Flowchart)..."
$bmp4 = New-Object System.Drawing.Bitmap 1100, 1550
$g4 = [System.Drawing.Graphics]::FromImage($bmp4)
Set-GraphicsQuality $g4
$g4.Clear([System.Drawing.Color]::White)

# Title
$fontFlowTitle = New-Font "Arial" 16 ([System.Drawing.FontStyle]::Bold)
$g4.DrawString("Flowchart Logika Autentikasi Login Condong Raos 234", $fontFlowTitle, [System.Drawing.Brushes]::Black, 550, 25, $sfCenter)
$fontFlowSub = New-Font "Arial" 10.5
$g4.DrawString("Modul: AuthModal.jsx (handleSubmit) & AuthContext.jsx", $fontFlowSub, [System.Drawing.Brushes]::DimGray, 550, 55, $sfCenter)

# Helper function to draw rounded box
function Draw-Pill($g, $text, $cx, $cy, $w, $h, $bgCol, $borderCol) {
    $brush = New-Object System.Drawing.SolidBrush $bgCol
    $pen = New-Object System.Drawing.Pen $borderCol, 2
    $g.FillEllipse($brush, $cx - $w/2, $cy - $h/2, $h, $h)
    $g.FillEllipse($brush, $cx + $w/2 - $h, $cy - $h/2, $h, $h)
    $g.FillRectangle($brush, $cx - $w/2 + $h/2, $cy - $h/2, $w - $h, $h)
    $g.DrawArc($pen, $cx - $w/2, $cy - $h/2, $h, $h, 90, 180)
    $g.DrawArc($pen, $cx + $w/2 - $h, $cy - $h/2, $h, $h, 270, 180)
    $g.DrawLine($pen, $cx - $w/2 + $h/2, $cy - $h/2, $cx + $w/2 - $h/2, $cy - $h/2)
    $g.DrawLine($pen, $cx - $w/2 + $h/2, $cy + $h/2, $cx + $w/2 - $h/2, $cy + $h/2)
    $font = New-Font "Arial" 11 ([System.Drawing.FontStyle]::Bold)
    $g.DrawString($text, $font, [System.Drawing.Brushes]::Black, $cx, $cy - 7, $sfCenter)
}

function Draw-Box($g, $text, $cx, $cy, $w, $h, $bgCol, $borderCol, $isDashed=$false) {
    $brush = New-Object System.Drawing.SolidBrush $bgCol
    $pen = New-Object System.Drawing.Pen $borderCol, 2
    if ($isDashed) { $pen.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash }
    $g.FillRectangle($brush, $cx - $w/2, $cy - $h/2, $w, $h)
    $g.DrawRectangle($pen, $cx - $w/2, $cy - $h/2, $w, $h)
    $font = New-Font "Arial" 10
    $lines = $text.Split("`n")
    $lineH = 16
    $startY = $cy - ($lines.Length * $lineH / 2) + 2
    for ($i=0; $i -lt $lines.Length; $i++) {
        $g.DrawString($lines[$i], $font, [System.Drawing.Brushes]::Black, $cx, $startY + ($i * $lineH), $sfCenter)
    }
}

function Draw-Diamond($g, $text, $cx, $cy, $w, $h, $bgCol, $borderCol) {
    $brush = New-Object System.Drawing.SolidBrush $bgCol
    $pen = New-Object System.Drawing.Pen $borderCol, 2
    $pts = @(
        (New-Object System.Drawing.PointF ($cx), ($cy - $h/2)),
        (New-Object System.Drawing.PointF ($cx + $w/2), ($cy)),
        (New-Object System.Drawing.PointF ($cx), ($cy + $h/2)),
        (New-Object System.Drawing.PointF ($cx - $w/2), ($cy))
    )
    $g.FillPolygon($brush, $pts)
    $g.DrawPolygon($pen, $pts)
    $font = New-Font "Arial" 9.5 ([System.Drawing.FontStyle]::Bold)
    $lines = $text.Split("`n")
    $lineH = 15
    $startY = $cy - ($lines.Length * $lineH / 2) + 1
    for ($i=0; $i -lt $lines.Length; $i++) {
        $g.DrawString($lines[$i], $font, [System.Drawing.Brushes]::Black, $cx, $startY + ($i * $lineH), $sfCenter)
    }
}

function Draw-Arrow($g, $x1, $y1, $x2, $y2, $lbl="", $lblCol=[System.Drawing.Color]::Black) {
    $pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(60, 60, 60)), 2
    $pen.CustomEndCap = New-Object System.Drawing.Drawing2D.AdjustableArrowCap 5, 5
    $g.DrawLine($pen, $x1, $y1, $x2, $y2)
    if ($lbl -ne "") {
        $font = New-Font "Arial" 9.5 ([System.Drawing.FontStyle]::Bold)
        $brush = New-Object System.Drawing.SolidBrush $lblCol
        $mx = ($x1 + $x2)/2 + 8; $my = ($y1 + $y2)/2 - 10
        $g.DrawString($lbl, $font, $brush, $mx, $my)
    }
}

# 1. Mulai
Draw-Pill $g4 "Mulai (Start)" 550 110 200 44 ([System.Drawing.Color]::FromArgb(255, 235, 238)) ([System.Drawing.Color]::FromArgb(198, 40, 40))
Draw-Arrow $g4 550 132 550 170

# 2. Predicate 1: Cek Konfigurasi DB
Draw-Diamond $g4 "1. Apakah Konfigurasi DB Valid?`n(isSupabaseConfigured & supabase)" 550 220 320 80 ([System.Drawing.Color]::FromArgb(255, 249, 196)) ([System.Drawing.Color]::FromArgb(251, 192, 45))

# Branch 1: Tidak -> Return 500
$penStandard = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(60, 60, 60)), 2
$g4.DrawLine($penStandard, 710, 220, 880, 220)
Draw-Arrow $g4 880 220 880 260 "Tidak" ([System.Drawing.Color]::Red)
Draw-Box $g4 "Return 500: Database Belum`nDikonfigurasi di file .env" 880 300 240 60 ([System.Drawing.Color]::FromArgb(255, 205, 210)) ([System.Drawing.Color]::FromArgb(229, 57, 53)) $true

# Branch 1: Ya -> Sanitasi
Draw-Arrow $g4 550 260 550 310 "Ya" ([System.Drawing.Color]::DarkGreen)
Draw-Box $g4 "Sanitasi Input: email.trim()`nReset State Error (errorMsg = '')" 550 340 280 50 ([System.Drawing.Color]::FromArgb(225, 245, 254)) ([System.Drawing.Color]::FromArgb(2, 136, 209))
Draw-Arrow $g4 550 365 550 410

# 3. Predicate 2: Cek Input Kosong
Draw-Diamond $g4 "2. Apakah Email & Sandi`nTerisi Lengkap?" 550 460 280 75 ([System.Drawing.Color]::FromArgb(255, 249, 196)) ([System.Drawing.Color]::FromArgb(251, 192, 45))

# Branch 2: Tidak -> Return 400
$g4.DrawLine($penStandard, 690, 460, 880, 460)
Draw-Arrow $g4 880 460 880 500 "Tidak" ([System.Drawing.Color]::Red)
Draw-Box $g4 "Return 400: Email dan`nkata sandi wajib diisi" 880 535 240 55 ([System.Drawing.Color]::FromArgb(255, 205, 210)) ([System.Drawing.Color]::FromArgb(229, 57, 53)) $true

# Branch 2: Ya -> Call Supabase
Draw-Arrow $g4 550 498 550 545 "Ya" ([System.Drawing.Color]::DarkGreen)
Draw-Box $g4 "Panggil Layanan Autentikasi:`nsupabase.auth.signInWithPassword({email, password})" 550 580 360 55 ([System.Drawing.Color]::FromArgb(225, 245, 254)) ([System.Drawing.Color]::FromArgb(2, 136, 209))
Draw-Arrow $g4 550 608 550 650

# 4. Predicate 3: Respon Error?
Draw-Diamond $g4 "3. Apakah Respon Supabase`nMenghasilkan Error?" 550 700 300 80 ([System.Drawing.Color]::FromArgb(255, 249, 196)) ([System.Drawing.Color]::FromArgb(251, 192, 45))

# Branch 3: Ya (Error) -> Left side
$g4.DrawLine($penStandard, 400, 700, 240, 700)
Draw-Arrow $g4 240 700 240 750 "Ya (Error)" ([System.Drawing.Color]::Red)

# Predicate 4: Kredensial Salah?
Draw-Diamond $g4 "4. Apakah Pesan Error`n'Invalid login credentials'?" 240 800 280 75 ([System.Drawing.Color]::FromArgb(255, 249, 196)) ([System.Drawing.Color]::FromArgb(251, 192, 45))

# Branch 4: Ya / Tidak
$g4.DrawLine($penStandard, 100, 800, 100, 880)
Draw-Arrow $g4 100 880 100 900 "Ya" ([System.Drawing.Color]::Red)
Draw-Box $g4 "Throw Error Kredensial:`n'Email atau kata sandi salah...'" 100 940 180 60 ([System.Drawing.Color]::FromArgb(255, 205, 210)) ([System.Drawing.Color]::FromArgb(229, 57, 53))

$g4.DrawLine($penStandard, 380, 800, 380, 880)
Draw-Arrow $g4 380 880 380 900 "Tidak" ([System.Drawing.Color]::Red)
Draw-Box $g4 "Throw Original Error:`nGangguan Jaringan / Server" 380 940 180 60 ([System.Drawing.Color]::FromArgb(255, 205, 210)) ([System.Drawing.Color]::FromArgb(229, 57, 53))

# Both converge to Catch Block (Node 17)
$g4.DrawLine($penStandard, 100, 970, 100, 1040)
$g4.DrawLine($penStandard, 380, 970, 380, 1040)
$g4.DrawLine($penStandard, 100, 1040, 380, 1040)
Draw-Arrow $g4 240 1040 240 1080
Draw-Box $g4 "Node 17: Blok Catch(err)`nPasang Pesan Error ke UI (setErrorMsg)" 240 1120 280 60 ([System.Drawing.Color]::FromArgb(255, 205, 210)) ([System.Drawing.Color]::FromArgb(198, 40, 40))

# Branch 3: Tidak (Sukses) -> Fetch profile
Draw-Arrow $g4 550 740 550 820 "Tidak (Sukses)" ([System.Drawing.Color]::DarkGreen)
Draw-Box $g4 "Ambil Profil Pengguna dari Database:`nfetchProfile(currentUser.id)" 550 855 300 50 ([System.Drawing.Color]::FromArgb(225, 245, 254)) ([System.Drawing.Color]::FromArgb(2, 136, 209))
Draw-Arrow $g4 550 880 550 930

# 5. Predicate 5: Role Admin?
Draw-Diamond $g4 "5. Apakah Peran Pengguna`n(profile.role == 'admin')?" 550 980 280 80 ([System.Drawing.Color]::FromArgb(255, 249, 196)) ([System.Drawing.Color]::FromArgb(251, 192, 45))

# Branch 5: Ya / Tidak
$g4.DrawLine($penStandard, 410, 980, 410, 1040)
Draw-Arrow $g4 410 1040 460 1080 "Ya" ([System.Drawing.Color]::DarkGreen)
Draw-Box $g4 "Otorisasi Akses Admin:`nBuka Dashboard Pengelola" 480 1115 170 50 ([System.Drawing.Color]::FromArgb(200, 230, 201)) ([System.Drawing.Color]::FromArgb(56, 142, 60))

$g4.DrawLine($penStandard, 690, 980, 690, 1040)
Draw-Arrow $g4 690 1040 640 1080 "Tidak" ([System.Drawing.Color]::DarkGreen)
Draw-Box $g4 "Otorisasi Pelanggan:`nAkses Ulasan & Beranda" 640 1115 170 50 ([System.Drawing.Color]::FromArgb(200, 230, 201)) ([System.Drawing.Color]::FromArgb(56, 142, 60))

# Both converge to Toast Sukses (Node 16)
$g4.DrawLine($penStandard, 480, 1140, 560, 1190)
$g4.DrawLine($penStandard, 640, 1140, 560, 1190)
Draw-Arrow $g4 560 1190 560 1215
Draw-Box $g4 "Node 16: Tampilkan Toast Sukses:`n'Selamat datang kembali di Condong Raos 234!'`ndan Tutup Modal Login (onClose)" 560 1255 360 65 ([System.Drawing.Color]::FromArgb(200, 230, 201)) ([System.Drawing.Color]::FromArgb(46, 125, 50))

# Terminal Exit Convergence (Node 18)
# From Node 3:
$g4.DrawLine($penStandard, 880, 330, 980, 330)
$g4.DrawLine($penStandard, 980, 330, 980, 1370)
# From Node 6:
$g4.DrawLine($penStandard, 880, 563, 940, 563)
$g4.DrawLine($penStandard, 940, 563, 940, 1370)
# From Node 17:
$g4.DrawLine($penStandard, 240, 1150, 240, 1370)
# From Node 16:
$g4.DrawLine($penStandard, 560, 1288, 560, 1370)

# Merge all into line to Terminal
$g4.DrawLine($penStandard, 240, 1370, 980, 1370)
Draw-Arrow $g4 560 1370 560 1420

# Node 18: Terminal Exit
Draw-Pill $g4 "Selesai (Terminal Exit)" 560 1450 240 48 ([System.Drawing.Color]::FromArgb(255, 235, 238)) ([System.Drawing.Color]::FromArgb(198, 40, 40))

$bmp4.Save((Join-Path $imgDir "gambar4_flowchart.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$g4.Dispose(); $bmp4.Dispose()


# ==========================================
# GAMBAR 5: CONTROL FLOW GRAPH (CFG)
# ==========================================
Write-Host "Rendering Gambar 5 (CFG)..."
$bmp5 = New-Object System.Drawing.Bitmap 1100, 1550
$g5 = [System.Drawing.Graphics]::FromImage($bmp5)
Set-GraphicsQuality $g5
$g5.Clear([System.Drawing.Color]::White)

# Title & Subtitle
$fontCfgTitle = New-Font "Arial" 16 ([System.Drawing.FontStyle]::Bold)
$g5.DrawString("Control Flow Graph (Graf Alir) Logika Autentikasi Login", $fontCfgTitle, [System.Drawing.Brushes]::Black, 550, 25, $sfCenter)
$g5.DrawString("Basis Path Testing - McCabe Cyclomatic Complexity V(G) = 6", $fontFlowSub, [System.Drawing.Brushes]::DimGray, 550, 55, $sfCenter)

# Region text
$fontRegion = New-Font "Arial" 14 ([System.Drawing.FontStyle]::Bold)
$brushRegion = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(21, 101, 192))
$g5.DrawString("R1", $fontRegion, $brushRegion, 630, 220)
$g5.DrawString("R2", $fontRegion, $brushRegion, 630, 400)
$g5.DrawString("R3", $fontRegion, $brushRegion, 250, 750)
$g5.DrawString("R4", $fontRegion, $brushRegion, 420, 750)
$g5.DrawString("R5", $fontRegion, $brushRegion, 530, 1050)
$g5.DrawString("R6 (Wilayah Luar)", $fontRegion, (New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(13, 71, 161))), 920, 700)

# Helper function to draw CFG Node
function Draw-CfgNode($g, $id, $cx, $cy, $type="normal") {
    $r = 22
    $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(225, 245, 254)) # Blue normal
    $pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(2, 136, 209)), 2.5

    if ($type -eq "predicate") {
        $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 249, 196)) # Yellow
        $pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(251, 192, 45)), 3
    } elseif ($type -eq "error") {
        $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 205, 210)) # Red
        $pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(229, 57, 53)), 2.5
    } elseif ($type -eq "success") {
        $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(200, 230, 201)) # Green
        $pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(46, 125, 50)), 2.5
    } elseif ($type -eq "terminal") {
        $r = 26
        $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 235, 238)) # Double Red
        $pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(198, 40, 40)), 3.5
    }

    $g.FillEllipse($brush, $cx - $r, $cy - $r, 2*$r, 2*$r)
    $g.DrawEllipse($pen, $cx - $r, $cy - $r, 2*$r, 2*$r)
    if ($type -eq "terminal") {
        $g.DrawEllipse((New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(198, 40, 40)), 1.5), $cx - $r + 4, $cy - $r + 4, 2*$r - 8, 2*$r - 8)
    }

    $font = New-Font "Arial" 12 ([System.Drawing.FontStyle]::Bold)
    $g.DrawString($id, $font, [System.Drawing.Brushes]::Black, $cx, $cy - 9, $sfCenter)
}

# Coordinate definitions for all 18 nodes:
$n1 = @{ x=550; y=100 }
$n2 = @{ x=550; y=180 }
$n3 = @{ x=780; y=240 }
$n4 = @{ x=550; y=280 }
$n5 = @{ x=550; y=360 }
$n6 = @{ x=720; y=430 }
$n7 = @{ x=550; y=460 }
$n8 = @{ x=550; y=550 }
$n9 = @{ x=320; y=650 }
$n10 = @{ x=200; y=760 }
$n11 = @{ x=380; y=760 }
$n12 = @{ x=550; y=760 }
$n13 = @{ x=550; y=880 }
$n14 = @{ x=440; y=980 }
$n15 = @{ x=660; y=980 }
$n16 = @{ x=550; y=1080 }
$n17 = @{ x=300; y=900 }
$n18 = @{ x=550; y=1250 }

# Connect Edges:
# 1 -> 2
Draw-Arrow $g5 $n1.x ($n1.y+22) $n2.x ($n2.y-22)
# 2 -> 3 (Right)
$g5.DrawLine($penStandard, ($n2.x+22), $n2.y, $n3.x, $n2.y)
Draw-Arrow $g5 $n3.x $n2.y $n3.x ($n3.y-22) "Tidak (DB Missing)" ([System.Drawing.Color]::Red)
# 2 -> 4 (Down)
Draw-Arrow $g5 $n2.x ($n2.y+22) $n4.x ($n4.y-22) "Ya" ([System.Drawing.Color]::DarkGreen)
# 4 -> 5
Draw-Arrow $g5 $n4.x ($n4.y+22) $n5.x ($n5.y-22)
# 5 -> 6 (Right)
$g5.DrawLine($penStandard, ($n5.x+22), $n5.y, $n6.x, $n5.y)
Draw-Arrow $g5 $n6.x $n5.y $n6.x ($n6.y-22) "Tidak (Kosong)" ([System.Drawing.Color]::Red)
# 5 -> 7 (Down)
Draw-Arrow $g5 $n5.x ($n5.y+22) $n7.x ($n7.y-22) "Ya" ([System.Drawing.Color]::DarkGreen)
# 7 -> 8
Draw-Arrow $g5 $n7.x ($n7.y+22) $n8.x ($n8.y-22)
# 8 -> 9 (Left - Error)
$g5.DrawLine($penStandard, ($n8.x-22), $n8.y, $n9.x, $n8.y)
Draw-Arrow $g5 $n9.x $n8.y $n9.x ($n9.y-22) "Ya (Error)" ([System.Drawing.Color]::Red)
# 8 -> 12 (Down - Success)
Draw-Arrow $g5 $n8.x ($n8.y+22) $n12.x ($n12.y-22) "Tidak (Sukses)" ([System.Drawing.Color]::DarkGreen)
# 9 -> 10 (Left)
$g5.DrawLine($penStandard, ($n9.x-22), $n9.y, $n10.x, $n9.y)
Draw-Arrow $g5 $n10.x $n9.y $n10.x ($n10.y-22) "Ya (Sandi Salah)" ([System.Drawing.Color]::Red)
# 9 -> 11 (Right)
$g5.DrawLine($penStandard, ($n9.x+22), $n9.y, $n11.x, $n9.y)
Draw-Arrow $g5 $n11.x $n9.y $n11.x ($n11.y-22) "Tidak" ([System.Drawing.Color]::Red)
# 10 -> 17
$g5.DrawLine($penStandard, $n10.x, ($n10.y+22), $n10.x, 850)
$g5.DrawLine($penStandard, $n10.x, 850, $n17.x, 850)
Draw-Arrow $g5 $n17.x 850 $n17.x ($n17.y-22)
# 11 -> 17
$g5.DrawLine($penStandard, $n11.x, ($n11.y+22), $n11.x, 850)
$g5.DrawLine($penStandard, $n11.x, 850, $n17.x, 850)
# 12 -> 13
Draw-Arrow $g5 $n12.x ($n12.y+22) $n13.x ($n13.y-22)
# 13 -> 14 (Left)
$g5.DrawLine($penStandard, ($n13.x-22), $n13.y, $n14.x, $n13.y)
Draw-Arrow $g5 $n14.x $n13.y $n14.x ($n14.y-22) "Admin" ([System.Drawing.Color]::DarkGreen)
# 13 -> 15 (Right)
$g5.DrawLine($penStandard, ($n13.x+22), $n13.y, $n15.x, $n13.y)
Draw-Arrow $g5 $n15.x $n13.y $n15.x ($n15.y-22) "Pelanggan" ([System.Drawing.Color]::DarkGreen)
# 14 -> 16
$g5.DrawLine($penStandard, $n14.x, ($n14.y+22), $n14.x, 1040)
$g5.DrawLine($penStandard, $n14.x, 1040, $n16.x, 1040)
Draw-Arrow $g5 $n16.x 1040 $n16.x ($n16.y-22)
# 15 -> 16
$g5.DrawLine($penStandard, $n15.x, ($n15.y+22), $n15.x, 1040)
$g5.DrawLine($penStandard, $n15.x, 1040, $n16.x, 1040)

# Paths to 18 (Terminal Exit):
# 16 -> 18
Draw-Arrow $g5 $n16.x ($n16.y+22) $n18.x ($n18.y-26)
# 17 -> 18
$g5.DrawLine($penStandard, $n17.x, ($n17.y+22), $n17.x, 1180)
$g5.DrawLine($penStandard, $n17.x, 1180, ($n18.x-26), 1250)
Draw-Arrow $g5 $n17.x 1180 ($n18.x-26) 1250
# 3 -> 18 (Far right trunk)
$g5.DrawLine($penStandard, $n3.x, ($n3.y+22), $n3.x, 1180)
$g5.DrawLine($penStandard, $n3.x, 1180, ($n18.x+26), 1250)
Draw-Arrow $g5 $n3.x 1180 ($n18.x+26) 1250
# 6 -> 18
$g5.DrawLine($penStandard, $n6.x, ($n6.y+22), $n6.x, 1150)
$g5.DrawLine($penStandard, $n6.x, 1150, $n3.x, 1150)

# Now Draw All Nodes on top of Edges:
Draw-CfgNode $g5 "1" $n1.x $n1.y "normal"
Draw-CfgNode $g5 "2" $n2.x $n2.y "predicate"
Draw-CfgNode $g5 "3" $n3.x $n3.y "error"
Draw-CfgNode $g5 "4" $n4.x $n4.y "normal"
Draw-CfgNode $g5 "5" $n5.x $n5.y "predicate"
Draw-CfgNode $g5 "6" $n6.x $n6.y "error"
Draw-CfgNode $g5 "7" $n7.x $n7.y "normal"
Draw-CfgNode $g5 "8" $n8.x $n8.y "predicate"
Draw-CfgNode $g5 "9" $n9.x $n9.y "predicate"
Draw-CfgNode $g5 "10" $n10.x $n10.y "error"
Draw-CfgNode $g5 "11" $n11.x $n11.y "error"
Draw-CfgNode $g5 "12" $n12.x $n12.y "normal"
Draw-CfgNode $g5 "13" $n13.x $n13.y "predicate"
Draw-CfgNode $g5 "14" $n14.x $n14.y "success"
Draw-CfgNode $g5 "15" $n15.x $n15.y "success"
Draw-CfgNode $g5 "16" $n16.x $n16.y "success"
Draw-CfgNode $g5 "17" $n17.x $n17.y "error"
Draw-CfgNode $g5 "18" $n18.x $n18.y "terminal"

# Legend Box at Bottom
$legX = 180; $legY = 1350
$g5.FillRectangle([System.Drawing.Brushes]::WhiteSmoke, $legX, $legY, 740, 110)
$g5.DrawRectangle($penStandard, $legX, $legY, 740, 110)
$fontLegTitle = New-Font "Arial" 10.5 ([System.Drawing.FontStyle]::Bold)
$g5.DrawString("Keterangan Simbol & Bentuk Simpul (Legend):", $fontLegTitle, [System.Drawing.Brushes]::Black, $legX + 20, $legY + 12)

# Legend items
$g5.FillEllipse((New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(225, 245, 254))), $legX + 30, $legY + 45, 22, 22)
$g5.DrawEllipse((New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(2, 136, 209)), 2), $legX + 30, $legY + 45, 22, 22)
$g5.DrawString("Simpul Proses / Pernyataan (Node 1, 4, 7, 12)", $fontNavLink, [System.Drawing.Brushes]::Black, $legX + 60, $legY + 48)

$g5.FillEllipse((New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 249, 196))), $legX + 400, $legY + 45, 22, 22)
$g5.DrawEllipse((New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(251, 192, 45)), 2), $legX + 400, $legY + 45, 22, 22)
$g5.DrawString("Predicate Node Percabangan (2, 5, 8, 9, 13)", $fontNavLink, [System.Drawing.Brushes]::Black, $legX + 430, $legY + 48)

$g5.FillEllipse((New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 205, 210))), $legX + 30, $legY + 75, 22, 22)
$g5.DrawEllipse((New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(229, 57, 53)), 2), $legX + 30, $legY + 75, 22, 22)
$g5.DrawString("Error Handling / Exit Cabang (3, 6, 10, 11, 17)", $fontNavLink, [System.Drawing.Brushes]::Black, $legX + 60, $legY + 78)

$g5.FillEllipse((New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 235, 238))), $legX + 400, $legY + 75, 22, 22)
$g5.DrawEllipse((New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(198, 40, 40)), 2), $legX + 400, $legY + 75, 22, 22)
$g5.DrawString("Terminal Exit Simpul Selesai (Node 18)", $fontNavLink, [System.Drawing.Brushes]::Black, $legX + 430, $legY + 78)

$bmp5.Save((Join-Path $imgDir "gambar5_cfg.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$g5.Dispose(); $bmp5.Dispose()

Write-Host "ALL 5 IMAGES GENERATED CLEANLY!"
