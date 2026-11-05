"""Decode unchanged approved videos that predate the frame-hash evidence marker."""
import hashlib,json,runpy,sys
from pathlib import Path
root=Path(__file__).resolve().parent
reviews=json.loads((root/'visual-reviews.json').read_text(encoding='utf8'))
plan=json.loads((root/'production-plan.json').read_text(encoding='utf8'))
done=[]
for exercise in plan['pendingIds']:
    review=reviews.get(exercise,{})
    if not review.get('approved'):continue
    video=root/'output'/f'{exercise}.mp4'
    if hashlib.sha256(video.read_bytes()).hexdigest()!=review.get('videoSha256'):
        raise RuntimeError(f'Video changed after visual approval: {exercise}')
    marker=root/'output'/'review'/f'{exercise}.decoded.json'
    if marker.exists():
        evidence=json.loads(marker.read_text(encoding='utf8'))
        if evidence.get('videoSha256')==review['videoSha256'] and evidence.get('uniqueFrameCount',0)>=2 and set(review['reviewedFrames']).issubset(evidence.get('frames',[])):continue
    sys.argv=['review_frames.py','--',exercise,'--extra-frames',*[str(f) for f in review['reviewedFrames']]]
    runpy.run_path(str(root/'review_frames.py'),run_name='__main__')
    done.append(exercise)
    (root/'refreshed-review-evidence.json').write_text(json.dumps(done,indent=2),encoding='utf8')
print('REVIEW_EVIDENCE_REFRESHED',len(done))
