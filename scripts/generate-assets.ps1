throw "Deprecated: the app now uses image_gen-generated JPG assets. Do not run this legacy geometric PNG generator."

Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"

$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
$IngredientDir = Join-Path $Root "assets/images/ingredients"
$RecipeDir = Join-Path $Root "assets/images/recipes"
$BrandDir = Join-Path $Root "assets/images/brand"
$IconDir = Join-Path $Root "assets/icons"

New-Item -ItemType Directory -Force -Path $IngredientDir, $RecipeDir, $BrandDir, $IconDir | Out-Null

function ColorFromHex($hex) {
  return [System.Drawing.ColorTranslator]::FromHtml($hex)
}

function Brush($hex) {
  return New-Object System.Drawing.SolidBrush (ColorFromHex $hex)
}

function Pen($hex, $width) {
  $p = New-Object System.Drawing.Pen ((ColorFromHex $hex), $width)
  $p.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $p.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $p.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
  return $p
}

function NewCanvas($w, $h, $transparent = $false) {
  $bmp = New-Object System.Drawing.Bitmap $w, $h
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  if ($transparent) {
    $g.Clear([System.Drawing.Color]::Transparent)
  }
  return @{ Bitmap = $bmp; Graphics = $g }
}

function SaveCanvas($canvas, $path) {
  $canvas.Bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
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
  $path.Dispose()
}

function SeedFromId($id) {
  $sum = 17
  foreach ($ch in $id.ToCharArray()) {
    $sum = ($sum * 31 + [int][char]$ch) -band 0x7fffffff
  }
  return $sum
}

function DrawTiltedStrip($g, $x, $y, $w, $h, $color) {
  $state = $g.Save()
  $g.TranslateTransform($x + $w / 2, $y + $h / 2)
  $g.RotateTransform((($x + $y) % 38) - 19)
  FillRound $g (Brush $color) (-$w / 2) (-$h / 2) $w $h ([Math]::Min($h / 2, 18))
  $g.Restore($state)
}

function DrawTofuBlock($g, $x, $y, $w, $h) {
  FillRound $g (Brush "#F5E7C8") $x $y $w $h 8
  $g.DrawLine((Pen "#D7C59A" 2), $x + 6, $y + $h - 8, $x + $w - 6, $y + $h - 8)
}

function DrawBroccoliFloret($g, $x, $y, $s) {
  $g.FillRectangle((Brush "#77A85A"), $x + $s * 0.42, $y + $s * 0.48, $s * 0.18, $s * 0.42)
  $g.FillEllipse((Brush "#2E8B43"), $x, $y + $s * 0.22, $s * 0.42, $s * 0.42)
  $g.FillEllipse((Brush "#44B35A"), $x + $s * 0.26, $y, $s * 0.46, $s * 0.46)
  $g.FillEllipse((Brush "#2F9E55"), $x + $s * 0.58, $y + $s * 0.24, $s * 0.38, $s * 0.38)
}

function DrawShrimpCurl($g, $x, $y, $s) {
  $p = Pen "#F26D45" ([Math]::Max(8, $s / 5))
  $g.DrawArc($p, $x, $y, $s, $s, 20, 260)
  $p.Dispose()
  $g.FillEllipse((Brush "#FFD0BE"), $x + $s * 0.58, $y + $s * 0.34, $s * 0.16, $s * 0.16)
}

function DrawMushroomPiece($g, $x, $y, $s) {
  $g.FillEllipse((Brush "#B67A4D"), $x, $y, $s, $s * 0.58)
  FillRound $g (Brush "#F0DCC4") ($x + $s * 0.35) ($y + $s * 0.38) ($s * 0.28) ($s * 0.48) 8
}

function DrawLeafPiece($g, $x, $y, $w, $h, $color) {
  DrawLeaf $g $x $y $w $h $color
  $g.DrawLine((Pen "#E9F8DD" 2), $x + $w / 2, $y + $h * 0.18, $x + $w / 2, $y + $h * 0.88)
}

function DrawRiceGrains($g, $rng, $count, $x1, $x2, $y1, $y2) {
  for ($i = 0; $i -lt $count; $i++) {
    $x = $rng.Next($x1, $x2)
    $y = $rng.Next($y1, $y2)
    $g.FillEllipse((Brush "#FFFDF7"), $x, $y, 18, 9)
    if ($i % 3 -eq 0) {
      $g.FillEllipse((Brush "#F1E7D8"), $x + 3, $y + 2, 12, 5)
    }
  }
}

