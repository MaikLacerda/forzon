param([string[]]$ExerciseIds=@(),[string]$SheetName='contact-sheet.jpg')
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$renderRoot = $PSScriptRoot
$motions = Get-Content (Join-Path $renderRoot 'motions.json') -Raw | ConvertFrom-Json
$entries = @($motions.PSObject.Properties)
if($ExerciseIds.Count){
  $remaining=Get-Content -LiteralPath (Join-Path $renderRoot 'remaining-motion-specs.json') -Raw | ConvertFrom-Json
  $entries=@($entries)+@($remaining.PSObject.Properties)
  $entries=@($entries | Where-Object {$_.Name -in $ExerciseIds})
  if($entries.Count -ne $ExerciseIds.Count){throw 'ID desconhecido na revisao.'}
}
if($entries.Count -gt 10){throw 'Use folhas com ate 10 exercicios para preservar a legibilidade.'}
if([IO.Path]::GetFileName($SheetName) -ne $SheetName){throw 'Nome de folha invalido.'}
$sheet = [System.Drawing.Bitmap]::new(1600, 360 * $entries.Count)
$graphics = [System.Drawing.Graphics]::FromImage($sheet)
$graphics.Clear([System.Drawing.Color]::White)
$font = [System.Drawing.Font]::new('Segoe UI', 13)
$smallFont = [System.Drawing.Font]::new('Segoe UI', 9)
try {
  for ($row = 0; $row -lt $entries.Count; $row++) {
    $entry = $entries[$row]
    $spec = $entry.Value
    $qaFile=Join-Path $renderRoot "output/$($entry.Name).qa.json"
    if(Test-Path -LiteralPath $qaFile){
      $qa=Get-Content -LiteralPath $qaFile -Raw | ConvertFrom-Json
      $videoMeta=Get-Content -LiteralPath (Join-Path $renderRoot "output/$($entry.Name).video.json") -Raw | ConvertFrom-Json
      $decoded=Get-Content -LiteralPath (Join-Path $renderRoot "output/review/$($entry.Name).decoded.json") -Raw | ConvertFrom-Json
      $videoSha=(Get-FileHash -LiteralPath (Join-Path $renderRoot "output/$($entry.Name).mp4") -Algorithm SHA256).Hash.ToLowerInvariant()
      if(-not $qa.mechanicalChecksPassed -or $qa.sceneSha256 -ne $videoMeta.sceneSha256 -or $decoded.videoSha256 -ne $videoSha){throw "Revisao desatualizada para $($entry.Name): conferir auditoria, MP4 e quadros decodificados."}
    }
    $graphics.DrawString($spec.name, $font, [System.Drawing.Brushes]::Black, 8, $row * 360)
    $frames = @(1, [int]($spec.frames / 4), [int]($spec.frames / 2), [int](3 * $spec.frames / 4), $spec.frames)
    for ($column = 0; $column -lt 5; $column++) {
      $frame = $frames[$column]
      $frameFile = Join-Path $renderRoot "output/review/$($entry.Name)-$frame.png"
      $source = [System.Drawing.Image]::FromFile($frameFile)
      try {
        $graphics.DrawImage($source, [System.Drawing.Rectangle]::new($column * 320, $row * 360 + 25, 320, 320))
      } finally { $source.Dispose() }
      $graphics.DrawString("Quadro $frame", $smallFont, [System.Drawing.Brushes]::Black, $column * 320 + 8, $row * 360 + 343)
    }
  }
  $sheet.Save((Join-Path $renderRoot "output/review/$SheetName"), [System.Drawing.Imaging.ImageFormat]::Jpeg)
} finally {
  $graphics.Dispose()
  $font.Dispose()
  $smallFont.Dispose()
  $sheet.Dispose()
}
