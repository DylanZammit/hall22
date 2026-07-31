const sources = {
  1:["Trial formally begins","https://www.maltatoday.com.mt/news/court_and_police/142924/yorgen_fenech_trial_over_murder_of_journalist_daphne_caruana_galizia_set_to_begin"],
  2:["Prosecution lays out its case","https://www.maltatoday.com.mt/news/court_and_police/142931/stage_set_for_prosecution_as_yorgen_fenech_trial_enters_second_day"],
  3:["Arnaud retraces the investigation","https://www.maltatoday.com.mt/news/court_and_police/142953/witness_testimony_set_to_begin_as_third_day_of_yorgen_fenech_trial_underway_1"],
  4:["Theuma recordings described","https://www.maltatoday.com.mt/news/court_and_police/142973/yorgen_fenech_jury_lead_investigator_keith_arnaud_to_continue_testifying"],
  6:["Defence shifts focus to Schembri","https://www.maltatoday.com.mt/news/court_and_police/143023/crossexamination_of_arnaud_to_resume_as_yorgen_fenech_murder_trial_enters_sixth_day"],
  8:["Eyewitness and scene evidence","https://www.maltatoday.com.mt/news/court_and_police/143050/yorgen_fenech_murder_trial_enters_eighth_day_as_more_forensic_evidence_expected"],
  9:["Medical and explosives evidence","https://www.maltatoday.com.mt/news/court_and_police/143076/yorgen_fenech_jury_trial_more_forensic_experts_expected_to_testify"],
  10:["Digital trail and phone requests","https://www.maltatoday.com.mt/news/court_and_police/143092/yorgen_fenech_jury_trial_fbi_set_to_testify_over_role_in_investigation"],
  11:["Vince Muscat begins evidence","https://www.maltatoday.com.mt/news/court_and_police/143124/yorgen_fenech_jury_trial_more_witnesses_to_testify_as_caruana_galizia_murder_proceedings_resume"],
  12:["Muscat cross-examined","https://www.maltatoday.com.mt/news/court_and_police/143147/vince_muscat_ilkou_to_continue_testifying_as_yorgen_fenech_murder_trial_enters_day_121"],
  13:["Degiorgio brothers testify","https://www.maltatoday.com.mt/news/court_and_police/143173/yorgen_fenech_trial_new_witnesses_set_to_take_the_stand_as_yorgen_fenech_jury_enters_day_13"],
  14:["Theuma finances scrutinised","https://www.maltatoday.com.mt/news/court_and_police/143206/yorgen_fenech_jury_trial_heads_into_third_week_after_explosive_testimony_from_degiorgio_brothers1"],
  15:["Bomb mechanics and cash pipeline","https://www.maltatoday.com.mt/news/court_and_police/143232/yorgen_fenech_trial_more_prosecution_witnesses_set_to_take_the_stand"],
  16:["Edgar Brincat takes the stand","https://www.maltatoday.com.mt/news/court_and_police/143259/yorgen_fenech_trial_former_police_commissioner_lawrence_cutajar_and_edgar_brincat_are_scheduled_to_take_the_witness_stand1"],
  17:["Cutajar rejects defence allegations","https://www.maltatoday.com.mt/news/court_and_police/143301/yorgen_fenech_jury_trial_melvin_theuma_confidante_edgar_brincat_to_continue_testifying_1"],
  18:["Johann Cremona takes the stand","https://www.maltatoday.com.mt/news/court_and_police/143329/johann_cremona_takes_the_stand_as_yorgen_fenechs_trial_enters_its_18th_day"],
  19:["Cremona continues","https://www.maltatoday.com.mt/news/court_and_police/143359/yorgen_fenech_jury_trial_enters_day_19_as_johann_cremona_expected_to_continue_testifying"],
  25:["Schembri cross-examined","https://www.maltatoday.com.mt/news/court_and_police/143521/yorgen_fenech_jury_trial_keith_schembri_faces_crossexamination_as_third_day_of_testimony_begins"]
};
const summaries=[
["1 Jul","case","A jury is empanelled","Judge Edwina Grima swore the panel, read the indictment and stressed that Fenech is presumed innocent and the prosecution bears the burden of proof.",["Nine jurors and six reserves selected","Two accusations read separately","Jurors told to ignore outside reporting"]],
["2 Jul","case","The prosecution sets out its theory","The State alleged Fenech set the plot in motion, financed it and used Melvin Theuma to reach the killers. The defence maintained his innocence.",["Alleged fee: €150,000","Opening address previews recordings","Complicity and criminal association explained"]],
["3 Jul","testimony","The investigation, from blast to breakthrough","Lead investigator Keith Arnaud traced the inquiry from the Bidnija scene to the arrests and the identification of Theuma as the alleged middleman.",["Police inquiry initially stalled","Theuma became a central lead","International assistance described"]],
["4 Jul","testimony","The recordings enter the story","Arnaud said Theuma’s covert archive revived a stalled investigation. Jurors heard about statements, messages, a handwritten letter and the route to Fenech and Schembri.",["Around 100 recordings examined","Letter found in Fenech’s office","Signal screenshot led police to Schembri"]],
["6 Jul","testimony","Arnaud’s evidence continues","The prosecution continued presenting the investigative sequence, exhibits and accounts recovered after the 2019 arrests before the defence’s extended cross-examination.",["Statements placed in chronology","Electronic exhibits introduced","Police decisions tested"]],
["7 Jul","testimony","Defence redirects the lens","Cross-examination concentrated on Keith Schembri: his alleged links to Theuma, the phantom job, a letter passed via doctor Adrian Vella and devices police did not recover.",["Schembri phone and laptop missing","Phantom job examined","Theuma’s pardon scope challenged"]],
["8 Jul","testimony","The missing-device questions deepen","The defence continued testing Arnaud on investigative omissions, disputed documents and possible alternative lines around Schembri, Cardona and other intermediaries.",["Search procedures challenged","Letter narrative disputed","Credibility of investigative choices tested"]],
["9 Jul","forensics","The blast scene reconstructed","Eyewitnesses and scene-of-crime officers described the explosion, suspicious vehicles, human remains and the controlled recovery of evidence across 28 sectors.",["Eyewitness heard a scream","White rental car recalled","Chain of custody explained"]],
["10 Jul","forensics","Forensics establish the bomb’s violence","Medical and explosives experts described catastrophic blast injuries, the device beneath the driver’s seat and TNT traces. Searches yielded phones and other devices.",["Victim identified by DNA","Military-grade TNT detected","Phones recovered near Marsa shed"]],
["11 Jul","forensics","Burner phones map a coordinated operation","An FBI cellular analyst linked the suspected burner phones to one another and to the fatal SMS. The defence sought wider access to Schembri-related phone data and Caruana Galizia’s emails.",["Three phones travelled together","Detonation SIM vanished","Email access disputed"]],
["13 Jul","testimony","Vince Muscat describes two alleged plots","The convicted hitman described an abandoned 2015 plan and the 2017 surveillance and bombing operation, while relaying allegations involving Cardona, Gatt and the Degiorgios.",["2015 plot allegedly abandoned","€30,000 deposit described","Months of surveillance recounted"]],
["14 Jul","testimony","Muscat’s memory and credibility tested","The defence challenged inconsistencies in Muscat’s recollection, including timing, contacts and previous sworn accounts. Muscat said he did not know who stood behind Theuma.",["Prior testimony used to refresh memory","Contact with victim described","Schembri references challenged"]],
["15 Jul","testimony","The Degiorgios turn on the investigation","George Degiorgio made allegations about Cardona, Schembri and Gatt and claimed pardon talks stopped when he intended to name them. Alfred largely refused to answer.",["George fined for contempt","Alfred re-arrested after refusing","Claims expressly contested and unproven"]],
["16 Jul","testimony","Theuma’s money comes under scrutiny","Superintendent Nicholas Vella was cross-examined on Theuma’s properties, illegal gambling and large cash holdings as the defence sought to erode the state witness’s credibility.",["More than €790,000 recovered","Declared income contrasted with assets","Phantom-job case discussed"]],
["17 Jul","forensics","Bomb mechanics meet a cash trail","A Europol specialist described a 300–400g TNT device beneath the driver’s seat. Other evidence concerned cash passed to relatives of the jailed hitmen.",["90cm hole through car floor","Weekly family payments alleged","€781,826 found in a safe"]],
["18 Jul","testimony","Theuma’s confidant speaks","Edgar Brincat described Theuma’s fear, drinking, secret recordings and frustration over money, including an alleged thought of approaching Schembri.",["USB recordings discussed","Post-arrest payments alleged","Fenech and Schembri repeatedly named"]],
["20 Jul","testimony","Brincat finishes; Cutajar takes the stand","The defence played intercepted calls to test whether Brincat coached Theuma. Former commissioner Lawrence Cutajar then faced questions about meetings, recordings and the pardon process.",["Coaching denied","Police contacts scrutinised","Pardon signature explained"]],
["21 Jul","testimony","Johann Cremona becomes the sounding board","Cremona said Theuma repeatedly confided in him about the alleged plot, payments, fear of exposure and the recordings he was making.",["Election pause discussed","€30,000 deposit recounted","Theuma’s anxiety described"]],
["22 Jul","testimony","Cremona’s account is tested","Cremona continued recounting what Theuma told him before and after the murder, placing conversations about payments and fear alongside the recordings.",["Account is hearsay-based testimony","Timing and detail examined","Links among Fenech, Theuma and others mapped"]],
["23 Jul","testimony","The recordings and intermediaries return","The court continued through testimony touching on Theuma’s communications and the people around him, with the defence probing context, reliability and investigative handling.",["Conversations put in context","Intermediary roles revisited","Defence challenges reliability"]],
["24 Jul","testimony","Prosecution closes another evidential strand","Further witnesses and records consolidated parts of the prosecution’s chronology while legal argument continued over what could properly go before jurors.",["Evidence formally exhibited","Chronology reinforced","Admissibility contested"]],
["25 Jul","testimony","Attention turns toward Schembri","Evidence increasingly focused on the former OPM chief of staff and the claims, communications and investigative gaps that had shadowed earlier testimony.",["Schembri connections revisited","Missing devices remain central","Competing narratives sharpen"]],
["27 Jul","testimony","Schembri begins his evidence","Keith Schembri entered the witness box, bringing the trial’s most persistent alternative focus into direct testimony before the jury.",["Relationship with Fenech examined","Prior claims put to witness","Courtroom focus shifts"]],
["28 Jul","testimony","Schembri’s account continues","A second day of evidence explored Schembri’s contacts, knowledge and responses to allegations raised across the preceding weeks.",["Communications revisited","Accounts compared","Cross-examination approaches"]],
["29 Jul","testimony","Schembri faces cross-examination","On the third day of Schembri’s testimony, questioning tested his account against earlier witnesses, communications and the investigation’s disputed gaps.",["Third day in witness box","Earlier evidence confronted","Proceedings remain ongoing"]]]
  .map((d,i)=>({day:i+1,date:d[0],type:d[1],title:d[2],summary:d[3],points:d[4]}));

