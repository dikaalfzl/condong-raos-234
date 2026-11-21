Add-Type -AssemblyName System.Drawing

$imgDir = Join-Path $pwd "generated_images"

function New-Font([string]$name, [float]$size, [System.Drawing.FontStyle]$style = [System.Drawing.FontStyle]::Regular) {
    return New-Object System.Drawing.Font($name, $size, $style)
}
function Set-GraphicsQuality($g) {
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
}

# ----------------------------------------------------
# GAMBAR 6: KATALOG MENU & FILTER PENCARIAN
# ----------------------------------------------------
Write-Host "Rendering Gambar 6..."
$bmp6 = New-Object System.Drawing.Bitmap 1200, 750
$g6 = [System.Drawing.Graphics]::FromImage($bmp6)
Set-GraphicsQuality $g6
$g6.Clear([System.Drawing.Color]::FromArgb(248, 249, 250))

# Browser Header
$brushBrowserHeader = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(230, 233, 238))
$g6.FillRectangle($brushBrowserHeader, 0, 0, 1200, 50)
$g6.FillEllipse((New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 95, 86))), 20, 18, 14, 14)
$g6.FillEllipse((New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 189, 46))), 42, 18, 14, 14)
$g6.FillEllipse((New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(39, 201, 63))), 64, 18, 14, 14)
$brushAddr = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
$g6.FillRectangle($brushAddr, 120, 10, 800, 30)
$fontAddr = New-Font "Segoe UI" 10
$g6.DrawString("🔒 http://localhost:5173/#menu (Katalog Menu Kuliner Condong Raos 234)", $fontAddr, [System.Drawing.Brushes]::DimGray, 130, 15)

# Navbar
$brushNav = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
$g6.FillRectangle($brushNav, 0, 50, 1200, 70)
$penBorder = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(230, 230, 230)), 1
$g6.DrawLine($penBorder, 0, 120, 1200, 120)
$brushMaroon = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(154, 16, 6))
$fontNavBrand = New-Font "Segoe UI" 15 ([System.Drawing.FontStyle]::Bold)
$g6.DrawString("🍜 CONDONG RAOS 234", $fontNavBrand, $brushMaroon, 60, 70)

# Section Title
$fontSecTitle = New-Font "Segoe UI" 20 ([System.Drawing.FontStyle]::Bold)
$g6.DrawString("Daftar Menu & Kuliner Favorit", $fontSecTitle, [System.Drawing.Brushes]::Black, 60, 145)
$fontSecSub = New-Font "Segoe UI" 11
$g6.DrawString("Nikmati aneka hidangan bakso sapi asli, mie ayam gurih, dan aneka minuman segar pilihan.", $fontSecSub, [System.Drawing.Brushes]::DimGray, 60, 185)

# Search Bar
$g6.FillRectangle([System.Drawing.Brushes]::White, 60, 220, 420, 42)
$penInput = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(210, 215, 225)), 1.5
$g6.DrawRectangle($penInput, 60, 220, 420, 42)
$fontInput = New-Font "Segoe UI" 10.5
$g6.DrawString("🔍 Cari menu lezat...", $fontInput, [System.Drawing.Brushes]::Gray, 75, 230)

# Category Tabs
$categories = @("Semua (18)", "🍜 Bakso Sapi", "🥢 Mie Ayam", "🥤 Minuman", "🥟 Pelengkap")
$tabX = 500
for ($i = 0; $i -lt $categories.Length; $i++) {
    $c = $categories[$i]
    $isAct = ($i -eq 0)
    $bg = if ($isAct) { $brushMaroon } else { [System.Drawing.Brushes]::White }
    $fg = if ($isAct) { [System.Drawing.Brushes]::White } else { [System.Drawing.Brushes]::Black }
    $fontStyle = if ($isAct) { [System.Drawing.FontStyle]::Bold } else { [System.Drawing.FontStyle]::Regular }
    $w = 125
    $g6.FillRectangle($bg, $tabX, 220, $w, 42)
    if (-not $isAct) { $g6.DrawRectangle($penInput, $tabX, 220, $w, 42) }
    $fontTab = New-Font "Segoe UI" 9.5 $fontStyle
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
    $g6.DrawString($c, $fontTab, $fg, (New-Object System.Drawing.RectangleF $tabX, 220, $w, 42), $sf)
    $tabX += ($w + 10)
}

