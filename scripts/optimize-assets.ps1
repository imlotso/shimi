Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"

function Save-JpegResized {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Path,

    [Parameter(Mandatory = $true)]
    [int]$Width,

    [Parameter(Mandatory = $true)]
    [int]$Height,

    [Parameter(Mandatory = $true)]
    [long]$Quality
  )

  $fullPath = Resolve-Path $Path
  $tempPath = "$fullPath.tmp.jpg"

  $src = [System.Drawing.Image]::FromFile($fullPath)
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
  $graphics = [System.Drawing.Graphics]::FromImage($dst)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.DrawImage(
    $src,
    (New-Object System.Drawing.Rectangle 0, 0, $Width, $Height),
    (New-Object System.Drawing.Rectangle $cropX, $cropY, $cropW, $cropH),
    [System.Drawing.GraphicsUnit]::Pixel
  )

  $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
    Where-Object { $_.MimeType -eq "image/jpeg" }
  $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters 1
  $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), $Quality

  $dst.Save($tempPath, $codec, $encoderParams)
  $graphics.Dispose()
  $dst.Dispose()
  $src.Dispose()

  Move-Item -Force -LiteralPath $tempPath -Destination $fullPath
}

Get-ChildItem -Recurse -File "assets/images/recipes" -Filter *.jpg | ForEach-Object {
  Save-JpegResized -Path $_.FullName -Width 360 -Height 240 -Quality 38
}

Get-ChildItem -Recurse -File "assets/images/ingredients" -Filter *.jpg | ForEach-Object {
  Save-JpegResized -Path $_.FullName -Width 88 -Height 88 -Quality 46
}

Get-ChildItem -Recurse -File "assets/images/steps" -Filter *.jpg | ForEach-Object {
  Save-JpegResized -Path $_.FullName -Width 200 -Height 136 -Quality 58
}

Write-Host "Optimized recipe, ingredient, and step JPG assets."