const dailyUpdates = window.DAILY_UPDATES || [];
for (const update of dailyUpdates) {
  const existing = summaries.findIndex(day => day.day === update.day.day);
  if (existing >= 0) summaries[existing] = update.day;
  else summaries.push(update.day);
  sources[update.day.day] = [update.day.sourceTitle, update.day.sourceUrl];
}
summaries.sort((a, b) => a.day - b.day);
const latestUpdate = dailyUpdates.at(-1);
if (latestUpdate) {
  document.querySelector("#sitting-count").textContent = summaries.length;
  const [latestDay, latestMonth] = latestUpdate.day.date.split(" ");
  document.querySelector("#date-range").textContent = `01—${latestDay.padStart(2, "0")}`;
  document.querySelector("#date-range-label").textContent = `${latestMonth === "Jul" ? "July" : latestMonth} 2026`;
  document.querySelector("#research-cutoff").textContent = `Research cut-off: ${latestUpdate.day.date} 2026 · Updated automatically from MaltaToday`;
  document.querySelector(".yesterday-label").innerHTML = `<i></i> ${latestUpdate.lead.label}`;
  document.querySelector("#yesterday-title").textContent = latestUpdate.lead.title;
  document.querySelector(".yesterday-copy p").textContent = latestUpdate.lead.summary;
  document.querySelector(".yesterday-copy a").href = latestUpdate.day.sourceUrl;
  document.querySelector(".yesterday-number").textContent = latestUpdate.day.day;
}

