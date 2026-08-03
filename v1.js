(function(){
  "use strict";
  const data=window.WISDOM_V1_DATA;
  const model=window.WISDOM_V1_MODEL;
  const STATE_KEY="wisdom-reader-v1-state";
  const RECOVERY_KEY="wisdom-reader-v1-recovery";
  const ids=["searchInput","workFilter","personFilter","themeFilter","timeFilter","difficultyFilter","modeFilter","statusFilter","formatFilter","rightsFilter"];
  const $=id=>document.getElementById(id);
  const filters=Object.fromEntries(ids.map(id=>[id,$(id)]));
  let state=loadState();
  let activeSection=location.hash.slice(1)==="books"?"books":"home";

  function defaultState(){return model.defaultState();}
  function normalizeState(candidate){return model.normalizeState(candidate,data);}
  function loadState(){
    try{const raw=localStorage.getItem(STATE_KEY);return raw?normalizeState(JSON.parse(raw)):defaultState();}
    catch(error){setTimeout(()=>announce(`Saved state could not be read: ${error.message}`),0);return defaultState();}
  }
  function saveState(next,{backup=true,message="Saved locally."}={}){
    try{
      const normalized=normalizeState({...next,schemaVersion:1,updatedAt:new Date().toISOString()});
      const prior=localStorage.getItem(STATE_KEY);if(backup&&prior)localStorage.setItem(RECOVERY_KEY,prior);
      localStorage.setItem(STATE_KEY,JSON.stringify(normalized));state=normalized;announce(message);render();return true;
    }catch(error){announce(`Nothing was saved: ${error.message}`,true);return false;}
  }
  function announce(message,isError=false){const node=$("globalStatus");if(!node)return;node.textContent=message;node.classList.toggle("errorText",isError);}
  function workState(id){const work=data.works.find(item=>item.id===id);return work?model.workState(state,work):{};}
  function esc(value){return String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));}
  function option(value,label){return `<option value="${esc(value)}">${esc(label)}</option>`;}
  function populateFilters(){
    const append=(id,items)=>{filters[id].insertAdjacentHTML("beforeend",items.map(([value,label])=>option(value,label)).join(""));};
    append("workFilter",data.works.map(w=>[w.id,w.title]));
    append("personFilter",[...new Set(data.works.map(w=>w.person))].sort().map(x=>[x,x]));
    append("themeFilter",[...new Set(data.works.flatMap(w=>w.themes))].sort().map(x=>[x,x]));
    append("modeFilter",Object.keys(data.transformationModes).map(x=>[x,x]));
    append("rightsFilter",[...new Set(data.works.map(w=>w.rights))].sort().map(x=>[x,x]));
  }
  function statusOf(id){return workState(id).status||"unread";}
  function queryTerms(){return filters.searchInput.value.toLowerCase().trim().split(/\s+/).filter(Boolean);}
  function workMatchesSearch(work){const terms=queryTerms();if(!terms.length)return true;const records=data.searchRecords.filter(record=>record.workId===work.id);return terms.every(term=>records.some(record=>record.text.toLowerCase().includes(term)));}
  function matchesFilters(work){
    const sectionMatch=activeSection==="books"?work.kind==="Book":true;
    return sectionMatch&&(!filters.workFilter.value||work.id===filters.workFilter.value)&&
      (!filters.personFilter.value||work.person===filters.personFilter.value)&&
      (!filters.themeFilter.value||work.themes.includes(filters.themeFilter.value))&&
      (!filters.timeFilter.value||work.minutes<=Number(filters.timeFilter.value))&&
      (!filters.difficultyFilter.value||work.difficulty===Number(filters.difficultyFilter.value))&&
      (!filters.modeFilter.value||work.modes.includes(filters.modeFilter.value))&&
      (!filters.statusFilter.value||statusOf(work.id)===filters.statusFilter.value)&&
      (!filters.formatFilter.value||(filters.formatFilter.value==="text"?work.format==="text":work.audio.available))&&
      (!filters.rightsFilter.value||work.rights===filters.rightsFilter.value)&&workMatchesSearch(work);
  }
  function progress(work){return model.progress(state,work);}
  function currentUnit(work){const ws=workState(work.id);return work.units.find(unit=>unit.id===ws.unitId)||work.units[0];}
  function readerHref(work,unit=currentUnit(work),mode=workState(work.id).mode||work.defaultMode){
    const param=work.modeParams[mode]||work.modeParams[work.defaultMode];
    const anchor=`chapter-${unit?.id}`;
    return `${work.readerHref}?mode=${encodeURIComponent(param)}${anchor?`#${encodeURIComponent(anchor)}`:""}`;
  }
  function startWork(id){
    const work=data.works.find(item=>item.id===id);if(!work)return;
    const ws=workState(id);state.works[id]={...ws,status:"reading",unitId:ws.unitId||work.units[0]?.id||null,mode:ws.mode||work.defaultMode,updatedAt:new Date().toISOString()};state.activeWorkId=id;
    saveState(state,{message:`${work.title} is now active.`});$("sessionPanel").scrollIntoView({behavior:"smooth",block:"start"});
  }
  function nextIncompleteUnit(work){const ws=workState(work.id);return work.units.find(unit=>!ws.completedUnitIds.includes(unit.id))||work.units[work.units.length-1];}
  function renderContinue(){
    const active=data.works.find(work=>work.id===state.activeWorkId&&statusOf(work.id)==="reading");
    if(!active){
      const first=rankSuggestions()[0]?.work||data.works[0];$("continueProgress").textContent="Nothing active";
      $("continueBody").innerHTML=`<div><p class="continueLabel">Start with one bounded encounter</p><h3>${esc(first.title)}</h3><p>${esc(first.path.whyNow)}</p></div><button class="primaryButton" data-start="${esc(first.id)}" type="button">Start ${esc(first.person)}</button>`;return;
    }
    const unit=currentUnit(active);$("continueProgress").textContent=`${progress(active)}% · ${esc(statusOf(active.id))}`;
    $("continueBody").innerHTML=`<div><p class="continueLabel">${esc(active.person)} · ${active.minutes} min · ${esc(workState(active.id).mode)}</p><h3>${esc(active.title)}</h3><p><strong>${esc(active.unitLabel)} ${esc(unit?.number)}:</strong> ${esc(unit?.title)}</p><p>${esc(active.path.comprehension)}</p></div><div class="continueActions"><a class="primaryLink" href="${esc(readerHref(active,unit))}">Continue current unit</a><button data-edit-state="${esc(active.id)}" type="button">Update state</button></div>`;
  }
  function activeInputText(){return Object.values(state.works).map(ws=>`${ws.note} ${ws.teachback} ${ws.output}`.toLowerCase()).join(" ");}
  function rankSuggestions(){
    const filtered=data.works.filter(matchesFilters).filter(work=>work.id!==state.activeWorkId&&!['finished','dropped'].includes(statusOf(work.id)));const active=data.works.find(w=>w.id===state.activeWorkId);const input=activeInputText();
    const ranked=filtered.map(work=>{
      let score=statusOf(work.id)==="unread"?10:statusOf(work.id)==="reading"?6:0;const reasons=[];
      if(statusOf(work.id)==="unread")reasons.push("unread");
      if(filters.themeFilter.value&&work.themes.includes(filters.themeFilter.value)){score+=5;reasons.push(`selected theme: ${filters.themeFilter.value}`);}
      const inputTheme=work.themes.find(theme=>input.includes(theme.toLowerCase()));if(inputTheme){score+=4;reasons.push(`your saved text mentions ${inputTheme}`);}
      if(active&&Math.abs(active.difficulty-work.difficulty)<=1){score+=2;reasons.push("similar difficulty");}
      if(work.minutes<=20){score+=2;reasons.push(`${work.minutes}-minute start`);}
      if(queryTerms().length){score+=3;reasons.push("search match");}
      return {work,score,reasons:reasons.slice(0,3)};
    }).sort((a,b)=>b.score-a.score||data.works.indexOf(a.work)-data.works.indexOf(b.work));return model.capSuggestions(ranked,data.maxStartNext);
  }
  function renderSuggestions(){
    const ranked=rankSuggestions();$("suggestionGrid").innerHTML=ranked.length?ranked.map(({work,reasons})=>`<article class="suggestionCard"><p class="textMeta">${esc(work.kind)} · ${work.minutes} min</p><h3>${esc(work.title)}</h3><p class="reasonText">${esc(reasons.join(" · ")||"source-safe complete path")}</p><button data-start="${esc(work.id)}" type="button">Start</button></article>`).join(""):`<p class="emptyState">No next choice matches. Clear a filter to widen the list.</p>`;
  }
  function pathDetails(work){return `<details class="pathDetails"><summary>Source, context, teaching, and output path</summary><div class="pathBody"><p><strong>Why now:</strong> ${esc(work.path.whyNow)}</p><h4>Context Jerry may lack</h4><ul>${work.path.context.map(x=>`<li>${esc(x)}</li>`).join("")}</ul><h4>Sequence</h4><ol>${work.path.sequence.map(x=>`<li>${esc(x)}</li>`).join("")}</ol><p><strong>Comprehension:</strong> ${esc(work.path.comprehension)}</p><p><strong>Counterargument:</strong> ${esc(work.path.counterargument)}</p><p><strong>Output — ${esc(work.path.output.kind)}:</strong> ${esc(work.path.output.prompt)}</p></div></details>`;}
  function renderLibrary(){
    const works=data.works.filter(matchesFilters);$("resultCount").textContent=`${works.length} ${works.length===1?"work":"works"}`;
    $("libraryRows").innerHTML=works.length?works.map(work=>{const ws=workState(work.id);const unit=currentUnit(work);const pct=progress(work);return `<article class="textRow"><div class="textMain"><p class="textMeta">${esc(work.kind)} · ${esc(work.person)} · ${work.minutes} min</p><h3>${esc(work.title)}</h3><p class="workQuestion">${esc(work.path.comprehension)}</p><div class="progressTrack" aria-label="${pct}% complete"><span style="width:${pct}%"></span></div><p class="workState">${esc(ws.status==="reading"?"in progress":ws.status)} · ${pct}% · ${esc(work.defaultMode)}</p><div class="chipRow">${work.themes.slice(0,3).map(x=>`<span>${esc(x)}</span>`).join("")}</div>${pathDetails(work)}</div><div class="textActions"><a class="primaryLink" href="${esc(readerHref(work,unit))}">${ws.status==="reading"?"Continue":"Open"}</a><button data-start="${esc(work.id)}" type="button">${ws.status==="reading"?"Make current":"Start"}</button></div></article>`;}).join(""):`<p class="emptyState">No works match. Accepted audio stays empty until a source-aligned recording passes quality review.</p>`;
  }
  function renderSession(){
    const work=data.works.find(item=>item.id===state.activeWorkId&&statusOf(item.id)==="reading");const panel=$("sessionPanel");if(!work||activeSection!=="home"){panel.hidden=true;return;}panel.hidden=false;const ws=workState(work.id);
    $("sessionTitle").textContent=work.title;$("sessionStatusBadge").textContent=`${progress(work)}% · ${ws.status}`;
    $("unitSelect").innerHTML=work.units.map(unit=>option(unit.id,`${unit.number} · ${unit.title}`)).join("");$("unitSelect").value=ws.unitId;
    $("sessionMode").innerHTML=work.modes.map(mode=>option(mode,mode)).join("");$("sessionMode").value=ws.mode||work.defaultMode;
    $("unitComplete").checked=ws.completedUnitIds.includes(ws.unitId);$("noteInput").value=ws.note;$("teachbackInput").value=ws.teachback;$("outputInput").value=ws.output;
    const finishReady=ws.teachback.trim().length>=40&&ws.output.trim().length>=work.path.output.minimumChars;$("finishWork").disabled=!finishReady;$("finishGate").textContent=finishReady?"Finish is available: teach-back and concrete output are present.":`Finish requires a 40+ character teach-back and ${work.path.output.minimumChars}+ character output. Drop remains available and records no invented reaction.`;
    $("openCurrent").href=readerHref(work,currentUnit(work),ws.mode);
  }
  function renderModes(){$("modeDefinitions").innerHTML=Object.entries(data.transformationModes).map(([mode,definition])=>`<dt>${esc(mode)}</dt><dd>${esc(definition)}</dd>`).join("");}
  function renderNavigation(){
    $("readingWorkspace").hidden=false;$("readingTop").hidden=activeSection!=="home";
    document.querySelectorAll("#categoryOverview [data-section]").forEach(button=>{const active=button.dataset.section===activeSection;button.classList.toggle("active",active);button.setAttribute("aria-pressed",String(active));});
    $("libraryKicker").textContent=activeSection==="books"?"Long-form worlds":"Reading library";$("libraryTitle").textContent=activeSection==="books"?"Books":"Books and essays";
    const activeCount=ids.filter(id=>filters[id].value.trim()).length;$("activeFilterCount").textContent=`${activeCount} active`;
  }
  function setSection(section){if(section!=="books")return;activeSection=activeSection===section?"home":section;history.replaceState(null,"",activeSection==="home"?location.pathname+location.search:`#${activeSection}`);render();document.querySelector(activeSection==="home"?"#categoryOverview":".browseShell").scrollIntoView({behavior:"smooth",block:"start"});}
  function render(){renderNavigation();renderContinue();renderSuggestions();renderLibrary();renderSession();}
  function saveSession(){
    const work=data.works.find(item=>item.id===state.activeWorkId);if(!work)return;const prior=workState(work.id);const unitId=$("unitSelect").value;const completed=new Set(prior.completedUnitIds);$("unitComplete").checked?completed.add(unitId):completed.delete(unitId);
    state.works[work.id]={...prior,status:"reading",unitId,mode:$("sessionMode").value,completedUnitIds:[...completed],note:$("noteInput").value,teachback:$("teachbackInput").value,output:$("outputInput").value,updatedAt:new Date().toISOString()};
    const next=nextIncompleteUnit(work);if($("unitComplete").checked&&next)state.works[work.id].unitId=next.id;saveState(state,{message:"Progress, note, teach-back, and output saved locally."});
  }
  function setStatus(status){const work=data.works.find(item=>item.id===state.activeWorkId);if(!work)return;const ws=workState(work.id);if(status==="finished"&&(ws.teachback.trim().length<40||ws.output.trim().length<work.path.output.minimumChars)){announce("Finish is locked until the teach-back and output gate pass.",true);return;}state.works[work.id]={...ws,status,updatedAt:new Date().toISOString()};if(status!=="reading")state.activeWorkId=null;saveState(state,{message:`${work.title}: ${status}.`});}
  function exportState(){const blob=new Blob([JSON.stringify({...state,exportedAt:new Date().toISOString()},null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const link=document.createElement("a");link.href=url;link.download="wisdom-reader-state.json";link.click();URL.revokeObjectURL(url);announce("Wisdom state exported.");}
  async function importState(file){try{if(!file||file.size>1_000_000)throw new Error("Choose a JSON file under 1 MB");const parsed=JSON.parse(await file.text());saveState(normalizeState(parsed),{message:"Imported Wisdom state after schema and work/unit validation."});}catch(error){announce(`Import rejected: ${error.message}`,true);}finally{$("importState").value="";}}
  function recover(){try{const raw=localStorage.getItem(RECOVERY_KEY);if(!raw)throw new Error("No previous local state exists");saveState(normalizeState(JSON.parse(raw)),{backup:false,message:"Recovered the previous valid Wisdom state."});}catch(error){announce(`Recovery unavailable: ${error.message}`,true);}}
  function clearState(){if(!window.confirm("Clear all local Wisdom progress, notes, teach-back, outputs, and recovery data?"))return;try{localStorage.removeItem(STATE_KEY);localStorage.removeItem(RECOVERY_KEY);state=defaultState();announce("Local Wisdom state cleared.");render();}catch(error){announce(`Local state could not be cleared: ${error.message}`,true);}}

  populateFilters();renderModes();render();
  ids.forEach(id=>filters[id].addEventListener(id==="searchInput"?"input":"change",render));
  $("resetFilters").addEventListener("click",()=>{ids.forEach(id=>filters[id].value="");render();});
  document.addEventListener("click",event=>{const section=event.target.closest("[data-section]");if(section){setSection(section.dataset.section);return;}const start=event.target.closest("[data-start]");if(start)startWork(start.dataset.start);const edit=event.target.closest("[data-edit-state]");if(edit)$("sessionPanel").scrollIntoView({behavior:"smooth",block:"start"});});
  $("unitSelect").addEventListener("change",()=>{const work=data.works.find(item=>item.id===state.activeWorkId);if(!work)return;const ws=workState(work.id);$("unitComplete").checked=ws.completedUnitIds.includes($("unitSelect").value);$("openCurrent").href=readerHref(work,work.units.find(unit=>unit.id===$("unitSelect").value),$("sessionMode").value);});
  $("sessionMode").addEventListener("change",()=>{$("unitSelect").dispatchEvent(new Event("change"));});
  $("saveSession").addEventListener("click",saveSession);$("finishWork").addEventListener("click",()=>setStatus("finished"));$("dropWork").addEventListener("click",()=>setStatus("dropped"));
  $("exportState").addEventListener("click",exportState);$("importState").addEventListener("change",event=>importState(event.target.files[0]));$("recoverState").addEventListener("click",recover);$("clearState").addEventListener("click",clearState);
})();
