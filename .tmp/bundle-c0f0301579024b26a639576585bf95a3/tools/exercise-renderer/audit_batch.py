"""Repeat the full mechanical checks without changing scenes or approvals."""
import argparse,json,runpy,sys,traceback
from pathlib import Path
root=Path(__file__).resolve().parent
plan=json.loads((root/'production-plan.json').read_text(encoding='utf8'))
parser=argparse.ArgumentParser();parser.add_argument('--exercises',nargs='+',choices=plan['pendingIds'])
args=parser.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else [])
progress=root/'final-audit-progress.json'
previous=json.loads(progress.read_text(encoding='utf8')) if args.exercises and progress.exists() else []
by_id={entry['exerciseId']:entry for entry in previous}
for exercise in args.exercises or plan['pendingIds']:
    try:
        sys.argv=['audit_remaining.py','--',exercise]
        runpy.run_path(str(root/'audit_remaining.py'),run_name='__main__')
        qa=json.loads((root/'output'/f'{exercise}.qa.json').read_text(encoding='utf8'))
        by_id[exercise]={'exerciseId':exercise,'passed':True,'sceneSha256':qa['sceneSha256']}
    except Exception as error:
        traceback.print_exc()
        by_id[exercise]={'exerciseId':exercise,'passed':False,'error':str(error)}
    results=[by_id[id] for id in plan['pendingIds'] if id in by_id]
    progress.write_text(json.dumps(results,indent=2),encoding='utf8')
failed=[item for item in results if not item['passed']]
print('FINAL_BATCH_AUDIT',json.dumps({'checked':len(results),'failed':failed}))
if failed or len(results)!=len(plan['pendingIds']):raise RuntimeError('Final batch audit incomplete or failed')