const rail=document.querySelector(".day-rail"),detail=document.querySelector(".day-detail");
function renderDay(day){document.querySelectorAll(".day-button").forEach(b=>b.classList.toggle("active",+b.dataset.day===day.day));const s=sources[day.day]||sources[25];detail.innerHTML=`<div class="date">Day ${String(day.day).padStart(2,"0")} · ${day.date} 2026 · ${day.type}</div><h3>${day.title}</h3><p class="summary">${day.summary}</p><div class="takeaways">${day.points.map((p,i)=>`<div><b>0${i+1}</b>${p}</div>`).join("")}</div><a class="source-link" href="${s[1]}" target="_blank" rel="noreferrer">Read MaltaToday coverage ↗</a>`}
function renderRail(filter="all"){const visible=summaries.filter(d=>filter==="all"||d.type===filter);rail.innerHTML=visible.map(d=>`<button class="day-button" data-day="${d.day}"><b>${String(d.day).padStart(2,"0")}</b><span>${d.date}<br>${d.title}</span></button>`).join("");rail.querySelectorAll("button").forEach(b=>b.onclick=()=>renderDay(summaries[+b.dataset.day-1]));renderDay(visible[0])}
document.querySelectorAll(".filters button").forEach(b=>b.onclick=()=>{document.querySelectorAll(".filters button").forEach(x=>x.classList.remove("active"));b.classList.add("active");renderRail(b.dataset.filter)});renderRail();

