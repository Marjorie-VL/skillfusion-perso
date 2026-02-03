# Script de nettoyage de l'historique Git avec git filter-branch
# Supprime les fichiers sensibles de tout l'historique Git
# ⚠️ ATTENTION: Ce script modifie l'historique Git de manière permanente

param(
    [switch]$DryRun = $false
)

Write-Host "[NETTOYAGE] Nettoyage de l'historique Git..." -ForegroundColor Yellow
Write-Host ""

if ($DryRun) {
    Write-Host "[DRY-RUN] MODE TEST: Aucune modification ne sera effectuee" -ForegroundColor Cyan
    Write-Host ""
}

# Sauvegarde de la branche actuelle
$currentBranch = git branch --show-current
Write-Host "[INFO] Branche actuelle: $currentBranch" -ForegroundColor Cyan

# Verification des changements non commits
$unstagedChanges = git status --porcelain 2>&1
if ($unstagedChanges -and -not $DryRun) {
    Write-Host "[ATTENTION] Des changements non commits ont ete detectes" -ForegroundColor Yellow
    Write-Host "[INFO] Ces changements doivent etre commits ou stashes avant le nettoyage" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Cyan
    Write-Host "  1. Commiter les changements: git add . && git commit -m 'Cleanup before history rewrite'" -ForegroundColor White
    Write-Host "  2. Stasher les changements: git stash" -ForegroundColor White
    Write-Host ""
    $response = Read-Host "Voulez-vous commiter les changements maintenant? (O/N)"
    if ($response -eq "O" -or $response -eq "o") {
        Write-Host "[COMMIT] Ajout des fichiers..." -ForegroundColor Yellow
        git add . 2>&1 | Out-Null
        Write-Host "[COMMIT] Creation du commit..." -ForegroundColor Yellow
        git commit -m "Cleanup: Remove sensitive files and improve .gitignore before making repo public" 2>&1 | Out-Null
        Write-Host "[OK] Changements commits" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host "[ERREUR] Veuillez commiter ou stasher les changements avant de continuer" -ForegroundColor Red
        exit 1
    }
}

# Création d'une sauvegarde avant nettoyage
if (-not $DryRun) {
    Write-Host "[SAUVEGARDE] Creation d'une sauvegarde..." -ForegroundColor Yellow
    git branch backup-before-cleanup 2>&1 | Out-Null
    Write-Host "[OK] Sauvegarde creee: backup-before-cleanup" -ForegroundColor Green
    Write-Host ""
}

# Liste des fichiers/dossiers à supprimer de l'historique
$filesToRemove = @(
    "DOSSIER PROJET",
    "Back/coverage",
    "Back/uploads",
    "SkillFusion/Back/coverage",
    "SkillFusion/Back/uploads",
    "SkillFusion/DOSSIER PROJET"
)

# Verification des fichiers dans l'historique
Write-Host "[VERIFICATION] Verification des fichiers dans l'historique..." -ForegroundColor Yellow
$filesFound = @()
foreach ($file in $filesToRemove) {
    $exists = git log --all --full-history --pretty=format:"%H" -- "$file" 2>&1 | Select-Object -First 1
    if ($exists -and $exists -notmatch "fatal|error") {
        $filesFound += $file
        Write-Host "   [TROUVE] '$file' trouve dans l'historique" -ForegroundColor Yellow
    }
}

# Verification des fichiers .env
$envFiles = git log --all --full-history --pretty=format:"%H" -- "*.env" ".env" "**/.env" 2>&1 | Select-Object -First 1
if ($envFiles -and $envFiles -notmatch "fatal|error") {
    Write-Host "   [TROUVE] Fichiers .env trouves dans l'historique" -ForegroundColor Yellow
    $hasEnvFiles = $true
} else {
    $hasEnvFiles = $false
}

Write-Host ""

if ($filesFound.Count -eq 0 -and -not $hasEnvFiles) {
    Write-Host "[OK] Aucun fichier sensible trouve dans l'historique !" -ForegroundColor Green
    exit 0
}

if ($DryRun) {
    Write-Host "[LISTE] Fichiers qui seraient supprimes:" -ForegroundColor Cyan
    foreach ($file in $filesFound) {
        Write-Host "   - $file" -ForegroundColor Gray
    }
    if ($hasEnvFiles) {
        Write-Host "   - *.env (tous les fichiers .env)" -ForegroundColor Gray
    }
    Write-Host ""
    Write-Host "Pour executer reellement le nettoyage, lancez: .\clean-git-history.ps1" -ForegroundColor Yellow
    exit 0
}

# Suppression de chaque fichier/dossier de l'historique
Write-Host "[SUPPRESSION] Suppression des fichiers de l'historique..." -ForegroundColor Yellow
Write-Host "   (Cela peut prendre plusieurs minutes...)" -ForegroundColor Gray
Write-Host ""

# Construire la commande filter-branch pour tous les fichiers en une seule passe
$indexFilter = "git rm -rf --cached --ignore-unmatch"
foreach ($file in $filesFound) {
    $indexFilter += " '$file'"
}

# Ajouter les fichiers .env
if ($hasEnvFiles) {
    $indexFilter += " '*.env' '**/.env' '.env' 'Back/.env' 'SkillFusion/Back/.env' 'Front/.env' 'SkillFusion/Front/.env'"
}

# Executer git filter-branch une seule fois pour tous les fichiers
if ($filesFound.Count -gt 0 -or $hasEnvFiles) {
    Write-Host "[EXECUTION] Execution de git filter-branch (peut prendre du temps)..." -ForegroundColor Yellow
    $filterCommand = "git filter-branch --force --index-filter `"$indexFilter`" --prune-empty --tag-name-filter cat -- --all"
    Invoke-Expression $filterCommand 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Fichiers supprimes de l'historique" -ForegroundColor Green
    } else {
        Write-Host "[ERREUR] Erreur lors de la suppression (code: $LASTEXITCODE)" -ForegroundColor Red
        Write-Host "   Verifiez les messages ci-dessus pour plus de details" -ForegroundColor Yellow
    }
}

# Nettoyage des references
Write-Host ""
Write-Host "[NETTOYAGE] Nettoyage des references Git..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .git/refs/original/ -ErrorAction SilentlyContinue
git reflog expire --expire=now --all 2>&1 | Out-Null
git gc --prune=now --aggressive 2>&1 | Out-Null

Write-Host ""
Write-Host "[TERMINE] Nettoyage termine !" -ForegroundColor Green
Write-Host ""
Write-Host "[ETAPES] Prochaines etapes IMPORTANTES:" -ForegroundColor Cyan
Write-Host "   1. Verifiez les changements avec: git log --all --oneline" -ForegroundColor White
Write-Host "   2. Verifiez la taille du repo: git count-objects -vH" -ForegroundColor White
Write-Host "   3. Si tout est correct, forcez le push:" -ForegroundColor White
Write-Host "      git push --force --all" -ForegroundColor Yellow
Write-Host "      git push --force --tags" -ForegroundColor Yellow
Write-Host "   4. Si quelque chose ne va pas, restaurez avec:" -ForegroundColor White
Write-Host "      git reset --hard backup-before-cleanup" -ForegroundColor Yellow
Write-Host ""
Write-Host "[ATTENTION] Apres le push --force, tous les collaborateurs devront" -ForegroundColor Red
Write-Host "   reinitialiser leur depot local avec: git fetch --all && git reset --hard origin/master" -ForegroundColor Red
Write-Host ""
