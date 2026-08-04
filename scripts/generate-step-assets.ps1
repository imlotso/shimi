param(
  [switch]$Force
)

Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"
$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
$OutRoot = Join-Path $Root "assets/images/steps"
$ManifestPath = Join-Path $env:TEMP "tonight-step-manifest.json"

Push-Location $Root
try {
  node (Join-Path $Root "scripts/build-step-manifest.js") $ManifestPath ($(if ($Force) { "true" } else { "false" }))
} finally {
  Pop-Location
}

$Recipes = Get-Content -Raw -Encoding UTF8 $ManifestPath | ConvertFrom-Json
function Color($hex) {
  return [System.Drawing.ColorTranslator]::FromHtml($hex)
}

function Brush($hex) {
  return New-Object System.Drawing.SolidBrush (Color $hex)
}

function Pen($hex, $width) {
  $p = New-Object System.Drawing.Pen ((Color $hex), $width)
  $p.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $p.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $p.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
  return $p
}

function NewCanvas($w, $h) {
  $bmp = New-Object System.Drawing.Bitmap $w, $h
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.Clear((Color "#f3eadc"))
  return @{ Bitmap = $bmp; Graphics = $g }
}

function SaveJpeg($canvas, $path) {
  New-Item -ItemType Directory -Force -Path (Split-Path $path) | Out-Null
  $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
  $params = New-Object System.Drawing.Imaging.EncoderParameters 1
  $params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), 58L
  $canvas.Bitmap.Save($path, $codec, $params)
  $params.Dispose()
  $canvas.Graphics.Dispose()
  $canvas.Bitmap.Dispose()
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

function FillRound($g, $brush, $x, $y, $w, $h, $r) {
  $path = RoundPath $x $y $w $h $r
  $g.FillPath($brush, $path)
  $path.Dispose()
}

function DrawLeaf($g, $x, $y, $w, $h, $color) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddBezier($x + $w / 2, $y, $x + $w, $y + $h / 5, $x + $w, $y + $h * 0.78, $x + $w / 2, $y + $h)
  $path.AddBezier($x + $w / 2, $y + $h, $x, $y + $h * 0.78, $x, $y + $h / 5, $x + $w / 2, $y)
  $path.CloseFigure()
  $g.FillPath((Brush $color), $path)
  $g.DrawLine((Pen "#e8f7dc" 1), $x + $w / 2, $y + $h * 0.2, $x + $w / 2, $y + $h * 0.86)
  $path.Dispose()
}

function DrawStrip($g, $x, $y, $w, $h, $color, $angle) {
  $state = $g.Save()
  $g.TranslateTransform($x + $w / 2, $y + $h / 2)
  $g.RotateTransform($angle)
  FillRound $g (Brush $color) (-$w / 2) (-$h / 2) $w $h ([Math]::Min($h / 2, 8))
  $g.Restore($state)
}

function DrawShrimp($g, $x, $y, $s) {
  $p = Pen "#e96a43" ([Math]::Max(5, $s / 7))
  $g.DrawArc($p, $x, $y, $s, $s, 20, 260)
  $p.Dispose()
  $g.FillEllipse((Brush "#ffd5c6"), $x + $s * 0.56, $y + $s * 0.35, $s * 0.14, $s * 0.14)
}

function DrawShell($g, $x, $y, $s, $color) {
  $g.FillEllipse((Brush $color), $x, $y, $s, $s * 0.62)
  $g.DrawArc((Pen "#8b6d51" 2), $x + 3, $y + 3, $s - 6, $s * 0.55, 180, 180)
  $g.DrawLine((Pen "#ffffff" 1), $x + $s * 0.2, $y + $s * 0.25, $x + $s * 0.75, $y + $s * 0.28)
}