# 3 Menu Cards
$cardW = 340; $cardH = 420; $cardY = 290
$menusData = @(
    @{ Name = "Bakso Urat Istimewa"; Price = "Rp 25.000"; Rating = "★ 4.9 (128)"; Desc = "Bakso sapi urat cincang kasar bertekstur kenyal, disiram kuah kaldu rempah gurih khas 234."; Tag = "Terpopuler"; TagBg = [System.Drawing.Color]::FromArgb(230, 81, 0) },
    @{ Name = "Mie Ayam Komplit"; Price = "Rp 22.000"; Rating = "★ 4.8 (95)"; Desc = "Mie kenyal buatan sendiri bertabur ayam kecap gurih legit, bakso halus, dan pangsit renyah."; Tag = "Favorit"; TagBg = [System.Drawing.Color]::FromArgb(46, 125, 50) },
    @{ Name = "Es Teh Manis Jumbo"; Price = "Rp 6.000"; Rating = "★ 4.9 (150)"; Desc = "Teh melati wangi khas diseduh gula aren alami, disajikan dingin menyegarkan penutup makan."; Tag = "Segar"; TagBg = [System.Drawing.Color]::FromArgb(2, 136, 209) }
)

for ($i = 0; $i -lt 3; $i++) {
    $m = $menusData[$i]
    $cX = 60 + ($i * 380)
    $g6.FillRectangle([System.Drawing.Brushes]::White, $cX, $cardY, $cardW, $cardH)
    $g6.DrawRectangle($penInput, $cX, $cardY, $cardW, $cardH)
    
    $brushDishBg = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(240, 240, 245))
    $g6.FillRectangle($brushDishBg, $cX, $cardY, $cardW, 180)
    $fontDishIcon = New-Font "Segoe UI" 32
    $g6.DrawString("🍲", $fontDishIcon, [System.Drawing.Brushes]::DimGray, $cX + 140, $cardY + 55)

    $brushTag = New-Object System.Drawing.SolidBrush $m.TagBg
    $g6.FillRectangle($brushTag, $cX + 15, $cardY + 15, 95, 26)
    $fontTag = New-Font "Segoe UI" 9 ([System.Drawing.FontStyle]::Bold)
    $g6.DrawString($m.Tag, $fontTag, [System.Drawing.Brushes]::White, $cX + 22, $cardY + 20)

    $fontMName = New-Font "Segoe UI" 14 ([System.Drawing.FontStyle]::Bold)
    $g6.DrawString($m.Name, $fontMName, [System.Drawing.Brushes]::Black, $cX + 20, $cardY + 195)
    
    $fontMRating = New-Font "Segoe UI" 10 ([System.Drawing.FontStyle]::Bold)
    $g6.DrawString($m.Rating, $fontMRating, (New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(245, 127, 23))), $cX + 20, $cardY + 225)
    
    $fontMDesc = New-Font "Segoe UI" 9.5
    $rectMDesc = New-Object System.Drawing.RectangleF ($cX + 20), ($cardY + 250), 300, 70
    $g6.DrawString($m.Desc, $fontMDesc, [System.Drawing.Brushes]::DimGray, $rectMDesc)
    
    $fontMPrice = New-Font "Segoe UI" 13 ([System.Drawing.FontStyle]::Bold)
    $g6.DrawString($m.Price, $fontMPrice, $brushMaroon, $cX + 20, $cardY + 355)
    
    $g6.FillRectangle($brushMaroon, $cX + 190, $cardY + 350, 130, 36)
    $fontMBtn = New-Font "Segoe UI" 9.5 ([System.Drawing.FontStyle]::Bold)
    $g6.DrawString("Beri Ulasan 💬", $fontMBtn, [System.Drawing.Brushes]::White, $cX + 205, $cardY + 358)
}

$bmp6.Save((Join-Path $imgDir "gambar6_katalog_menu.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$g6.Dispose(); $bmp6.Dispose()


# ----------------------------------------------------
# GAMBAR 7: MODAL ULASAN & FORM RATING PELANGGAN
# ----------------------------------------------------
Write-Host "Rendering Gambar 7..."
$bmp7 = New-Object System.Drawing.Bitmap 1200, 750
$g7 = [System.Drawing.Graphics]::FromImage($bmp7)
Set-GraphicsQuality $g7
$g7.Clear([System.Drawing.Color]::FromArgb(240, 242, 245))

# Browser Header
$g7.FillRectangle($brushBrowserHeader, 0, 0, 1200, 50)
$g7.FillEllipse((New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 95, 86))), 20, 18, 14, 14)
$g7.FillEllipse((New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 189, 46))), 42, 18, 14, 14)
$g7.FillEllipse((New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(39, 201, 63))), 64, 18, 14, 14)
$g7.FillRectangle($brushAddr, 120, 10, 800, 30)
$g7.DrawString("🔒 http://localhost:5173/ (Modal Ulasan & Penilaian Pelanggan)", $fontAddr, [System.Drawing.Brushes]::DimGray, 130, 15)

