#!/usr/bin/env python3
"""Prepare idempotent SQL batches from the supplied Sirene directory CSV.
Only active 56.10C establishments are selected; no merchant/account is created.
"""
import argparse, csv, hashlib, json, re
from datetime import date
from pathlib import Path

FIELDS = ['siret','display_name','legal_name','naf_code','administrative_status','address_line','postal_code','city','department','latitude','longitude','source_url','source_checked_on','source_sha256','mini_site_path']

def extract(path):
    digest=hashlib.sha256(path.read_bytes()).hexdigest()
    records={}
    with path.open(encoding='utf-8-sig',newline='') as stream:
        rows=list(csv.DictReader(stream,delimiter=';'))
    for row in rows:
        if row['Code NAF établissement'].strip()!='56.10C' or row['Statut administratif établissement'].strip()!='A':
            continue
        siret=row['SIRET'].strip()
        if not re.fullmatch(r'\d{14}',siret): raise ValueError('Invalid SIRET: '+siret)
        name=(row['Nom commercial / enseigne'] or row['Raison sociale']).strip()
        if not name or len(name)>250: raise ValueError('Invalid establishment name: '+siret)
        source='https://annuaire-entreprises.data.gouv.fr/etablissement/'+siret
        if row['URL source administrative'].strip()!=source: raise ValueError('Unexpected source URL: '+siret)
        postal=row['Code postal'].strip()
        if not re.fullmatch(r'\d{5}',postal): raise ValueError('Invalid postal code: '+siret)
        record=dict(zip(FIELDS,[siret,name,row['Raison sociale'].strip(),'56.10C','A',row['Adresse complète'].strip(),postal,row['Commune'].strip(),row['Département'].strip(),float(row['Latitude']) if row['Latitude'] else None,float(row['Longitude']) if row['Longitude'] else None,source,date.fromisoformat(row['Date de consultation']).isoformat(),digest,None]))
        # Existing mini-site: name/address match reviewed against its current source.
        if siret=='84749958900020' and record['city']=='TRAPPES' and '15 BOULEVARD MARTIN LUTHER KING' in record['address_line']:
            record['mini_site_path']='/la-petite-pause/'
            record['display_name']='La Petite Pause'
        if siret in records and records[siret]!=record: raise ValueError('Conflicting duplicate: '+siret)
        records[siret]=record
    return list(records.values()),len(rows),digest

def batch_sql(records):
    payload=json.dumps(records,ensure_ascii=False,separators=(',',':'))
    marker='$directory_import$'
    if marker in payload: raise ValueError('Unexpected SQL delimiter in input')
    definitions=', '.join(f'{field} '+('double precision' if field in ['latitude','longitude'] else 'date' if field=='source_checked_on' else 'text') for field in FIELDS)
    assignments=', '.join(f'{f}=excluded.{f}' for f in FIELDS if f not in ['siret','mini_site_path'])
    return f"insert into public.directory_businesses ({','.join(FIELDS)}) select {','.join(FIELDS)} from jsonb_to_recordset({marker}{payload}{marker}::jsonb) as x({definitions}) on conflict(siret) do update set {assignments},mini_site_path=coalesce(excluded.mini_site_path,directory_businesses.mini_site_path),imported_at=now();\nselect count(*) as imported_references from public.directory_businesses;\n"

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('input',type=Path);parser.add_argument('--output-dir',type=Path,required=True);parser.add_argument('--batch-size',type=int,default=200);args=parser.parse_args()
    if not 1<=args.batch_size<=500: parser.error('batch size must be between 1 and 500')
    records,source_total,digest=extract(args.input);args.output_dir.mkdir(parents=True,exist_ok=True)
    batches=[]
    for i in range(0,len(records),args.batch_size):
        target=args.output_dir/f'batch-{i//args.batch_size:03d}.sql';target.write_text(batch_sql(records[i:i+args.batch_size]),encoding='utf-8');batches.append(str(target))
    print(json.dumps({'source_total':source_total,'import_count':len(records),'excluded':source_total-len(records),'source_sha256':digest,'batches':batches},ensure_ascii=False))
