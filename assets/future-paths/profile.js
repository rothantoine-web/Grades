/* Shared adapter: only school observations cross into the planning page. */
(function(global){
  'use strict';
  const number = value => value === null || value === undefined || value === '' ? null : Number.isFinite(Number(value)) ? Number(value) : null;
  function domain(subject){
    const s=String(subject||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();
    if(/SPORT|\bEPS\b/.test(s)) return 'sport';
    if(/MATH/.test(s)) return 'math';
    if(/\bEIS\b/.test(s)) return 'integrated';
    if(/^HG\b|HIST|GEO/.test(s)) return 'history';
    if(/PHYS|CHIM/.test(s)) return 'physics';
    if(/SVT|SCIENCES DE LA VIE/.test(s)) return 'biology';
    if(/FRANC/.test(s)) return 'french';
    if(/ANGL|AGL|LLC|BILING|ESP|ALLEMAND|ITALIEN|LV[12]/.test(s)) return 'language';
    if(/ART|MUSIQ|MUSICAL/.test(s)) return 'art';
    return 'other';
  }
  function yearProfile(year){
    const valid=(year.data||[]).filter(r=>number(r.valeur)!==null && number(r.noteSur)>0 && r.matiere);
    const subjects=[...new Set([...valid.map(r=>r.matiere),...Object.keys(year.subjectStats||{})])];
    const rows=subjects.map(subject=>{
      const notes=valid.filter(r=>r.matiere===subject), official=(year.subjectStats||{})[subject]||{};
      const mean=key=>{
        const rs=notes.filter(r=>number(r[key])!==null);
        const weights=rs.map(r=>number(r.coef)??1), weight=weights.reduce((a,b)=>a+b,0);
        if(!weight) return null;
        if(year.method==='pool'){
          const max=rs.reduce((sum,r,i)=>sum+number(r.noteSur)*weights[i],0);
          return max>0 ? rs.reduce((sum,r,i)=>sum+number(r[key])*weights[i],0)/max*20 : null;
        }
        return rs.reduce((sum,r,i)=>sum+number(r[key])/number(r.noteSur)*20*weights[i],0)/weight;
      };
      const you=number(official.studentAvg)??mean('valeur'), cls=number(official.classAvg)??mean('moyenneClasse');
      return {subject,domain:domain(subject),you,cls,count:notes.length,official:number(official.studentAvg)!==null,
        classCount:notes.filter(r=>number(r.moyenneClasse)!==null).length};
    }).filter(r=>r.you!==null);
    const dates=valid.map(r=>String(r.dateSaisie||'').slice(0,10)).filter(Boolean).sort();
    // This is the individual test session, not a national rank or a whole-subject score.
    const nat=year.natEval;
    const sameSession=nat && (!nat.year || !year.year || String(nat.year).slice(0,4)===String(year.year).slice(0,4));
    const tests=sameSession ? (Array.isArray(nat.tests)?nat.tests:Object.values(nat.tests||{})).map(t=>({
      label:t.label||t.key,score:number(t.score),max:number(t.max),cutoff:number(t.seuilSat),
      referenceYear: nat.referenceYear||nat.nationalYear||2025
    })).filter(t=>t.score!==null && t.max>0 && t.score>=0 && t.score<=t.max) : [];
    return {key:year.key,level:year.level,year:year.year,label:year.label,count:valid.length,
      dateStart:dates[0]||null,dateEnd:dates[dates.length-1]||null,rows,tests};
  }
  function fromStore(store,activeChild){
    return {version:1,source:'dashboard',activeChild,children:Object.keys(store).map(name=>({
      name,years:store[name].years.map(yearProfile).sort((a,b)=>String(a.year).localeCompare(String(b.year)))
    }))};
  }
  global.FutureProfile={domain,yearProfile,fromStore};
})(globalThis);
