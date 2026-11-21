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

$bmp = New-Object System.Drawing.Bitmap 1100, 1450
$g = [System.Drawing.Graphics]::FromImage($bmp)
Set-GraphicsQuality $g
$g.Clear([System.Drawing.Color]::White)

$sfCenter = New-Object System.Drawing.StringFormat
$sfCenter.Alignment = [System.Drawing.StringAlignment]::Center
$sfCenter.LineAlignment = [System.Drawing.StringAlignment]::Center

# Header
$fontTitle = New-Font "Arial" 16 ([System.Drawing.FontStyle]::Bold)
$g.DrawString("Flowchart Fungsional Fitur Katalog Menu Condong Raos 234", $fontTitle, [System.Drawing.Brushes]::Black, 550, 25, $sfCenter)
$fontSub = New-Font "Arial" 10.5
$g.DrawString("Alur Black Box Testing (Pencarian, Filter Kategori, Sorting, Status Stok, & Modal Ulasan)", $fontSub, [System.Drawing.Brushes]::DimGray, 550, 55, $sfCenter)

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

# Colors
$colStartBg = [System.Drawing.Color]::FromArgb(232, 245, 233)
$colStartBorder = [System.Drawing.Color]::FromArgb(46, 125, 50)
$colProcBg = [System.Drawing.Color]::FromArgb(227, 242, 253)
$colProcBorder = [System.Drawing.Color]::FromArgb(25, 118, 210)
$colDecisionBg = [System.Drawing.Color]::FromArgb(255, 249, 196)
$colDecisionBorder = [System.Drawing.Color]::FromArgb(245, 127, 23)
$colAlertBg = [System.Drawing.Color]::FromArgb(255, 235, 238)
$colAlertBorder = [System.Drawing.Color]::FromArgb(211, 47, 47)
$colSuccessBg = [System.Drawing.Color]::FromArgb(243, 229, 245)
$colSuccessBorder = [System.Drawing.Color]::FromArgb(123, 31, 162)

# 1. Start
Draw-Pill $g "Mulai: Buka Halaman Utama (#menu)" 550 110 320 44 $colStartBg $colStartBorder
Draw-Arrow $g 550 132 550 170

# 2. Fetch Data
Draw-Box $g "Ambil Data Menu & Rating dari Database Supabase`n(fetchMenusAndRatings)" 550 205 380 60 $colProcBg $colProcBorder
Draw-Arrow $g 550 235 550 275

# 3. Render Katalog
Draw-Box $g "Tampilkan Grid Kartu Menu, Foto, Harga, & Rating Rata-rata" 550 305 420 50 $colProcBg $colProcBorder
Draw-Arrow $g 550 330 550 370

# 4. Main Decision: Interaksi
Draw-Diamond $g "Pilihan Interaksi Pengunjung?" 550 420 300 85 $colDecisionBg $colDecisionBorder

# Branches:
# Branch 1: Cari Menu (Left: X=160)
Draw-Arrow $g 400 420 160 420 "Pencarian"
Draw-Arrow $g 160 420 160 490
Draw-Box $g "Input Teks Pencarian`n(searchQuery)" 160 520 220 50 $colProcBg $colProcBorder
Draw-Arrow $g 160 545 160 590
Draw-Diamond $g "Menu Ditemukan?" 160 640 200 80 $colDecisionBg $colDecisionBorder
Draw-Arrow $g 160 680 160 740 "Ya"
Draw-Box $g "Tampilkan Kartu Menu`nyang Cocok Kata Kunci" 160 770 210 50 $colProcBg $colProcBorder
Draw-Arrow $g 260 640 310 640 "Tidak"
Draw-Arrow $g 310 640 310 740
Draw-Box $g "Tampilkan Pesan:`n'Tidak Ada Menu Cocok'" 310 770 190 50 $colAlertBg $colAlertBorder

# Branch 2: Filter Kategori (Mid-Left: X=450)
Draw-Arrow $g 480 460 450 500
Draw-Box $g "Klik Tab Kategori:`nSemua / Makanan / Minuman" 450 535 210 55 $colProcBg $colProcBorder
Draw-Arrow $g 450 563 450 620
Draw-Box $g "Saring Array (list.filter):`nKategori Aktif Terpilih" 450 650 210 50 $colProcBg $colProcBorder

# Branch 3: Pengurutan (Mid-Right: X=690)
Draw-Arrow $g 620 460 690 500
Draw-Box $g "Pilih Opsi Sortir Dropdown:`nHarga / Rating / Ulasan" 690 535 220 55 $colProcBg $colProcBorder
Draw-Arrow $g 690 563 690 620
Draw-Box $g "Urutkan Array (list.sort):`nAscending / Descending" 690 650 210 50 $colProcBg $colProcBorder

# Branch 4: Klik Ulasan (Right: X=930)
Draw-Arrow $g 700 420 930 420 "Ulas Menu"
Draw-Arrow $g 930 420 930 490
Draw-Box $g "Klik Tombol '💬 Ulas'`npada Kartu Menu" 930 520 200 50 $colSuccessBg $colSuccessBorder
Draw-Arrow $g 930 545 930 620
Draw-Box $g "Buka Modal Ulasan (ReviewModal)`nSesuai ID Menu Terpilih" 930 650 220 50 $colSuccessBg $colSuccessBorder

# Rejoin at Level Y = 870
$penJoin = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(100, 100, 100)), 2
$g.DrawLine($penJoin, 160, 795, 160, 870)
$g.DrawLine($penJoin, 310, 795, 310, 870)
$g.DrawLine($penJoin, 450, 675, 450, 870)
$g.DrawLine($penJoin, 690, 675, 690, 870)
$g.DrawLine($penJoin, 930, 675, 930, 870)
$g.DrawLine($penJoin, 160, 870, 930, 870)

# Go to Stock Check
Draw-Arrow $g 550 870 550 920

# 5. Check Stock Condition
Draw-Diamond $g "Apakah Menu Tersedia?`n(is_available !== false)" 550 970 300 85 $colDecisionBg $colDecisionBorder
Draw-Arrow $g 550 1012 550 1070 "Ya"
Draw-Box $g "Tampilkan Kartu Normal &`nTombol Ulas Dapat Diakses" 550 1100 280 50 $colProcBg $colProcBorder

Draw-Arrow $g 700 970 870 970 "Tidak"
Draw-Arrow $g 870 970 870 1070
Draw-Box $g "Tampilkan Badge 'HABIS HARI INI'`n& Redupkan Kartu (Sold Out)" 870 1100 260 50 $colAlertBg $colAlertBorder

# Final Rejoin to End
$g.DrawLine($penJoin, 550, 1125, 550, 1210)
$g.DrawLine($penJoin, 870, 1125, 870, 1210)
$g.DrawLine($penJoin, 550, 1210, 870, 1210)

Draw-Arrow $g 660 1210 660 1280

# 6. End Pill
Draw-Pill $g "Selesai: Pengunjung Berhasil Menjelajah & Mengulas Menu" 660 1315 450 48 $colStartBg $colStartBorder

$outPath = Join-Path $imgDir "gambar9_flowchart_menu.png"
$bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
Write-Host "gambar9_flowchart_menu.png generated successfully at: $outPath"
