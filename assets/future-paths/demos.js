/* Invented observations for exploring the prototype. Never added to real exports. */
(function(global){
  const subjects=[['MATHEMATIQUES','math'],['PHYSIQUE-CHIMIE','physics'],['FRANCAIS','french'],['ANGLAIS LV1','language'],['HISTOIRE-GEOGRAPHIE','history'],['SVT','biology']];
  function year(level,schoolYear,values,classes,counts){
    return {key:level+'_'+schoolYear,level,year:schoolYear,label:level+' · '+schoolYear,count:counts.reduce((a,b)=>a+b,0),
      dateStart:schoolYear.slice(0,4)+'-09-15',dateEnd:level==='3eme'?'2026-06-15':'2026-11-10',tests:[],
      rows:subjects.map(([subject,domain],i)=>({subject,domain,you:values[i],cls:classes[i],count:counts[i],official:true,classCount:counts[i]}))};
  }
  const cls=[13.5,13.6,13.8,14,13.9,13.4];
  global.FutureDemos=[
    {name:'Démo · Camille — seconde, sciences solides',demo:true,demoFamily:'science',demoLabel:'Sciences solides',years:[
      year('3eme','2025-2026',[18.1,17.4,15.9,16.9,15.4,16.5],cls,[8,7,8,6,6,5]),
      year('2nde','2026-2027',[18.2,17.7,15.6,17.1,15.3,16.8],cls,[5,4,5,4,4,3])]},
    {name:'Démo · Noé — seconde, sciences à consolider',demo:true,demoFamily:'science',demoLabel:'Sciences à consolider',years:[
      year('3eme','2025-2026',[13.2,12.8,14.2,14.8,14.1,13.4],cls,[8,7,8,6,6,5]),
      year('2nde','2026-2027',[12.3,11.8,14.5,14.7,14.2,13.2],cls,[5,4,5,4,4,3])]},
    {name:'Démo · Lina — seconde, langues solides',demo:true,demoFamily:'international',demoLabel:'Langues solides, sciences plus moyennes',years:[
      year('3eme','2025-2026',[13.4,13.2,17.5,18.3,17.1,14.2],cls,[8,7,8,6,6,5]),
      year('2nde','2026-2027',[12.6,13.1,17.3,18.5,17.6,13.8],cls,[5,4,5,4,4,3])]}
  ];
})(globalThis);
