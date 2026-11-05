param([string[]]$ExerciseIds=@())
$ErrorActionPreference='Stop'
$root=$PSScriptRoot
$project=[IO.Path]::GetFullPath((Join-Path $root '../..'))
$blender=Join-Path $project '.tools/blender-4.5.14-windows-x64/blender.exe'
$out=Join-Path $root 'output/anatomy-v3'
New-Item -ItemType Directory -Path $out -Force | Out-Null
$specs=Get-Content -LiteralPath (Join-Path $root 'motions.json') -Raw | ConvertFrom-Json -AsHashtable
$remaining=Get-Content -LiteralPath (Join-Path $root 'remaining-motion-specs.json') -Raw | ConvertFrom-Json -AsHashtable
foreach($key in $remaining.Keys){$specs[$key]=$remaining[$key]}
$priority=@('ex-crucifixo-reto-halteres','barbell-curl','ex-elevacao-lateral-halteres','ex-remada-curvada-barra','ex-agachamento-livre-barra','ex-abdominal-supra-solo')
$queue=if($ExerciseIds.Count){@($ExerciseIds)}else{@($priority)+@($specs.Keys | Where-Object {$_ -notin $priority} | Sort-Object)}
foreach($key in $queue){if(-not $specs.ContainsKey($key)){throw "Exercicio desconhecido: $key"}}
$recipeHash=(Get-FileHash -LiteralPath (Join-Path $root 'style_anatomy.py') -Algorithm SHA256).Hash
$status=[ordered]@{style='anatomy-v3';required=$queue.Count;rendered=0;visualReviewRequired=$true;publication='not-published';state='running';startedAt=(Get-Date).ToString('o');currentExercise=$null;stage=$null;completed=@()}
function Save-Status { $status.updatedAt=(Get-Date).ToString('o');$status | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $out 'batch-state.json') -Encoding utf8 }
try {
  foreach($key in $queue){
    if((Get-FileHash -LiteralPath (Join-Path $root 'style_anatomy.py') -Algorithm SHA256).Hash -ne $recipeHash){throw 'O estilo mudou durante o lote. Retome depois de revisar os videos ja produzidos.'}
    $id=$specs[$key].exerciseId;$status.currentExercise=$id
    $video=Join-Path $out "$id.mp4";$decoded=Join-Path $out "review/$id.decoded.json"
    $alreadyReady=$false
    if((Test-Path -LiteralPath $video) -and (Test-Path -LiteralPath $decoded)){
      $review=Get-Content -LiteralPath $decoded -Raw | ConvertFrom-Json
      $style=Get-Content -LiteralPath (Join-Path $out "$id.style.json") -Raw | ConvertFrom-Json
      $qa=Get-Content -LiteralPath (Join-Path $out "$id.motion-qa.json") -Raw | ConvertFrom-Json
      $metadata=Get-Content -LiteralPath (Join-Path $out "$id.video.json") -Raw | ConvertFrom-Json
      $actualVideoHash=(Get-FileHash -LiteralPath $video -Algorithm SHA256).Hash.ToLowerInvariant()
      $actualSceneHash=(Get-FileHash -LiteralPath (Join-Path $out "$id.blend") -Algorithm SHA256).Hash.ToLowerInvariant()
      $actualSourceHash=(Get-FileHash -LiteralPath (Join-Path $root "output/$key.blend") -Algorithm SHA256).Hash.ToLowerInvariant()
      $alreadyReady=$review.videoSha256 -eq $actualVideoHash -and $metadata.videoSha256 -eq $actualVideoHash -and $qa.motionPreserved -and $qa.sceneSha256 -eq $actualSceneHash -and $metadata.sceneSha256 -eq $actualSceneHash -and $style.sourceSceneSha256 -eq $actualSourceHash -and $style.styleRecipeSha256 -eq $recipeHash.ToLowerInvariant()
    }
    if(-not $alreadyReady){
      $stages=@(
        @{script='style_anatomy.py';arguments=@('--exercise',$key,'--frame',[string]([Math]::Floor($specs[$key].frames/4)))},
        @{script='audit_anatomy_style.py';arguments=@($key)},
        @{script='render_anatomy_video.py';arguments=@($id)},
        @{script='review_anatomy_video.py';arguments=@($id)}
      )
      foreach($stage in $stages){
        $status.stage=$stage.script;Save-Status
        $log=Join-Path $out "$id-$($stage.script).log"
        & $blender --background --python-exit-code 1 -t 4 --python (Join-Path $root $stage.script) -- @($stage.arguments) *> $log
        if($LASTEXITCODE -ne 0){throw "Falha em $($stage.script) para $id. Consulte $log"}
      }
    }
    $status.rendered++;$status.completed+= $id;Save-Status
    Write-Output "$($status.rendered)/$($status.required) MP4 renderizados e decodificados: $id; revisao visual pendente."
  }
  $status.state='rendered-awaiting-visual-review';$status.stage=$null;Save-Status
} catch {
  $status.state='failed';$status.error=$_.Exception.Message;Save-Status
  throw
}
