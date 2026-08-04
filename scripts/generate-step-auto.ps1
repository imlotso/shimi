param(
  [string]$ManifestPath = "scripts/.generated/step-auto-manifest.json",
  [string]$OutputRoot = "packages/detail/assets/images/step-auto",
  [int]$Width = 352,
  [int]$Height = 212,
  [long]$Quality = 82
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

function ColorFromHex($hex) {
  return [System.Drawing.ColorTranslator]::FromHtml($hex)
}

function BrushOf($hex) {
  return New-Object System.Drawing.SolidBrush (ColorFromHex $hex)
}

function BrushA($r, $g, $b, $a) {
  return New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb($a, $r, $g, $b))
}

function PenOf($hex, $width) {
  $pen = New-Object System.Drawing.Pen ((ColorFromHex $hex), $width)
  $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
  return $pen
}

function AssetPath($imagePath) {
  if (-not $imagePath) { return "" }
  return Join-Path (Get-Location) ($imagePath.TrimStart("/") -replace "/", "\")
}

function RoundPath($x, $y, $w, $h, $r) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $r * 2
  $path.AddArc($x, $y, $d, $d, 180, 90)
  $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $path.CloseFigure()
  return $path
}

function FillRoundRect($g, $brush, $x, $y, $w, $h, $r) {
  $path = RoundPath $x $y $w $h $r
  $g.FillPath($brush, $path)
  $path.Dispose()
}

function StrokeRoundRect($g, $pen, $x, $y, $w, $h, $r) {
  $path = RoundPath $x $y $w $h $r
  $g.DrawPath($pen, $path)
  $path.Dispose()
}

function DrawImageCover($g, $path, $x, $y, $w, $h) {
  if (-not (Test-Path $path)) { return $false }
  $img = [System.Drawing.Image]::FromFile((Resolve-Path $path))
  $srcRatio = $img.Width / $img.Height
  $dstRatio = $w / $h
  if ($srcRatio -gt $dstRatio) {
    $cropH = $img.Height
    $cropW = [int]($img.Height * $dstRatio)
    $cropX = [int](($img.Width - $cropW) / 2)
    $cropY = 0
  } else {
    $cropW = $img.Width
    $cropH = [int]($img.Width / $dstRatio)
    $cropX = 0
    $cropY = [int](($img.Height - $cropH) / 2)
  }
  $g.DrawImage(
    $img,
    (New-Object System.Drawing.Rectangle $x, $y, $w, $h),
    (New-Object System.Drawing.Rectangle $cropX, $cropY, $cropW, $cropH),
    [System.Drawing.GraphicsUnit]::Pixel
  )
  $img.Dispose()
  return $true
}

function DrawRoundImage($g, $imagePath, $x, $y, $w, $h, $radius) {
  $path = RoundPath $x $y $w $h $radius
  $state = $g.Save()
  $g.SetClip($path)
  $ok = DrawImageCover $g (AssetPath $imagePath) $x $y $w $h
  if (-not $ok) {
    FillRoundRect $g (BrushOf "#e8c990") $x $y $w $h $radius
  }
  $g.Restore($state)
  $g.DrawPath((PenOf "#fff8ef" 3), $path)
  $path.Dispose()
}

function DrawIngredientGroup($g, $ingredients, $boxes) {
  $count = [Math]::Min($ingredients.Count, $boxes.Count)
  for ($i = 0; $i -lt $count; $i++) {
    if (-not $ingredients[$i] -or -not $ingredients[$i].image) { continue }
    $b = $boxes[$i]
    DrawRoundImage $g $ingredients[$i].image $b[0] $b[1] $b[2] $b[3] 16
  }
}

function DrawCounter($g) {
  $g.Clear((ColorFromHex "#efe5d7"))
  $g.FillRectangle((BrushOf "#f7efe3"), 0, 0, 352, 212)
  $g.FillRectangle((BrushA 120 86 52 20), 0, 164, 352, 48)
}

function DrawPrepScene($g, $ingredients) {
  DrawCounter $g
  FillRoundRect $g (BrushOf "#d19a62") 24 24 304 154 24
  StrokeRoundRect $g (PenOf "#a86f3e" 3) 24 24 304 154 24
  $g.DrawLine((PenOf "#f0c08a" 4), 52, 52, 292, 52)
  $g.DrawLine((PenOf "#b87945" 4), 52, 150, 292, 150)
  $g.DrawLine((PenOf "#171511" 10), 238, 38, 320, 72)
  $g.DrawLine((PenOf "#f0eee7" 4), 242, 40, 300, 64)
  DrawIngredientGroup $g $ingredients @(
    @(44, 58, 86, 90),
    @(118, 44, 98, 110),
    @(210, 68, 72, 76),
    @(272, 102, 44, 46)
  )
}

function DrawMixScene($g, $ingredients, $isSteam) {
  DrawCounter $g
  $g.FillEllipse((BrushA 83 58 35 28), 46, 158, 260, 28)
  $g.FillEllipse((BrushOf "#d8c8b6"), 42, 58, 268, 104)
  $g.FillEllipse((BrushOf "#fff8ec"), 60, 36, 232, 106)
  $fill = if ($isSteam) { "#ecd079" } else { "#f0c84c" }
  $g.FillEllipse((BrushOf $fill), 92, 76, 168, 48)
  if ($isSteam) {
    $g.DrawArc((PenOf "#ffffff" 5), 82, 24, 42, 40, 210, 125)
    $g.DrawArc((PenOf "#ffffff" 5), 230, 22, 46, 46, 210, 125)
  } else {
    $g.DrawLine((PenOf "#171511" 8), 226, 36, 318, 68)
    $g.DrawLine((PenOf "#171511" 8), 218, 58, 306, 92)
  }
  DrawIngredientGroup $g $ingredients @(
    @(76, 62, 74, 72),
    @(190, 64, 70, 68),
    @(136, 108, 60, 50)
  )
}

