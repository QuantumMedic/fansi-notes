"""Local restore drill and guarded D1 command generator. Never executes remote commands."""
import argparse,json,pathlib,sqlite3,hashlib,os,shlex
p=argparse.ArgumentParser();p.add_argument('action',choices=['drill','commands']);p.add_argument('--directory',required=True);p.add_argument('--config');p.add_argument('--environment',choices=['staging','production']);a=p.parse_args()
d=pathlib.Path(a.directory).resolve(); repo=pathlib.Path.cwd().resolve()
if d==repo or repo in d.parents: raise SystemExit('Private output must be outside repository')
d.mkdir(mode=0o700,parents=True,exist_ok=True);os.chmod(d,0o700)
if a.action=='drill':
 source=d/'synthetic-source.sqlite';dest=d/'synthetic-restored.sqlite';dump=d/'synthetic-backup.sql'
 if any(x.exists() for x in [source,dest,dump]):raise SystemExit('Use a fresh drill directory; never overwrite backups')
 db=sqlite3.connect(source);db.execute('create table drill(id text primary key, body text)');db.execute('insert into drill values(?,?)',('synthetic','合成復原演練'));db.commit()
 dump.write_text('\n'.join(db.iterdump())); db.close();other=sqlite3.connect(dest);other.executescript(dump.read_text());assert other.execute('select * from drill').fetchall()==[('synthetic','合成復原演練')];assert other.execute('pragma integrity_check').fetchone()[0]=='ok';other.close()
 for f in [source,dest,dump]:os.chmod(f,0o600)
 print('Local SQLite dump/restore integrity and data equality passed; no remote operation.')
else:
 c=json.loads(pathlib.Path(a.config).read_text());env=a.environment
 if env not in ['staging','production'] or c.get('ENVIRONMENT')!=env:raise SystemExit('Environment mismatch')
 expected='fansi-comments-staging' if env=='staging' else 'fansi-comments'
 if c.get('D1_DATABASE_NAME')!=expected or not c.get('D1_DATABASE_ID'):raise SystemExit('Explicit project DB binding required')
 config=pathlib.Path('services/comments/'+('public.'+env+'.private.json')).resolve()
 if not config.exists():raise SystemExit('Run existing private config generator first')
 bound=json.loads(config.read_text())['d1_databases'][0]
 if bound['database_id']!=c['D1_DATABASE_ID'] or bound['database_name']!=expected:raise SystemExit('Database binding mismatch')
 q=shlex.quote;backup=d/'backup.sql'
 if backup.exists():raise SystemExit('Refuse to overwrite backup')
 commands=f'''# REVIEW ONLY. Separate authorization required before each remote operation.
# Target environment: {env}; ID verified against private config.
umask 077
npx wrangler d1 export {q(expected)} --remote --config {q(str(config))} --output {q(str(backup))}
# Restore ONLY into a separately provisioned recovery database, never run blindly on live DB.
# Inspect backup and migration compatibility; bind recovery config before import.
# npx wrangler d1 execute RECOVERY_DATABASE --remote --config PRIVATE_RECOVERY_CONFIG --file {q(str(backup))}
'''
 out=d/'review-commands.sh';out.write_text(commands);os.chmod(out,0o600);print('Private command file prepared, not executed.')
