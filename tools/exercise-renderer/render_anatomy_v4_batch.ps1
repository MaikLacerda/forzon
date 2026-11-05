param([string[]]$ExerciseIds=@())
$ErrorActionPreference='Stop'
$root=$PSScriptRoot
$project=[IO.Path]::GetFullPath((Join-Path $root '../..'))
$blender=Join-Path $project '.tools/blender-4.5.14-windows-x64/blender.exe'
$out=Join-Path $root 'output/anatomy-v4'
New-Item -ItemType Directory -Path $out -Force | Out-Null
$plan=Get-Content -LiteralPath (Join-Path $root 'anatomy-v4-corrections.json') -Raw | ConvertFrom-Json
$queue=if($ExerciseIds.Count){@($ExerciseIds)}else{@($plan.exercises.exerciseId)}
foreach($id in $queue){if($id -notin $plan.exercises.exerciseId){throw "Exercicio fora do lote revisado: $id"}}
$hashes=@{}
foreach($file in @('correct_anatomy_v4.py','audit_anatomy_v4.py','render_anatomy_video.py','review_anatomy_video.py')){$hashes[$file]=(Get-FileHash -LiteralPath (Join-Path $root $file) -Algorithm SHA256).Hash.ToLowerInvariant()}
$state=[ordered]@{style='anatomy-v4';required=$queue.Count;rendered=0;completed=@();currentExercise=$null;stage=$null;state='running';publication='not-published';visualReviewRequired=$true;startedAt=(Get-Date).ToString('o')}
function Save-State {$state.updatedAt=(Get-Date).ToString('o');$state | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath (Join-Path $out 'batch-state.json') -Encoding utf8}
function Invoke-Stage([string]$file,[string[]]$arguments){
 foreach($name in $hashes.Keys){if((Get-FileHash -LiteralPath (Join-Path $root $name) -Algorithm SHA256).Hash.ToLowerInvariant() -ne $hashes[$name]){throw "Receita alterada durante o lote: $name"}}
 $state.stage=$file;Save-State
 & $blender --background --python-exit-code 1 -t 4 --python (Join-Path $root $file) -- @arguments *> (Join-Path $out "$($state.currentExercise)-$file.log")
 if($LASTEXITCODE -ne 0){throw "Falha em $file para $($state.currentExercise); veja o log correspondente."}
}
try {
 foreach($id in $queue){
  $state.currentExercise=$id;Save-State
  $metaPath=Join-Path $out "$id.corrections.json";$scene=Join-Path $out "$id.blend"
  $source=Join-Path $root "output/anatomy-v3/$id.blend"
  $fresh=$false
  if((Test-Path -LiteralPath $metaPath) -and (Test-Path -LiteralPath $scene)){
   $meta=Get-Content -LiteralPath $metaPath -Raw | ConvertFrom-Json
   $fresh=$meta.recipeSha256 -eq $hashes['correct_anatomy_v4.py'] -and $meta.sourceSceneSha256 -eq (Get-FileHash -LiteralPath $source -Algorithm SHA256).Hash.ToLowerInvariant()
  }
  if(-not $fresh){Invoke-Stage 'correct_anatomy_v4.py' @($id)}
  $sceneHash=(Get-FileHash -LiteralPath $scene -Algorithm SHA256).Hash.ToLowerInvariant()
  $qaPath=Join-Path $out "$id.motion-qa.json";$audited=$false
  if(Test-Path -LiteralPath $qaPath){$qa=Get-Content -LiteralPath $qaPath -Raw | ConvertFrom-Json;$audited=$qa.checksPassed -and $qa.sceneSha256 -eq $sceneHash -and $qa.auditRecipeSha256 -eq $hashes['audit_anatomy_v4.py']}
  if(-not $audited){Invoke-Stage 'audit_anatomy_v4.py' @($id)}
  $videoPath=Join-Path $out "$id.mp4";$videoMeta=Join-Path $out "$id.video.json";$encoded=$false
  if((Test-Path -LiteralPath $videoPath) -and (Test-Path -LiteralPath $videoMeta)){$vm=Get-Content -LiteralPath $videoMeta -Raw | ConvertFrom-Json;$encoded=$vm.sceneSha256 -eq $sceneHash -and $vm.videoSha256 -eq (Get-FileHash -LiteralPath $videoPath -Algorithm SHA256).Hash.ToLowerInvariant()}
  if(-not $encoded){Invoke-Stage 'render_anatomy_video.py' @($id,'--version','anatomy-v4')}
  $actualVideoHash=(Get-FileHash -LiteralPath $videoPath -Algorithm SHA256).Hash.ToLowerInvariant()
  $reviewPath=Join-Path $out "review/$id.decoded-detailed.json";$decoded=$false
  if(Test-Path -LiteralPath $reviewPath){$rv=Get-Content -LiteralPath $reviewPath -Raw | ConvertFrom-Json;$decoded=$rv.videoSha256 -eq $actualVideoHash -and @($rv.framePixelSha256.PSObject.Properties).Count -ge 17}
  if(-not $decoded){Invoke-Stage 'review_anatomy_video.py' @($id,'--version','anatomy-v4','--samples','17')}
  $state.completed+=@($id);$state.rendered=$state.completed.Count;Save-State
  Write-Output "$($state.rendered)/$($state.required) MP4 v4 renderizados e decodificados: $id; revisao visual pendente."
 }
 $state.stage=$null;$state.state='rendered-awaiting-visual-review';Save-State
}catch{$state.state='failed';$state.error=$_.Exception.Message;Save-State;throw}