function DrawBlanchScene($g, $ingredients) {
  DrawCounter $g
  FillRoundRect $g (BrushOf "#424a48") 50 84 252 88 24
  $g.FillEllipse((BrushOf "#dbe8e3"), 62, 42, 228, 82)
  $g.FillEllipse((BrushOf "#f2fbf7"), 78, 62, 196, 54)
  $g.DrawArc((PenOf "#ffffff" 5), 88, 26, 48, 44, 210, 120)
  $g.DrawArc((PenOf "#ffffff" 5), 214, 24, 48, 50, 210, 120)
  DrawIngredientGroup $g $ingredients @(
    @(86, 58, 82, 76),
    @(154, 68, 72, 64),
    @(214, 66, 62, 58)
  )
}

function DrawPotScene($g, $ingredients) {
  DrawCounter $g
  FillRoundRect $g (BrushOf "#44443f") 42 82 268 96 24
  $g.FillEllipse((BrushOf "#d8d0bf"), 58, 46, 236, 82)
  $g.FillEllipse((BrushOf "#cf9957"), 78, 66, 196, 50)
  DrawIngredientGroup $g $ingredients @(
    @(82, 62, 76, 68),
    @(150, 72, 66, 58),
    @(210, 70, 58, 52)
  )
}

function DrawPanScene($g, $ingredients, $stage) {
  DrawCounter $g
  $g.FillEllipse((BrushA 0 0 0 55), 42, 154, 226, 28)
  $g.FillEllipse((BrushOf "#151514"), 36, 78, 246, 92)
  $g.DrawLine((PenOf "#151514" 14), 258, 126, 340, 96)
  $g.FillEllipse((BrushOf "#55422c"), 58, 92, 204, 62)
  if ($stage -eq "aromatic") {
    $g.FillEllipse((BrushOf "#e0bd65"), 100, 112, 28, 18)
    $g.FillEllipse((BrushOf "#f0d88f"), 142, 106, 26, 17)
  }
  DrawIngredientGroup $g $ingredients @(
    @(62, 80, 84, 76),
    @(136, 92, 74, 66),
    @(202, 96, 58, 54)
  )
}

function DrawSeasoningScene($g, $ingredients) {
  DrawPanScene $g $ingredients "pan"
  FillRoundRect $g (BrushA 255 252 244 235) 30 30 118 64 16
  $g.FillEllipse((BrushOf "#6b351d"), 58, 56, 60, 18)
  $g.DrawLine((PenOf "#171511" 7), 142, 54, 238, 22)
}

function DrawPlateScene($g, $ingredients) {
  DrawCounter $g
  $g.FillEllipse((BrushA 70 45 25 30), 52, 150, 248, 30)
  $g.FillEllipse((BrushOf "#ddd3c5"), 48, 66, 256, 102)
  $g.FillEllipse((BrushOf "#fff8ec"), 66, 50, 220, 102)
  DrawIngredientGroup $g $ingredients @(
    @(82, 72, 84, 76),
    @(166, 78, 74, 66),
    @(126, 120, 62, 48)
  )
}

function DrawStep($recipe, $step, $outputPath, $width, $height, $quality) {
  $bmp = New-Object System.Drawing.Bitmap $width, $height
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.ScaleTransform(($width / 352.0), ($height / 212.0))
  $g.Clear((ColorFromHex "#f3eadc"))

  if ($step.action -eq "seasoning") {
    DrawSeasoningScene $g $recipe.image $step.ingredients
  } elseif ($step.action -eq "prep") {
    DrawPrepScene $g $step.ingredients
  } elseif ($step.action -eq "mix") {
    DrawMixScene $g $step.ingredients $false
  } elseif ($step.action -eq "steam") {
    DrawMixScene $g $step.ingredients $true
  } elseif ($step.action -eq "blanch") {
    DrawBlanchScene $g $step.ingredients
  } elseif ($step.action -eq "pot") {
    DrawPotScene $g $step.ingredients
  } elseif ($step.action -eq "plate") {
    DrawPlateScene $g $step.ingredients
  } elseif ($step.action -eq "pan" -or $step.action -eq "aromatic") {
    DrawPanScene $g $step.ingredients $step.action
  } else {
    DrawPrepScene $g $step.ingredients
  }

  $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
    Where-Object { $_.MimeType -eq "image/jpeg" }
  $params = New-Object System.Drawing.Imaging.EncoderParameters 1
  $params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), $quality
  New-Item -ItemType Directory -Force (Split-Path $outputPath) | Out-Null
  $bmp.Save($outputPath, $codec, $params)
  $params.Dispose()
  $g.Dispose()
  $bmp.Dispose()
}

$manifest = Get-Content -Raw -Encoding UTF8 $ManifestPath | ConvertFrom-Json
$made = 0
foreach ($recipe in $manifest) {
  foreach ($step in $recipe.steps) {
    if ($step.action -eq "final") { continue }
    $out = Join-Path $OutputRoot (Join-Path $recipe.id ("step-{0}.jpg" -f ($step.index + 1)))
    DrawStep $recipe $step $out $Width $Height $Quality
    $made += 1
  }
}

Write-Host "Generated $made step thumbnails."