function DrawPlateBase($g, $palette, $rng) {
  $shadow = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(44, 23, 23, 22))
  $g.FillEllipse($shadow, 94, 360, 532, 54)
  $shadow.Dispose()
  $g.FillEllipse((Brush "#FFFDF7"), 78, 78, 562, 316)
  $g.DrawEllipse((Pen "#E6DAC7" 8), 102, 104, 514, 264)
  $g.FillEllipse((Brush "#F8F1E5"), 146, 134, 426, 204)
}

function DrawBowlBase($g, $palette, $rng, $liquid) {
  $shadow = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(44, 23, 23, 22))
  $g.FillEllipse($shadow, 126, 356, 468, 52)
  $shadow.Dispose()
  $g.FillEllipse((Brush "#FFFDF7"), 120, 92, 480, 260)
  $g.FillEllipse((Brush "#EAE0CF"), 152, 122, 416, 190)
  $g.FillEllipse((Brush $liquid), 166, 138, 388, 164)
  $front = New-Object System.Drawing.Drawing2D.GraphicsPath
  $front.AddLine(126, 230, 594, 230)
  $front.AddBezier(594, 230, 560, 352, 160, 352, 126, 230)
  $front.CloseFigure()
  $g.FillPath((Brush "#FFFDF7"), $front)
  $g.DrawBezier((Pen "#E1D5C1" 8), 594, 230, 560, 352, 160, 352, 126, 230)
  $front.Dispose()
}

