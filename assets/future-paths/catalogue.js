/* Public formation identities and routes. This model never reads pupil data. */
(function(global){
  'use strict';
  const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const list=v=>Array.isArray(v)?v:v?[v]:[];
  const TYPES=[
    ['bts','BTS / BTSA / BTSM',['BTS - BTSA - BTSM']],['but','BUT',['BUT']],['cpge','Prépa CPGE',['CPGE']],
    ['licence','Licence / double licence',['Licence','Licence sélective']],['las','Licence avec accès santé (L.AS)',[]],['pass','PASS',[]],
    ['engineering','École d’ingénieurs après le bac',["Formations des écoles d'ingénieurs"]],
    ['business','École de commerce / management',['Formations des écoles de commerce et de management']],
    ['iep','Sciences Po / IEP',["Sciences Po - Instituts d'études politiques"]],['dnmade','DN MADE',[]],
    ['art','École d’art / DNA / spectacle',["Formations d'art, de design et du spectacle vivant"]],
    ['nursing','IFSI / diplôme infirmier',[]],['paramedical','Autres études de santé',['Etudes de santé']],
    ['social','Diplôme du travail social',['Formations diplômantes du travail social']],
    ['architecture','Architecture / paysage / patrimoine',["Formations d'architecture, du paysage et du patrimoine"]],
    ['veterinary','École vétérinaire',['Formations des écoles vétérinaires','Formations des écoles nationales vétérinaires']],
    ['dcg','DCG',['DCG']],['deust','DEUST',['DEUST']],['cmi','Cursus master en ingénierie (CMI)',['C.M.I - Cursus Master en Ingénierie']],
    ['iae','IAE',["I.A.E - Instituts d'administration des entreprises"]],['lpe','Professorat des écoles',['LPE - Licence Professorat des Ecoles']],
    ['sport','Formation aux métiers du sport',['Formation aux métiers du sport','Formations aux métiers du sport']],
    ['services','Formation hôtellerie / restauration',["Formations aux métiers de l'hôtellerie restauration"]],
    ['preparation','Année préparatoire / CPES',['Formations préparatoires à l’enseignement supérieur',"Formations préparatoires à l'enseignement supérieur"]],
    ['professional','Autres formations professionnelles',['Formations professionnelles']],
    ['certificate','Certificat de spécialisation / FCIL',['Certificats de spécialisation et FCIL','Mentions complémentaires']],
    ['du','Diplôme d’université ou d’établissement',["Diplômes d'université ou d'établissement"]],['licencepro','Licence professionnelle',['Licence professionnelle']],
    ['other','Autre formation',[]]
  ].map(([id,label,mapLabels])=>({id,label,mapLabels}));
  const KEYWORDS={science:['math','scientifique','informatique','ingenieur','electronique','reseaux','genie','chimie'],international:['langues','lettres','lea','llcer','bilingue','sciences po','commerce international'],health:['sante','pass','las','sciences de la vie','infirmier','ergother','orthophon','kines','medic'],economy:['economie','gestion','ecg','commerce','comptabilite','management','finance'],society:['droit','social','politique','sociologie'],arts:['art','design','dn made','cinema','theatre','spectacle','animation','photograph'],environment:['agric','agronom','nature','environnement','veter','bcpst','ecologie','geologie'],architecture:['architecture','paysage','patrimoine','urbanisme','genie civil','batiment'],people:['psychologie','education','professorat','travail social','educateur','assistant de service social'],sport:['staps','sport','activite physique','mouvement humain'],services:['tourisme','hotellerie','restauration','cuisine','hospitality']};
  const text=r=>norm([r.program,r.lib_for_voe_ins,r.fil_lib_voe_acc,r.form_lib_voe_acc,r.detail_forma,...list(r.nm),...list(r.fl),...list(r.tf)].join(' '));
  function types(r){
    if(r.formationTypes?.length)return r.formationTypes;
    const s=text(r),labels=list(r.tf).map(norm),found=[];
    const add=id=>{if(!found.includes(id))found.push(id);};
    if(/\bbtsa?\b|\bbtsm\b/.test(s)||r.fili==='BTS')add('bts');
    if(/\bbut\b/.test(s)||r.fili==='BUT')add('but');
    if(/\bcpge\b/.test(s)||r.fili==='CPGE')add('cpge');
    if(/\bpass\b|parcours d.acces specifique sante/.test(s)||r.fili==='PASS')add('pass');
    if(/\blas\b|\bl\.as\b|acces sante/.test(s)||r.fili==='Licence_Las')add('las');
    if(/dn made/.test(s))add('dnmade');
    if(/infirmier/.test(s)||r.fili==='IFSI')add('nursing');
    if(/professorat|\bpppe\b/.test(s))add('lpe');
    if(/\bdcg\b|diplome de comptabilite et de gestion/.test(s))add('dcg');
    if(/\bdeust\b/.test(s))add('deust');
    if(/\bcmi\b|cursus master.*ingenierie/.test(s))add('cmi');
    if(/veterinaire/.test(s))add('veterinary');
    if(/sciences po|instituts? d.etudes politiques/.test(s))add('iep');
    if(!found.includes('bts')&&/formation d.ingenieur|ecole.*ingenieur/.test(s))add('engineering');
    if(!found.includes('bts')&&/formation.*ecoles.*commerce|international bba|bachelor.*management/.test(s))add('business');
    if(/classe preparatoire aux etudes superieures/.test(s))add('preparation');
    for(const t of TYPES)if(t.mapLabels.some(label=>labels.includes(norm(label))))add(t.id);
    if(!found.length&&/licence/.test(s))add('licence');
    if(!found.length&&/diplome national d.art|ecoles.*art/.test(s))add('art');
    if(!found.length&&/ergother|orthophon|kines|psychomotr|medic/.test(s))add('paramedical');
    if(!found.length&&/educateur|assistant de service social/.test(s))add('social');
    return found.length?found:['other'];
  }
  function families(r){
    if(r.families?.length)return r.families;
    const s=text(r),out=[],add=id=>{if(!out.includes(id))out.push(id);};
    if(/architecture|paysage|patrimoine|urbanisme/.test(s))add('architecture');
    if(/staps|sport|activites physiques|mouvement humain/.test(s))add('sport');
    if(/tourisme|hotellerie|restauration|cuisine|hospitality/.test(s))add('services');
    if(/psychologie|professorat|education|educateur|assistant de service social/.test(s))add('people');
    if(/agric|agronom|protection.*nature|environ|veterinaire|bcpst|ecologie|geologie/.test(s))add('environment');
    if(/\barts?\b|dn made|design|cinema|theatr|spectacle|animation|photograph/.test(s)&&!out.includes('architecture'))add('arts');
    if(/sciences po|instituts? d.etudes politiques|reseau scpo/.test(s)){add('society');add('international');}
    if(/b\s*\/\s*l/.test(s)){add('society');add('international');add('economy');}
    if(/droit|politique|social|sociologie/.test(s))add('society');
    if(/langue|lettre|\blea\b|llcer|bilingue|anglo.saxon|commerce international/.test(s))add('international');
    if(/sante|\bpass\b|\blas\b|\bl\.as\b|sciences.*vie|biologie|infirmier|ergother|orthophon|kines|veterinaire/.test(s))add('health');
    if(/commerce|gestion|economie|ecg|comptabilite|management|finance/.test(s))add('economy');
    if(!out.includes('arts')&&!out.includes('services')&&/mpsi|pcsi|mp2i|bcpst|ingenieur|math|physique|chimie|informatique|scientifique|technologie|electronique|reseaux|genie/.test(s))add('science');
    return out.length?out:['unknown'];
  }
  const typeLabel=g=>types(g).slice(0,2).map(id=>TYPES.find(t=>t.id===id)?.label||id).join(' · ');
  const codeFromMap=r=>/^\d+$/.test(String(r.gta||''))?String(r.gta):null;
  function fromMap(r,known=[]){
    const code=codeFromMap(r);if(!code||!r.etab_uai||String(r.annee)!=='2026')return null;
    const program=list(r.nm).join(' · '),apprenticeship=list(r.app).some(a=>norm(a).includes('apprentissage'))||norm(program).includes('apprentissage');
    const existing=known.find(g=>String(g.code)===code&&g.uai===r.etab_uai&&g.apprenticeship===apprenticeship);
    const attrs={formationTypes:types(r),offerSession:'2026',offerSource:'https://data.enseignementsup-recherche.gouv.fr/explore/dataset/fr-esr-cartographie_formations_parcoursup/',apprenticeship};
    if(existing)return {...existing,...attrs};
    const f=families(r),url='https://dossier.parcoursup.fr/Candidats/public/fiches/afficherFicheFormation?g_ta_cod='+code;
    const conflict=known.some(g=>String(g.code)===code);
    return {id:'ps-'+code+(conflict?'-'+r.etab_uai+(apprenticeship?'-apprenticeship':''):''),code,uai:r.etab_uai,name:r.etab_nom,program,city:r.commune,region:r.region,departmentName:r.departement,dep:norm(r.departement)==='alpes-maritimes'?'06':undefined,
      stage:'postbac',family:f[0],families:f,session:'2026',statisticsSession:2025,historyEnd:2025,statisticsEligible:!apprenticeship,
      source:'Parcoursup · offre 2026',url,verifiedCriteria:false,...attrs,
      practical:apprenticeship?'Vérifier le calendrier, les conditions d’âge, les démarches de contrat et l’accompagnement pour trouver un employeur.':'Vérifier les frais, le logement, les conditions d’entrée et le calendrier.'};
  }
  function enrich(g){return {...g,apprenticeship:g.apprenticeship===true,formationTypes:types(g)};}
  function matches(g,type='all',mode='all',route='all'){
    return (type==='all'||types(g).includes(type))&&(mode==='all'||(mode==='apprenticeship'?g.apprenticeship===true:g.apprenticeship!==true))&&(route==='all'||g.schoolRoute===route);
  }
  global.FutureCatalogue={types:TYPES,typeIds:types,typeLabel,families,keywords:KEYWORDS,fromMap,enrich,matches,normalize:norm};
})(globalThis);