function DrawFood($g, $id, $x, $y, $s, $rng) {
  $angle = $rng.Next(-22, 22)
  switch -Regex ($id) {
    "egg|duck_egg|quail_egg|salted_duck_egg" {
      $g.FillEllipse((Brush "#fff2c4"), $x, $y, $s, $s * 0.72)
      $g.FillEllipse((Brush "#f5c246"), $x + $s * 0.32, $y + $s * 0.18, $s * 0.32, $s * 0.3)
    }
    "tomato|strawberry|watermelon|cherry" {
      FillRound $g (Brush "#e64c36") $x $y ($s * 1.05) ($s * 0.66) 7
      $g.FillEllipse((Brush "#ff8a72"), $x + $s * 0.18, $y + $s * 0.12, $s * 0.25, $s * 0.18)
    }
    "broccoli|cabbage|napa|lettuce|bok_choy|spinach|youmai|rapeseed|chive|celery|cilantro|long_bean|mungbean|soybean|scallion" {
      DrawLeaf $g $x $y ($s * 0.72) ($s * 1.08) "#42aa58"
      DrawLeaf $g ($x + $s * 0.38) ($y + $s * 0.1) ($s * 0.62) ($s * 0.9) "#58bf67"
    }
    "carrot|sweet_potato|pumpkin" {
      DrawStrip $g $x $y ($s * 1.1) ($s * 0.34) "#f18b32" $angle
    }
    "potato|yam|lotus|radish|rice_cake" {
      FillRound $g (Brush "#e4bd72") $x $y ($s * 0.9) ($s * 0.62) 8
      $g.FillEllipse((Brush "#f4d796"), $x + $s * 0.15, $y + $s * 0.1, $s * 0.34, $s * 0.22)
    }
    "mushroom|enoki|black_fungus" {
      $g.FillEllipse((Brush "#b7784b"), $x, $y, $s, $s * 0.56)
      FillRound $g (Brush "#f1ddc5") ($x + $s * 0.35) ($y + $s * 0.38) ($s * 0.28) ($s * 0.5) 5
    }
    "onion" {
      $g.FillEllipse((Brush "#9d559d"), $x, $y, $s, $s * 0.72)
      $g.DrawArc((Pen "#dfb0dc" 2), $x + 5, $y + 5, $s - 10, $s * 0.6, 80, 180)
    }
    "garlic" {
      $g.FillEllipse((Brush "#f2dfc4"), $x, $y, $s * 0.78, $s * 0.58)
      $g.DrawLine((Pen "#cbb997" 1), $x + $s * 0.38, $y + 4, $x + $s * 0.38, $y + $s * 0.5)
    }
    "ginger" {
      FillRound $g (Brush "#d89a45") $x $y ($s * 0.95) ($s * 0.42) 8
      FillRound $g (Brush "#efbd6f") ($x + $s * 0.35) ($y - $s * 0.12) ($s * 0.58) ($s * 0.38) 8
    }
    "shrimp|prawn" {
      DrawShrimp $g $x $y $s
    }
    "clam|scallop|oyster" {
      DrawShell $g $x $y $s "#dcb484"
    }
    "crab|crayfish" {
      $g.FillEllipse((Brush "#d95038"), $x, $y, $s * 0.9, $s * 0.58)
      $g.DrawLine((Pen "#d95038" 3), $x + 4, $y + $s * 0.28, $x - 10, $y + $s * 0.1)
      $g.DrawLine((Pen "#d95038" 3), $x + $s * 0.78, $y + $s * 0.28, $x + $s, $y + $s * 0.08)
    }
    "squid" {
      $g.DrawEllipse((Pen "#f0c6b2" 5), $x, $y, $s * 0.7, $s * 0.52)
      $g.DrawLine((Pen "#f0c6b2" 3), $x + $s * 0.35, $y + $s * 0.46, $x + $s * 0.2, $y + $s * 0.82)
      $g.DrawLine((Pen "#f0c6b2" 3), $x + $s * 0.35, $y + $s * 0.46, $x + $s * 0.55, $y + $s * 0.82)
    }
    "fish|whole_fish" {
      FillRound $g (Brush "#f3d0bf") $x $y ($s * 1.05) ($s * 0.45) 12
      $tail = [System.Drawing.Point[]]@(
        (New-Object System.Drawing.Point ($x + $s), ($y + $s * 0.22)),
        (New-Object System.Drawing.Point ($x + $s * 1.22), ($y + $s * 0.04)),
        (New-Object System.Drawing.Point ($x + $s * 1.22), ($y + $s * 0.44))
      )
      $g.FillPolygon((Brush "#eaa98e"), $tail)
    }
    "beef|pork|loin|ribs|trotter|lamb|duck|ham|chicken" {
      DrawStrip $g $x $y ($s * 1.1) ($s * 0.42) "#c8644e" $angle
      $g.DrawBezier((Pen "#ffd1c5" 2), $x + 4, $y + $s * 0.18, $x + $s * 0.35, $y, $x + $s * 0.62, $y + $s * 0.42, $x + $s * 0.95, $y + $s * 0.2)
    }
    "tofu|yuba|soy|fried_tofu|soft_tofu|firm_tofu|tofu_skin|tofu_dry" {
      FillRound $g (Brush "#f2e6c6") $x $y ($s * 0.78) ($s * 0.62) 5
      $g.DrawLine((Pen "#d7c295" 1), $x + 4, $y + $s * 0.34, $x + $s * 0.7, $y + $s * 0.34)
    }
    "rice|noodle|vermicelli|flour|mantou|baozi|dumpling" {
      for ($i = 0; $i -lt 5; $i++) {
        DrawStrip $g ($x + $rng.Next(-6, 8)) ($y + $rng.Next(-6, 8)) ($s * 0.95) 4 "#fff4d9" ($angle + $i * 8)
      }
    }
    default {
      $g.FillEllipse((Brush "#efb45f"), $x, $y, $s * 0.72, $s * 0.56)
    }
  }
}

function DrawFoodSet($g, $ids, $rng, $x1, $x2, $y1, $y2, $count) {
  if (-not $ids -or $ids.Count -eq 0) { $ids = @("tomato", "egg") }
  for ($i = 0; $i -lt $count; $i++) {
    $id = $ids[$i % $ids.Count]
    DrawFood $g $id ($rng.Next($x1, $x2)) ($rng.Next($y1, $y2)) ($rng.Next(22, 34)) $rng
  }
}