function DrawRecipeItems($g, $id, $rng) {
  switch ($id) {
    "tomato-egg" {
      for ($i = 0; $i -lt 9; $i++) { $g.FillEllipse((Brush "#F5C84C"), $rng.Next(205, 450), $rng.Next(175, 280), $rng.Next(54, 92), $rng.Next(30, 58)) }
      for ($i = 0; $i -lt 7; $i++) { FillRound $g (Brush "#F04E37") $rng.Next(190, 486) $rng.Next(168, 286) $rng.Next(42, 70) $rng.Next(30, 52) 14 }
    }
    "green-pepper-potato" {
      for ($i = 0; $i -lt 22; $i++) { DrawTiltedStrip $g $rng.Next(176, 510) $rng.Next(166, 296) $rng.Next(66, 126) 16 "#E4B757" }
      for ($i = 0; $i -lt 10; $i++) { DrawTiltedStrip $g $rng.Next(182, 516) $rng.Next(154, 296) $rng.Next(48, 96) 18 "#2F9E55" }
    }
    "broccoli-chicken" {
      for ($i = 0; $i -lt 7; $i++) { DrawBroccoliFloret $g $rng.Next(180, 495) $rng.Next(148, 270) $rng.Next(48, 70) }
      for ($i = 0; $i -lt 9; $i++) { DrawTiltedStrip $g $rng.Next(192, 490) $rng.Next(172, 294) $rng.Next(58, 98) 30 "#F2B49E" }
    }
    "shrimp-steamed-egg" {
      $g.FillEllipse((Brush "#F8D76F"), 164, 140, 392, 168)
      for ($i = 0; $i -lt 7; $i++) { DrawShrimpCurl $g $rng.Next(198, 482) $rng.Next(164, 252) 56 }
    }
    "cucumber-tofu-egg" {
      for ($i = 0; $i -lt 8; $i++) { DrawTofuBlock $g $rng.Next(190, 490) $rng.Next(158, 278) 54 42 }
      for ($i = 0; $i -lt 8; $i++) { $g.FillEllipse((Brush "#2F9E55"), $rng.Next(176, 520), $rng.Next(154, 284), 58, 24) }
      for ($i = 0; $i -lt 4; $i++) { $g.FillEllipse((Brush "#F7C949"), $rng.Next(210, 474), $rng.Next(160, 278), 46, 34) }
    }
    "chicken-corn-salad" {
      for ($i = 0; $i -lt 12; $i++) { DrawLeafPiece $g $rng.Next(162, 520) $rng.Next(138, 288) 58 82 "#4CBF63" }
      for ($i = 0; $i -lt 9; $i++) { DrawTiltedStrip $g $rng.Next(206, 496) $rng.Next(162, 292) 76 26 "#F2B49E" }
      for ($i = 0; $i -lt 22; $i++) { $g.FillEllipse((Brush "#F5C84C"), $rng.Next(178, 538), $rng.Next(154, 306), 16, 16) }
    }
    "garlic-lettuce" {
      for ($i = 0; $i -lt 18; $i++) { DrawLeafPiece $g $rng.Next(160, 520) $rng.Next(132, 292) 72 96 "#45B85B" }
      for ($i = 0; $i -lt 10; $i++) { $g.FillEllipse((Brush "#F1E0C6"), $rng.Next(210, 500), $rng.Next(156, 294), 16, 12) }
    }
    "tomato-beef-soup" {
      for ($i = 0; $i -lt 9; $i++) { FillRound $g (Brush "#C8443B") $rng.Next(190, 496) $rng.Next(160, 276) $rng.Next(54, 86) 28 14 }
      for ($i = 0; $i -lt 8; $i++) { $g.FillEllipse((Brush "#F04E37"), $rng.Next(184, 510), $rng.Next(150, 282), 58, 42) }
    }
    "mushroom-egg-soup" {
      for ($i = 0; $i -lt 8; $i++) { DrawMushroomPiece $g $rng.Next(188, 500) $rng.Next(154, 276) 54 }
      for ($i = 0; $i -lt 10; $i++) { DrawTiltedStrip $g $rng.Next(184, 500) $rng.Next(162, 282) 84 18 "#F7C949" }
    }
    "pan-chicken-veggie" {
      FillRound $g (Brush "#EAA279") 220 162 188 96 40
      $g.DrawBezier((Pen "#D17D5F" 5), 244, 206, 286, 178, 338, 238, 382, 202)
      for ($i = 0; $i -lt 5; $i++) { DrawBroccoliFloret $g $rng.Next(400, 520) $rng.Next(150, 260) 50 }
      for ($i = 0; $i -lt 5; $i++) { DrawTiltedStrip $g $rng.Next(170, 430) $rng.Next(246, 298) 72 18 "#FF8F45" }
    }
    "homestyle-tofu" {
      for ($i = 0; $i -lt 13; $i++) { DrawTofuBlock $g $rng.Next(184, 506) $rng.Next(150, 292) 58 44 }
      for ($i = 0; $i -lt 7; $i++) { DrawTiltedStrip $g $rng.Next(190, 508) $rng.Next(160, 288) 72 18 "#2F9E55" }
      for ($i = 0; $i -lt 12; $i++) { $g.FillEllipse((Brush "#C8443B"), $rng.Next(180, 520), $rng.Next(154, 294), 18, 18) }
    }
    "onion-beef" {
      for ($i = 0; $i -lt 12; $i++) { DrawTiltedStrip $g $rng.Next(178, 510) $rng.Next(150, 292) $rng.Next(76, 118) 24 "#C8443B" }
      for ($i = 0; $i -lt 9; $i++) { DrawTiltedStrip $g $rng.Next(180, 510) $rng.Next(150, 286) 90 14 "#9D4D9E" }
    }
    "mushroom-greens" {
      for ($i = 0; $i -lt 9; $i++) { DrawMushroomPiece $g $rng.Next(184, 502) $rng.Next(150, 274) 58 }
      for ($i = 0; $i -lt 10; $i++) { DrawLeafPiece $g $rng.Next(170, 516) $rng.Next(144, 288) 54 84 "#3DAA55" }
    }
    "minced-pork-tofu" {
      for ($i = 0; $i -lt 12; $i++) { DrawTofuBlock $g $rng.Next(184, 502) $rng.Next(150, 292) 58 44 }
      for ($i = 0; $i -lt 22; $i++) { $g.FillEllipse((Brush "#D9655B"), $rng.Next(180, 530), $rng.Next(148, 302), 22, 16) }
    }
    "potato-chicken" {
      for ($i = 0; $i -lt 9; $i++) { FillRound $g (Brush "#DCA34B") $rng.Next(184, 506) $rng.Next(152, 286) 62 44 14 }
      for ($i = 0; $i -lt 9; $i++) { FillRound $g (Brush "#E7A062") $rng.Next(190, 510) $rng.Next(154, 288) 68 42 18 }
    }
    "beef-fried-rice" {
      DrawRiceGrains $g $rng 96 170 536 146 304
      for ($i = 0; $i -lt 10; $i++) { FillRound $g (Brush "#C8443B") $rng.Next(190, 500) $rng.Next(158, 286) 42 26 8 }
      for ($i = 0; $i -lt 8; $i++) { $g.FillEllipse((Brush "#F7C949"), $rng.Next(190, 510), $rng.Next(158, 286), 34, 24) }
    }
    "shrimp-broccoli" {
      for ($i = 0; $i -lt 8; $i++) { DrawShrimpCurl $g $rng.Next(184, 500) $rng.Next(150, 276) 58 }
      for ($i = 0; $i -lt 7; $i++) { DrawBroccoliFloret $g $rng.Next(180, 500) $rng.Next(150, 278) 56 }
    }
    "corn-egg-rice" {
      DrawRiceGrains $g $rng 104 170 536 146 304
      for ($i = 0; $i -lt 28; $i++) { $g.FillEllipse((Brush "#F5C84C"), $rng.Next(180, 528), $rng.Next(150, 300), 16, 16) }
      for ($i = 0; $i -lt 8; $i++) { $g.FillEllipse((Brush "#F7C949"), $rng.Next(190, 510), $rng.Next(158, 286), 42, 26) }
    }
    "carrot-beef-stew" {
      for ($i = 0; $i -lt 10; $i++) { FillRound $g (Brush "#C8443B") $rng.Next(186, 502) $rng.Next(154, 286) 58 34 12 }
      for ($i = 0; $i -lt 12; $i++) { DrawTiltedStrip $g $rng.Next(188, 512) $rng.Next(154, 288) 62 20 "#FF7A2E" }
    }
    "green-pepper-beef" {
      for ($i = 0; $i -lt 13; $i++) { DrawTiltedStrip $g $rng.Next(176, 510) $rng.Next(150, 292) $rng.Next(76, 118) 24 "#C8443B" }
      for ($i = 0; $i -lt 11; $i++) { DrawTiltedStrip $g $rng.Next(182, 514) $rng.Next(150, 292) 88 18 "#37A84E" }
    }
    "lettuce-chicken-wrap" {
      for ($i = 0; $i -lt 5; $i++) {
        DrawLeafPiece $g $rng.Next(170, 470) $rng.Next(148, 260) 108 132 "#4CBF63"
        DrawTiltedStrip $g $rng.Next(200, 500) $rng.Next(172, 286) 76 22 "#F2B49E"
      }
    }
    "tomato-potato-soup" {
      for ($i = 0; $i -lt 8; $i++) { $g.FillEllipse((Brush "#F04E37"), $rng.Next(184, 510), $rng.Next(150, 284), 58, 42) }
      for ($i = 0; $i -lt 8; $i++) { FillRound $g (Brush "#DCA34B") $rng.Next(190, 504) $rng.Next(154, 286) 54 38 12 }
    }
    "tofu-mushroom-stew" {
      for ($i = 0; $i -lt 10; $i++) { DrawTofuBlock $g $rng.Next(184, 502) $rng.Next(150, 290) 56 42 }
      for ($i = 0; $i -lt 9; $i++) { DrawMushroomPiece $g $rng.Next(186, 504) $rng.Next(150, 276) 54 }
    }
    "egg-fried-rice" {
      DrawRiceGrains $g $rng 110 170 536 146 304
      for ($i = 0; $i -lt 14; $i++) { $g.FillEllipse((Brush "#F7C949"), $rng.Next(184, 514), $rng.Next(150, 292), 42, 28) }
      for ($i = 0; $i -lt 12; $i++) { $g.FillEllipse((Brush "#3DAA55"), $rng.Next(180, 526), $rng.Next(150, 300), 12, 12) }
    }
  }

  for ($i = 0; $i -lt 14; $i++) {
    $g.FillEllipse((Brush "#2F8E42"), $rng.Next(186, 526), $rng.Next(146, 306), 10, 10)
  }
}