$brushDim = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(120, 0, 0, 0))
$g7.FillRectangle($brushDim, 0, 50, 1200, 700)

$mX = 220; $mY = 70; $mW = 760; $mH = 640
$g7.FillRectangle([System.Drawing.Brushes]::White, $mX, $mY, $mW, $mH)
$g7.DrawRectangle($penInput, $mX, $mY, $mW, $mH)

$fontModTitle = New-Font "Segoe UI" 16 ([System.Drawing.FontStyle]::Bold)
$g7.DrawString("Ulasan Menu: Bakso Urat Istimewa", $fontModTitle, [System.Drawing.Brushes]::Black, $mX + 30, $mY + 20)
$fontModSub = New-Font "Segoe UI" 10
$g7.DrawString("Kategori: Makanan • Rata-rata Kepuasan: ★ 4.9 dari 128 pelanggan", $fontModSub, [System.Drawing.Brushes]::DimGray, $mX + 30, $mY + 52)
$g7.DrawLine($penBorder, $mX + 30, $mY + 80, $mX + $mW - 30, $mY + 80)

$fontFormH = New-Font "Segoe UI" 11 ([System.Drawing.FontStyle]::Bold)
$g7.DrawString("Tulis Penilaian & Ulasan Anda:", $fontFormH, [System.Drawing.Brushes]::Black, $mX + 30, $mY + 100)

$fontStarBig = New-Font "Segoe UI" 20
$brushStarGold = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 193, 7))
$g7.DrawString("★★★★★", $fontStarBig, $brushStarGold, $mX + 30, $mY + 125)
$fontStarLabel = New-Font "Segoe UI" 10 ([System.Drawing.FontStyle]::Bold)
$g7.DrawString("(5.0 Bintang - Sangat Puas)", $fontStarLabel, [System.Drawing.Brushes]::DarkGreen, $mX + 160, $mY + 138)

$g7.DrawRectangle($penInput, $mX + 30, $mY + 170, 700, 80)
$fontComment = New-Font "Segoe UI" 10
$g7.DrawString("Baksonya mantap sekali, daging uratnya terasa banget dan kuah kaldunya sangat gurih!", $fontComment, [System.Drawing.Brushes]::Black, $mX + 42, $mY + 185)

$g7.FillRectangle($brushMaroon, $mX + 530, $mY + 265, 200, 40)
$fontBtnMod = New-Font "Segoe UI" 10 ([System.Drawing.FontStyle]::Bold)
$g7.DrawString("Kirim Ulasan Sekarang", $fontBtnMod, [System.Drawing.Brushes]::White, $mX + 555, $mY + 276)

$g7.DrawLine($penBorder, $mX + 30, $mY + 325, $mX + $mW - 30, $mY + 325)
$g7.DrawString("Daftar Ulasan Pelanggan Lain:", $fontFormH, [System.Drawing.Brushes]::Black, $mX + 30, $mY + 345)

# Review 1
$g7.FillRectangle((New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(248, 249, 250))), $mX + 30, $mY + 375, 700, 95)
$g7.DrawRectangle($penInput, $mX + 30, $mY + 375, 700, 95)
$fontRevUser = New-Font "Segoe UI" 10 ([System.Drawing.FontStyle]::Bold)
$g7.DrawString("Budi Santoso  •  ★★★★★  •  12 November 2026", $fontRevUser, [System.Drawing.Brushes]::Black, $mX + 45, $mY + 388)
$g7.DrawString('"Pelayanan ramah, porsi melimpah, dan sambalnya benar-benar pedas mantap. Sangat direkomendasikan!"', $fontComment, [System.Drawing.Brushes]::DimGray, $mX + 45, $mY + 412)

$g7.FillRectangle((New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(254, 243, 242))), $mX + 45, $mY + 435, 670, 26)
$fontReply = New-Font "Segoe UI" 9
$g7.DrawString("↳ Balasan Pengelola (Admin): Terima kasih banyak Kak Budi, ditunggu kedatangannya kembali! 🙏", $fontReply, $brushMaroon, $mX + 55, $mY + 440)

