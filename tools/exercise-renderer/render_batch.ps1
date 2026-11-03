param([Parameter(Mandatory=$true)][string[]]$ExerciseIds)
$ErrorActionPreference='Stop'
$projectPath=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
$blenderPath=Join-Path $projectPath '.tools/blender-4.5.14-windows-x64/blender.exe'
$specs=Get-Content -LiteralPath (Join-Path $PSScriptRoot 'remaining-motion-specs.json') -Raw | ConvertFrom-Json -AsHashtable
foreach($exerciseId in $ExerciseIds){
 if(-not $specs.ContainsKey($exerciseId)){throw "Exercicio desconhecido: $exerciseId"}
 # Sequential execution prevents GPU memory contention. Stop on any failed stage.
 foreach($stage in @('render.py','audit_remaining.py','render_saved.py','review_frames.py')){
  [string[]]$stageArgs=@(if($stage -eq 'render.py'){'--exercise';$exerciseId;'--scene-only'}else{$exerciseId})
  $stageLog=Join-Path $PSScriptRoot "output/$exerciseId-$stage.log"
  & $blenderPath --background --python-exit-code 1 -t 6 --python (Join-Path $PSScriptRoot $stage) -- @stageArgs *> $stageLog
  if($LASTEXITCODE -ne 0){throw "Falha em $stage para $exerciseId. Consulte $stageLog"}
 }
}
& node (Join-Path $PSScriptRoot 'batch_status.mjs')
Write-Output 'Renderizacao encerrada. Revisao visual ainda obrigatoria; nenhum video foi publicado.'
