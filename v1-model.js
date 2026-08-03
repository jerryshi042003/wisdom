(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;root.WISDOM_V1_MODEL=api;})(typeof window!=="undefined"?window:globalThis,function(){
  "use strict";
  function defaultState(){return {schemaVersion:1,activeWorkId:null,works:{},updatedAt:null};}
  function cleanString(value,max=5000){return typeof value==="string"?value.slice(0,max):"";}
  function normalizeState(candidate,data){
    if(!candidate||candidate.schemaVersion!==1||!candidate.works||typeof candidate.works!=="object"||Array.isArray(candidate.works))throw new Error("Unsupported Wisdom state file");
    const next=defaultState();next.activeWorkId=data.works.some(work=>work.id===candidate.activeWorkId)?candidate.activeWorkId:null;
    for(const work of data.works){const raw=candidate.works[work.id];if(!raw)continue;const validUnits=new Set(work.units.map(unit=>unit.id));next.works[work.id]={status:["unread","reading","finished","dropped"].includes(raw.status)?raw.status:"unread",unitId:validUnits.has(raw.unitId)?raw.unitId:work.units[0]?.id||null,completedUnitIds:[...new Set(Array.isArray(raw.completedUnitIds)?raw.completedUnitIds.filter(id=>validUnits.has(id)):[])],mode:work.modes.includes(raw.mode)?raw.mode:work.defaultMode,note:cleanString(raw.note),teachback:cleanString(raw.teachback),output:cleanString(raw.output),updatedAt:cleanString(raw.updatedAt,64)};}next.updatedAt=cleanString(candidate.updatedAt,64);return next;
  }
  function workState(state,work){return state.works[work.id]||{status:"unread",unitId:work.units[0]?.id||null,completedUnitIds:[],mode:work.defaultMode,note:"",teachback:"",output:"",updatedAt:""};}
  function progress(state,work){const ws=workState(state,work);return work.units.length?Math.round(ws.completedUnitIds.length/work.units.length*100):0;}
  function capSuggestions(items,max){return items.slice(0,Math.min(3,max));}
  return {defaultState,normalizeState,workState,progress,capSuggestions};
});
