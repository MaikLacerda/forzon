param([string]$ArchiveName = 'forzon-videos-musculatura-v2.zip')
$ErrorActionPreference = 'Stop'
$workspaceRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
$planPath = Join-Path $PSScriptRoot 'production-plan.json'
if(Test-Path -LiteralPath $planPath){
  $plan = Get-Content -LiteralPath $planPath -Raw | ConvertFrom-Json
  if($plan.deliveryMode -eq 'single-complete-batch'){
    & node (Join-Path $PSScriptRoot 'batch_status.mjs')
    if($LASTEXITCODE -ne 0){throw 'Nao foi possivel verificar a entrega.'}
    $batch = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'batch-status.json') -Raw | ConvertFrom-Json
    if(-not $batch.complete){throw "Pacote bloqueado: somente $($batch.ready)/$($batch.required) novos videos prontos."}
    $manifest = Get-Content -LiteralPath (Join-Path $workspaceRoot 'src/data/ownedExerciseVideos.json') -Raw | ConvertFrom-Json
    $manifestIds = @($manifest.PSObject.Properties.Name)
    if($manifestIds.Count -ne $plan.requiredTotal){throw 'Execute a publicacao validada do lote completo antes de montar o ZIP.'}
    foreach($id in @($plan.existingIds)+@($plan.pendingIds)){
      if($id -notin $manifestIds){throw "Video ausente no manifesto publicado: $id"}
    }
  }
}
$archivePath = [System.IO.Path]::GetFullPath((Join-Path $workspaceRoot $ArchiveName))
if ((Split-Path $archivePath -Parent) -ne $workspaceRoot -or [System.IO.Path]::GetExtension($archivePath) -ne '.zip') {
  throw 'O ZIP deve ficar na raiz do projeto.'
}
if (Test-Path -LiteralPath $archivePath) { throw 'O ZIP ja existe; escolha outro nome para preservar a versao anterior.' }
$stage = Join-Path $workspaceRoot ('.tmp/bundle-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $stage -Force | Out-Null
$files = @('.gitignore','package.json','package-lock.json','server.ts','EXERCISE_VIDEO_STATUS.md','src/App.tsx',
  'src/components/workout/ExerciseExecutionModal.tsx','src/components/workout/ExerciseVideoDemonstration.tsx',
  'src/components/workout/LiveWorkoutModal.tsx','src/components/views/TodayView.tsx',
  'src/components/views/WorkoutsView.tsx','src/data/exercises.ts','src/data/exerciseVideoAssets.ts','src/data/ownedExerciseVideos.json','public/sw.js')
foreach ($relative in $files) {
  $destination = Join-Path $stage $relative
  New-Item -ItemType Directory -Path (Split-Path $destination -Parent) -Force | Out-Null
  Copy-Item -LiteralPath (Join-Path $workspaceRoot $relative) -Destination $destination
}
$toolStage=Join-Path $stage 'tools/exercise-renderer'
New-Item -ItemType Directory -Path $toolStage -Force | Out-Null
Get-ChildItem -LiteralPath $PSScriptRoot -File | Where-Object {$_.Extension -in @('.py','.mjs','.ps1','.json','.md','.txt')} | ForEach-Object {
  Copy-Item -LiteralPath $_.FullName -Destination $toolStage
}
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'assets') -Destination $toolStage -Recurse
Copy-Item -LiteralPath (Join-Path $workspaceRoot 'tools/check-service-worker.mjs') -Destination (Join-Path $stage 'tools')
$assetRoot = Join-Path $stage 'public/assets'
New-Item -ItemType Directory -Path $assetRoot -Force | Out-Null
Copy-Item -LiteralPath (Join-Path $workspaceRoot 'public/assets/exercise-videos') -Destination $assetRoot -Recurse
$videoManifest = Get-Content (Join-Path $workspaceRoot 'src/data/ownedExerciseVideos.json') -Raw | ConvertFrom-Json
$catalog = Get-Content (Join-Path $workspaceRoot 'tools/exercise-renderer/catalog.json') -Raw | ConvertFrom-Json
$videoNames = foreach ($entry in $videoManifest.PSObject.Properties) {
  $name = ($catalog | Where-Object { $_.id -eq $entry.Name } | Select-Object -First 1).name
  '- ' + $name
}
$readme = @'
FORZON - ATUALIZACAO DOS VIDEOS E DISPONIBILIDADE

Inclui {COUNT} videos proprios:
{EXERCISES}

Extraia o conteudo na raiz do projeto mantendo as pastas src e public.
Aceite substituir os arquivos correspondentes.

No Git Bash, dentro da pasta do projeto:
npm install
npm run build
npm run dev

Para encerrar a previa e liberar o terminal, pressione Ctrl+C.

O player repete os videos automaticamente e oferece controles de reproducao.
Os enderecos dos videos foram atualizados para renovar o cache do navegador.
Na Biblioteca, marque "Somente exercicios com video" para localizar os videos disponiveis.
Na lista, clique no nome do exercicio para abrir a ficha de execucao.
O lote completo inclui os 100 novos videos e os quatro videos anteriores.

Este pacote cobre {COUNT} dos 104 exercicios do catalogo principal.
As estrias e a definicao do personagem sao uma ilustracao muscular estilizada.
Os avisos de licenca acompanham as midias proprias.

A correcao do cache fica em public/sw.js. Depois da publicacao, recarregue o
site com Ctrl+F5 para atualizar a pagina que estava aberta.

Para enviar ao GitHub:
git add src public/assets/exercise-videos public/sw.js tools .gitignore EXERCISE_VIDEO_STATUS.md LEIA-ME-VIDEOS.txt
git commit -m "Adiciona os 100 videos restantes dos exercicios"
git push origin main
'@
$readme = $readme.Replace('{COUNT}',[string]@($videoManifest.PSObject.Properties).Count).Replace('{EXERCISES}',($videoNames -join [Environment]::NewLine))
$readme | Set-Content -LiteralPath (Join-Path $stage 'LEIA-ME-VIDEOS.txt') -Encoding utf8
$readme | Set-Content -LiteralPath (Join-Path $workspaceRoot 'LEIA-ME-VIDEOS.txt') -Encoding utf8
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($stage,$archivePath,[System.IO.Compression.CompressionLevel]::Optimal,$false)
$archive = [System.IO.Compression.ZipFile]::OpenRead($archivePath)
try {
  $entries = @($archive.Entries.FullName)
  $manifest = Get-Content (Join-Path $workspaceRoot 'src/data/ownedExerciseVideos.json') -Raw | ConvertFrom-Json
  foreach ($entry in $manifest.PSObject.Properties) {
    $required = 'public' + ($entry.Value.video -split '\?')[0]
    if ($required -notin $entries) { throw "Video ausente no ZIP: $required" }
  }
  foreach ($required in $files) {
    if ($required -notin $entries) { throw "Estrutura incorreta no ZIP: $required" }
  }
  [pscustomobject]@{ ZIP = $archivePath; Arquivos = $entries.Count; Bytes = (Get-Item -LiteralPath $archivePath).Length }
} finally { $archive.Dispose() }
