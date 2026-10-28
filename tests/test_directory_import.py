import csv,importlib.util,tempfile,unittest
from pathlib import Path
spec=importlib.util.spec_from_file_location('importer',Path(__file__).parents[1]/'scripts/prepare_directory_import.py');importer=importlib.util.module_from_spec(spec);spec.loader.exec_module(importer)
class ImportTest(unittest.TestCase):
 def fixture(self,**extra):
  return {'Code NAF établissement':'56.10C','Statut administratif établissement':'A','SIRET':'12345678901234','Nom commercial / enseigne':"Chez l'ami",'Raison sociale':'Entreprise test','Adresse complète':'12 rue du Centre','Code postal':'78190','Commune':'TRAPPES','Département':'78','Latitude':'','Longitude':'','Date de consultation':'2026-10-25','URL source administrative':'https://annuaire-entreprises.data.gouv.fr/etablissement/12345678901234',**extra}
 def run_extract(self,rows):
  with tempfile.TemporaryDirectory() as tmp:
   path=Path(tmp)/'input.csv'
   with path.open('w',encoding='utf-8-sig',newline='') as f:
    writer=csv.DictWriter(f,fieldnames=rows[0].keys(),delimiter=';');writer.writeheader();writer.writerows(rows)
   return importer.extract(path)
 def test_only_active_quick_restaurants_and_siret_dedup(self):
  row=self.fixture();records,total,digest=self.run_extract([row,row,self.fixture(**{'Code NAF établissement':'10.71C'}),self.fixture(**{'Statut administratif établissement':'F'})]);self.assertEqual(total,4);self.assertEqual(len(records),1);self.assertEqual(records[0]['siret'],'12345678901234');self.assertIsNone(records[0]['latitude']);self.assertIsNone(records[0]['mini_site_path']);self.assertEqual(len(digest),64)
 def test_conflicting_siret_fails(self):
  with self.assertRaises(ValueError):self.run_extract([self.fixture(),self.fixture(**{'Nom commercial / enseigne':'Autre nom'})])
 def test_sql_payload_preserves_quotes_without_touching_merchants(self):
  records,_,_=self.run_extract([self.fixture()]);sql=importer.batch_sql(records);self.assertIn("Chez l'ami",sql);self.assertIn('on conflict(siret)',sql);self.assertNotIn('insert into public.merchants',sql)
 def test_unknown_source_is_rejected(self):
  with self.assertRaises(ValueError):self.run_extract([self.fixture(**{'URL source administrative':'https://untrusted.example'})])
if __name__=='__main__':unittest.main()