# Review 2
$g7.FillRectangle((New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(248, 249, 250))), $mX + 30, $mY + 485, 700, 75)
$g7.DrawRectangle($penInput, $mX + 30, $mY + 485, 700, 75)
$g7.DrawString("Siti Rahmawati  •  ★★★★★  •  10 November 2026", $fontRevUser, [System.Drawing.Brushes]::Black, $mX + 45, $mY + 498)
$g7.DrawString('"Tekstur mie dan baksonya pas, tempat bersih dan nyaman untuk makan bersama keluarga."', $fontComment, [System.Drawing.Brushes]::DimGray, $mX + 45, $mY + 522)

$bmp7.Save((Join-Path $imgDir "gambar7_ulasan_modal.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$g7.Dispose(); $bmp7.Dispose()


# ----------------------------------------------------
# GAMBAR 8: DASHBOARD ADMINISTRATOR & MANAJEMEN MENU
# ----------------------------------------------------
Write-Host "Rendering Gambar 8..."
$bmp8 = New-Object System.Drawing.Bitmap 1200, 750
$g8 = [System.Drawing.Graphics]::FromImage($bmp8)
Set-GraphicsQuality $g8
$g8.Clear([System.Drawing.Color]::FromArgb(248, 249, 250))

# Browser Header
$g8.FillRectangle($brushBrowserHeader, 0, 0, 1200, 50)
$g8.FillEllipse((New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 95, 86))), 20, 18, 14, 14)
$g8.FillEllipse((New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 189, 46))), 42, 18, 14, 14)
$g8.FillEllipse((New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(39, 201, 63))), 64, 18, 14, 14)
$g8.FillRectangle($brushAddr, 120, 10, 800, 30)
$g8.DrawString("🔒 http://localhost:5173/#admin (Panel Kontrol Manajemen Admin Condong Raos 234)", $fontAddr, [System.Drawing.Brushes]::DimGray, 130, 15)

# Admin Header
$g8.FillRectangle([System.Drawing.Brushes]::White, 0, 50, 1200, 65)
$g8.DrawLine($penBorder, 0, 115, 1200, 115)
$g8.DrawString("🍜 Condong Raos 234 • Admin Dashboard", $fontNavBrand, $brushMaroon, 50, 68)

$g8.FillRectangle($brushMaroon, 1010, 64, 140, 36)
$fontBackBtn = New-Font "Segoe UI" 9.5 ([System.Drawing.FontStyle]::Bold)
$g8.DrawString("← Ke Website", $fontBackBtn, [System.Drawing.Brushes]::White, 1035, 72)

# Tab Bar
$adminTabs = @("🍲 Kelola Menu (18)", "🖼️ Banner Swiper (4)", "💰 Keuangan Harian", "💬 Ulasan Pelanggan", "⚙️ Status Toko")
$atX = 50
for ($i = 0; $i -lt $adminTabs.Length; $i++) {
    $t = $adminTabs[$i]
    $isAct = ($i -eq 0)
    $bg = if ($isAct) { $brushMaroon } else { [System.Drawing.Brushes]::White }
    $fg = if ($isAct) { [System.Drawing.Brushes]::White } else { [System.Drawing.Brushes]::Black }
    $fontStyle = if ($isAct) { [System.Drawing.FontStyle]::Bold } else { [System.Drawing.FontStyle]::Regular }
    $w = 210
    $g8.FillRectangle($bg, $atX, 130, $w, 42)
    if (-not $isAct) { $g8.DrawRectangle($penInput, $atX, 130, $w, 42) }
    $fontTab = New-Font "Segoe UI" 10 $fontStyle
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
    $g8.DrawString($t, $fontTab, $fg, (New-Object System.Drawing.RectangleF $atX, 130, $w, 42), $sf)
    $atX += ($w + 12)
}

# Left Side Form: Tambah / Edit Menu
$formCardX = 50; $formCardY = 190; $formCardW = 420; $formCardH = 520
$g8.FillRectangle([System.Drawing.Brushes]::White, $formCardX, $formCardY, $formCardW, $formCardH)
$g8.DrawRectangle($penInput, $formCardX, $formCardY, $formCardW, $formCardH)
$fontHAdmin = New-Font "Segoe UI" 13 ([System.Drawing.FontStyle]::Bold)
$g8.DrawString("Tambah / Perbarui Menu", $fontHAdmin, [System.Drawing.Brushes]::Black, $formCardX + 25, $formCardY + 20)

$fields = @("Nama Menu Makanan/Minuman", "Kategori (Makanan / Minuman / Pelengkap)", "Harga Jual (Contoh: Rp 25.000)", "Deskripsi Singkat Cita Rasa")
$fY = $formCardY + 60
foreach ($f in $fields) {
    $fontF = New-Font "Segoe UI" 9.5 ([System.Drawing.FontStyle]::Bold)
    $g8.DrawString($f, $fontF, [System.Drawing.Brushes]::Black, $formCardX + 25, $fY)
    $g8.DrawRectangle($penInput, $formCardX + 25, $fY + 22, 370, 36)
    $fY += 70
}