const nodes=[
 {id:"Daphne Caruana Galizia",role:"victim / journalist",x:550,y:85,core:true},{id:"Yorgen Fenech",role:"accused",x:550,y:330,core:true},{id:"Melvin Theuma",role:"state witness / middleman",x:310,y:285,core:true},{id:"Keith Schembri",role:"former OPM chief of staff",x:800,y:270,core:true},{id:"Vince Muscat",role:"convicted participant",x:220,y:500},{id:"George Degiorgio",role:"convicted participant",x:430,y:545},{id:"Alfred Degiorgio",role:"convicted participant",x:650,y:545},{id:"Chris Cardona",role:"former minister",x:900,y:460},{id:"Johann Cremona",role:"business associate",x:160,y:175},{id:"Edgar Brincat",role:"Theuma confidant",x:950,y:125},{id:"David Gatt",role:"lawyer",x:1030,y:340},{id:"Keith Arnaud",role:"lead investigator",x:80,y:370}
];
const edges=[
 ["Melvin Theuma","Yorgen Fenech",18,-1,"Repeatedly named Fenech in recordings and accounts as the alleged commissioner and source of funds.","Days 3–4, 16–19"],
 ["Yorgen Fenech","Keith Schembri",12,0,"Statements and messages described a close relationship, alongside adverse allegations that Schembri denies.","Days 4, 6–8, 25"],
 ["Vince Muscat","George Degiorgio",15,0,"Described surveillance, planning and statements allegedly made by George.","Days 11–12"],
 ["Vince Muscat","Alfred Degiorgio",15,0,"Placed Alfred in the planning, surveillance and payment chain.","Days 11–12"],
 ["Vince Muscat","Chris Cardona",8,-1,"Relayed allegations attributed to the Degiorgios about Cardona; Cardona denies involvement.","Days 11–13"],
 ["George Degiorgio","Chris Cardona",9,-1,"Made direct allegations about a 2015 plot and information leaks; claims were not substantiated in court.","Day 13"],
 ["George Degiorgio","Keith Schembri",6,-1,"Claimed pardon discussions ended when he proposed naming Schembri.","Day 13"],
 ["George Degiorgio","David Gatt",7,-1,"Alleged Gatt was involved in arrangements around the abandoned 2015 plot.","Day 13"],
 ["Johann Cremona","Melvin Theuma",16,1,"Described himself as a confidant to an increasingly anxious Theuma.","Days 18–19"],
 ["Johann Cremona","Yorgen Fenech",10,0,"Recounted Theuma’s claims about Fenech, instructions and payments.","Days 18–19"],
 ["Edgar Brincat","Melvin Theuma",14,1,"Described a close, advisory relationship and Theuma’s fears and recordings.","Days 16–17"],
 ["Edgar Brincat","Yorgen Fenech",7,-1,"Repeated allegations Theuma had shared about the murder commission and money.","Days 16–17"],
 ["Melvin Theuma","Keith Schembri",10,0,"Recordings and testimony mixed fear and claims of possible protection or access.","Days 4, 6–8, 16–19"],
 ["Keith Arnaud","Yorgen Fenech",16,0,"Led jurors through the investigation, Fenech’s statements and seized communications.","Days 3–8"],
 ["Keith Arnaud","Keith Schembri",12,0,"Described searches, communications and investigative decisions involving Schembri.","Days 4, 6–8"],
 ["Alfred Degiorgio","Daphne Caruana Galizia",7,-1,"Evidence described surveillance and messages sent before the assassination.","Days 11–12"],
 ["Melvin Theuma","George Degiorgio",14,0,"Accounts placed Theuma between the alleged commissioner and the Degiorgio brothers.","Days 2–4, 11–19"],
 ["Melvin Theuma","Alfred Degiorgio",14,0,"Accounts placed Theuma in the payment and communication chain.","Days 2–4, 11–19"]
];
for (const update of dailyUpdates.flatMap(item => item.relationUpdates || [])) {
  const edge = edges.find(item => item[0] === update.from && item[1] === update.to);
  if (edge) {
    edge[2] += update.count;
    edge[3] = update.tone;
    edge[4] = update.context;
    edge[5] = update.days;
  } else {
    edges.push([update.from, update.to, update.count, update.tone, update.context, update.days]);
  }
}
const svg=document.querySelector("#network-svg"),ns="http://www.w3.org/2000/svg",nodeMap=Object.fromEntries(nodes.map(n=>[n.id,n]));
const defs=document.createElementNS(ns,"defs");defs.innerHTML=`<marker id="arrow-red" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#d33b2e"/></marker><marker id="arrow-amber" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#b8792d"/></marker><marker id="arrow-green" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#318363"/></marker>`;svg.append(defs);
const card=document.querySelector(".network-card");
edges.forEach((e,idx)=>{const a=nodeMap[e[0]],b=nodeMap[e[1]],line=document.createElementNS(ns,"line"),color=e[3]<0?"#d33b2e":e[3]>0?"#318363":"#b8792d",strength=e[2]>12?6:e[2]>7?4:e[2]>3?2.5:1.25;line.setAttribute("x1",a.x);line.setAttribute("y1",a.y);line.setAttribute("x2",b.x);line.setAttribute("y2",b.y);line.setAttribute("stroke",color);line.setAttribute("stroke-width",strength);line.setAttribute("stroke-opacity",".62");line.setAttribute("marker-end",`url(#arrow-${e[3]<0?"red":e[3]>0?"green":"amber"})`);line.classList.add("edge");line.onclick=()=>{card.innerHTML=`<div class="section-kicker">Connection</div><h3>${e[0]} → ${e[1]}</h3><div class="score">Mention band <b>${e[2]>10?"10+":e[2]>5?"6–10":e[2]>2?"3–5":"1–2"}</b> · tone <b>${e[3]<0?"adverse":e[3]>0?"supportive":"mixed"}</b></div><p>${e[4]}</p><p>${e[5]}</p>`};svg.append(line)});
nodes.forEach(n=>{const g=document.createElementNS(ns,"g");g.classList.add("node");g.innerHTML=`<circle cx="${n.x}" cy="${n.y}" r="${n.core?49:40}"/><text x="${n.x}" y="${n.y-2}">${n.id.split(" ").map((w,i)=>`<tspan x="${n.x}" dy="${i?14:0}">${w}</tspan>`).join("")}</text><text class="role" x="${n.x}" y="${n.y+(n.core?66:57)}">${n.role}</text>`;g.onclick=()=>{svg.querySelectorAll(".node").forEach(node=>node.classList.remove("selected"));g.classList.add("selected");const related=edges.filter(e=>e[0]===n.id||e[1]===n.id);card.innerHTML=`<div class="section-kicker">${n.role}</div><h3>${n.id}</h3><div class="score"><b>${related.length}</b> mapped connections</div><p>${related.map(e=>`${e[0]} → ${e[1]} (${e[2]>10?"10+":e[2]>5?"6–10":e[2]>2?"3–5":"1–2"})`).join("<br>")}</p>`};svg.append(g)});
document.querySelector(".source-list").innerHTML=Object.entries(sources).map(([d,s])=>`<a class="source-item" href="${s[1]}" target="_blank" rel="noreferrer"><b>DAY ${String(d).padStart(2,"0")}</b>${s[0]} ↗</a>`).join("");
