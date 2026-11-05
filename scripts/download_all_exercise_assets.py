import os
import json
import urllib.request
import re

os.makedirs('public/assets/exercises', exist_ok=True)

# 1. Download list of files in JAlbertoGonzalez/everkinetic-data/img
print("Fetching Everkinetic repo image listing...")
api_url = 'https://api.github.com/repos/JAlbertoGonzalez/everkinetic-data/contents/img'
req = urllib.request.Request(api_url, headers={'User-Agent': 'ForzonFitnessApp/1.0'})
try:
    with urllib.request.urlopen(req, timeout=20) as resp:
        repo_files = json.loads(resp.read().decode('utf-8'))
        filenames = [item['name'] for item in repo_files if item['type'] == 'file']
except Exception as e:
    print("Failed to fetch github api, falling back to cached or local:", e)
    with open('scripts/everkinetic_filenames.json', 'r') as f:
        filenames = json.load(f)

print(f"Total available Everkinetic files: {len(filenames)}")

# Also query Wikimedia Commons Category:Line_art_of_exercise
wiki_url = 'https://commons.wikimedia.org/w/api.php?action=query&generator=categorymembers&gcmtitle=Category:Line_art_of_exercise&gcmlimit=200&prop=imageinfo&iiprop=url&format=json'
req_wiki = urllib.request.Request(wiki_url, headers={'User-Agent': 'ForzonFitnessApp/1.0'})
wiki_files = {}
try:
    with urllib.request.urlopen(req_wiki, timeout=20) as resp:
        wiki_data = json.loads(resp.read().decode('utf-8'))
        pages = wiki_data.get('query', {}).get('pages', {})
        for _, p in pages.items():
            title = p.get('title', '')
            imageinfo = p.get('imageinfo', [])
            if imageinfo and title.startswith('File:'):
                fname = title.replace('File:', '').strip()
                wiki_files[fname] = imageinfo[0].get('url')
        print(f"Total Wikimedia files found: {len(wiki_files)}")
except Exception as e:
    print("Wikimedia query note:", e)

# Identify pairs (ending with -1 and -2)
pairs = {}
for fn in filenames:
    m = re.match(r'^(.*?)-([123])\.(png|gif|jpg)$', fn, re.IGNORECASE)
    if m:
        base = m.group(1).lower()
        frame_idx = m.group(2)
        if base not in pairs:
            pairs[base] = {}
        pairs[base][frame_idx] = fn

print(f"Identified {len(pairs)} exercise base pairs from Everkinetic")

# Download key exercise sets to public/assets/exercises/
downloaded = set(os.listdir('public/assets/exercises'))

# We want to download all paired images that correspond to fitness exercises
exercises_to_download = []
for base, frames in pairs.items():
    if '1' in frames and '2' in frames:
        for fidx in ['1', '2']:
            fn = frames[fidx]
            if fn not in downloaded:
                exercises_to_download.append(fn)

print(f"Downloading {len(exercises_to_download)} exercise images...")
success_count = 0
for i, fn in enumerate(exercises_to_download):
    url = f"https://raw.githubusercontent.com/JAlbertoGonzalez/everkinetic-data/master/img/{fn}"
    target = os.path.join('public/assets/exercises', fn)
    try:
        r = urllib.request.Request(url, headers={'User-Agent': 'ForzonFitnessApp/1.0'})
        with urllib.request.urlopen(r, timeout=12) as response:
            data = response.read()
            with open(target, 'wb') as f:
                f.write(data)
            success_count += 1
            if success_count % 30 == 0 or i == len(exercises_to_download) - 1:
                print(f"Progress: {success_count}/{len(exercises_to_download)} files downloaded")
    except Exception as e:
        # print error concisely
        pass

# Also download any matching wikimedia files (especially bench-press, squat, etc.)
for wname, wurl in wiki_files.items():
    if wname.lower().endswith(('.png', '.gif', '.jpg')):
        target = os.path.join('public/assets/exercises', wname.lower())
        if not os.path.exists(target):
            try:
                r = urllib.request.Request(wurl, headers={'User-Agent': 'ForzonFitnessApp/1.0 (fitness workout illustration)'})
                with urllib.request.urlopen(r, timeout=12) as response:
                    with open(target, 'wb') as f:
                        f.write(response.read())
            except Exception:
                pass

print("Finished downloading assets. Now generating mapping for exercises.ts...")