function DrawBoard($g) {
  FillRound $g (Brush "#e6bd83") 34 40 132 72 14
  $g.DrawLine((Pen "#d29e61" 2), 48, 54, 148, 54)
  $g.DrawLine((Pen "#11100e" 4), 138, 28, 188, 58)
  $g.DrawLine((Pen "#e9e6df" 2), 146, 34, 184, 56)
}

function DrawPan($g) {
  $g.FillEllipse((Brush "#2b2c2b"), 38, 52, 134, 66)
  $g.FillEllipse((Brush "#414442"), 50, 60, 110, 48)
  $g.DrawLine((Pen "#2b2c2b" 12), 158, 78, 210, 62)
}

function DrawPot($g, $steam) {
  FillRound $g (Brush "#4a4d4d") 42 58 120 62 16
  $g.FillEllipse((Brush "#dfeee8"), 48, 48, 108, 38)
  $g.FillEllipse((Brush "#f2d06c"), 55, 55, 94, 28)
  if ($steam) {
    $g.DrawBezier((Pen "#ffffff" 2), 72, 40, 62, 24, 82, 22, 74, 8)
    $g.DrawBezier((Pen "#ffffff" 2), 116, 40, 104, 24, 128, 24, 118, 8)
  }
}

function DrawPlate($g) {
  $g.FillEllipse((Brush "#d9c9ad"), 40, 100, 134, 18)
  $g.FillEllipse((Brush "#fffdf7"), 34, 36, 140, 78)
  $g.DrawEllipse((Pen "#e1d2bd" 3), 48, 46, 112, 58)
}

function DrawBowl($g) {
  $g.FillEllipse((Brush "#d9c9ad"), 52, 100, 112, 16)
  $g.FillEllipse((Brush "#fffdf7"), 44, 44, 128, 70)
  $g.FillEllipse((Brush "#f0e4ce"), 56, 54, 104, 46)
}

function DrawFinal($g, $assetPath) {
  $relative = $assetPath.TrimStart("/").Replace("/", [System.IO.Path]::DirectorySeparatorChar)
  $fullPath = Join-Path $Root $relative
  if (Test-Path $fullPath) {
    $img = [System.Drawing.Image]::FromFile($fullPath)
    $ratio = [Math]::Max(200 / $img.Width, 136 / $img.Height)
    $w = [int]($img.Width * $ratio)
    $h = [int]($img.Height * $ratio)
    $x = [int]((200 - $w) / 2)
    $y = [int]((136 - $h) / 2)
    $g.DrawImage($img, $x, $y, $w, $h)
    $img.Dispose()
  } else {
    DrawPlate $g
  }
}

function DrawStep($recipe, $step, $outPath) {
  $canvas = NewCanvas 200 136
  $g = $canvas.Graphics
  $rng = New-Object System.Random ([Math]::Abs(($recipe.id + "-" + $step.index).GetHashCode()))
  $g.FillRectangle((Brush "#f4eddf"), 0, 0, 200, 136)
  $g.FillEllipse((Brush "#eee1cf"), -18, 100, 236, 48)
  $ids = @($step.ingredientIds)

  switch ($step.action) {
    "final" {
      DrawFinal $g $recipe.image
    }
    "prep" {
      DrawBoard $g
      DrawFoodSet $g $ids $rng 44 126 52 84 5
    }
    "beat" {
      DrawBowl $g
      DrawFoodSet $g $ids $rng 70 132 54 82 5
      $g.DrawLine((Pen "#7a5a3e" 3), 120, 36, 166, 88)
      $g.DrawLine((Pen "#7a5a3e" 3), 132, 36, 174, 82)
    }
    "pan" {
      DrawPan $g
      DrawFoodSet $g $ids $rng 58 138 64 92 8
      $g.DrawArc((Pen "#f8d38b" 2), 66, 42, 38, 18, 15, 145)
      $g.DrawArc((Pen "#f8d38b" 2), 104, 42, 44, 18, 15, 145)
    }
    "pot" {
      DrawPot $g $true
      DrawFoodSet $g $ids $rng 62 132 58 82 8
    }
    "steam" {
      DrawPot $g $true
      $g.DrawLine((Pen "#b88a54" 2), 54, 70, 150, 70)
      $g.DrawLine((Pen "#b88a54" 2), 54, 82, 150, 82)
      DrawFoodSet $g $ids $rng 62 132 56 78 6
    }
    "mix" {
      DrawPlate $g
      DrawFoodSet $g $ids $rng 56 138 52 86 8
      $g.DrawLine((Pen "#7a5a3e" 3), 146, 38, 116, 92)
    }
    default {
      DrawPlate $g
      DrawFoodSet $g $ids $rng 56 138 52 86 7
    }
  }

  SaveJpeg $canvas $outPath
}

$made = 0
foreach ($recipe in $Recipes) {
  foreach ($step in $recipe.steps) {
    $outDir = Join-Path $OutRoot $recipe.id
    $outPath = Join-Path $outDir "step-$($step.index).jpg"
    if ($Force -or -not (Test-Path $outPath)) {
      DrawStep $recipe $step $outPath
      $made++
    }
  }
}

Write-Host "Generated $made step images."