function DrawIngredient($id, $path) {
  $c = NewCanvas 192 192 $true
  $g = $c.Graphics
  $shadow = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(30, 23, 23, 22))
  $g.FillEllipse($shadow, 34, 142, 124, 22)
  $shadow.Dispose()

  switch ($id) {
    "egg" {
      $g.FillEllipse((Brush "#F4D7A4"), 47, 30, 98, 128)
      $g.FillEllipse((Brush "#FFF8E8"), 54, 22, 82, 116)
    }
    "tomato" {
      $g.FillEllipse((Brush "#F04E37"), 38, 50, 116, 102)
      $g.FillEllipse((Brush "#FF7A5F"), 66, 58, 34, 28)
      DrawLeaf $g 72 31 24 42 "#2F8E42"
      DrawLeaf $g 93 31 24 42 "#3BAA4D"
    }
    "potato" {
      $g.FillEllipse((Brush "#DCA34B"), 50, 70, 72, 64)
      $g.FillEllipse((Brush "#E7BA65"), 82, 52, 58, 54)
      $g.FillEllipse((Brush "#B88235"), 76, 88, 7, 7)
      $g.FillEllipse((Brush "#B88235"), 110, 77, 6, 6)
    }
    "carrot" {
      $pts = [System.Drawing.Point[]]@(
        (New-Object System.Drawing.Point 72, 58),
        (New-Object System.Drawing.Point 142, 84),
        (New-Object System.Drawing.Point 52, 150)
      )
      $g.FillPolygon((Brush "#FF7A2E"), $pts)
      $g.DrawLine((Pen "#E65A1F" 4), 77, 95, 111, 86)
      $g.DrawLine((Pen "#E65A1F" 4), 68, 119, 96, 110)
      DrawLeaf $g 60 33 25 44 "#35A852"
      DrawLeaf $g 82 31 25 46 "#48B85E"
    }
    "green_pepper" {
      FillRound $g (Brush "#37A84E") 43 55 100 78 28
      FillRound $g (Brush "#4CC765") 62 44 52 96 24
      $g.FillRectangle((Brush "#2F8E42"), 88, 32, 14, 28)
    }
    "broccoli" {
      $g.FillRectangle((Brush "#80B45E"), 85, 92, 20, 58)
      $g.FillEllipse((Brush "#2F8E42"), 50, 58, 48, 48)
      $g.FillEllipse((Brush "#3CB75B"), 78, 42, 52, 52)
      $g.FillEllipse((Brush "#2F8E42"), 106, 64, 44, 44)
    }
    "chicken_breast" {
      $pathBody = RoundPath 42 56 108 78 34
      $g.FillPath((Brush "#F4B9A7"), $pathBody)
      $g.DrawPath((Pen "#E7907D" 5), $pathBody)
      $pathBody.Dispose()
    }
    "tofu" {
      FillRound $g (Brush "#F3E8C7") 48 52 96 86 10
      $g.DrawLine((Pen "#D7C79B" 3), 48, 88, 144, 88)
      $g.DrawLine((Pen "#D7C79B" 3), 96, 52, 96, 138)
    }
    "lettuce" {
      DrawLeaf $g 48 42 54 110 "#4CBF63"
      DrawLeaf $g 88 38 56 116 "#68D46E"
      DrawLeaf $g 66 64 60 98 "#3EAA55"
    }
    "rice" {
      FillRound $g (Brush "#DDEAF0") 42 92 108 48 18
      $g.FillPie((Brush "#F9FBF5"), 46, 50, 100, 90, 180, 180)
      $g.DrawArc((Pen "#B7CCD4" 5), 42, 82, 108, 56, 0, 180)
    }
    "shrimp" {
      $g.DrawArc((Pen "#F36F45" 18), 54, 54, 82, 82, 20, 260)
      $g.DrawArc((Pen "#FFD2BE" 5), 66, 67, 58, 58, 20, 250)
      $g.FillEllipse((Brush "#F36F45"), 122, 82, 18, 18)
    }
    "beef" {
      FillRound $g (Brush "#C8443B") 43 64 108 72 16
      $g.DrawBezier((Pen "#F4A29A" 5), 56, 84, 78, 70, 94, 110, 130, 92)
    }
    "mushroom" {
      $g.FillEllipse((Brush "#C9864F"), 48, 48, 98, 66)
      FillRound $g (Brush "#F2DFC7") 78 88 40 58 12
      $g.FillEllipse((Brush "#A86E43"), 68, 67, 13, 10)
      $g.FillEllipse((Brush "#A86E43"), 111, 70, 12, 9)
    }
    "cucumber" {
      FillRound $g (Brush "#2F9E55") 49 70 102 52 26
      FillRound $g (Brush "#76D36D") 60 82 80 14 7
      $g.FillEllipse((Brush "#CDEFA4"), 70, 86, 7, 7)
      $g.FillEllipse((Brush "#CDEFA4"), 104, 86, 7, 7)
    }
    "corn" {
      FillRound $g (Brush "#F5C84C") 62 42 68 112 32
      for ($yy = 56; $yy -lt 136; $yy += 18) {
        $g.DrawLine((Pen "#E3A928" 3), 66, $yy, 126, $yy)
      }
      DrawLeaf $g 43 94 32 70 "#49AA5D"
      DrawLeaf $g 116 94 32 70 "#3C9E50"
    }
    "onion" {
      $g.FillEllipse((Brush "#9D4D9E"), 50, 54, 94, 92)
      $g.FillEllipse((Brush "#C785C4"), 68, 64, 58, 70)
      $g.DrawArc((Pen "#7F3B82" 4), 67, 60, 58, 76, 90, 180)
    }
    "garlic" {
      $g.FillEllipse((Brush "#F1E0C6"), 50, 58, 92, 84)
      $g.DrawLine((Pen "#CDBD9D" 4), 96, 62, 96, 142)
      $g.FillRectangle((Brush "#CDBD9D"), 88, 42, 16, 26)
    }
    "ginger" {
      FillRound $g (Brush "#D99B44") 46 76 96 50 20
      FillRound $g (Brush "#E7B96B") 84 52 60 46 18
      $g.FillEllipse((Brush "#B97932"), 67, 91, 8, 8)
    }
    "scallion" {
      $g.DrawLine((Pen "#3EA45D" 10), 52, 138, 138, 45)
      $g.DrawLine((Pen "#63C875" 8), 72, 146, 147, 74)
      $g.DrawLine((Pen "#E8F1D7" 10), 44, 150, 82, 116)
    }
    "pork" {
      FillRound $g (Brush "#D9655B") 42 64 108 72 18
      $g.DrawBezier((Pen "#FFD2C7" 5), 56, 88, 76, 70, 98, 112, 130, 88)
    }
    "chicken_thigh" {
      $g.FillEllipse((Brush "#E7A062"), 52, 58, 88, 82)
      $g.DrawLine((Pen "#F4D2B0" 14), 118, 122, 146, 148)
      $g.FillEllipse((Brush "#F4D2B0"), 136, 139, 20, 20)
    }
    "bok_choy" {
      DrawLeaf $g 44 44 54 104 "#3DAA55"
      DrawLeaf $g 90 44 54 104 "#50BE62"
      $g.FillRectangle((Brush "#E5F2C8"), 78, 104, 36, 48)
    }
  }

  SaveCanvas $c $path
}

