/* Public IVAL comparisons. No child data is sent to the public data service. */
(function(){
  'use strict';
  const SOURCE='https://data.education.gouv.fr/explore/dataset/fr-en-indicateurs-de-resultat-des-lycees-gt_v2/';
  const API='https://data.education.gouv.fr/api/explore/v2.1/catalog/datasets/fr-en-indicateurs-de-resultat-des-lycees-gt_v2/records';
  const SNAPSHOT=[
  {"nom": "Lycée Sainte Marie", "ville": "Cannes", "secteur": "prive", "vaMen": 21.0, "vaMen3": 13.0, "men": 93.0, "men3": 83.7, "reu": 100.0, "reu3": 100.0, "bTb": 16, "bB": 27, "bAb": 49, "bSans": 7, "bTb3": 16.7, "bB3": 27.0, "bAb3": 39.7, "bN": 95, "nY": 3},
  {"nom": "Lycée Saint Joseph", "ville": "Nice", "secteur": "prive", "vaMen": 9.0, "vaMen3": 17.0, "men": 75.0, "men3": 78.7, "reu": 100.0, "reu3": 99.7, "bTb": 8, "bB": 24, "bAb": 42, "bSans": 25, "bTb3": 17.0, "bB3": 25.0, "bAb3": 36.3, "bN": 99, "nY": 3},
  {"nom": "Lycée International", "ville": "Valbonne", "secteur": "public", "vaMen": 8.0, "vaMen3": 8.3, "men": 94.0, "men3": 92.3, "reu": 99.0, "reu3": 99.3, "bTb": 40, "bB": 37, "bAb": 18, "bSans": 5, "bTb3": 38.0, "bB3": 35.3, "bAb3": 19.3, "bN": 350, "nY": 3},
  {"nom": "Lycée Fenelon", "ville": "Grasse", "secteur": "prive", "vaMen": 7.0, "vaMen3": 8.3, "men": 88.0, "men3": 87.0, "reu": 100.0, "reu3": 99.7, "bTb": 19, "bB": 32, "bAb": 37, "bSans": 12, "bTb3": 21.0, "bB3": 31.3, "bAb3": 35.0, "bN": 172, "nY": 3},
  {"nom": "Institution St Joseph Carnoles", "ville": "Roquebrune Cap Martin", "secteur": "prive", "vaMen": 7.0, "vaMen3": 12.3, "men": 78.0, "men3": 79.3, "reu": 100.0, "reu3": 99.7, "bTb": 9, "bB": 31, "bAb": 38, "bSans": 22, "bTb3": 11.7, "bB3": 26.3, "bAb3": 41.3, "bN": 159, "nY": 3},
  {"nom": "Lycée Leonard De Vinci (général et Techno.)", "ville": "Antibes", "secteur": "public", "vaMen": 7.0, "vaMen3": 4.7, "men": 72.0, "men3": 70.0, "reu": 96.0, "reu3": 95.3, "bTb": 10, "bB": 28, "bAb": 36, "bSans": 25, "bTb3": 10.3, "bB3": 24.3, "bAb3": 38.7, "bN": 165, "nY": 3},
  {"nom": "Lycée Rene Goscinny", "ville": "Drap", "secteur": "public", "vaMen": 7.0, "vaMen3": 9.7, "men": 54.0, "men3": 54.7, "reu": 97.0, "reu3": 95.7, "bTb": 6, "bB": 17, "bAb": 33, "bSans": 45, "bTb3": 7.3, "bB3": 16.3, "bAb3": 33.3, "bN": 241, "nY": 3},
  {"nom": "Lycée Mont Saint Jean", "ville": "Antibes", "secteur": "prive", "vaMen": 6.0, "vaMen3": 6.0, "men": 91.0, "men3": 90.7, "reu": 99.0, "reu3": 99.7, "bTb": 22, "bB": 41, "bAb": 29, "bSans": 8, "bTb3": 26.3, "bB3": 35.7, "bAb3": 29.3, "bN": 168, "nY": 3},
  {"nom": "Lycée Sasserno", "ville": "Nice", "secteur": "prive", "vaMen": 6.0, "vaMen3": 10.3, "men": 89.0, "men3": 90.7, "reu": 100.0, "reu3": 99.3, "bTb": 16, "bB": 41, "bAb": 32, "bSans": 11, "bTb3": 23.0, "bB3": 39.0, "bAb3": 29.3, "bN": 170, "nY": 3},
  {"nom": "Lycée Parc Imperial", "ville": "Nice", "secteur": "public", "vaMen": 6.0, "vaMen3": 4.7, "men": 57.0, "men3": 54.7, "reu": 92.0, "reu3": 91.0, "bTb": 11, "bB": 19, "bAb": 31, "bSans": 38, "bTb3": 11.0, "bB3": 18.0, "bAb3": 31.0, "bN": 450, "nY": 3},
  {"nom": "Lycée Stanislas", "ville": "Nice", "secteur": "prive", "vaMen": 5.0, "vaMen3": 5.3, "men": 93.0, "men3": 93.0, "reu": 100.0, "reu3": 100.0, "bTb": 37, "bB": 38, "bAb": 18, "bSans": 7, "bTb3": 35.0, "bB3": 37.7, "bAb3": 20.3, "bN": 128, "nY": 3},
  {"nom": "Lycée Guillaume Apollinaire", "ville": "Nice", "secteur": "public", "vaMen": 4.0, "vaMen3": 4.7, "men": 43.0, "men3": 42.7, "reu": 90.0, "reu3": 90.7, "bTb": 3, "bB": 15, "bAb": 30, "bSans": 52, "bTb3": 4.3, "bB3": 14.7, "bAb3": 28.0, "bN": 323, "nY": 3},
  {"nom": "Lycée Simone Veil", "ville": "Valbonne", "secteur": "public", "vaMen": 4.0, "vaMen3": 4.7, "men": 78.0, "men3": 79.0, "reu": 99.0, "reu3": 98.7, "bTb": 18, "bB": 28, "bAb": 33, "bSans": 21, "bTb3": 21.7, "bB3": 28.0, "bAb3": 30.7, "bN": 326, "nY": 3},
  {"nom": "Lycée Don Bosco", "ville": "Nice", "secteur": "prive", "vaMen": 3.0, "vaMen3": 3.7, "men": 81.0, "men3": 80.7, "reu": 100.0, "reu3": 99.7, "bTb": 11, "bB": 26, "bAb": 44, "bSans": 19, "bTb3": 15.3, "bB3": 27.3, "bAb3": 38.3, "bN": 140, "nY": 3},
  {"nom": "Lycée Henri Matisse", "ville": "Vence", "secteur": "public", "vaMen": 2.0, "vaMen3": -0.3, "men": 72.0, "men3": 69.7, "reu": 96.0, "reu3": 97.7, "bTb": 15, "bB": 28, "bAb": 32, "bSans": 25, "bTb3": 13.7, "bB3": 24.3, "bAb3": 33.0, "bN": 329, "nY": 3},
  {"nom": "Lycée Stanislas", "ville": "Cannes", "secteur": "prive", "vaMen": 2.0, "vaMen3": 6.7, "men": 87.0, "men3": 90.0, "reu": 100.0, "reu3": 100.0, "bTb": 26, "bB": 36, "bAb": 25, "bSans": 13, "bTb3": 26.7, "bB3": 36.7, "bAb3": 27.0, "bN": 206, "nY": 3},
  {"nom": "Lycée Jacques Audiberti", "ville": "Antibes", "secteur": "public", "vaMen": 2.0, "vaMen3": 2.3, "men": 56.0, "men3": 54.7, "reu": 95.0, "reu3": 95.0, "bTb": 8, "bB": 18, "bAb": 33, "bSans": 41, "bTb3": 7.3, "bB3": 18.0, "bAb3": 32.3, "bN": 412, "nY": 3},
  {"nom": "Lycée Massena", "ville": "Nice", "secteur": "public", "vaMen": 2.0, "vaMen3": 0.3, "men": 76.0, "men3": 73.0, "reu": 98.0, "reu3": 98.3, "bTb": 25, "bB": 29, "bAb": 24, "bSans": 22, "bTb3": 22.0, "bB3": 25.7, "bAb3": 26.3, "bN": 284, "nY": 3},
  {"nom": "Lycée Melinee et Missak Manouchian", "ville": "Nice", "secteur": "public", "vaMen": 2.0, "vaMen3": -0.7, "men": 51.0, "men3": 47.3, "reu": 92.0, "reu3": 89.7, "bTb": 8, "bB": 18, "bAb": 29, "bSans": 45, "bTb3": 7.3, "bB3": 17.7, "bAb3": 28.3, "bN": 424, "nY": 3},
  {"nom": "Lycée Regional Hotelier Jeanne et Paul Augier (général et Techno.)", "ville": "Nice", "secteur": "public", "vaMen": 1.0, "vaMen3": -6.0, "men": 54.0, "men3": 53.3, "reu": 93.0, "reu3": 95.3, "bTb": 6, "bB": 21, "bAb": 30, "bSans": 42, "bTb3": 6.3, "bB3": 18.0, "bAb3": 32.0, "bN": 66, "nY": 3},
  {"nom": "Lycée Honore D'Estienne D'Orves", "ville": "Nice", "secteur": "public", "vaMen": -1.0, "vaMen3": -3.7, "men": 51.0, "men3": 48.7, "reu": 93.0, "reu3": 90.7, "bTb": 7, "bB": 19, "bAb": 29, "bSans": 45, "bTb3": 8.0, "bB3": 17.3, "bAb3": 29.0, "bN": 473, "nY": 3},
  {"nom": "Lycée Pierre et Marie Curie", "ville": "Menton", "secteur": "public", "vaMen": -2.0, "vaMen3": 2.3, "men": 42.0, "men3": 45.3, "reu": 87.0, "reu3": 89.3, "bTb": 6, "bB": 13, "bAb": 29, "bSans": 52, "bTb3": 6.3, "bB3": 14.3, "bAb3": 30.0, "bN": 259, "nY": 3},
  {"nom": "Lycée Amiral De Grasse", "ville": "Grasse", "secteur": "public", "vaMen": -2.0, "vaMen3": -3.7, "men": 61.0, "men3": 56.3, "reu": 96.0, "reu3": 94.0, "bTb": 9, "bB": 21, "bAb": 34, "bSans": 37, "bTb3": 8.7, "bB3": 20.3, "bAb3": 31.0, "bN": 316, "nY": 3},
  {"nom": "Lycée Albert Calmette", "ville": "Nice", "secteur": "public", "vaMen": -2.0, "vaMen3": 0.3, "men": 62.0, "men3": 61.7, "reu": 95.0, "reu3": 93.3, "bTb": 15, "bB": 20, "bAb": 30, "bSans": 35, "bTb3": 16.3, "bB3": 20.3, "bAb3": 29.3, "bN": 381, "nY": 3},
  {"nom": "Lycée Auguste Renoir", "ville": "Cagnes Sur Mer", "secteur": "public", "vaMen": -2.0, "vaMen3": -3.7, "men": 61.0, "men3": 62.0, "reu": 96.0, "reu3": 95.7, "bTb": 8, "bB": 21, "bAb": 34, "bSans": 37, "bTb3": 12.0, "bB3": 22.0, "bAb3": 30.7, "bN": 513, "nY": 3},
  {"nom": "Lycée Carnot", "ville": "Cannes", "secteur": "public", "vaMen": -3.0, "vaMen3": -1.3, "men": 51.0, "men3": 52.3, "reu": 94.0, "reu3": 93.3, "bTb": 8, "bB": 19, "bAb": 28, "bSans": 45, "bTb3": 8.0, "bB3": 19.0, "bAb3": 29.7, "bN": 368, "nY": 3},
  {"nom": "Lycée La Providence", "ville": "Nice", "secteur": "prive", "vaMen": -3.0, "vaMen3": -7.0, "men": 45.0, "men3": 42.3, "reu": 89.0, "reu3": 90.0, "bTb": 9, "bB": 17, "bAb": 26, "bSans": 49, "bTb3": 5.0, "bB3": 12.0, "bAb3": 30.3, "bN": 47, "nY": 3},
  {"nom": "Lycée De La Montagne (général et Techno.)", "ville": "Valdeblore", "secteur": "public", "vaMen": -4.0, "vaMen3": -3.7, "men": 63.0, "men3": 61.3, "reu": 97.0, "reu3": 97.7, "bTb": 8, "bB": 20, "bAb": 37, "bSans": 36, "bTb3": 11.0, "bB3": 21.0, "bAb3": 31.0, "bN": 76, "nY": 3},
  {"nom": "Lycée Bristol", "ville": "Cannes", "secteur": "public", "vaMen": -5.0, "vaMen3": -1.3, "men": 33.0, "men3": 35.7, "reu": 86.0, "reu3": 87.3, "bTb": 3, "bB": 9, "bAb": 26, "bSans": 62, "bTb3": 2.7, "bB3": 12.3, "bAb3": 26.0, "bN": 268, "nY": 3},
  {"nom": "Lycée Alexis De Tocqueville", "ville": "Grasse", "secteur": "public", "vaMen": -5.0, "vaMen3": -6.0, "men": 57.0, "men3": 55.0, "reu": 95.0, "reu3": 94.0, "bTb": 10, "bB": 21, "bAb": 29, "bSans": 40, "bTb3": 9.7, "bB3": 19.3, "bAb3": 29.3, "bN": 306, "nY": 3},
  {"nom": "Lycée Jules Ferry", "ville": "Cannes", "secteur": "public", "vaMen": -5.0, "vaMen3": 0.7, "men": 64.0, "men3": 67.3, "reu": 93.0, "reu3": 95.3, "bTb": 17, "bB": 25, "bAb": 27, "bSans": 31, "bTb3": 16.7, "bB3": 26.7, "bAb3": 27.0, "bN": 277, "nY": 3},
  {"nom": "Lycée Les Eucalyptus", "ville": "Nice", "secteur": "public", "vaMen": -7.0, "vaMen3": -2.0, "men": 57.0, "men3": 64.0, "reu": 93.0, "reu3": 94.3, "bTb": 9, "bB": 25, "bAb": 27, "bSans": 39, "bTb3": 11.3, "bB3": 27.7, "bAb3": 28.7, "bN": 205, "nY": 3},
  {"nom": "Lycée Saint Barthelemy", "ville": "Nice", "secteur": "prive", "vaMen": 0.0, "vaMen3": 1.0, "men": 86.0, "men3": 81.0, "reu": 100.0, "reu3": 100.0, "bTb": 14, "bB": 40, "bAb": 33, "bSans": 14, "bTb3": 14.7, "bB3": 33.7, "bAb3": 33.0, "bN": 88, "nY": 3},
  {"nom": "Lycée Les Fauvettes", "ville": "Cannes", "secteur": "prive", "vaMen": null, "vaMen3": -5.0, "men": 50.0, "men3": 44.0, "reu": 90.0, "reu3": 87.0, "bTb": 4, "bB": 15, "bAb": 37, "bSans": 44, "bTb3": 2.3, "bB3": 15.7, "bAb3": 33.0, "bN": 27, "nY": 3},
  {"nom": "Lycée Or Torah", "ville": "Nice", "secteur": "prive", "vaMen": null, "vaMen3": null, "men": 63.0, "men3": 69.0, "reu": 93.0, "reu3": 96.5, "bTb": 12, "bB": 32, "bAb": 24, "bSans": 32, "bTb3": 15.0, "bB3": 26.5, "bAb3": 30.0, "bN": 25, "nY": 2},
]; // Replaced with the preserved public 2023–2025 Alpes-Maritimes dataset.
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const num=v=>v==null||String(v).trim()===''||!Number.isFinite(Number(v))?null:Number(v);
  const fmt=v=>v==null?'Non publié':v.toLocaleString('fr-FR',{maximumFractionDigits:1});
  const validDepartment=v=>/^(?:0[1-9]|[1-8][0-9]|9[0-5]|2[AB]|97[1-6])$/.test(v);
  const metricKeys={va:['vaMen3','vaMen'],mentions:['men3','men'],success:['reu3','reu']};
  let panel=null,chart=null,controller=null,epoch=0,rows=[],shown=[],selectedDepartment='06',periodEnd=2025,chooseGoal=null,isActive=()=>false;
  function summarize(records){
    const end=Math.max(0,...records.map(r=>num(r.annee)||0));
    const by=new Map();
    for(const r of records){
      const year=num(r.annee);if(!r.uai||!year||year<end-2||year>end)continue;
      const key=String(r.uai);if(!by.has(key))by.set(key,new Map());by.get(key).set(year,r);
    }
    const result=[];
    for(const [uai,years] of by){
      const history=[...years.values()].sort((a,b)=>num(b.annee)-num(a.annee)),last=history[0];
      const average=key=>{const values=history.map(r=>num(r[key])).filter(v=>v!=null);return values.length?values.reduce((a,b)=>a+b,0)/values.length:null;};
      const count=key=>history.filter(r=>num(r[key])!=null).length;
      const latest=key=>num(last.annee)===end?num(last[key]):null;
      result.push({uai,nom:String(last.libelle_uai||uai),ville:String(last.libelle_commune||''),dep:String(last.code_departement||'').replace(/^0(\d\d)$/,'$1'),secteur:norm(last.secteur).startsWith('pr')?'prive':'public',
        vaMen:latest('va_men_total'),vaMen3:average('va_men_total'),men:latest('taux_men_total'),men3:average('taux_men_total'),reu:latest('taux_reu_total'),reu3:average('taux_reu_total'),
        counts:{va:count('va_men_total'),mentions:count('taux_men_total'),success:count('taux_reu_total')},nY:history.length,bN:latest('presents_total'),lastYear:num(last.annee)});
    }
    return {rows:result,end};
  }
  function html(){return '<details id="lycee-comparison" class="lycee-comparison"><summary>Comparer les lycées · Alpes-Maritimes et autres départements</summary>'+
    '<p class="subtle">Lycées généraux et technologiques. La valeur ajoutée des mentions compare le résultat observé au résultat attendu selon le profil des élèves à l’entrée. Elle aide à comparer les résultats ; regarde aussi les enseignements, l’accompagnement et le trajet.</p>'+
    '<div class="lycee-controls"><form id="lycee-department-form"><label>Département<input id="lycee-department" value="06" maxlength="3" placeholder="06, 75, 2A…" autocomplete="off"></label><button type="submit" id="lycee-load">Afficher</button></form>'+
    '<label>Comparer<select id="lycee-metric"><option value="va">Valeur ajoutée des mentions</option><option value="mentions">Taux de mention au bac</option><option value="success">Taux de réussite au bac</option></select></label>'+
    '<label>Période<select id="lycee-period"><option value="3">Trois ans</option><option value="1">Dernière session publiée</option></select></label></div>'+
    '<label class="small-gap">Filtrer par nom ou ville<input id="lycee-filter" placeholder="Stanislas, Antibes…" autocomplete="off"></label>'+
    '<p id="lycee-status" class="context" role="status"></p><p id="lycee-period-note" class="subtle"></p>'+
    '<div class="lycee-chart-box"><canvas id="lycee-chart" role="img" aria-label="Comparaison des résultats des lycées"></canvas></div>'+
    '<p class="subtle">Bleu : public · Violet : privé. Les barres comparent des établissements ; elles ne donnent pas une chance d’admission.</p>'+
    '<details class="lycee-projects"><summary>Voir les chiffres et garder un lycée comme projet</summary><div id="lycee-project-list"></div></details>'+
    '<p class="subtle"><a href="'+SOURCE+'" target="_blank" rel="noopener noreferrer">Source : IVAL · Éducation nationale ↗</a>. Moyennes simples des sessions disponibles sur trois ans ; une donnée absente reste absente. Les taux bruts reflètent aussi le public accueilli. Les lycées professionnels ne figurent pas dans cette comparaison.</p></details>';}
  const $=s=>panel?.querySelector(s);
  function render(){
    if(!panel||!isActive())return;
    const metric=$('#lycee-metric').value,three=$('#lycee-period').value==='3',key=metricKeys[metric][three?0:1],query=norm($('#lycee-filter').value.trim());
    shown=rows.filter(r=>r[key]!=null&&(!query||norm(r.nom+' '+r.ville).includes(query))).slice().sort((a,b)=>b[key]-a[key]||a.nom.localeCompare(b.nom,'fr'));
    const period=three?(periodEnd-2)+'–'+periodEnd:String(periodEnd),isVa=metric==='va';
    $('#lycee-period-note').textContent=period+' · '+shown.length+' lycée(s) · '+(isVa?'valeur ajoutée en points de pourcentage':'taux en %')+'.';
    $('#lycee-project-list').innerHTML=shown.map((r,i)=>'<article class="lycee-project"><div><strong>'+esc(r.nom)+'</strong><p>'+esc(r.ville)+' · '+(r.secteur==='public'?'public':'privé')+' · '+fmt(r[key])+(isVa?' points':' %')+' · '+(three?(r.counts?.[metric]??r.nY)+'/3 sessions':periodEnd)+'</p></div><button type="button" data-lycee-project="'+i+'">Garder ce projet</button></article>').join('')||'<p class="subtle">Aucun lycée avec des résultats publiés pour ces filtres.</p>';
    panel.querySelectorAll('[data-lycee-project]').forEach(button=>button.onclick=()=>{
      const r=shown[Number(button.dataset.lyceeProject)];if(!r||!isActive())return;
      const goal={id:'ival-'+(r.uai||norm(r.nom+'-'+r.ville).replace(/[^a-z0-9]+/g,'-')),uai:r.uai||undefined,name:r.nom,city:r.ville,dep:r.dep||selectedDepartment,stage:'lycee',family:'open',families:['open'],schoolRoute:'general',
        program:'Entrée au lycée · enseignements et procédure à vérifier',url:SOURCE,source:'IVAL · Éducation nationale',session:periodEnd,verifiedCriteria:false,
        preparation:'Comparer les enseignements et les sections proposés, puis vérifier les règles d’affectation ou de candidature auprès du lycée.'};
      chooseGoal(goal);button.textContent='Projet conservé';
    });
    const box=$('.lycee-chart-box');box.hidden=!shown.length;
    if(chart){chart.destroy();chart=null;}
    if(!shown.length||!panel.open)return;
    box.style.height=Math.max(260,shown.length*43+70)+'px';
    const narrow=window.innerWidth<600;
    const label=r=>{const text=r.nom.replace(/^Lycée\s+/i,'')+' · '+r.ville;if(!narrow)return text;const words=text.split(' '),lines=[''];for(const w of words){if(lines.at(-1).length+w.length>22)lines.push(w);else lines[lines.length-1]+=(lines.at(-1)?' ':'')+w;}return lines;};
    chart=new Chart($('#lycee-chart'),{type:'bar',data:{labels:shown.map(label),datasets:[{label:isVa?'Valeur ajoutée des mentions':metric==='mentions'?'Taux de mention':'Taux de réussite',data:shown.map(r=>r[key]),backgroundColor:shown.map(r=>r.secteur==='public'?'#6ea8fe':'#c792ea'),borderRadius:3}]},
      options:{maintainAspectRatio:false,indexAxis:'y',animation:false,scales:{x:{beginAtZero:true,...(!isVa?{min:0,max:100}:{}),grid:{color:'#2a3150'},ticks:{color:'#9aa3c0',callback:v=>v+(isVa?' pts':' %')}},y:{grid:{display:false},ticks:{color:'#e8ecf7',autoSkip:false,font:{size:narrow?10:12}}}},plugins:{legend:{display:false},tooltip:{callbacks:{title:items=>shown[items[0].dataIndex].nom+' · '+shown[items[0].dataIndex].ville,label:c=>fmt(shown[c.dataIndex][key])+(isVa?' points':' %'),afterBody:items=>{const r=shown[items[0].dataIndex];return [period+' · '+(three?(r.counts?.[metric]??r.nY)+'/3 sessions renseignées':'session publiée'),r.bN!=null?'Effectif dernière session : '+r.bN:'Effectif dernière session non publié'];}}}}}});
  }
  function clear(){epoch++;controller?.abort();controller=null;if(chart)chart.destroy();chart=null;panel=null;chooseGoal=null;rows=[];shown=[];}
  function mount(selectGoal,{isActive:activeCheck}={}){
    clear();panel=document.querySelector('#lycee-comparison');if(!panel)return;
    chooseGoal=selectGoal;isActive=()=>!!panel?.isConnected&&!!activeCheck?.();rows=SNAPSHOT.map(r=>({...r,dep:'06'}));periodEnd=2025;selectedDepartment='06';
    $('#lycee-status').textContent='Alpes-Maritimes · données conservées, sessions 2023–2025. Afficher permet de consulter les dernières données publiques.';
    panel.addEventListener('toggle',()=>{if(panel?.open)render();});
    $('#lycee-metric').onchange=render;$('#lycee-period').onchange=render;$('#lycee-filter').oninput=render;
    $('#lycee-department-form').onsubmit=async event=>{
      event.preventDefault();const dep=$('#lycee-department').value.trim().toUpperCase();
      if(!validDepartment(dep)){$('#lycee-status').textContent='Indique un code de département, par exemple 06, 75 ou 2A.';return;}
      controller?.abort();controller=new AbortController();const requestController=controller,request=++epoch,signal=requestController.signal,timeout=setTimeout(()=>requestController.abort(),20000);
      $('#lycee-load').disabled=true;$('#lycee-status').textContent='Lecture des résultats publics · département '+dep+'…';
      const current=()=>request===epoch&&panel?.isConnected&&isActive();
      const clauses='code_departement in ('+[dep,dep.length===2&&!/[AB]/.test(dep)?'0'+dep:dep].map(v=>JSON.stringify(v)).join(',')+')';
      try{
        const query=async(where,limit,offset=0)=>{
          const url=new URL(API);url.search=new URLSearchParams({where,order_by:'annee desc',limit:String(limit),offset:String(offset)});
          const response=await fetch(url,{signal,credentials:'omit',referrerPolicy:'no-referrer'});if(!response.ok)throw Error('Public data unavailable');return response.json();
        };
        const first=await query(clauses,1);if(!current())return;
        const end=num(first.results?.[0]?.annee);if(!end){rows=[];selectedDepartment=dep;$('#lycee-status').textContent='Aucun résultat IVAL publié retrouvé pour le département '+dep+'.';render();return;}
        const where=clauses+" and annee >= date'"+(end-2)+"-01-01' and annee < date'"+(end+1)+"-01-01'",all=[];
        let total=0;
        do{const page=await query(where,100,all.length);if(!current())return;total=Number(page.total_count)||0;all.push(...(page.results||[]));if(!page.results?.length)break;}while(all.length<total&&all.length<10000);
        if(all.length<total)throw Error('Incomplete public data');
        const summary=summarize(all);rows=summary.rows;periodEnd=summary.end;selectedDepartment=dep;
        $('#lycee-status').textContent='Département '+dep+' · résultats publics '+(periodEnd-2)+'–'+periodEnd+'.';render();
      }catch{if(current()){
        if(dep==='06'){rows=SNAPSHOT.map(r=>({...r,dep:'06'}));periodEnd=2025;selectedDepartment='06';$('#lycee-status').textContent='Données publiques indisponibles. Repli Alpes-Maritimes : sessions 2023–2025.';}
        else{rows=[];selectedDepartment=dep;$('#lycee-status').textContent='Données publiques indisponibles pour le département '+dep+'. Réessaie plus tard ou choisis 06 pour les données conservées.';}
        render();
      }}finally{clearTimeout(timeout);if(current())$('#lycee-load').disabled=false;}
    };
    render();
  }
  window.FutureLycees=Object.freeze({html,mount,clear,summarize,validDepartment});
})();
