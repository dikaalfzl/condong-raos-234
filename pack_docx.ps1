param (
    [string]$SourceDir,
    [string]$DestinationDocx
)

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

if (Test-Path $DestinationDocx) {
    Remove-Item $DestinationDocx -Force
}

$fullSource = (Resolve-Path $SourceDir).Path.TrimEnd('\')

$zipStream = [System.IO.File]::Open($DestinationDocx, [System.IO.FileMode]::CreateNew)
$archive = New-Object System.IO.Compression.ZipArchive($zipStream, [System.IO.Compression.ZipArchiveMode]::Create)

$files = Get-ChildItem -Path $fullSource -Recurse -File
foreach ($file in $files) {
    $relativePath = $file.FullName.Substring($fullSource.Length + 1).Replace('\', '/')
    $entry = $archive.CreateEntry($relativePath, [System.IO.Compression.CompressionLevel]::Optimal)
    $entryStream = $entry.Open()
    $fileStream = [System.IO.File]::OpenRead($file.FullName)
    $fileStream.CopyTo($entryStream)
    $fileStream.Dispose()
    $entryStream.Dispose()
}

$archive.Dispose()
$zipStream.Dispose()

Write-Host "Successfully packaged $DestinationDocx"