function DrawRecipeImage($id, $colors, $path) {
  $w = 720
  $h = 480
  $c = NewCanvas $w $h $false
  $g = $c.Graphics
  $rect = New-Object System.Drawing.Rectangle 0, 0, $w, $h
  $grad = New-Object System.Drawing.Drawing2D.LinearGradientBrush ($rect, (ColorFromHex $colors[0]), (ColorFromHex $colors[1]), 24)
  $g.FillRectangle($grad, $rect)
  $grad.Dispose()

  $rng = New-Object System.Random (SeedFromId $id)
  for ($i = 0; $i -lt 20; $i++) {
    $x = $rng.Next(20, 680)
    $y = $rng.Next(20, 430)
    $size = $rng.Next(8, 20)
    $dot = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(22, 23, 23, 22))
    $g.FillEllipse($dot, $x, $y, $size, $size)
    $dot.Dispose()
  }

  $bowlIds = @("tomato-beef-soup", "mushroom-egg-soup", "carrot-beef-stew", "tomato-potato-soup", "tofu-mushroom-stew", "potato-chicken")
  $riceIds = @("beef-fried-rice", "corn-egg-rice", "egg-fried-rice")
  if ($bowlIds -contains $id) {
    DrawBowlBase $g $colors $rng $colors[2]
  } elseif ($riceIds -contains $id) {
    DrawBowlBase $g $colors $rng "#F7F2E5"
  } else {
    DrawPlateBase $g $colors $rng
  }

  DrawRecipeItems $g $id $rng

  $g.DrawLine((Pen "#171716" 8), 492, 86, 656, 178)
  $g.DrawLine((Pen "#171716" 8), 508, 64, 672, 158)
  $g.FillEllipse((Brush "#B8F24C"), 82, 78, 74, 74)
  $g.FillEllipse((Brush "#FF5A3D"), 558, 314, 58, 58)

  SaveCanvas $c $path
}