# Buttons in Admin Form
$g8.FillRectangle($brushMaroon, $formCardX + 25, $formCardY + 440, 370, 44)
$fontSaveBtn = New-Font "Segoe UI" 11 ([System.Drawing.FontStyle]::Bold)
$g8.DrawString("💾 Simpan Data Menu", $fontSaveBtn, [System.Drawing.Brushes]::White, $formCardX + 110, $formCardY + 452)

# Right Side Table: Daftar Menu di Database
$tblX = 490; $tblY = 190; $tblW = 660; $tblH = 520
$g8.FillRectangle([System.Drawing.Brushes]::White, $tblX, $tblY, $tblW, $tblH)
$g8.DrawRectangle($penInput, $tblX, $tblY, $tblW, $tblH)
$g8.DrawString("Daftar Menu Aktif di Database Supabase", $fontHAdmin, [System.Drawing.Brushes]::Black, $tblX + 25, $tblY + 20)

# Table Header
$g8.FillRectangle((New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(240, 242, 245))), $tblX + 25, $tblY + 55, 610, 36)
$fontTH = New-Font "Segoe UI" 9.5 ([System.Drawing.FontStyle]::Bold)
$g8.DrawString("Menu", $fontTH, [System.Drawing.Brushes]::Black, $tblX + 40, $tblY + 64)
$g8.DrawString("Kategori", $fontTH, [System.Drawing.Brushes]::Black, $tblX + 230, $tblY + 64)
$g8.DrawString("Harga", $fontTH, [System.Drawing.Brushes]::Black, $tblX + 340, $tblY + 64)
$g8.DrawString("Status Stok", $fontTH, [System.Drawing.Brushes]::Black, $tblX + 440, $tblY + 64)
$g8.DrawString("Aksi", $fontTH, [System.Drawing.Brushes]::Black, $tblX + 540, $tblY + 64)

# Table Rows
$sampleRows = @(
    @{ Name = "Bakso Urat Istimewa"; Cat = "Makanan"; Price = "Rp 25.000"; Status = "Tersedia" },
    @{ Name = "Bakso Halus Telur"; Cat = "Makanan"; Price = "Rp 23.000"; Status = "Tersedia" },
    @{ Name = "Mie Ayam Pangsit"; Cat = "Makanan"; Price = "Rp 20.000"; Status = "Tersedia" },
    @{ Name = "Es Teh Manis Jumbo"; Cat = "Minuman"; Price = "Rp 6.000"; Status = "Tersedia" },
    @{ Name = "Es Jeruk Peras Murni"; Cat = "Minuman"; Price = "Rp 8.000"; Status = "Tersedia" },
    @{ Name = "Kerupuk Kulit Gurih"; Cat = "Pelengkap"; Price = "Rp 5.000"; Status = "Tersedia" }
)

$rY = $tblY + 100
foreach ($row in $sampleRows) {
    $fontTR = New-Font "Segoe UI" 9.5
    $g8.DrawString($row.Name, $fontTR, [System.Drawing.Brushes]::Black, $tblX + 40, $rY + 8)
    $g8.DrawString($row.Cat, $fontTR, [System.Drawing.Brushes]::DimGray, $tblX + 230, $rY + 8)
    $g8.DrawString($row.Price, $fontTR, [System.Drawing.Brushes]::Black, $tblX + 340, $rY + 8)
    
    $g8.FillRectangle((New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(232, 245, 233))), $tblX + 435, $rY + 4, 75, 24)
    $fontStatus = New-Font "Segoe UI" 8.5 ([System.Drawing.FontStyle]::Bold)
    $g8.DrawString("✓ Tersedia", $fontStatus, (New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(46, 125, 50))), $tblX + 442, $rY + 8)
    
    $g8.DrawString("✏️  🗑️", $fontTR, [System.Drawing.Brushes]::Black, $tblX + 540, $rY + 8)
    
    $g8.DrawLine($penBorder, $tblX + 25, $rY + 38, $tblX + 635, $rY + 38)
    $rY += 45
}

$bmp8.Save((Join-Path $imgDir "gambar8_admin_dashboard.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$g8.Dispose(); $bmp8.Dispose()

Write-Host "GAMBAR 6, 7, 8 BERHASIL DIBUAT DENGAN SUKSES!"
