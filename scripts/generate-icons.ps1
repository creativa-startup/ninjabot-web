[void][System.Reflection.Assembly]::LoadWithPartialName("System.Drawing")
$colors = @(@(224,86,253), @(168,85,247))
$sizes = @(192, 512)
foreach ($size in $sizes) {
  $bmp = New-Object System.Drawing.Bitmap($size, $size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
  $color1 = [System.Drawing.Color]::FromArgb(255, $colors[0][0], $colors[0][1], $colors[0][2])
  $color2 = [System.Drawing.Color]::FromArgb(255, $colors[1][0], $colors[1][1], $colors[1][2])
  $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $color1, $color2, 45)
  $g.FillRectangle($brush, $rect)
  $g.Dispose()
  $output = Join-Path (Get-Location) "public\icon-$size.png"
  $bmp.Save($output, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Write-Host "Generado: $output"
}