function DrawHeroBowl($path, $light = $false) {
  $c = NewCanvas 560 420 $true
  $g = $c.Graphics
  $rng = New-Object System.Random 88
  if ($light) {
    $g.FillEllipse((Brush "#FFFDF7"), 104, 116, 356, 210)
    $g.DrawEllipse((Pen "#D9EFF2" 8), 122, 136, 320, 170)
    foreach ($color in @("#4CBF63", "#F7C949", "#F04E37", "#F4B9A7", "#76D36D")) {
      for ($i = 0; $i -lt 5; $i++) {
        $g.FillEllipse((Brush $color), $rng.Next(162, 370), $rng.Next(156, 250), $rng.Next(22, 44), $rng.Next(16, 34))
      }
    }
  } else {
    $g.FillEllipse((Brush "#F5EFE4"), 78, 124, 404, 218)
    $g.DrawEllipse((Pen "#FFFDF7" 12), 94, 144, 372, 174)
    foreach ($color in @("#F04E37", "#F7C949", "#3DAA55", "#F4B9A7", "#C8443B")) {
      for ($i = 0; $i -lt 6; $i++) {
        $g.FillEllipse((Brush $color), $rng.Next(142, 392), $rng.Next(156, 266), $rng.Next(28, 58), $rng.Next(18, 42))
      }
    }
    $g.DrawLine((Pen "#B8F24C" 12), 362, 92, 512, 186)
    $g.DrawLine((Pen "#37D6C8" 12), 378, 70, 528, 164)
  }
  SaveCanvas $c $path
}

