(function(){
  'use strict';
  const $=selector=>document.querySelector(selector);
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt=value=>value===null||value===undefined?'—':Number(value).toLocaleString('fr-FR',{maximumFractionDigits:2});
  const date=value=>value?new Date(value+'T12:00:00').toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric'}):'non renseignée';
  const normalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const safeURL=value=>{try{const u=new URL(value);return u.protocol==='https:'?u.href:null;}catch{return null;}};
  const link=(url,label)=>safeURL(url)?'<a target="_blank" rel="noopener noreferrer" href="'+esc(safeURL(url))+'">'+esc(label)+' ↗</a>':esc(label);
  const withDemos=p=>({...p,children:[...(p.children||[]).filter(c=>!c.demo),...(window.FutureDemos||[])]});
  let payload=withDemos(JSON.parse($('#profile-data').textContent)),catalog=JSON.parse($('#catalog-data').textContent).map(FutureCatalogue.enrich);
  let child=payload.activeChild||payload.children?.[0]?.name,results=[],searchMessage='',requestVersion=0,searchController=null;
  let searchPage=0,searchLive=false,searchHasNext=false,lastBrowse=false,searchTotal=0;
  const populationLoads=new Map(),populationCache=new Map();
  const embedded=parent!==window;
  const FAMILIES=[
    {id:'science',icon:'🔬',name:'Sciences, ingénierie & informatique',domains:['math','physics','integrated'],prepare:'Raisonner, expliquer une démarche et progresser en maths et en sciences.',routes:'Prépa puis école · école post-bac · licence scientifique puis master',now:'Essayer un petit défi de logique, de programmation ou une expérience, puis expliquer la démarche.'},
    {id:'international',icon:'🌍',name:'Langues, lettres & international',domains:['french','language'],prepare:'Lire, écrire et s’exprimer à l’oral, en français et dans les langues étudiées.',routes:'Section internationale · licence langues/lettres · prépa littéraire · droit bilingue · IEP, selon le projet',now:'Lire ou regarder un sujet qui te plaît dans une langue étudiée, puis en faire un court récit à l’oral.'},
    {id:'health',icon:'🌱',name:'Santé & sciences du vivant',domains:['biology','physics','integrated','math'],prepare:'Construire les bases scientifiques, la compréhension de textes et une organisation régulière.',routes:'PASS ou L.AS selon l’offre et les règles d’accès · biologie · autres formations de santé',now:'Explorer un métier de la santé ou du vivant et raconter ce qui t’attire dans ses activités.'},
    {id:'economy',icon:'📊',name:'Économie, gestion & commerce',domains:['math','french','language'],prepare:'Garder des bases en maths, développer l’expression et la curiosité pour le monde économique.',routes:'Université · BUT · prépa ECG puis école · école post-bac, selon le projet',now:'Choisir une question de la vie quotidienne sur l’économie et chercher deux façons de l’expliquer.'},
    {id:'society',icon:'⚖️',name:'Droit & sciences sociales',domains:['french','history','language'],prepare:'Comprendre un texte, argumenter, confronter des sources et s’exprimer clairement.',routes:'Licence de droit/sciences sociales · IEP · prépa littéraire, selon l’objectif',now:'Choisir un sujet d’actualité adapté à ton âge, comparer deux sources et présenter ton avis.'},
    {id:'arts',icon:'🎨',name:'Arts, création & design',domains:['art'],prepare:'Explorer une pratique choisie, développer sa culture et conserver des productions.',routes:'Pratiques au collège/lycée · DN MADE · école d’art/design · université, selon le domaine',now:'Créer quelque chose dans une pratique qui te plaît et expliquer tes choix.'},
    {id:'environment',icon:'🌿',name:'Nature, environnement & animaux',domains:['biology','integrated','math'],prepare:'Observer le vivant et découvrir les métiers de la nature, de l’agriculture et des animaux.',routes:'Bac général, technologique ou professionnel selon le projet · BTSA · BUT · licence · BCPST · écoles agronomiques ou vétérinaires',now:'Observer un milieu ou découvrir un métier lié aux animaux, puis raconter ce que tu as appris.'},
    {id:'architecture',icon:'🏛️',name:'Architecture, paysage & patrimoine',domains:['french','math','history'],prepare:'Observer les espaces, représenter une idée et comprendre les usages d’un lieu.',routes:'Bac selon le cursus · BTSA paysage · BTS/BUT bâtiment · école d’architecture ou de paysage',now:'Dessiner ou photographier un lieu et proposer une amélioration pour les personnes qui l’utilisent.'},
    {id:'people',icon:'🤝',name:'Psychologie, éducation & accompagnement',domains:['french','history','language'],prepare:'Comprendre les personnes, s’exprimer clairement et découvrir les métiers de l’éducation et du social.',routes:'Licence psychologie ou professorat · BUT carrières sociales · diplômes d’État du travail social',now:'Découvrir un métier d’accompagnement et expliquer ce qui t’intéresse dans le travail avec les autres.'},
    {id:'sport',icon:'🏃',name:'Sport & activité physique',domains:['french','biology'],prepare:'Découvrir les métiers du sport, la santé et l’encadrement ; documenter sa pratique et sa motivation.',routes:'STAPS · DEUST · formations professionnelles du sport selon les conditions d’âge et de pratique',now:'Découvrir une activité et les métiers qui l’entourent, au-delà de la compétition.'},
    {id:'services',icon:'🧳',name:'Tourisme, hôtellerie & services',domains:['french','language'],prepare:'Communiquer, travailler en équipe et découvrir les situations concrètes des métiers de service.',routes:'CAP · bac professionnel ou technologique · BTS tourisme/hôtellerie · autres études selon le métier',now:'Découvrir les activités d’un métier du tourisme ou de la restauration et raconter une journée type.'}
  ];
  const family=id=>FAMILIES.find(f=>f.id===id)||{id:'unknown',name:'Projet à explorer',domains:[],prepare:'Identifier les compétences et les activités de la formation choisie, puis lire ses attendus officiels.',routes:'Comparer plusieurs formations menant au projet envisagé',now:'Découvrir un métier ou une activité qui te plaît et raconter ce qui t’attire.'};
  const familiesFor=g=>g.families?.length?g.families:[g.family];
  const matchesFamily=(g,id)=>id==='all'||familiesFor(g).includes(id);
  const artisticGoal=g=>familiesFor(g).includes('arts');
  const goalFamily=g=>family(matchesFamily(g,activeFamily())&&activeFamily()!=='all'?activeFamily():g.family);
  const goalDomains=g=>g.readinessDomains||(artisticGoal(g)?['french','language']:goalFamily(g).domains);
  const REGIONS=[['84','Auvergne-Rhône-Alpes'],['27','Bourgogne-Franche-Comté'],['53','Bretagne'],['24','Centre-Val de Loire'],['94','Corse'],['44','Grand Est'],['32','Hauts-de-France'],['11','Île-de-France'],['28','Normandie'],['75','Nouvelle-Aquitaine'],['76','Occitanie'],['52','Pays de la Loire'],['93',"Provence-Alpes-Côte d’Azur"],['01','Guadeloupe'],['02','Martinique'],['03','Guyane'],['04','La Réunion'],['06','Mayotte']];
  const regionKey=value=>normalize(value).replace(/[^a-z0-9]/g,'');
  const regionOf=g=>g.regionCode||REGIONS.find(([,name])=>regionKey(name)===regionKey(g.region))?.[0]||({'06':'93','75':'11','69':'84','33':'75','31':'76'})[g.dep];
  const matchesScope=g=>state.scope==='local'?g.dep==='06':state.scope==='regional'?regionOf(g)===state.region:true;
  const scopeLabel=()=>state.scope==='local'?'Alpes-Maritimes':state.scope==='regional'?REGIONS.find(r=>r[0]===state.region)?.[1]||'Région choisie':'France entière';
  function scopeWhere(kind){
    if(state.scope==='local')return kind==='map'?'departement="Alpes-Maritimes"':kind==='ps'?'dep="06"':'code_departement="006"';
    if(state.scope!=='regional')return '';
    if(kind==='ly')return 'code_region='+JSON.stringify(state.region);
    const name=REGIONS.find(r=>r[0]===state.region)?.[1]||'';
    const pattern='%'+normalize(name).split(/[^a-z0-9]+/).filter(Boolean).join('%')+'%';
    return (kind==='map'?'region':'region_etab_aff')+' like '+JSON.stringify(pattern);
  }
  function saved(){
    try{const s=JSON.parse(localStorage.getItem('futurePaths.v1.'+child)||'{}');
      return {interests:Array.isArray(s.interests)?s.interests:[],activeFamily:s.activeFamily||'',scope:['local','regional','national'].includes(s.scope)?s.scope:'national',region:REGIONS.some(r=>r[0]===s.region)?s.region:'93',historyWindow:s.historyWindow===5?5:3,formationType:FutureCatalogue.types.some(t=>t.id===s.formationType)?s.formationType:'all',trainingMode:['all','school','apprenticeship'].includes(s.trainingMode)?s.trainingMode:'all',schoolRoute:['all','general','technological','professional'].includes(s.schoolRoute)?s.schoolRoute:'all',habits:s.habits||'',feedback:s.feedback||'',goals:Array.isArray(s.goals)?s.goals.map(g=>({...g,...catalog.find(c=>c.id===g.id)})):[],activeGoal:s.activeGoal||'',done:s.done||{},reviews:Array.isArray(s.reviews)?s.reviews:[],reviewDraft:s.reviewDraft||''};
    }catch{return {interests:[],activeFamily:'',scope:'national',region:'93',historyWindow:3,formationType:'all',trainingMode:'all',schoolRoute:'all',habits:'',feedback:'',goals:[],activeGoal:'',done:{},reviews:[],reviewDraft:''};}
  }
  let state=saved(),storageOK=true;
  function save(){try{localStorage.setItem('futurePaths.v1.'+child,JSON.stringify(state));storageOK=true;}catch{storageOK=false;}
    const status=$('#save-status');if(status)status.textContent=storageOK?'Enregistré dans ce navigateur, pour '+child+'.':'Les modifications restent dans cette page ; le stockage du navigateur est indisponible.';
  }
  const pupil=()=>payload.children?.find(p=>p.name===child)||{name:child,years:[]};
  const latest=()=>pupil().years.at(-1)||{rows:[],tests:[],count:0};
  function domainRows(domains,year=latest()){return (year.rows||[]).filter(r=>domains.includes(r.domain));}
  function appuis(domains,year=latest()){return domainRows(domains,year).filter(r=>Number.isFinite(r.you)&&Number.isFinite(r.cls)&&r.you>=r.cls);}
  function history(domains){return pupil().years.filter(y=>appuis(domains,y).length).length;}
  function familyReading(f){
    const rows=domainRows(f.domains),positive=appuis(f.domains);
    if(f.id==='arts') return {label:'À explorer',type:'explore',text:'Le plaisir de créer et les réalisations comptent. Les notes d’arts ou de musique ne suffisent pas à choisir une formation.'};
    if(!rows.length) return {label:'À explorer',type:'explore',text:'Les acquis utiles à cette voie sont encore peu documentés. Ton intérêt peut être le point de départ.'};
    if(!rows.some(r=>Number.isFinite(r.cls))) return {label:'À explorer',type:'explore',text:'Des résultats sont disponibles ; le contexte et les appréciations restent à compléter.'};
    if(!positive.length) return {label:'Piste à consolider',type:'explore',text:'Les matières utiles à cette voie méritent un point avec tes professeurs. Un projet peut rester ouvert pendant que tu renforces ses bases.'};
    return {label:'Piste cohérente à préparer',type:'',text:'Des points d’appui en '+positive.map(r=>displaySubject(r.subject)).slice(0,2).join(' et ')+'. Si ces acquis se maintiennent aux prochains niveaux et que la voie te plaît, elle mérite d’être préparée.'};
  }
  function displaySubject(s){const map={'MATHEMATIQUES':'maths','FRANCAIS':'français','PHYSIQUE-CHIMIE':'physique-chimie','PHYSIQUE CHIMIE':'physique-chimie','EIS':'sciences intégrées','HISTOIRE-GEOGRAPHIE':'histoire-géographie','HISTOIRE,GEOGRAPHIE & EMC':'histoire-géographie','ANGLAIS':'anglais','ANGLAIS LV1':'anglais'};return map[s]||String(s).toLowerCase();}
  function subjectKey(r){
    if(r.domain!=='language')return r.domain==='other'?normalize(r.subject):r.domain;
    const s=normalize(r.subject);
    if(/biling/.test(s))return 'language-bilingual';
    if(/esp/.test(s))return 'language-spanish';
    if(/allemand/.test(s))return 'language-german';
    if(/llc[12]/.test(s))return s.match(/llc[12]/)[0];
    return normalize(r.subject).replace(/lv[12]/g,'').trim();
  }
  function subjectHistory(row){return pupil().years.map(y=>({year:y,row:(y.rows||[]).find(r=>subjectKey(r)===subjectKey(row))})).filter(x=>x.row);}
  function portraitHTML(){
    const groups=[{name:'maths',domains:['math']},{name:'français et langues',domains:['french','language']},{name:'sciences',domains:['physics','biology','integrated']},{name:'histoire-géographie',domains:['history']}];
    const supported=groups.filter(g=>appuis(g.domains).length),durable=groups.filter(g=>appuis(g.domains).some(r=>subjectHistory(r).filter(({row})=>row.cls!==null&&row.you>=row.cls).length>1));
    const watch=latest().rows.filter(r=>['math','physics','french','language','history'].includes(r.domain)&&Number.isFinite(r.cls)&&r.you<r.cls);
    const display=pupil().name.replace(/^Démo · /,'').split(' — ')[0];
    const appuiText=supported.length?supported.map(g=>g.name).join(', '):'Les prochains bulletins permettront de préciser les appuis.';
    const continuity=durable.length?'Les appuis en '+durable.map(g=>g.name).join(', ')+' se retrouvent dans plusieurs années.':latest().tests.length?'Les tests nationaux complètent les premiers résultats du bulletin.':'Des premiers signaux, à confirmer au prochain bulletin.';
    const summary=durable.some(g=>g.domains.includes('language'))?'Le français et les langues constituent des appuis qui se confirment. Plusieurs parcours restent à explorer.':appuis(['math']).length?'Les maths sont un point d’appui actuel. Les prochaines étapes permettront de préciser les voies scientifiques et les autres envies.':'Le projet reste ouvert. Les résultats, les envies et les retours des professeurs aideront à choisir les prochaines étapes.';
    const missing=['oral',...(!state.habits?['organisation du travail']:[]),...(!state.interests.length?['intérêts']:[])];
    return '<section class="student-portrait" id="student-portrait" aria-label="Portrait de l’élève"><div class="portrait-heading"><div class="portrait-avatar" aria-hidden="true">'+esc(display.slice(0,1))+'</div><div><span class="eyebrow">Ton portrait aujourd’hui</span><h2>Portrait de '+esc(display)+'</h2><p>'+esc(summary)+'</p></div><span class="pill muted">'+pupil().years.length+' année(s) de repères'+(pupil().demo?' · fictifs':'')+'</span></div><div class="portrait-grid"><div><span class="portrait-symbol">🌱</span><h3>Tes points d’appui</h3><p>'+esc(appuiText)+'.</p></div><div><span class="portrait-symbol">🧩</span><h3>Ce qui se confirme</h3><p>'+esc(continuity)+'</p></div><div><span class="portrait-symbol">🔎</span><h3>À regarder ensuite</h3><p>'+esc(watch.length?'Refaire le point en '+[...new Set(watch.map(r=>displaySubject(r.subject)))].slice(0,2).join(' et ')+', avec les prochaines évaluations.':'Confirmer les acquis et découvrir les activités qui te plaisent.')+'</p></div></div><div class="portrait-foot"><span>À compléter : '+esc(missing.join(', '))+'.</span>'+(state.interests.length?'<span>Envies renseignées : '+esc(state.interests.map(id=>family(id).name).join(' · '))+'</span>':'')+'</div></section>';
  }
  function scopeControlsHTML(){
    return '<div class="scope-controls"><div><span class="scope-label">Où explorer ?</span><div class="scope-buttons" role="group" aria-label="Périmètre géographique">'+[['local','📍 Local'],['regional','🗺️ Régional'],['national','🇫🇷 National']].map(([id,label])=>'<button data-scope="'+id+'" aria-pressed="'+(state.scope===id)+'">'+label+'</button>').join('')+'</div></div><label class="region-select '+(state.scope==='regional'?'':'hide')+'">Région<select id="region">'+REGIONS.map(([id,name])=>'<option value="'+id+'" '+(state.region===id?'selected':'')+'>'+esc(name)+'</option>').join('')+'</select></label><div class="scope-current">'+esc(scopeLabel())+'<br><span>Mobilité et internat possibles</span></div></div>';
  }
  function catalogueFiltersHTML(){
    return '<div class="catalogue-filters"><label>Type après le bac<select id="formation-type"><option value="all">Tous les types</option>'+FutureCatalogue.types.map(t=>'<option value="'+t.id+'" '+(state.formationType===t.id?'selected':'')+'>'+esc(t.label)+'</option>').join('')+'</select></label><label>Statut après le bac<select id="training-mode">'+[['all','Scolaire et apprentissage'],['school','Sous statut scolaire'],['apprenticeship','En apprentissage']].map(([id,label])=>'<option value="'+id+'" '+(state.trainingMode===id?'selected':'')+'>'+label+'</option>').join('')+'</select></label><label>Chemin au lycée<select id="school-route">'+[['all','Tous les chemins'],['general','Voie générale'],['technological','Voie technologique'],['professional','Voie professionnelle / CAP']].map(([id,label])=>'<option value="'+id+'" '+(state.schoolRoute===id?'selected':'')+'>'+label+'</option>').join('')+'</select></label></div>';
  }
  const matchesCatalogue=g=>FutureCatalogue.matches(g,state.formationType,state.trainingMode,state.schoolRoute)&&(state.schoolRoute==='all'||g.stage==='lycee')&&(state.formationType==='all'||g.stage==='postbac');
  function schoolPathsHTML(){
    return '<div class="school-paths" aria-label="Chemins après la troisième">'+[
      ['📚','Voie générale','Des enseignements à choisir en seconde, puis des spécialités en Première.'],
      ['🛠️','Voie technologique','Des enseignements appliqués : STI2D, STL, STMG, ST2S, STD2A, STAV, STHR ou S2TMD selon le projet.'],
      ['🤲','Voie professionnelle','CAP ou bac professionnel, en lycée ou en apprentissage selon l’offre ; des poursuites d’études restent possibles.']
    ].map(([icon,title,body])=>'<article><span aria-hidden="true">'+icon+'</span><h3>'+title+'</h3><p>'+body+'</p></article>').join('')+'</div>';
  }
  function admissionsHTML(g){
    if(g.stage!=='postbac')return '';
    if(g.statisticsEligible===false)return '<section class="admissions-history"><h3>Contexte d’admission à documenter</h3><p class="subtle">Cette offre '+esc(g.offerSession||g.session)+' est en apprentissage. La base historique utilisée ici porte sur les formations hors apprentissage ; elle ne fournit pas de taux comparable pour ce cursus. Vérifier les modalités de sélection et de contrat sur la fiche officielle.</p></section>';
    const s=FutureAdmissions.summary(g,state.historyWindow),percent=value=>value===null?'Non publié':Number(value).toLocaleString('fr-FR',{maximumFractionDigits:1})+' %';
    const label=(count)=>count+'/'+s.window+' années renseignées';
    const any=s.rows.some(r=>r.available),hasHistory=Array.isArray(g.history)&&g.history.length>1;
    return '<section class="admissions-history" aria-label="Historique des admissions"><div class="admissions-heading"><div><h3>La formation sur plusieurs années</h3><p>'+s.start+'–'+s.end+' · moyennes des années disponibles</p></div><div class="history-window" role="group" aria-label="Durée de l’historique"><button data-history-window="3" aria-pressed="'+(state.historyWindow===3)+'">3 ans</button><button data-history-window="5" aria-pressed="'+(state.historyWindow===5)+'">5 ans</button></div></div>'+
      '<div class="admissions-metrics"><div><span>Accès moyen</span><strong>'+percent(s.accessMean)+'</strong><small>'+label(s.accessCount)+(s.accessCount?' · de '+percent(s.accessMin)+' à '+percent(s.accessMax):'')+'</small></div><div><span>Candidatures confirmées / an</span><strong>'+ (s.candidatesMean===null?'Non publié':Math.round(s.candidatesMean).toLocaleString('fr-FR'))+'</strong><small>'+label(s.candidatesCount)+'</small></div><div><span>Propositions retenues en moyenne</span><strong>'+percent(s.retainedMean)+'</strong><small>Acceptations ÷ propositions reçues · '+label(s.retainedCount)+'</small></div></div>'+
      (any?'<div class="candidature-chart" role="img" aria-label="Candidatures par année">'+s.rows.map(r=>'<div class="candidature-year"><span>'+r.year+'</span><div class="candidature-track">'+(r.available&&r.candidates!==null?'<span style="width:'+Math.max(2,r.candidates/Math.max(...s.rows.map(r=>r.candidates||0),1)*100)+'%"></span>':'')+'</div><strong>'+fmt(r.candidates)+'</strong></div>').join('')+'</div>':'<p class="subtle small-gap">Historique à charger pour cette formation.</p>')+
      (!hasHistory?'<button data-load-history="'+esc(g.id)+'" class="quiet small-gap">Charger l’historique officiel</button><p class="notification" id="history-status"></p>':'')+
      '<details class="admissions-detail"><summary>Voir les chiffres annuels et la définition des deux taux</summary><div class="tablewrap"><table><thead><tr><th>Année</th><th>Candidatures confirmées</th><th>Places</th><th>Taux d’accès</th><th>Propositions reçues</th><th>Acceptations Parcoursup</th><th>Propositions retenues</th></tr></thead><tbody>'+s.rows.map(r=>'<tr><td>'+r.year+'</td><td>'+fmt(r.candidates)+'</td><td>'+fmt(r.places)+'</td><td>'+percent(r.access)+'</td><td>'+fmt(r.proposals)+'</td><td>'+fmt(r.accepted)+'</td><td>'+percent(r.proposals>0&&r.accepted!==null&&r.accepted<=r.proposals?r.accepted/r.proposals*100:null)+'</td></tr>').join('')+'</tbody></table></div><p><strong>Taux d’accès :</strong> part des candidats en phase principale classés au moins aussi favorablement que le dernier appelé de leur groupe, y compris ceux ayant renoncé avant la proposition. Les candidatures affichées sont les vœux confirmés en phase principale.</p><p><strong>Propositions retenues :</strong> acceptations finales sur Parcoursup ÷ candidats ayant effectivement reçu une proposition, sur l’ensemble de la procédure. Ce taux décrit les choix des candidats ; il ne mesure pas les chances d’un nouvel élève.</p><p class="subtle">Moyennes simples des taux annuels publiés ou calculés avec leurs deux effectifs correspondants. Un taux absent reste absent ; les valeurs officielles arrondies ne sont pas remplacées par admis/candidats. Les acceptations ne constituent pas une vérification des inscriptions à la rentrée.</p><p>'+link('https://data.enseignementsup-recherche.gouv.fr/explore/dataset/fr-esr-parcoursup/','Source ministérielle : Parcoursup')+' · historiques annuels '+s.start+'–'+s.end+'.</p></details></section>';
  }
  function activeFamily(){return state.activeFamily||pupil().demoFamily||state.interests[0]||'all';}
  const populationKey=g=>[g.code,g.uai,g.statisticsSession??g.session].join('|');
  function populationChartHTML(group,kind){
    if(group.status!=='ready')return '<p class="population-empty">'+(group.status==='empty'?(kind==='mentions'?'Aucun nouveau bachelier parmi les acceptations de cette session.':'Aucune proposition acceptée pour cette session.'):group.status==='inconsistent'?'Les effectifs publiés ne concordent pas : répartition à vérifier.':'Répartition non publiée ou incomplète.')+'</p>';
    return '<div class="population-bars">'+group.rows.map(row=>'<div class="population-row population-'+row.key+'" data-population-category="'+row.key+'"><div><span>'+esc(row.label)+'</span><strong>'+row.percent.toLocaleString('fr-FR',{maximumFractionDigits:1})+' % <small>· '+fmt(row.count)+'</small></strong></div><div class="population-track" aria-hidden="true"><span style="width:'+row.percent+'%"></span></div></div>').join('')+'</div>';
  }
  function populationHTML(g){
    if(g.stage!=='postbac')return '';
    if(g.statisticsEligible===false)return '<section class="population-section"><h3>Les profils ayant choisi cette formation</h3><p class="subtle">Le portrait de cette formation en apprentissage n’est pas disponible dans la base statistique utilisée. Les critères et les démarches de contrat restent les repères utiles.</p></section>';
    const s=FutureAdmissions.populationSummary(g),status=populationLoads.get(populationKey(g));
    const loading=status==='loading',canLoad=!!(g.code&&g.uai),missing=!s||s.origins.status==='missing'||s.mentions.status==='missing';
    return '<section class="population-section" aria-label="Profil collectif des candidats"><div class="population-heading"><div><h3>Les profils qui ont retenu cette formation</h3><p>'+(s?'Session '+s.year+' · '+fmt(s.accepted)+' acceptations sur Parcoursup':'Portrait collectif post-bac · session '+esc(g.statisticsSession??g.session??'à préciser'))+'</p></div><span class="pill muted">'+(loading?'Chargement…':'Repères de parcours')+'</span></div>'+
      (s?'<div class="population-grid"><div class="population-panel" data-population-chart="origins"><h4>Parcours des candidats</h4><p class="population-caption">Nouveaux bacheliers par type de bac et autres profils · '+fmt(s.accepted)+' acceptations</p>'+populationChartHTML(s.origins,'origins')+'</div><div class="population-panel" data-population-chart="mentions"><h4>Mentions au bac</h4><p class="population-caption">Parmi les '+fmt(s.neobac)+' nouveaux bacheliers ayant accepté</p>'+populationChartHTML(s.mentions,'mentions')+(s.neobac>0&&s.neobac<10?'<p class="population-small">Petit effectif : '+fmt(s.neobac)+' nouveau(x) bachelier(s). Lire aussi les nombres de candidats.</p>':'')+'</div></div><p class="population-note">Les autres profils comprennent notamment les réorientations et les parcours hors des trois types de bac affichés. Les mentions décrivent les nouveaux bacheliers ayant accepté ; elles peuvent avoir été obtenues après la sélection. Ce portrait ne décrit ni le dernier appelé ni un niveau minimum à atteindre.</p><p class="population-source">'+link(s.source,'Source : données ministérielles Parcoursup · '+s.year)+'</p>':'<p class="population-empty">'+(loading?'Lecture des données publiques de cette formation…':!canLoad?'Le code Parcoursup et le campus exact sont nécessaires pour retrouver ce portrait.':'Portrait non disponible dans les données chargées. La lecture des exigences et du parcours reste accessible.')+'</p>')+
      (status==='error'?'<p class="population-status" role="status">Les données publiques sont indisponibles pour le moment. Tu peux réessayer.</p>':status==='absent'?'<p class="population-status" role="status">Aucun portrait publié retrouvé pour cette formation et cette session dans cette base.</p>':'')+
      (canLoad&&(missing||status==='error'||status==='absent')?'<button class="quiet small-gap" data-load-population="'+esc(g.id)+'" '+(loading?'disabled':'')+'>'+(loading?'Lecture en cours…':'Réessayer de charger le portrait')+'</button>':'')+'</section>';
  }
  function refreshPopulation(g){
    const active=state.goals.find(t=>t.id===state.activeGoal);
    if(active&&populationKey(active)===populationKey(g)&&$('#population-slot')){$('#population-slot').innerHTML=populationHTML(active);bindPopulationButtons();}
  }
  async function loadPopulation(g,{retry=false}={}){
    if(!g||g.stage!=='postbac'||!g.code||!g.uai||g.statisticsEligible===false)return;
    const key=populationKey(g),existing=FutureAdmissions.populationSummary(g);
    if(existing&&existing.origins.status!=='missing'&&existing.mentions.status!=='missing'&&!retry)return;
    if(populationCache.has(key)&&!retry){g.population=populationCache.get(key);refreshPopulation(g);return;}
    if(populationLoads.get(key)==='loading'||(populationLoads.has(key)&&!retry))return;
    const year=Number(g.statisticsSession??g.session),controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),18000);
    populationLoads.set(key,'loading');refreshPopulation(g);
    try{
      if(!Number.isInteger(year)||year<2021)throw new Error('Session à vérifier');
      let found=null;
      for(const dataset of ['fr-esr-parcoursup','fr-esr-parcoursup_'+year]){
        const url=new URL('https://data.enseignementsup-recherche.gouv.fr/api/explore/v2.1/catalog/datasets/'+dataset+'/records');
        url.searchParams.set('where','cod_aff_form='+JSON.stringify(String(g.code))+' and cod_uai='+JSON.stringify(g.uai)+' and session='+JSON.stringify(String(year)));
        url.searchParams.set('limit','2');url.searchParams.set('select',['session','cod_aff_form','cod_uai',...Object.values(FutureAdmissions.populationFields)].join(','));
        const response=await fetch(url,{signal:controller.signal});
        if(!response.ok){if(response.status===404&&dataset!=='fr-esr-parcoursup')break;throw new Error('Portrait indisponible');}
        const data=await response.json(),rows=(data.results||[]).filter(r=>String(r.cod_aff_form)===String(g.code)&&r.cod_uai===g.uai&&Number(r.session)===year);
        if(rows.length>1)throw new Error('Formation ambiguë');
        if(rows.length===1){found=FutureAdmissions.populationFromRecord(rows[0],'https://data.enseignementsup-recherche.gouv.fr/explore/dataset/'+dataset+'/');break;}
      }
      populationLoads.set(key,found?'ready':'absent');
      if(found){
        populationCache.set(key,found);g.population=found;
        for(const goal of [...catalog,...state.goals])if(populationKey(goal)===key)goal.population=found;
        if(state.goals.some(goal=>populationKey(goal)===key))save();
      }
    }catch{populationLoads.set(key,'error');}
    finally{clearTimeout(timeout);refreshPopulation(g);}
  }
  function bindPopulationButtons(){
    document.querySelectorAll('[data-load-population]').forEach(b=>b.onclick=()=>{const g=state.goals.find(t=>t.id===b.dataset.loadPopulation);if(g)loadPopulation(g,{retry:true});});
  }
  function challengeFor(g){
    const c=g.challenge;
    return g.verifiedCriteria&&c?.reason&&safeURL(c.source)&&c.source===g.criteriaURL?c:null;
  }
  function mathRequired(g){
    return g.requiresMath??(['science','economy'].includes(g.family)&&/CPGE|Double licence|Double diplôme/i.test(g.program||''));
  }
  function artisticNext(g,index){
    if(index===null||index<4){
      if(g.creativePractice==='theatre')return 'Lire ou jouer une courte scène, puis garder une trace de ce que tu as découvert.';
      if(g.creativePractice==='image')return 'Composer un petit récit en images et expliquer ce que tu veux raconter.';
      if(g.creativePractice==='animation')return 'Essayer une courte séquence animée et conserver les essais avec quelques mots sur tes choix.';
      if(g.creativePractice==='design')return 'Imaginer un objet ou une affiche, essayer deux versions et garder tes croquis avec une explication.';
      return 'Commencer un carnet d’essais personnels : dessin, photo, volume ou autre pratique choisie, avec quelques mots sur tes recherches.';
    }
    if(!g.verifiedCriteria)return 'Lire les attendus actualisés et vérifier si des réalisations, un carnet ou un entretien sont demandés.';
    if(index===4)return g.creativeSelection?'Conserver des réalisations et leurs étapes ; explorer les enseignements d’arts ou de design et une porte ouverte.':'Comparer les enseignements du cursus et essayer un projet artistique qui te plaît.';
    if(g.admissionMode==='concours')return 'Lire les consignes du dossier artistique et les épreuves propres à cette école ; essayer un sujet de création et présenter tes recherches.';
    if(g.creativeSelection==='carnet')return 'Organiser ton carnet personnel selon les consignes actualisées du DN MADE, avec essais, curiosités et choix expliqués.';
    if(g.creativeSelection)return 'Choisir des réalisations pour le dossier demandé et t’entraîner à expliquer ta démarche pour l’entretien.';
    return 'Relire les attendus universitaires et ton bulletin ; préciser ton intérêt pour les cours et activités de ce parcours.';
  }
  function preparationReading(g){
    const artistic=artisticGoal(g),domains=goalDomains(g).filter(d=>!artistic||d!=='art'),rows=domainRows(domains),supported=appuis(domains).filter((r,i,list)=>list.findIndex(t=>t.domain===r.domain)===i).slice(0,2);
    const durable=supported.length&&supported.every(r=>subjectHistory(r).filter(x=>Number.isFinite(x.row.cls)&&x.row.you>=x.row.cls).length>1);
    const needs=rows.filter(r=>Number.isFinite(r.cls)&&Number.isFinite(r.you)&&r.count>=3&&r.you<r.cls);
    const focus=(mathRequired(g)?needs.find(r=>r.domain==='math'):null)||needs[0];
    const index=levelIndex(latest().level),college=index===null||index<4;
    const tasks={
      math:'Reprendre un exercice corrigé et expliquer chaque étape du raisonnement.',
      french:'Lire un court texte, puis rédiger un paragraphe qui explique ton idée.',
      language:'Raconter un sujet qui te plaît à l’oral dans la langue étudiée.',
      history:'Comparer deux documents et expliquer ce que chacun apporte.',
      physics:'Reprendre une expérience ou un exercice et expliquer le résultat.',
      biology:'Expliquer une notion du vivant avec un schéma et quelques phrases.',
      integrated:'Expliquer une expérience, ses étapes et ce que tu en retiens.'
    };
    let next;
    if(artistic)next=artisticNext(g,index);
    else if(focus)next=tasks[focus.domain]||'Reprendre une difficulté avec le professeur et expliquer un exercice corrigé.';
    else if(g.stage==='lycee')next=index===3?'Lire la procédure de candidature et préparer les éventuels tests.':'Découvrir les enseignements et les sections qui t’intéressent au lycée.';
    else if(college)next=tasks[domains[0]]||'Essayer un court exercice ou une lecture et expliquer ce que tu as compris.';
    else if(index===4)next=mathRequired(g)?(g.families?.includes('society')?'Discuter du maintien des maths, avec les lettres et les sciences sociales.':'Vérifier les enseignements en maths et dans les sciences du cursus.'):'Comparer les enseignements utiles au cursus avec un professeur.';
    else next=g.admissionMode==='concours'?'Lire le programme et le calendrier du concours, puis essayer un sujet.':'Relire un bulletin et un attendu actualisé de la formation avec un professeur.';
    if(focus&&!college&&!artistic)next+=' Puis vérifier les '+(g.admissionMode==='concours'?'épreuves à préparer.':'enseignements et attendus du cursus.');
    const support=supported.length?supported.map(r=>displaySubject(r.subject)).join(', '):'À préciser avec les prochains bulletins.';
    const continuity=supported.length?(durable?'Appuis retrouvés sur plusieurs années':'Premiers repères à confirmer'):'';
    return {support:artistic?'Repères scolaires : '+support: support,continuity:artistic?[continuity,'Pratique artistique à découvrir'].filter(Boolean).join(' · '):continuity,focus:focus?(artistic?'Repère scolaire : ':'')+displaySubject(focus.subject)+' à travailler':'',next};
  }
  function schoolReading(g){
    const challenge=challengeFor(g),next=preparationReading(g).next;
    if(challenge)return {group:'stretch',label:'Cap exigeant',why:challenge.reason,next};
    if(g.family==='open')return {group:'prepare',label:'Affectation à vérifier',why:'Comparer les enseignements disponibles et les règles d’affectation.',next:'Vérifier les choix et les éventuelles sections en 3e.'};
    if(g.programVerified)return {group:'prepare',label:'Enseignements à découvrir',why:g.preparation||g.publishedProgramme[0],next};
    return {group:'prepare',label:g.verifiedCriteria?'Piste à explorer':'Attendus à documenter',why:g.verifiedCriteria?(g.preparation||goalFamily(g).prepare):'Formation identifiée dans ce parcours ; ses exigences précises restent à vérifier.',next};
  }
  function levelIndex(level){const s=normalize(level).replace(/\s/g,'');
    if(/^6/.test(s))return 0;if(/^5/.test(s))return 1;if(/^4/.test(s))return 2;if(/^3/.test(s))return 3;
    if(/^2|seconde/.test(s))return 4;if(/^1|premiere/.test(s))return 5;if(/term/.test(s))return 6;return null;
  }
  const levels=['6e','5e','4e','3e','Seconde','Première','Terminale'];
  function milestones(){
    const current=levelIndex(latest().level),start=Number(String(latest().year||'').slice(0,4));
    const schoolYear=index=>current===null||!start?'Année à préciser':(start+index-current)+'–'+(start+index-current+1);
    const rows=[
      {index:current??0,title:'Prochain bulletin & conseil de classe',when:'À chaque période',body:'Relire les appréciations avec les résultats : compréhension, organisation, régularité et plaisir d’apprendre. Choisir un seul point à consolider.'},
      {index:2,title:'4e · faire le point sur les acquis',when:'Début et fin d’année',body:'Ajouter les évaluations nationales si disponibles, les retours des professeurs et les premières découvertes de métiers ou de formations.'},
      {index:3,title:'3e · préparer les choix de lycée',when:'Avant les candidatures et au fil des conseils',body:'Repérer les sections avec dossier ou tests assez tôt. Discuter l’orientation aux conseils de classe, puis formuler les choix et vérifier l’affectation.'},
      {index:3,title:'3e · brevet & affectation',when:'Fin d’année',body:'Le brevet apporte un repère sur les acquis. L’affectation au lycée et les procédures des sections particulières sont à suivre séparément.'},
      {index:4,title:'Seconde · choisir les enseignements',when:'Conseils de classe et fin d’année',body:'Comparer voie générale et voies technologiques. En voie générale, choisir trois spécialités pour la Première selon le projet, l’intérêt et l’offre du lycée.'},
      {index:5,title:'Première · dossier & épreuves anticipées',when:'Bulletins, conseils et fin d’année',body:'Regarder les attendus des formations choisies, les appréciations et les épreuves anticipées du bac. En voie générale, choisir les deux spécialités poursuivies en Terminale.'},
      {index:6,title:'Terminale · Parcoursup & bac',when:'Du calendrier des vœux aux résultats du bac',body:'Préparer les vœux et les dossiers avant le bac, suivre les réponses et organiser plusieurs options. Actualiser les exigences, les coûts et le logement.'}
    ].filter(r=>current===null||r.index>=current);
    return {current,start,schoolYear,rows};
  }
  function stageFocus(){const i=levelIndex(latest().level);
    if(i===null)return 'Préciser le niveau scolaire pour situer les prochaines étapes.';
    if(i<2)return 'Explorer ce qui te plaît et confirmer tes points d’appui au prochain bulletin.';
    if(i<4)return 'Préparer le choix du lycée, ses enseignements et les éventuelles candidatures de section.';
    if(i===4)return 'Choisir une voie et les enseignements qui permettent de préparer plusieurs projets.';
    if(i===5)return 'Construire le dossier de lycée et vérifier les attendus des formations envisagées.';
    return 'Comparer les conditions réelles de candidature et préparer plusieurs vœux cohérents.';
  }
  function heading(n,title,subtitle){return '<div class="section-head"><span class="num">'+n+'</span><div><h2>'+title+'</h2><p>'+subtitle+'</p></div></div>';}
  function strengthCard(title,domains){
    const rows=domainRows(domains),pos=appuis(domains);
    if(!rows.length)return '<article class="card"><span class="pill explore">À documenter</span><h3>'+title+'</h3><p>Pas encore de données exploitables dans ces domaines.</p></article>';
    const h=history(domains);
    const continuity=h>1?'Repères sur '+h+' années':'Premiers repères';
    const sciences=domains.includes('integrated')&&rows.some(r=>r.domain==='integrated')?'EIS : sciences intégrées, sans distinction des disciplines.':'';
    const shown=rows.filter((r,index)=>r.domain!=='language'||rows.findIndex(v=>v.domain==='language')===index).slice(0,3);
    return '<article class="card strength-card"><span class="pill '+(!pos.length?'explore':'')+'">'+continuity+'</span><h3>'+title+'</h3>'+shown.map(r=>'<div class="subject-observation"><strong>'+esc(displaySubject(r.subject))+'</strong><div class="year-comparison">'+subjectHistory(r).map(({year,row})=>'<div class="year-observation" data-observation-year="'+esc(year.year)+'"><span class="observation-level">'+esc(levels[levelIndex(year.level)]||year.level)+'</span><div class="grade-track" role="img" aria-label="'+esc(year.year+' : '+fmt(row.you)+'/20 ; classe '+fmt(row.cls)+' ; '+row.count+' notes')+'"><span class="grade-bar" style="width:'+Math.max(0,Math.min(100,row.you/20*100))+'%"></span>'+(Number.isFinite(row.cls)?'<span class="class-tick" style="left:'+Math.max(0,Math.min(100,row.cls/20*100))+'%"></span>':'')+'</div><span class="grade-value">'+fmt(row.you)+'</span><span class="observation-meta">'+row.count+' notes · classe '+fmt(row.cls)+'</span></div>').join('')+'</div></div>').join('')+(sciences?'<p class="subtle small-gap">'+sciences+'</p>':'')+'</article>';
  }
  function pathCard(f){
    const r=familyReading(f),positive=appuis(f.domains),chosen=activeFamily()===f.id;
    const signal=positive.length?'Appuis : '+[...new Set(positive.map(r=>displaySubject(r.subject)))].slice(0,2).join(', '):r.label==='Piste à consolider'?'Bases à renforcer au prochain bulletin.':'À découvrir selon tes envies.';
    return '<article class="card pathcard '+(chosen?'selected':'')+'"><span class="path-icon" aria-hidden="true">'+f.icon+'</span><h3>'+f.name+'</h3><span class="pill '+r.type+'">'+r.label+'</span><p>'+esc(signal)+'</p><button data-family="'+f.id+'" aria-pressed="'+chosen+'">'+(chosen?'Parcours sélectionné ✓':'Explorer ce parcours →')+'</button></article>';
  }
  function familyPickerHTML(){return '<div class="chipbar family-picker" role="group" aria-label="Parcours à explorer"><button data-proposal-family="all" aria-pressed="'+(activeFamily()==='all')+'">Panorama</button>'+FAMILIES.map(f=>'<button data-proposal-family="'+f.id+'" aria-pressed="'+(activeFamily()===f.id)+'">'+f.icon+' '+f.name+'</button>').join('')+'</div>';}
  function proposalCard(g){
    const r=schoolReading(g),prep=preparationReading(g),challenge=challengeFor(g);
    return '<article class="proposal-card" data-proposed="'+esc(g.id)+'"><div class="proposal-stage">'+(g.stage==='lycee'?'🏫 Lycée':'🎓 Après le bac')+' · '+esc(g.city||'France')+'</div><h3>'+esc(g.name)+'</h3><p class="proposal-program">'+esc(g.displayProgram||g.program)+'</p><span class="pill '+(r.group==='stretch'?'ambition':g.verifiedCriteria?'':'muted')+'">'+r.label+'</span>'+(g.stage==='postbac'?'<p class="proposal-meta">'+esc(FutureCatalogue.typeLabel(g))+' · '+(g.apprenticeship?'Apprentissage':'Statut scolaire')+'</p>':'')+'<div class="proposal-reading"><div class="proposal-reason"><span aria-hidden="true">🧭</span><div><strong>Pourquoi explorer ce cap</strong><p>'+esc(r.why)+'</p>'+(challenge?'<small>'+link(challenge.source,'Exigences publiées · '+challenge.session)+'</small>':'')+'</div></div><div class="proposal-support"><span aria-hidden="true">🌱</span><div><strong>Tes appuis aujourd’hui</strong><p>'+esc(prep.support)+'</p>'+(prep.continuity?'<small>'+esc(prep.continuity)+'</small>':'')+'</div></div><div class="proposal-next-step"><span aria-hidden="true">👣</span><div><strong>Ton prochain pas</strong>'+(prep.focus?'<span class="preparation-focus">'+esc(prep.focus)+'</span>':'')+'<p>'+esc(prep.next)+'</p></div></div></div><button data-select="'+esc(g.id)+'">Voir le chemin →</button></article>';
  }
  function proposalsHTML(){
    const id=activeFamily(),i=levelIndex(latest().level),schools=catalog.filter(g=>(state.schoolRoute!=='all'?g.stage==='lycee':matchesFamily(g,id))&&(state.schoolRoute!=='all'||i===null||i<4||g.stage==='postbac')&&matchesScope(g)&&matchesCatalogue(g));
    const phase=i===null||i<4?'Au collège : découvrir des horizons et construire les bases.':i===4?'En seconde : préciser les enseignements et les habitudes utiles.':'Au lycée : confronter le dossier et la préparation aux attentes actualisées.';
    const groups=[{id:'prepare',icon:'🌱',title:'Pistes à explorer',subtitle:'Des chemins à découvrir ; certains sont aussi sélectifs.',empty:'Pas encore d’exemple documenté dans ce périmètre. Le catalogue reste à enrichir.'},{id:'stretch',icon:'🚀',title:'Caps ambitieux à préparer',subtitle:'Des exigences particulières, expliquées pour chaque formation.',empty:'Aucune ambition documentée dans ce filtre pour le moment. Cela ne limite pas ton potentiel : élargis le périmètre ou cherche une formation.'}];
    return '<p class="proposal-phase">'+esc(phase)+'</p><div class="proposal-board">'+groups.map(group=>{
      const list=schools.filter(g=>schoolReading(g).group===group.id),visible=[];
      const diversify=group.id==='prepare'&&!['arts','international','all'].includes(id)&&state.schoolRoute==='all';
      for(const g of list){if(visible.length<3&&!visible.some(v=>v.name===g.name)&&(!diversify||!visible.some(v=>FutureCatalogue.typeIds(v)[0]===FutureCatalogue.typeIds(g)[0])))visible.push(g);}
      for(const g of list){if(visible.length<3&&!visible.some(v=>v.name===g.name))visible.push(g);}
      for(const g of list){if(visible.length<3&&!visible.includes(g))visible.push(g);}
      const more=list.filter(g=>!visible.includes(g));
      return '<section class="proposal-column '+group.id+'" aria-label="'+group.title+'"><div class="proposal-heading"><span aria-hidden="true">'+group.icon+'</span><div><h3>'+group.title+'</h3><p>'+group.subtitle+'</p></div><span class="column-count">'+list.length+'</span></div>'+visible.map(proposalCard).join('')+(more.length?'<details class="more-proposals"><summary>'+more.length+' autres exemples</summary>'+more.map(proposalCard).join('')+'</details>':'')+(!list.length?'<p class="proposal-empty">'+group.empty+'</p>':'')+'</section>';
    }).join('')+'</div><button data-browse-schools class="quiet small-gap">Explorer davantage d’établissements · '+esc(scopeLabel())+'</button><p class="subtle small-gap">Un cap exigeant peut rester ouvert pendant que ses bases se construisent. Les critères seront actualisés avant de candidater.</p><details id="suggestion-method"><summary>Comment ces établissements sont-ils choisis ?</summary><p class="subtle">Les formations sont filtrées par parcours, étape scolaire et périmètre. La colonne de droite présente des exemples dont les exigences particulières ont été documentées : dossier d’excellence, langues, double cursus ou concours. Chaque cap renvoie à sa source. Les autres pistes peuvent aussi être sélectives ; un attendu absent reste à documenter.</p><p class="subtle">Ce choix reste une lecture éditoriale, sans seuil universel de taux d’accès. L’historique des admissions apporte du contexte sur la concurrence. Les notes de l’enfant ne déterminent pas la colonne : elles éclairent les appuis et une action dans les matières utiles. Un résultat inférieur à la moyenne locale, sur au moins trois évaluations, invite à refaire le point avec le professeur ; il ne constitue pas un verdict d’admission. Une colonne vide reflète la couverture du catalogue et les filtres disponibles.</p></details>';
  }
  function criteriaHTML(g){
    const verified=g.verifiedCriteria;
    const weights=g.criteriaWeights||[];
    return '<div class="criteria-heading"><span class="label '+(!verified?'general':'')+'">'+(verified?'Critères publiés · '+esc(g.criteriaSession):'Repères de voie · critères spécifiques à vérifier')+'</span>'+(verified?link(g.criteriaURL||g.url,g.criteriaURL?.includes('parcoursup')?'Source : fiche Parcoursup':'Source : site officiel'):'')+'</div>'+(weights.length?'<div class="weight-chart" role="img" aria-label="Grille de critères : '+esc(weights.map(([label,value])=>label+' '+value+' %').join(', '))+'">'+weights.map(([label,value],index)=>'<span class="weight-segment weight-'+index+(value<=5?' narrow':'')+'" style="flex:'+value+'" title="'+esc(label)+' : '+value+' %">'+value+(value<=5?'':' %')+'</span>').join('')+'</div><div class="weight-legend">'+weights.map(([label,value],index)=>'<span><i class="weight-'+index+'"></i>'+esc(label)+' <strong>'+value+' %</strong></span>').join('')+'</div>':'<p class="small-gap subtle">'+(verified?(g.admissionMode==='concours'?'Sélection sur les épreuves du concours, selon la procédure publiée.':'Attendus et procédure publiés : lire les conditions ci-dessous.'):'Les attendus spécifiques restent à lire sur la fiche officielle.')+'</p>');
  }
  function render(){
    const p=pupil(),y=latest(),m=milestones();
    if(!payload.children?.length){$('#app').innerHTML='<div class="empty"><h1>Choisissons un premier cap</h1><p>Aucune donnée scolaire reçue. Ouvre cette page depuis le dashboard ou recharge l’aperçu.</p></div>';return;}
    const supported=FAMILIES.filter(f=>f.id!=='arts'&&appuis(f.domains).length),chosen=state.goals.find(g=>g.id===state.activeGoal);
    const summary=supported.length?'Tes acquis ouvrent plusieurs pistes. Choisis un parcours pour découvrir des établissements et le chemin à construire.':'Choisis un parcours à explorer. Les prochaines périodes aideront à préciser ses points d’appui.';
    const currentYear=Number(String(y.year||'').slice(0,4)),nextLycee=m.current===null?null:currentYear+4-m.current,nextPost=m.current===null?null:currentYear+7-m.current;
    const journey=[
      {index:3,title:'3e · orientation & brevet',body:'Conseils de classe, choix du lycée, candidatures de section, brevet et affectation.'},
      {index:4,title:'Seconde · voie & enseignements',body:'Conseils de classe : choix de voie et, en voie générale, trois spécialités pour la Première.'},
      {index:5,title:'Première · épreuves anticipées',body:'Bulletins, appréciations, épreuves anticipées du bac et spécialités poursuivies en Terminale.'},
      {index:6,title:'Terminale · Parcoursup & bac',body:'Calendrier des vœux, dossiers, réponses, épreuves du bac et organisation des études.'}
    ].filter(step=>m.current===null||step.index>m.current);

    $('#app').innerHTML=
      '<section class="hero"><div><div class="childbar"><label for="child-select" class="subtle">Parcours de</label><select id="child-select">'+payload.children.map(c=>'<option '+(c.name===child?'selected':'')+'>'+esc(c.name)+'</option>').join('')+'</select><span class="pill muted">'+esc(y.level||'Niveau à préciser')+' · '+esc(y.year||'')+'</span>'+(p.demo?'<span class="pill demo-badge">Profil fictif · démonstration</span>':'')+'</div><div class="eyebrow">Explorer · préparer · refaire le point</div><h1>Un cap, plusieurs chemins.</h1><p>'+summary+'</p></div><aside class="hero-note"><span class="eyebrow">Ce qui compte aujourd’hui</span><p class="small-gap">'+stageFocus()+'</p><p class="subtle">'+(m.current!==null&&m.current<4?'À ce stade, une école lointaine est un cap à préparer. Le dossier de candidature se construira au lycée.':'Les bulletins, les choix d’enseignements et les critères publiés enrichissent progressivement la lecture.')+'</p></aside></section>'+
      portraitHTML()+
      '<nav class="nav" aria-label="Rubriques">'+['Mes appuis','Les parcours','Les passages clés','Un établissement','Mes actions'].map((s,i)=>'<a href="#section-'+(i+1)+'">'+(i+1)+'. '+s+'</a>').join('')+'</nav>'+
      '<section class="section" id="section-1">'+heading(1,'Tes appuis, au fil des années','L’année actuelle montre où tu en es ; les précédentes aident à voir ce qui dure.')+'<div class="history-strip">'+p.years.map(yr=>'<span><strong>'+esc(levels[levelIndex(yr.level)]||yr.level)+'</strong> '+esc(yr.year)+' · '+yr.count+' notes</span>').join('<span class="history-arrow" aria-hidden="true">→</span>')+'</div>'+
      '<div class="grid3">'+strengthCard('Raisonner & résoudre',['math'])+strengthCard('Lire & communiquer',['french','language'])+strengthCard('Comprendre les sciences',['integrated','physics','biology'])+'</div><p class="chart-caption"><span class="bar-sample"></span> Moyenne de l’élève /20 <span class="tick-sample"></span> Moyenne de sa classe · Les années restent séparées : leurs notes ne sont pas mélangées.</p>'+
      '<details><summary>Voir les données et leurs limites · '+y.count+' notes cette année</summary><p class="subtle">'+(p.demo?'Données entièrement fictives, pour tester la lecture d’un profil. ':payload.source==='snapshot'?'Aperçu des exports locaux au '+date(payload.asOf)+'. ':'Données de l’année la plus récente chargée dans le dashboard. ')+'Dernière note : '+date(y.dateEnd)+'. '+p.years.length+' année(s) disponible(s). Les moyennes du bulletin sont utilisées lorsqu’elles existent ; sinon, moyenne calculée sur les notes disponibles. Les écarts à la classe restent des repères locaux.</p><div class="tablewrap"><table><thead><tr><th>Matière</th><th>Toi /20</th><th>Classe /20</th><th>Notes</th><th>Origine moyenne</th></tr></thead><tbody>'+y.rows.map(r=>'<tr><td>'+esc(r.subject)+'</td><td>'+fmt(r.you)+'</td><td>'+fmt(r.cls)+'</td><td>'+r.count+'</td><td>'+(r.official?'Bulletin/export':'Notes disponibles')+'</td></tr>').join('')+'</tbody></table></div><p><strong>Acquis testés à l’échelle nationale</strong></p>'+
      (y.tests?.length?'<p class="subtle">Les sous-tests de '+esc(y.year)+' apportent une autre observation de certains acquis. Les taux par question ne déterminent pas à eux seuls la répartition des scores individuels ni un rang global.</p><div class="chipbar">'+y.tests.map(t=>'<span class="pill muted">'+esc(t.label)+' : '+t.score+'/'+t.max+'</span>').join('')+'</div><p class="subtle">Les références utilisées dans l’audit sont de 2025 ; leur stabilité pour cette session reste à vérifier. Aucun sous-test ne représente une matière entière.</p>':'<p class="subtle">Aucun résultat individuel de test national disponible pour cette année. Cela ne réduit pas les ambitions possibles.</p>')+
      '<p class="subtle">Appréciations, aisance à l’oral, autonomie et intérêts : à compléter. Une information absente ne devient pas un point faible.</p></details>'+
      '<details id="profile-details"><summary>Compléter ce que les notes ne disent pas</summary><p class="subtle">Qu’as-tu envie de découvrir ? Tu peux choisir plusieurs pistes et changer d’avis.</p><div class="chipbar">'+FAMILIES.map(f=>'<button data-interest="'+f.id+'" aria-pressed="'+state.interests.includes(f.id)+'">'+f.icon+' '+esc(f.name)+'</button>').join('')+'</div><div class="profile-form"><label>Organisation du travail · ressenti de la famille<select id="habits"><option value="">À discuter</option>'+['Je m’organise assez seul','J’avance avec une aide régulière','J’essaie encore de trouver ma méthode'].map(v=>'<option '+(state.habits===v?'selected':'')+'>'+v+'</option>').join('')+'</select></label><label>Un retour du professeur ou une envie de l’enfant<textarea id="feedback" maxlength="1500" placeholder="Par exemple : aime expliquer ses raisonnements ; souhaite découvrir le dessin…">'+esc(state.feedback)+'</textarea></label></div><p id="save-status" class="notification">Ces compléments sont conservés pour cet enfant dans ce navigateur.</p></details></section>'+
      '<section class="section" id="section-2">'+heading(2,'Choisis une piste à explorer','Un choix pour découvrir des possibilités. Tu peux en changer à tout moment.')+'<div class="grid3" id="path-grid">'+FAMILIES.map(pathCard).join('')+'</div><details><summary>Voir les chemins possibles pour chaque parcours</summary><div class="grid2">'+FAMILIES.map(f=>'<div><h3>'+f.icon+' '+f.name+'</h3><p class="subtle">'+esc(f.routes)+'</p></div>').join('')+'</div></details></section>'+
      '<section class="section" id="section-3">'+heading(3,'Les passages où refaire le point','Chaque conseil, examen ou choix d’orientation peut enrichir la page et faire évoluer le projet.')+
      schoolPathsHTML()+'<div class="timeline"><article class="step current"><div class="date">Maintenant · '+esc(y.year||'')+'</div><h3>'+esc(levels[m.current]||y.level||'Niveau à préciser')+' · '+(m.current<2?'découvrir':m.current<4?'préparer le lycée':'préciser les choix')+'</h3><p>'+stageFocus()+'</p></article>'+journey.map(step=>'<article class="step"><div class="date">'+esc(m.schoolYear(step.index))+'</div><h3>'+step.title+'</h3><p>'+step.body+'</p></article>').join('')+'</div><p class="context">'+(nextPost?'Premières études après le bac envisagées en septembre '+nextPost+'. ':'')+'Ces échéances situent les étapes à préparer ; les modalités seront à vérifier pour leur année.</p>'+
      '<div class="milestone"><strong>Prochain passage : '+esc(m.rows[0].title)+'</strong><p>'+esc(m.rows[0].body)+'</p></div><details id="checkpoint-details"><summary>Voir les conseils de classe, le brevet, le bac et les choix à venir</summary><div class="tablewrap"><table><thead><tr><th>Passage</th><th>Quand</th><th>Ce que l’on ajoutera au projet</th></tr></thead><tbody>'+m.rows.map(r=>'<tr><td><strong>'+esc(r.title)+'</strong><br><span class="subtle">'+esc(m.schoolYear(r.index))+'</span></td><td>'+esc(r.when)+'</td><td>'+esc(r.body)+'</td></tr>').join('')+'</tbody></table></div><p class="subtle">Dates indicatives selon une progression scolaire sans changement de rythme. Les calendriers et règles seront actualisés chaque année ; la décision d’orientation ne se résume pas au résultat d’un examen.</p></details></section>'+
      '<section class="section" id="section-4">'+heading(4,'Des établissements pour ce parcours','Des suggestions d’abord. Tu peux ensuite chercher une école précise.')+
      '<div id="scope-controls">'+scopeControlsHTML()+'</div><div id="family-picker">'+familyPickerHTML()+'</div>'+catalogueFiltersHTML()+'<div id="proposal-slot">'+proposalsHTML()+'</div>'+
      '<div class="saved" id="saved-goals">'+savedGoalButtons()+'</div><div id="target-slot">'+(chosen?targetHTML(chosen):'')+'</div>'+
      '<details id="school-search"><summary>🔎 Chercher un autre établissement ou une formation en France</summary><form class="searchbar" id="search-form"><label>Établissement ou formation<input id="search" placeholder="CIV, Masséna, médecine, design…" autocomplete="off"></label><label>Étape<select id="stage"><option value="all">Toutes les étapes</option><option value="lycee">Entrée au lycée</option><option value="postbac">Après le bac</option></select></label><div class="search-scope"><span>Périmètre</span><strong id="search-scope-label">'+esc(scopeLabel())+'</strong></div><button type="submit" id="search-online">Chercher en France</button></form><p class="context" id="search-status">Recherche dans les catalogues publics.</p><div id="search-results" class="search-results"></div><nav class="search-pagination" id="search-pagination" aria-label="Pages de résultats"></nav></details>'+
      '<details id="custom-details"><summary>Ajouter un établissement que je ne trouve pas</summary><form id="custom-form"><div class="profile-form"><label>Nom de l’établissement<input id="custom-name" required maxlength="150"></label><label>Formation ou section précise<input id="custom-program" required maxlength="200" placeholder="Par exemple : seconde avec section…"></label><label>Étape<select id="custom-stage"><option value="lycee">Entrée au lycée</option><option value="postbac">Après le bac</option></select></label><label>Famille de parcours<select id="custom-family">'+FAMILIES.map(f=>'<option value="'+f.id+'">'+f.name+'</option>').join('')+'</select></label><label>Lien officiel, si connu<input id="custom-url" type="url" placeholder="https://…"></label></div><button class="small-gap" type="submit">Garder ce projet à documenter</button><p class="notification" id="custom-status"></p></form></details></section>'+
      '<section class="section" id="section-5">'+heading(5,'Deux actions maintenant, puis un nouveau point','Un peu de découverte, un peu de préparation. Le projet grandit avec toi.')+'<div class="grid2" id="actions">'+actionsHTML(chosen)+'</div><div class="review"><div class="card"><h3>Au prochain bulletin ou conseil de classe</h3><p>Relire les appréciations, garder ce qui aide à progresser et ajuster le cap.</p><label class="small-gap">Une observation à garder · facultatif<textarea id="review-note" maxlength="1500" placeholder="Ce que nous avons découvert ou ce qui a changé…">'+esc(state.reviewDraft)+'</textarea></label><button id="record-review">Garder ce point d’étape</button><p class="notification" id="review-status">'+(state.reviews.length?'Dernier point conservé : '+date(state.reviews.at(-1).date)+'.':'Premier point à construire ensemble.')+'</p></div><div class="card"><h3>Le projet au fil du temps</h3><div class="history" id="review-history">'+historyHTML()+'</div></div></div>'+
      '<details class="sources"><summary>Comment cette page lit les données · sources & améliorations à venir</summary><p class="subtle">Les suggestions sont qualitatives : une matière au-dessus ou au niveau de la moyenne de sa classe est un point d’appui local, à confronter aux appréciations et à la suite de la scolarité. Plusieurs cours de langues ne deviennent pas plusieurs preuves indépendantes d’un niveau global. L’historique décrit une continuité observée, sans garantir les résultats futurs.</p><ul><li>'+link('https://data.enseignementsup-recherche.gouv.fr/explore/dataset/fr-esr-cartographie_formations_parcoursup/','Offre Parcoursup 2026, avec apprentissage')+'</li><li>'+link('https://data.enseignementsup-recherche.gouv.fr/explore/dataset/fr-esr-parcoursup/','Parcoursup : statistiques des formations, session 2025')+' · contexte de concurrence par formation.</li><li>'+link('https://data.education.gouv.fr/explore/dataset/fr-en-annuaire-education/','Annuaire national des établissements')+' · identité et localisation, sans conclusion sur la sélection.</li><li>'+link('https://dossier.parcoursup.fr/Candidats/public/fiches/afficherFicheFormation?g_ta_cod=2314','CIV MPSI : critères publiés 2026')+' ; '+link('https://civfrance.com/lycee/si-lycee/si-americaine/','CIV section internationale américaine')+'.</li><li>'+link('https://www.onisep.fr/','Onisep')+' · explorer les métiers, les voies et les enseignements.</li></ul><p class="subtle">À enrichir : appréciations de chaque période, envies et aisance à l’oral ; offre de spécialités et coûts de chaque cible ; critères d’admission actualisés pour chaque formation. La saisie personnelle et les projets sont locaux au navigateur ; ils ne sont pas synchronisés entre appareils.</p></details></section>';
    $('#back-grades').disabled=false;
    bind();renderResults();
  }
  function savedGoalButtons(){return state.goals.length?state.goals.map(g=>'<button data-goal="'+esc(g.id)+'" class="'+(g.id===state.activeGoal?'active':'')+'">'+esc(g.name)+' · '+esc(g.program)+'</button>').join(''):'<span class="subtle">Aucun projet choisi pour le moment.</span>';}
  function alternatives(g){
    const candidates=catalog.filter(t=>matchesFamily(t,goalFamily(g).id)&&t.stage===g.stage&&t.id!==g.id&&matchesScope(t)),picked=[];
    for(const kind of [/CPGE/,/Licence/]){const found=candidates.find(t=>kind.test(t.program));if(found)picked.push(found);}
    return [...picked,...candidates.filter(t=>!picked.includes(t))].slice(0,3);
  }
  function targetHTML(g){
    const f=goalFamily(g),reading=schoolReading(g),prep=preparationReading(g),i=levelIndex(latest().level);
    const artistic=artisticGoal(g),point=[...new Set(appuis(goalDomains(g)).filter(r=>!artistic||r.domain!=='art').map(r=>displaySubject(r.subject)))].slice(0,3).join(', ');
    const expected=g.verifiedCriteria?g.criteria:g.publishedProgramme?.length?g.publishedProgramme:g.family==='open'?['Vérifier les règles d’affectation ou la procédure de candidature de cet établissement.','Comparer les enseignements, options et sections réellement proposés.']:[g.preparation||f.prepare,'Lire les attendus, les critères d’examen et le rapport public de la formation.'];
    const commonIEP=FutureCatalogue.typeIds(g).includes('iep');
    const due=g.nextMilestone||(g.stage==='lycee'?'3e : dossier, tests éventuels et affectation.':artistic?(g.creativeSelection?'Lycée : développer une pratique personnelle, conserver les recherches et nourrir sa culture artistique.':'Lycée : expression, culture artistique et découverte des enseignements du parcours.'):g.admissionMode==='concours'?(commonIEP?'Lycée : développer l’argumentation, l’histoire et la langue choisie pour le concours.':'Lycée : préparer les enseignements, le dossier et les épreuves propres au cursus.'):g.requiresMath?'Lycée : maintenir un enseignement de maths, avec les lettres et les sciences sociales.':'Lycée : enseignements, bulletins et appréciations.');
    const application=g.applicationSteps||(g.apprenticeship?'Dossier et conditions d’entrée, recherche d’un employeur et signature du contrat selon les règles de la session.':artistic?(!g.verifiedCriteria?'Lire les attendus et vérifier les pièces ou épreuves demandées pour cette formation.':g.admissionMode==='concours'?'Dossier artistique, épreuves propres à cette école et entretien ; procédure actualisée.':g.creativeSelection==='carnet'?'Dossier scolaire et carnet personnel DN MADE selon les consignes actualisées.':g.creativeSelection?'Dossier artistique et entretien selon la procédure actualisée.':'Dossier et attendus universitaires actualisés ; créations personnelles si pertinentes, sans portfolio obligatoire publié.'):g.admissionMode==='concours'?(commonIEP?'Épreuves du concours commun et conditions d’inscription actualisées.':'Dossier, épreuves et éventuels entretiens selon la procédure publiée pour cette formation.'):g.admissionMode==='dossier-entretien'?'Dossier, entretien si convoqué et conditions pratiques actualisées.':'Critères actualisés, dossier et conditions pratiques.');
    const present=artistic?prep.support+' Pratique artistique à découvrir.':point?'Appuis : '+point+'.':prep.support;
    const caution=artistic?'Les repères scolaires soutiennent l’expression et la culture ; ils ne mesurent pas la pratique artistique ni la qualité d’un futur dossier.':g.admissionMode==='concours'?(commonIEP?'Les notes éclairent la préparation ; la sélection publiée repose sur les épreuves du concours.':'La fiche précise la place du dossier, des épreuves et des entretiens dans la sélection.'):i!==null&&i<5?'Le dossier de candidature reste à construire.':'Confronter le dossier disponible aux critères publiés.';

    return '<article class="card target" data-target="'+esc(g.id)+'"><div class="target-header"><div><span class="pill '+(reading.group==='stretch'?'explore':'')+'">'+reading.label+'</span><h3>'+esc(g.name)+'</h3><p>'+esc(g.program)+' · '+esc(g.city||'Localisation à préciser')+'</p></div><button class="quiet" id="remove-goal">Retirer ce projet</button></div>'+
      '<div class="target-layout"><div><div class="label">Le chemin à construire</div><div class="target-steps"><div><span>1</span><strong>Maintenant</strong><p>'+esc(present)+'</p></div><div><span>2</span><strong>Prochain palier</strong><p>'+due+'</p></div><div><span>3</span><strong>Au moment de candidater</strong><p>'+application+'</p></div></div><div class="target-next"><strong>👣 Ton prochain pas</strong>'+(prep.focus?'<span class="preparation-focus">'+esc(prep.focus)+'</span>':'')+'<p>'+esc(prep.next)+'</p></div><p class="subtle">'+esc(caution)+'</p></div><div>'+criteriaHTML(g)+'</div></div>'+
      '<details class="target-detail"><summary>Lire les critères et les conditions pratiques</summary><ul>'+expected.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul><div class="conditions"><p>'+link(g.url,g.source||'Consulter la fiche officielle')+(g.session?' · statistiques/référence '+esc(g.session):'')+'</p><p><strong>Internat :</strong> '+esc(g.boarding||'À vérifier auprès de l’établissement.')+'</p><p><strong>Conditions pratiques :</strong> '+esc(g.practical||'Coût, calendrier, logement et exigences à documenter.')+'</p></div></details>'+
      '<div id="population-slot">'+populationHTML(g)+'</div>'+admissionsHTML(g)+'<div class="conditions"><div class="label">D’autres chemins vers le même objectif</div><p class="small-gap">'+esc(g.family==='open'?'D’autres lycées proposant les enseignements souhaités.':f.routes)+'.</p><div class="route-links">'+alternatives(g).map(t=>'<button data-select="'+esc(t.id)+'">'+esc(t.name)+' · '+esc(t.program)+'</button>').join('')+'</div></div></article>';
  }
  function actionData(g){
    const f=g?goalFamily(g):family(activeFamily()==='all'?'unknown':activeFamily());
    const rows=domainRows(g?goalDomains(g):f.domains),caution=(g?.requiresMath?rows.find(r=>r.domain==='math'&&r.cls!==null&&r.you<r.cls):null)||rows.find(r=>r.cls!==null&&r.you<r.cls);
    const index=levelIndex(latest().level);
    return [{id:'explore-'+f.id,title:'Découvrir ce qui te plaît',body:f.now},
      {id:'prepare-'+(g?.id||f.id),title:index!==null&&index>=4?'Préparer le prochain choix':'Consolider une habitude utile',body:g?preparationReading(g).next:f.id==='arts'?artisticNext({family:'arts'},index):index!==null&&index>=4?'Relire un bulletin avec un professeur et vérifier un attendu de la voie choisie.':caution?'Reprendre avec le professeur une difficulté en '+displaySubject(caution.subject)+', puis expliquer seul un exercice corrigé.':'Choisir un exercice ou un texte par semaine et expliquer ta démarche, puis discuter au prochain bulletin ce qui t’aide à travailler.'}];
  }
  function actionsHTML(g){return actionData(g).map(a=>'<article class="card action '+(state.done[a.id]?'done':'')+'"><input type="checkbox" id="'+esc(a.id)+'" data-action="'+esc(a.id)+'" '+(state.done[a.id]?'checked':'')+'><label for="'+esc(a.id)+'"><strong>'+esc(a.title)+'</strong>'+esc(a.body)+'</label></article>').join('');}
  function historyHTML(){return state.reviews.length?state.reviews.slice(-5).reverse().map(r=>'<p><strong>'+date(r.date)+' · '+esc(r.level||'Point d’étape')+'</strong><br>'+esc(r.note||'Point d’étape conservé.')+(r.goal?'<br>Cap : '+esc(r.goal):'')+'</p>').join(''):'<p>Les points d’étape apparaîtront ici : projets choisis, découvertes et actions utiles.</p>';}
  function selectGoal(g){
    if(!state.goals.some(s=>s.id===g.id))state.goals.push(g);
    state.activeGoal=g.id;save();refreshTarget();$('#target-slot').scrollIntoView({behavior:'smooth',block:'start'});
  }
  function refreshTarget(){const g=state.goals.find(g=>g.id===state.activeGoal);$('#saved-goals').innerHTML=savedGoalButtons();$('#target-slot').innerHTML=g?targetHTML(g):'';$('#actions').innerHTML=actionsHTML(g);bindGoalButtons();bindActions();}
  function bindGoalButtons(){
    document.querySelectorAll('[data-goal]').forEach(b=>b.onclick=()=>{state.activeGoal=b.dataset.goal;save();refreshTarget();});
    document.querySelectorAll('[data-select]').forEach(b=>b.onclick=()=>{const g=[...catalog,...results].find(g=>g.id===b.dataset.select);if(g)selectGoal(g);});
    if($('#remove-goal'))$('#remove-goal').onclick=()=>{state.goals=state.goals.filter(g=>g.id!==state.activeGoal);state.activeGoal=state.goals.at(-1)?.id||'';save();refreshTarget();};
    bindHistoryButtons();
    bindPopulationButtons();loadPopulation(state.goals.find(g=>g.id===state.activeGoal));
  }
  function bindHistoryButtons(){
    document.querySelectorAll('[data-history-window]').forEach(b=>b.onclick=()=>{
      const open=$('.admissions-detail')?.open;state.historyWindow=Number(b.dataset.historyWindow);save();refreshTarget();
      if(open&&$('.admissions-detail'))$('.admissions-detail').open=true;
    });
    document.querySelectorAll('[data-load-history]').forEach(b=>b.onclick=async()=>{
      const g=state.goals.find(g=>g.id===b.dataset.loadHistory);if(!g)return;
      if(!g.code||!g.uai){$('#history-status').textContent='L’identifiant exact de la formation reste à vérifier.';return;}
      const currentChild=child,controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),18000);
      b.disabled=true;$('#history-status').textContent='Lecture des historiques officiels…';
      try{
        const end=Number(g.historyEnd||g.session||2025),years=Array.from({length:5},(_,i)=>end-4+i);
        const records=await Promise.allSettled(years.map(async year=>{
          const dataset=year===2025?'fr-esr-parcoursup':'fr-esr-parcoursup_'+year;
          const url=new URL('https://data.enseignementsup-recherche.gouv.fr/api/explore/v2.1/catalog/datasets/'+dataset+'/records');
          url.searchParams.set('limit','2');url.searchParams.set('where','cod_aff_form='+JSON.stringify(String(g.code))+' and cod_uai='+JSON.stringify(g.uai));
          url.searchParams.set('select',['session','cod_aff_form','cod_uai','lib_for_voe_ins','nb_voe_pp','capa_fin','prop_tot','acc_tot',...(year===2021?[]:['taux_acces_ens'])].join(','));
          const response=await fetch(url,{signal:controller.signal});if(!response.ok)throw new Error('Historique indisponible');
          const data=await response.json(),matching=(data.results||[]).filter(r=>String(r.cod_aff_form)===String(g.code)&&r.cod_uai===g.uai&&Number(r.session)===year);if(matching.length>1)throw new Error('Formation ambiguë');const row=matching[0];
          return {year,available:!!row,source:url.href,candidates:row?.nb_voe_pp??null,places:row?.capa_fin??null,access:row?.taux_acces_ens??null,proposals:row?.prop_tot??null,accepted:row?.acc_tot??null};
        }));
        if(child!==currentChild||state.activeGoal!==g.id)return;
        const history=records.map((r,i)=>r.status==='fulfilled'?r.value:{year:years[i],available:false});
        if(!history.some(r=>r.available)){b.disabled=false;$('#history-status').textContent='Historiques indisponibles. Les données déjà présentes restent affichées.';return;}
        g.history=history;g.historyEnd=end;const known=catalog.find(c=>c.id===g.id);if(known)Object.assign(known,{history,historyEnd:end});save();refreshTarget();
      }finally{
        clearTimeout(timeout);if(b.isConnected)b.disabled=false;
      }
    });
  }
  function bindActions(){document.querySelectorAll('[data-action]').forEach(b=>b.onchange=()=>{state.done[b.dataset.action]=b.checked;b.closest('.action').classList.toggle('done',b.checked);save();});}
  function refreshScope(){
    resetSearch();$('#scope-controls').innerHTML=scopeControlsHTML();$('#proposal-slot').innerHTML=proposalsHTML();
    if($('#search-scope-label'))$('#search-scope-label').textContent=scopeLabel();
    bindScopeButtons();bindBrowseButtons();renderResults();
  }
  function bindScopeButtons(){
    document.querySelectorAll('[data-scope]').forEach(b=>b.onclick=()=>{state.scope=b.dataset.scope;save();refreshScope();});
    $('#region').onchange=e=>{state.region=e.target.value;save();refreshScope();};
  }
  function bindBrowseButtons(){
    document.querySelectorAll('[data-browse-schools]').forEach(b=>b.onclick=()=>{
      $('#school-search').open=true;onlineSearch({browse:true});$('#school-search').scrollIntoView({behavior:'smooth'});
    });
  }
  function bindFamilyButtons(){
    document.querySelectorAll('[data-family],[data-proposal-family]').forEach(b=>b.onclick=()=>{
      state.activeFamily=b.dataset.family||b.dataset.proposalFamily;save();
      $('#path-grid').innerHTML=FAMILIES.map(pathCard).join('');
      $('#family-picker').innerHTML=familyPickerHTML();$('#proposal-slot').innerHTML=proposalsHTML();
      $('#actions').innerHTML=actionsHTML(state.goals.find(g=>g.id===state.activeGoal));
      bindFamilyButtons();bindBrowseButtons();bindGoalButtons();bindActions();
      if(b.dataset.family)$('#section-4').scrollIntoView({behavior:'smooth'});
    });
  }
  function bindCatalogueFilters(){
    for(const [id,key] of [['formation-type','formationType'],['training-mode','trainingMode'],['school-route','schoolRoute']]){
      $('#'+id).onchange=e=>{
        state[key]=e.target.value;
        if(key==='schoolRoute'&&state.schoolRoute!=='all'){state.formationType='all';state.trainingMode='all';$('#formation-type').value='all';$('#training-mode').value='all';$('#stage').value='lycee';}
        else if(key!=='schoolRoute'&&(state.formationType!=='all'||state.trainingMode!=='all')){state.schoolRoute='all';$('#school-route').value='all';$('#stage').value='postbac';}
        save();resetSearch();$('#proposal-slot').innerHTML=proposalsHTML();bindBrowseButtons();bindGoalButtons();renderResults();
      };
    }
  }
  function bind(){
    $('#child-select').onchange=e=>{
      const name=e.target.value;
      if(embedded&&!payload.children.find(c=>c.name===name)?.demo){parent.postMessage({type:'futurepaths:child',child:name},location.origin==='null'?'*':location.origin);}
      child=name;state=saved();resetSearch();render();
    };
    document.querySelectorAll('[data-interest]').forEach(b=>b.onclick=()=>{const id=b.dataset.interest;state.interests=state.interests.includes(id)?state.interests.filter(i=>i!==id):[...state.interests,id];b.setAttribute('aria-pressed',String(state.interests.includes(id)));save();$('#student-portrait').outerHTML=portraitHTML();$('#actions').innerHTML=actionsHTML(state.goals.find(g=>g.id===state.activeGoal));bindActions();});
    $('#habits').onchange=e=>{state.habits=e.target.value;save();$('#student-portrait').outerHTML=portraitHTML();refreshTarget();};
    $('#feedback').oninput=e=>{state.feedback=e.target.value;save();};
    $('#review-note').oninput=e=>{state.reviewDraft=e.target.value;save();};
    bindFamilyButtons();
    bindCatalogueFilters();
    bindScopeButtons();bindBrowseButtons();
    $('#search').oninput=()=>{resetSearch();searchMessage='Exemples filtrés. Lance la recherche pour consulter l’offre publique 2026.';renderResults();};
    $('#stage').onchange=()=>{resetSearch();searchMessage='Exemples filtrés. Lance la recherche pour consulter le catalogue national.';renderResults();};
    $('#search-form').onsubmit=e=>{e.preventDefault();onlineSearch();};
    $('#custom-form').onsubmit=e=>{e.preventDefault();const url=$('#custom-url').value.trim();if(url&&!safeURL(url)){$('#custom-status').textContent='Indique un lien officiel en https://.';return;}selectGoal({id:'custom-'+Date.now(),name:$('#custom-name').value.trim(),program:$('#custom-program').value.trim(),stage:$('#custom-stage').value,family:$('#custom-family').value,url,custom:true,source:'Lien à vérifier',verifiedCriteria:false});$('#custom-status').textContent='Projet conservé. Les critères de cette formation restent à documenter.';};
    $('#record-review').onclick=()=>{const g=state.goals.find(g=>g.id===state.activeGoal);state.reviews.push({date:new Date().toISOString().slice(0,10),level:latest().level,year:latest().year,note:state.reviewDraft.trim(),goal:g?g.name+' · '+g.program:'',interests:[...state.interests],done:{...state.done}});state.reviewDraft='';save();$('#review-note').value='';$('#review-history').innerHTML=historyHTML();$('#review-status').textContent='Point d’étape conservé. À relire au prochain bulletin ou conseil.';};
    bindGoalButtons();bindActions();
  }
  function cancelRequest(){requestVersion++;if(searchController)searchController.abort();searchController=null;if($('#search-online')){$('#search-online').disabled=false;$('#search-online').textContent='Chercher en France';}}
  function resetSearch(){cancelRequest();results=[];searchMessage='';searchPage=0;searchLive=false;searchHasNext=false;searchTotal=0;}
  function renderResults(){
    const query=normalize($('#search')?.value||''),stage=$('#stage')?.value||'all';
    const source=searchLive?results:catalog;
    const filtered=source.filter(g=>(stage==='all'||g.stage===stage)&&matchesScope(g)&&matchesCatalogue(g)&&(searchLive||!query||normalize(g.name+' '+g.program+' '+g.city).includes(query)));
    const pageSize=24,shown=searchLive?filtered:filtered.slice(searchPage*pageSize,(searchPage+1)*pageSize);
    const next=searchLive?searchHasNext:(searchPage+1)*pageSize<filtered.length;
    $('#search-status').textContent=searchMessage||'Exemples sourcés · '+scopeLabel()+'. Lance la recherche pour consulter l’offre 2026, y compris en apprentissage.';
    $('#search-results').innerHTML=shown.length?shown.map(g=>'<article class="school-result"><div class="where">'+(g.stage==='lycee'?'Entrée au lycée':'Après le bac')+' · '+esc(g.city||'France')+'</div><h3>'+esc(g.name)+'</h3><p class="program">'+esc(g.program)+'</p><p>'+esc(g.stage==='postbac'?FutureCatalogue.typeLabel(g):'Chemin au lycée')+' · '+(g.apprenticeship?'Apprentissage':'Statut scolaire')+'</p><p>'+esc(g.source)+(g.offerSession?' · offre '+esc(g.offerSession):g.session?' · '+esc(g.session):'')+'</p><button data-select="'+esc(g.id)+'">'+(state.goals.some(goal=>goal.id===g.id)?'Voir le chemin':'Choisir ce projet')+' →</button></article>').join(''):'<p class="subtle">Aucune formation affichée dans ces filtres. Tu peux changer le périmètre, voir une autre page ou ajouter ton projet à documenter.</p>';
    $('#search-pagination').innerHTML='<button type="button" id="search-previous" '+(!searchPage?'disabled':'')+'>← Précédents</button><span>Page '+(searchPage+1)+(searchLive?' · '+fmt(searchTotal)+' résultats publics':' · '+filtered.length+' exemples')+'</span><button type="button" id="search-next" '+(!next?'disabled':'')+'>Suivants →</button>';
    $('#search-previous').onclick=()=>changeSearchPage(searchPage-1);$('#search-next').onclick=()=>changeSearchPage(searchPage+1);
    bindGoalButtons();
  }
  function changeSearchPage(page){if(page<0)return;if(searchLive)onlineSearch({browse:lastBrowse,page});else{searchPage=page;renderResults();}}
  const inferredFamilies=r=>FutureCatalogue.families(r);
  function typeWhere(){
    if(state.formationType==='all')return '';
    const type=FutureCatalogue.types.find(t=>t.id===state.formationType),clauses=(type?.mapLabels||[]).map(label=>'tf='+JSON.stringify(label));
    const words={las:['LAS','Accès Santé'],pass:['PASS'],nursing:['Infirmier'],dnmade:['DN MADE'],lpe:['Professorat','PPPE'],dcg:['Comptabilité et de Gestion'],deust:['DEUST'],cmi:['Cursus Master','CMI']}[state.formationType]||[];
    clauses.push(...words.map(word=>'nm like '+JSON.stringify('%'+word+'%')));
    return clauses.length?'('+clauses.join(' or ')+')':'';
  }
  function legacyFormation(r){
    const known=catalog.find(g=>String(g.code)===String(r.cod_aff_form)&&g.uai===r.cod_uai);
    if(known)return known;
    const f=inferredFamilies(r);
    return FutureCatalogue.enrich({id:'ps-'+r.cod_aff_form,name:r.g_ea_lib_vx,program:r.lib_for_voe_ins+(r.detail_forma?' · '+r.detail_forma:''),city:r.ville_etab,dep:r.dep,region:r.region_etab_aff,stage:'postbac',family:f[0],families:f,
      ...(f.includes('society')&&f.includes('international')&&f.includes('economy')?{requiresMath:true,readinessDomains:['french','language','history','math']}:{}),
      population:FutureAdmissions.populationFromRecord(r),selectivity:r.select_form,code:String(r.cod_aff_form),uai:r.cod_uai,session:r.session,source:'Parcoursup · statistiques historiques',places:r.capa_fin,access:r.taux_acces_ens,historyEnd:Number(r.session),history:[{year:Number(r.session),available:true,candidates:r.nb_voe_pp,places:r.capa_fin,access:r.taux_acces_ens,proposals:r.prop_tot,accepted:r.acc_tot}],
      url:r.lien_form_psup||'https://dossier.parcoursup.fr/Candidats/public/fiches/afficherFicheFormation?g_ta_cod='+encodeURIComponent(r.cod_aff_form),verifiedCriteria:false});
  }
  async function onlineSearch({browse=false,page=0}={}){
    cancelRequest();const version=requestVersion,query=browse?'':$('#search').value.trim();
    const stage=state.schoolRoute!=='all'?'lycee':state.formationType!=='all'||state.trainingMode!=='all'?'postbac':browse?(levelIndex(latest().level)>=4?'postbac':'all'):$('#stage').value;
    if(!browse&&query.length<2){searchMessage='Entre au moins deux caractères pour chercher un établissement ou une formation.';renderResults();return;}
    const tokens=normalize(query).split(/\s+/).map(t=>t.replace(/[^a-z0-9-]/g,'')).filter(Boolean).slice(0,5);
    if(!browse&&!tokens.length){searchMessage='Essaie un nom d’établissement ou une formation.';renderResults();return;}
    searchController=new AbortController();const controller=searchController,timeout=setTimeout(()=>controller.abort(),18000);
    $('#search-online').disabled=true;$('#search-online').textContent='Recherche…';searchMessage='Lecture de l’offre publique 2026…';renderResults();
    const mapTerms=['annee="2026"',...tokens.map(t=>'('+['etab_nom','nm','fl','commune'].map(field=>field+' like '+JSON.stringify('%'+t+'%')).join(' or ')+')')];
    if(browse&&FutureCatalogue.keywords[activeFamily()]?.length)mapTerms.push('('+FutureCatalogue.keywords[activeFamily()].map(t=>'(nm like '+JSON.stringify('%'+t+'%')+' or fl like '+JSON.stringify('%'+t+'%')+')').join(' or ')+')');
    if(scopeWhere('map'))mapTerms.push(scopeWhere('map'));if(typeWhere())mapTerms.push(typeWhere());
    if(state.trainingMode==='apprenticeship')mapTerms.push('app is not null');else if(state.trainingMode==='school')mapTerms.push('app is null');
    const lyTerms=['type_etablissement="Lycée"',...tokens.map(t=>'(nom_etablissement like '+JSON.stringify('%'+t+'%')+' or nom_commune like '+JSON.stringify('%'+t+'%')+')')];
    if(scopeWhere('ly'))lyTerms.push(scopeWhere('ly'));
    const routeField={general:'voie_generale',technological:'voie_technologique',professional:'voie_professionnelle'}[state.schoolRoute];if(routeField)lyTerms.push(routeField+'="1"');
    function url(host,dataset,where){const u=new URL(host+'/api/explore/v2.1/catalog/datasets/'+dataset+'/records');u.searchParams.set('limit','24');u.searchParams.set('offset',String(page*24));u.searchParams.set('where',where);u.searchParams.set('order_by',dataset==='fr-esr-cartographie_formations_parcoursup'?'etab_nom,gta':'nom_etablissement,identifiant_de_l_etablissement');return u;}
    async function fetchRows(u,kind){const response=await fetch(u,{signal:controller.signal});if(!response.ok)throw new Error('Catalogue indisponible');return {kind,...await response.json()};}
    try{
      const tasks=[];
      if(stage!=='lycee')tasks.push(fetchRows(url('https://data.enseignementsup-recherche.gouv.fr','fr-esr-cartographie_formations_parcoursup',mapTerms.join(' and ')),'map'));
      if(stage!=='postbac')tasks.push(fetchRows(url('https://data.education.gouv.fr','fr-en-annuaire-education',lyTerms.join(' and ')),'ly'));
      const settled=await Promise.allSettled(tasks);if(version!==requestVersion)return;
      const collected=[];let total=0,hasNext=false,failures=0;
      for(const outcome of settled){
        if(outcome.status==='rejected'){failures++;continue;}
        const d=outcome.value;total+=d.total_count||0;hasNext||=d.total_count>(page+1)*24;
        for(const r of d.results||[]){
          if(d.kind==='map'){
            const g=r.cod_aff_form?legacyFormation(r):FutureCatalogue.fromMap(r,catalog);if(g)collected.push(g);
          }else{
            const id='ly-'+r.identifiant_de_l_etablissement,known=catalog.find(g=>g.id===id);
            collected.push(known||{id,name:r.nom_etablissement,program:'Entrée au lycée · enseignements et procédure à vérifier',city:r.nom_commune||'',dep:String(r.code_departement||'').replace(/^0(\d\d)$/,'$1'),region:r.libelle_region,regionCode:String(r.code_region||''),stage:'lycee',family:'open',schoolRoute:state.schoolRoute==='all'?(r.voie_professionnelle==='1'?'professional':r.voie_technologique==='1'?'technological':'general'):state.schoolRoute,uai:r.identifiant_de_l_etablissement,source:'Annuaire Éducation nationale',url:safeURL(r.web)||'https://www.education.gouv.fr/annuaire?keywords='+encodeURIComponent(r.nom_etablissement),verifiedCriteria:false});
          }
        }
      }
      if(!settled.some(o=>o.status==='fulfilled')){resetSearch();searchMessage='Recherche nationale indisponible. Les exemples sourcés restent utilisables ; tu peux ajouter un projet à documenter.';renderResults();return;}
      results=[...new Map(collected.map(g=>[g.id,g])).values()];searchLive=true;searchPage=page;searchHasNext=hasNext;searchTotal=total;lastBrowse=browse;
      searchMessage=results.length+' résultat(s) chargé(s) · offre 2026 et annuaire des lycées · '+scopeLabel()+'.'+(failures?' Recherche partielle : un catalogue est indisponible.':'');
      if(browse){catalog=[...catalog,...results.filter(g=>!catalog.some(c=>c.id===g.id))];$('#proposal-slot').innerHTML=proposalsHTML();bindBrowseButtons();bindGoalButtons();}
      renderResults();
    }catch{if(version===requestVersion){resetSearch();searchMessage='Recherche nationale indisponible. Les exemples sourcés restent utilisables.';renderResults();}}
    finally{clearTimeout(timeout);if(version===requestVersion){searchController=null;$('#search-online').disabled=false;$('#search-online').textContent='Chercher en France';}}
  }
  $('#back-grades').onclick=()=>{if(embedded)parent.postMessage({type:'futurepaths:grades'},location.origin==='null'?'*':location.origin);else location.href='grades_dashboard.html?child='+encodeURIComponent(child);};
  window.addEventListener('message',e=>{
    if(e.source!==parent||(location.origin!=='null'&&e.origin!==location.origin)||e.data?.type!=='futurepaths:init')return;
    const next=e.data.payload;if(!next||next.version!==1||!Array.isArray(next.children))return;
    payload=withDemos(next);child=next.activeChild||payload.children[0]?.name;state=saved();resetSearch();render();
  });
  // Testable read-only view of the model; no raw grade or account data is exposed here.
  window.FuturePaths={milestones,levelIndex,familyReading,getProfile:()=>pupil(),admissionsSummary:g=>FutureAdmissions.summary(g,state.historyWindow)};
  if(embedded){
    $('#app').innerHTML='<div class="empty"><p>Chargement des parcours de l’enfant sélectionné…</p></div>';
    $('#back-grades').disabled=true;
    const reportHeight=()=>parent.postMessage({type:'futurepaths:height',height:Math.ceil(document.querySelector('.shell').getBoundingClientRect().height)},location.origin==='null'?'*':location.origin);
    new ResizeObserver(reportHeight).observe(document.querySelector('.shell'));
    parent.postMessage({type:'futurepaths:ready'},location.origin==='null'?'*':location.origin);
  }else render();
})();
