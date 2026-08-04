param(
  [Parameter(Mandatory = $true)]
  [string]$Out,

  [int]$Width = 600,
  [int]$Height = 400,
  [long]$Quality = 72
)

Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"
$GeneratedRoot = "D:\develop\.codex\generated_images"
$Latest = Get-ChildItem -Recurse -File $GeneratedRoot -Filter *.png |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1

if (-not $Latest) {
  throw "No generated image found under $GeneratedRoot"
}

$OutPath = Join-Path (Resolve-Path ".") $Out
$OutDir = Split-Path -Parent $OutPath
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

$src = [System.Drawing.Image]::FromFile($Latest.FullName)
$srcRatio = $src.Width / $src.Height
$dstRatio = $Width / $Height

if ($srcRatio -gt $dstRatio) {
  $cropH = $src.Height
  $cropW = [int]($src.Height * $dstRatio)
  $cropX = [int](($src.Width - $cropW) / 2)
  $cropY = 0
} else {
  $cropW = $src.Width
  $cropH = [int]($src.Width / $dstRatio)
  $cropX = 0
  $cropY = [int](($src.Height - $cropH) / 2)
}

$dst = New-Object System.Drawing.Bitmap $Width, $Height
$g = [System.Drawing.Graphics]::FromImage($dst)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.DrawImage(
  $src,
  (New-Object System.Drawing.Rectangle 0, 0, $Width, $Height),
  (New-Object System.Drawing.Rectangle $cropX, $cropY, $cropW, $cropH),
  [System.Drawing.GraphicsUnit]::Pixel
)

$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
  Where-Object { $_.MimeType -eq "image/jpeg" }
$params = New-Object System.Drawing.Imaging.EncoderParameters 1
$params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), $Quality

$dst.Save($OutPath, $codec, $params)
$g.Dispose()
$dst.Dispose()
$src.Dispose()

Write-Host "Imported $($Latest.FullName) -> $OutPath"