function DrawIcon($name, $path, $active = $false) {
  $c = NewCanvas 64 64 $true
  $g = $c.Graphics
  $color = if ($active) { "#171716" } else { "#76736B" }
  $accent = if ($active) { "#B8F24C" } else { "#00000000" }
  if ($active) {
    $g.FillEllipse((Brush $accent), 8, 8, 48, 48)
  }
  $p = Pen $color 5
  switch ($name) {
    "home" {
      $pts = [System.Drawing.Point[]]@(
        (New-Object System.Drawing.Point 14, 31),
        (New-Object System.Drawing.Point 32, 15),
        (New-Object System.Drawing.Point 50, 31)
      )
      $g.DrawLines($p, $pts)
      $g.DrawRectangle($p, 20, 30, 24, 20)
    }
    "search" {
      $g.DrawEllipse($p, 16, 14, 26, 26)
      $g.DrawLine($p, 37, 37, 50, 50)
    }
    "leaf" {
      DrawLeaf $g 19 12 30 38 $color
      $g.DrawLine((Pen "#FFFDF7" 2), 32, 20, 32, 48)
    }
    "user" {
      $g.DrawEllipse($p, 23, 14, 18, 18)
      $g.DrawArc($p, 16, 34, 32, 24, 200, 140)
    }
  }
  $p.Dispose()
  SaveCanvas $c $path
}

$ingredientIds = @(
  "egg", "tomato", "potato", "carrot", "green_pepper", "broccoli", "chicken_breast",
  "tofu", "lettuce", "rice", "shrimp", "beef", "mushroom", "cucumber", "corn",
  "onion", "garlic", "ginger", "scallion", "pork", "chicken_thigh", "bok_choy"
)

foreach ($id in $ingredientIds) {
  DrawIngredient $id (Join-Path $IngredientDir "$id.png")
}

