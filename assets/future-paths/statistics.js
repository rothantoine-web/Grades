/* Descriptive formation history. Missing years/rates are never inferred. */
(function(global){
  const number=value=>value==null||value===''?null:Number.isFinite(Number(value))?Number(value):null;
  const mean=values=>values.length?values.reduce((sum,value)=>sum+value,0)/values.length:null;
  const populationFields={accepted:'acc_tot',neobac:'acc_neobac',general:'acc_bg',technological:'acc_bt',professional:'acc_bp',other:'acc_at',unknownMention:'acc_mention_nonrenseignee',noMention:'acc_sansmention',fairlyGood:'acc_ab',good:'acc_b',veryGood:'acc_tb',distinction:'acc_tbf'};
  const count=value=>{if(value==null||typeof value==='boolean'||!['number','string'].includes(typeof value)||String(value).trim()==='')return null;const n=Number(value);return Number.isSafeInteger(n)&&n>=0?n:null;};
  function populationFromRecord(record,source){
    if(!record?.cod_aff_form||!record.cod_uai||!Object.values(populationFields).slice(1).some(k=>record[k]!=null))return null;
    return {version:1,year:count(record.session),code:String(record.cod_aff_form),uai:record.cod_uai,
      source:source||'https://data.enseignementsup-recherche.gouv.fr/explore/dataset/fr-esr-parcoursup/',
      ...Object.fromEntries(Object.entries(populationFields).map(([key,field])=>[key,count(record[field])]))};
  }
  function populationSummary(formation){
    const p=formation.population;
    if(!p||p.version!==1||String(p.code)!==String(formation.code)||p.uai!==formation.uai||p.year!==count(formation.statisticsSession??formation.session))return null;
    function group(denominator,keys){
      const rows=keys.map(([key,label])=>({key,label,count:count(p[key])})),n=count(denominator);
      const complete=n!==null&&rows.every(r=>r.count!==null),consistent=complete&&rows.reduce((sum,r)=>sum+r.count,0)===n;
      return {denominator:n,status:!complete?'missing':!consistent?'inconsistent':n===0?'empty':'ready',
        rows:rows.map(r=>({...r,percent:consistent&&n>0?r.count/n*100:null}))};
    }
    const origins=group(p.accepted,[['general','Bac général'],['technological','Bac technologique'],['professional','Bac professionnel'],['other','Autres profils']]);
    const mentions=group(p.neobac,[['distinction','Très bien avec félicitations'],['veryGood','Très bien'],['good','Bien'],['fairlyGood','Assez bien'],['noMention','Sans mention'],['unknownMention','Mention non renseignée']]);
    if(count(p.accepted)!==null&&count(p.neobac)!==null&&count(p.neobac)>count(p.accepted)){
      for(const g of [origins,mentions]){g.status='inconsistent';g.rows=g.rows.map(r=>({...r,percent:null}));}
    }
    return {year:p.year,source:p.source,accepted:count(p.accepted),neobac:count(p.neobac),
      origins,mentions};
  }
  function summary(formation,window=3){
    window=window===5?5:3;
    const end=number(formation.historyEnd)||number(formation.session)||2025,start=end-window+1;
    const source=Array.isArray(formation.history)?formation.history:[];
    const rows=Array.from({length:window},(_,i)=>{
      const year=start+i,r=source.find(r=>number(r.year)===year);
      return {year,available:!!r?.available,candidates:number(r?.candidates),places:number(r?.places),
        access:number(r?.access),proposals:number(r?.proposals),accepted:number(r?.accepted),source:r?.source||null};
    });
    const values=key=>rows.filter(r=>r.available).map(r=>r[key]).filter(v=>v!==null&&v>=0&&(key!=='access'||v<=100));
    const access=values('access'),candidates=values('candidates');
    const retained=rows.filter(r=>r.available&&r.proposals>0&&r.accepted!==null&&r.accepted>=0&&r.accepted<=r.proposals).map(r=>r.accepted/r.proposals*100);
    return {start,end,window,rows,accessMean:mean(access),accessCount:access.length,
      accessMin:access.length?Math.min(...access):null,accessMax:access.length?Math.max(...access):null,
      candidatesMean:mean(candidates),candidatesCount:candidates.length,retainedMean:mean(retained),retainedCount:retained.length};
  }
  global.FutureAdmissions={summary,number,populationFields,populationFromRecord,populationSummary};
})(globalThis);
