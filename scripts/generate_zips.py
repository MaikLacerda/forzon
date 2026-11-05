import os
import zipfile
import sys

def create_zips():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    public_dir = os.path.join(base_dir, "public")
    os.makedirs(public_dir, exist_ok=True)

    # 1. Zip de Arquivos Alterados
    altered_zip_path = os.path.join(public_dir, "forzon-arquivos-alterados.zip")
    altered_files = [
        "package.json",
        "server.ts",
        "src/App.tsx",
        "src/types/index.ts",
        "src/data/exercises.ts",
        "src/data/hevyAssetMap.ts",
        "src/data/exerciseAssetMap.ts",
        "src/services/exerciseVideoService.ts",
        "src/services/storage.ts",
        "src/components/workout/KineticVectorDiagram.tsx",
        "src/components/workout/ExerciseExecutionModal.tsx",
        "src/components/workout/AnatomicalExerciseIllustration.tsx",
        "src/components/workout/Exercise3DMannequin.tsx",
        "src/components/workout/LiveWorkoutModal.tsx",
        "src/components/social/PostWorkoutShareModal.tsx",
        "src/components/social/NewPostModal.tsx",
        "src/components/views/SocialView.tsx",
        "src/components/views/WorkoutsView.tsx",
        "src/components/views/TodayView.tsx",
        "src/components/layout/Header.tsx",
        "src/components/export/ProjectDownloadModal.tsx",
        "src/components/ai/AIWorkoutNutritionIntakeModal.tsx",
    ]

    print("Gerando forzon-arquivos-alterados.zip...")
    with zipfile.ZipFile(altered_zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
        for rel_path in altered_files:
            abs_path = os.path.join(base_dir, rel_path)
            if os.path.isfile(abs_path):
                zipf.write(abs_path, rel_path)
                print(f"  + Adicionado: {rel_path}")
            else:
                print(f"  ! Arquivo não encontrado: {rel_path}")

        # Adicionar todos os arquivos da pasta public/assets/hevy
        hevy_dir = os.path.join(public_dir, "assets", "hevy")
        if os.path.exists(hevy_dir):
            hevy_files = os.listdir(hevy_dir)
            print(f"  + Empacotando {len(hevy_files)} ilustrações técnicas oficiais do Hevy...")
            for hf in hevy_files:
                abs_hf = os.path.join(hevy_dir, hf)
                if os.path.isfile(abs_hf):
                    rel_hf = os.path.relpath(abs_hf, base_dir)
                    zipf.write(abs_hf, rel_hf)

    # 2. Zip de Projeto Completo
    full_zip_path = os.path.join(public_dir, "forzon-projeto-completo.zip")
    exclude_dirs = {"node_modules", ".git", "dist", ".aistudio", ".vite", ".vscode"}
    exclude_extensions = {".zip", ".pyc"}

    print("\nGerando forzon-projeto-completo.zip...")
    with zipfile.ZipFile(full_zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(base_dir):
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            for file in files:
                ext = os.path.splitext(file)[1]
                if ext in exclude_extensions:
                    continue
                abs_path = os.path.join(root, file)
                rel_path = os.path.relpath(abs_path, base_dir)
                zipf.write(abs_path, rel_path)

    print(f"\nSucesso! Arquivos gerados:")
    print(f"  {altered_zip_path} ({os.path.getsize(altered_zip_path)} bytes)")
    print(f"  {full_zip_path} ({os.path.getsize(full_zip_path)} bytes)")

if __name__ == "__main__":
    create_zips()