$recipes = @(
  @{ id = "tomato-egg"; colors = @("#FFE8DE", "#F9F2DB", "#F04E37", "#F7C949", "#FFB266") },
  @{ id = "green-pepper-potato"; colors = @("#EAF8D8", "#FFF4D8", "#DCA34B", "#2F9E55", "#F2D487") },
  @{ id = "broccoli-chicken"; colors = @("#DFF9E6", "#F7F4EA", "#3DAA55", "#F4B9A7", "#B8F24C") },
  @{ id = "shrimp-steamed-egg"; colors = @("#FFF2D6", "#DFFAFF", "#F36F45", "#F8D76F", "#FFFDF7") },
  @{ id = "cucumber-tofu-egg"; colors = @("#E6F8E7", "#F7F4EA", "#2F9E55", "#F3E8C7", "#F7C949") },
  @{ id = "chicken-corn-salad"; colors = @("#F0FFD8", "#DFFAFF", "#F4B9A7", "#F7C949", "#4CBF63") },
  @{ id = "garlic-lettuce"; colors = @("#E5F9DF", "#F7F4EA", "#4CBF63", "#F1E0C6", "#B8F24C") },
  @{ id = "tomato-beef-soup"; colors = @("#FFE7DF", "#FFF4D8", "#F04E37", "#C8443B", "#D99B44") },
  @{ id = "mushroom-egg-soup"; colors = @("#F4E8D6", "#DFFAFF", "#C9864F", "#F7C949", "#FFFDF7") },
  @{ id = "pan-chicken-veggie"; colors = @("#DFFAFF", "#F4FFD8", "#F4B9A7", "#4CBF63", "#FF8F45") },
  @{ id = "homestyle-tofu"; colors = @("#FFF0D8", "#FFE8DE", "#F3E8C7", "#2F9E55", "#FF5A3D") },
  @{ id = "onion-beef"; colors = @("#F0E4F6", "#FFE8DE", "#9D4D9E", "#C8443B", "#F4A29A") },
  @{ id = "mushroom-greens"; colors = @("#E9F7DC", "#F4E8D6", "#C9864F", "#3DAA55", "#E5F2C8") },
  @{ id = "minced-pork-tofu"; colors = @("#FFE8DE", "#FFF4D8", "#D9655B", "#F3E8C7", "#FF5A3D") },
  @{ id = "potato-chicken"; colors = @("#FFF0CF", "#FFE1D2", "#DCA34B", "#E7A062", "#C8443B") },
  @{ id = "beef-fried-rice"; colors = @("#FFF4D8", "#F7F4EA", "#C8443B", "#F7C949", "#FFFDF7") },
  @{ id = "shrimp-broccoli"; colors = @("#DFFAFF", "#E9FFD6", "#F36F45", "#3DAA55", "#B8F24C") },
  @{ id = "corn-egg-rice"; colors = @("#FFF2C9", "#F7F4EA", "#F5C84C", "#F7C949", "#FFFDF7") },
  @{ id = "carrot-beef-stew"; colors = @("#FFE6D3", "#FFF1CF", "#FF7A2E", "#C8443B", "#D99B44") },
  @{ id = "green-pepper-beef"; colors = @("#EAF8D8", "#FFE6DE", "#37A84E", "#C8443B", "#2F8E42") },
  @{ id = "lettuce-chicken-wrap"; colors = @("#E3F9E1", "#DFFAFF", "#4CBF63", "#F4B9A7", "#76D36D") },
  @{ id = "tomato-potato-soup"; colors = @("#FFE8DE", "#FFF2D6", "#F04E37", "#DCA34B", "#F7C949") },
  @{ id = "tofu-mushroom-stew"; colors = @("#F4E8D6", "#E9FFD6", "#F3E8C7", "#C9864F", "#3DAA55") },
  @{ id = "egg-fried-rice"; colors = @("#FFF4D8", "#F7F4EA", "#F7C949", "#FFFDF7", "#3DAA55") }
)

foreach ($recipe in $recipes) {
  DrawRecipeImage $recipe.id $recipe.colors (Join-Path $RecipeDir "$($recipe.id).png")
}

DrawHeroBowl (Join-Path $BrandDir "hero-bowl.png") $false
DrawHeroBowl (Join-Path $BrandDir "light-plate.png") $true

foreach ($name in @("home", "search", "leaf", "user")) {
  DrawIcon $name (Join-Path $IconDir "$name.png") $false
  DrawIcon $name (Join-Path $IconDir "$name-active.png") $true
}

Write-Host "Generated illustrated assets."
