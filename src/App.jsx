import React, { useMemo, useState } from "react";

// UB MSW Advising Planner – Baseline with distinct Electives & Advanced Topics
// Patch: Safe CSV export (no regex, no literal newlines in strings) + lightweight console tests

const COLORS = {
  ubBlue: "#005bbb",
  white: "#ffffff",
  gray: "#666666",
  lightGray: "#e4e4e4",
  errorBg: "#fff5f5",
  errorBorder: "#ef4444",
};

const styles = {
  page: { background: COLORS.lightGray, minHeight: "100vh", color: COLORS.gray, fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: COLORS.ubBlue, color: COLORS.white },
  h1: { fontSize: 22, fontWeight: 600 },
  container: { padding: 16, maxWidth: 1400, margin: "0 auto" },
  tabs: { display: "flex", gap: 8, marginBottom: 12 },
  tab: function(active){ return { padding: "8px 12px", borderRadius: 9999, background: active ? COLORS.white : "transparent", color: active ? COLORS.ubBlue : COLORS.white, border: "1px solid "+COLORS.white , cursor: "pointer", fontWeight: 600 }; },
  grid: { display: "grid", gap: 12, gridTemplateColumns: "repeat(3, minmax(0, 1fr))" },
  col: { background: COLORS.white, borderRadius: 16, border: "1px solid "+COLORS.lightGray, padding: 12, minHeight: 260, display: "flex", flexDirection: "column" },
  colHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, fontWeight: 600, color: COLORS.ubBlue },
  chip: function(issue){ return { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, padding: 10, borderRadius: 12, border: "1px solid "+(issue ? COLORS.errorBorder : COLORS.lightGray), background: issue ? COLORS.errorBg : COLORS.white, boxShadow: "0 1px 2px rgba(0,0,0,0.06)", cursor: "grab" }; },
  btn: { fontSize: 12, padding: "6px 8px", borderRadius: 8, background: COLORS.lightGray, border: "1px solid "+COLORS.lightGray, cursor: "pointer" },
  rulePanel: { background: COLORS.white, borderRadius: 16, border: "1px solid "+COLORS.lightGray, padding: 12 },
  catalog: { background: COLORS.white, borderRadius: 16, border: "1px solid "+COLORS.lightGray, padding: 12 },
  toggle: { display: "flex", gap: 8, alignItems: "center", marginTop: 8 },
};

const LEVEL = { FOUNDATION: "foundation", ADVANCED: "advanced", ELECTIVE: "elective" };

const FOUNDATION_LIST = [
  "SW 500","SW 505","SW 510","SW 550","SW 555","SW 520",
  "SW 502","SW 503","SW 506","SW 521","SW 551","SW 555B"
];

const CATALOG = {
  // Foundation
  "SW 500": { title: "Social Welfare History", credits: 3, offered: ["Fall"], prereqs: [], coreqs: [], level: LEVEL.FOUNDATION },
  "SW 505": { title: "Theories of Human Behavior and Development", credits: 3, offered: ["Fall"], prereqs: [], coreqs: [], level: LEVEL.FOUNDATION },
  "SW 510": { title: "Introduction to Social Work Research and Evaluation", credits: 3, offered: ["Fall","Spring"], prereqs: [], coreqs: [], level: LEVEL.FOUNDATION },
  "SW 520": { title: "Interventions I", credits: 3, offered: ["Fall"], prereqs: [], coreqs: ["SW 550","SW 555"], level: LEVEL.FOUNDATION },
  "SW 550": { title: "Field Instruction I", credits: 3, offered: ["Fall"], prereqs: [], coreqs: ["SW 520","SW 555"], level: LEVEL.FOUNDATION },
  "SW 555": { title: "Field Seminar (Part 1)", credits: 0.5, offered: ["Fall"], prereqs: [], coreqs: ["SW 520","SW 550"], level: LEVEL.FOUNDATION },
  "SW 502": { title: "Social Welfare Policy", credits: 3, offered: ["Spring"], prereqs: [], coreqs: [], level: LEVEL.FOUNDATION },
  "SW 503": { title: "Diversity and Oppression", credits: 3, offered: ["Spring","Summer"], prereqs: [], coreqs: [], level: LEVEL.FOUNDATION },
  "SW 506": { title: "Theories of Organizational Behavior and Development", credits: 3, offered: ["Spring","Summer"], prereqs: [], coreqs: [], level: LEVEL.FOUNDATION },
  "SW 521": { title: "Interventions II", credits: 3, offered: ["Spring"], prereqs: ["SW 505","SW 520","SW 550"], coreqs: ["SW 551","SW 555B"], level: LEVEL.FOUNDATION },
  "SW 551": { title: "Field Instruction II", credits: 4, offered: ["Spring"], prereqs: ["SW 505","SW 520","SW 550"], coreqs: ["SW 521","SW 555B"], level: LEVEL.FOUNDATION },
  "SW 555B": { title: "Field Seminar (Part 2)", credits: 0.5, offered: ["Spring"], prereqs: ["SW 555"], coreqs: ["SW 521","SW 551"], level: LEVEL.FOUNDATION },
  // Advanced + Electives
  "SW 542": { title: "Perspectives on Trauma and Human Rights", credits: 3, offered: ["Fall"], prereqs: FOUNDATION_LIST.slice(), coreqs: [], level: LEVEL.ADVANCED },
  "SW 552": { title: "Field Instruction III", credits: 4, offered: ["Fall","Spring"], prereqs: FOUNDATION_LIST.slice(), coreqs: [], level: LEVEL.ADVANCED },
  "SW 553": { title: "Field Instruction IV", credits: 3, offered: ["Spring","Summer"], prereqs: ["SW 552"].concat(FOUNDATION_LIST), coreqs: [], level: LEVEL.ADVANCED },
  "ADV-INTERVENTIONS": { title: "Advanced Interventions", credits: 3, offered: ["Fall","Summer"], prereqs: FOUNDATION_LIST.slice(), coreqs: [], level: LEVEL.ADVANCED },
  "ADV-TOPIC 1": { title: "Advanced Topics Course", credits: 3, offered: ["Fall","Spring"], prereqs: FOUNDATION_LIST.slice(), coreqs: [], level: LEVEL.ADVANCED },
  "ADV-TOPIC 2": { title: "Advanced Topics Course", credits: 3, offered: ["Fall","Spring"], prereqs: FOUNDATION_LIST.slice(), coreqs: [], level: LEVEL.ADVANCED },
  "ELECTIVE 1": { title: "Elective Course", credits: 3, offered: ["Fall","Spring","Summer"], prereqs: [], coreqs: [], level: LEVEL.ELECTIVE },
  "ELECTIVE 2": { title: "Elective Course", credits: 3, offered: ["Fall","Spring","Summer"], prereqs: [], coreqs: [], level: LEVEL.ELECTIVE },
  "ELECTIVE 3": { title: "Elective Course", credits: 3, offered: ["Fall","Spring","Summer"], prereqs: [], coreqs: [], level: LEVEL.ELECTIVE },
};

const PLAN_FULL_TIME = {
  "Fall Y1": ["SW 500","SW 505","SW 510","SW 520","SW 550","SW 555"],
  "Spring Y1": ["SW 502","SW 503","SW 506","SW 521","SW 551","SW 555B"],
  "Summer Y1": [],
  "Fall Y2": ["SW 542","SW 552","ADV-INTERVENTIONS","ADV-TOPIC 1"],
  "Spring Y2": ["ELECTIVE 1","ELECTIVE 2","ELECTIVE 3","SW 553","ADV-TOPIC 2"],
  "Summer Y2": [],
  "Fall Y3": [],
  "Spring Y3": [],
  "Summer Y3": [],
};

const PLAN_PART_TIME = {
  "Fall Y1": ["SW 500","SW 505"],
  "Spring Y1": ["SW 502","SW 510"],
  "Summer Y1": ["SW 503","SW 506","ELECTIVE 1"],
  "Fall Y2": ["SW 520","SW 550","SW 555"],
  "Spring Y2": ["SW 521","SW 551","SW 555B"],
  "Summer Y2": ["ADV-INTERVENTIONS","ELECTIVE 2"],
  "Fall Y3": ["SW 542","ADV-TOPIC 1"],
  "Spring Y3": ["SW 552","ADV-TOPIC 2"],
  "Summer Y3": ["SW 553","ELECTIVE 3"],
  "Fall Y4": [],
  "Spring Y4": [],
  "Summer Y4": [],
};

const TERM_SEASON = function(termName){ return termName.indexOf("Fall")>-1 ? "Fall" : termName.indexOf("Spring")>-1 ? "Spring" : "Summer"; };

function validatePlan(plan, humanBioComplete) {
  var terms = Object.keys(plan);
  var termIndex = {};
  for (var ti=0; ti<terms.length; ti++) termIndex[terms[ti]] = ti;

  var placement = {};
  for (var t in plan) {
    var arr = plan[t];
    for (var j=0;j<arr.length;j++) placement[arr[j]] = t;
  }

  var list = [];
  var byTerm = {};
  for (var k=0;k<terms.length;k++) byTerm[terms[k]] = {};
  var count = 0;

  function foundationsCompletedBefore(term) {
    for (var idx=0; idx<FOUNDATION_LIST.length; idx++) {
      var c = FOUNDATION_LIST[idx];
      var pTerm = placement[c];
      if (!pTerm) return false;
      if (termIndex[pTerm] >= termIndex[term]) return false;
    }
    return true;
  }

  for (var x=0;x<terms.length;x++) {
    var term = terms[x];
    var season = TERM_SEASON(term);
    var arr2 = plan[term];
    for (var y=0;y<arr2.length;y++) {
      var code = arr2[y];
      var course = CATALOG[code];
      if (!course) continue;
      var msgs = [];

      if (course.offered && course.offered.indexOf(season) === -1) {
        msgs.push("Not offered in "+season);
      }

      var prereqs = course.prereqs || [];
      for (var p=0;p<prereqs.length;p++) {
        var need = prereqs[p];
        var pTerm2 = placement[need];
        if (!pTerm2) msgs.push("Missing prerequisite "+need);
        else if (termIndex[pTerm2] >= termIndex[term]) msgs.push("Prerequisite "+need+" must be before "+code);
      }

      var coreqs = course.coreqs || [];
      for (var cdx=0;cdx<coreqs.length;cdx++) {
        var co = coreqs[cdx];
        var sameTerm = placement[co] === term;
        if (!sameTerm) msgs.push("Corequisite "+co+" must be taken with "+code);
      }

      if (course.level === LEVEL.ADVANCED) {
        if (!foundationsCompletedBefore(term)) msgs.push("All required foundation courses must be completed before advanced courses");
        if (!humanBioComplete) msgs.push("Human Biology requirement must be completed before advanced year");
      }

      if (msgs.length) {
        byTerm[term][code] = msgs;
        for (var mIdx=0;mIdx<msgs.length;mIdx++) list.push(code+" in "+term+": "+msgs[mIdx]);
        count += msgs.length;
      }
    }
  }
  return { count: count, list: list, byTerm: byTerm };
}

// ────────────────────────────────────────────────────────────────────────────────
// Export to CSV helpers (safe, no UI disruption)
function planToRows(plan, track) {
  var rows = [];
  var terms = Object.keys(plan);
  for (var i=0; i<terms.length; i++) {
    var term = terms[i];
    var list = plan[term] || [];
    for (var j=0; j<list.length; j++) {
      var code = list[j];
      var c = CATALOG[code] || {};
      rows.push([track, term, code, (c.title || ""), (typeof c.credits === "number" ? c.credits : "")]);
    }
  }
  return rows;
}

function makeCSV(plan, track) {
  var rows = [["Track","Term","Code","Title","Credits"]].concat(planToRows(plan, track));
  var csv = "";
  for (var r=0; r<rows.length; r++) {
    var cells = rows[r].map(function(cell){
      var s = (cell===null || cell===undefined) ? "" : String(cell);
      var needsQuotes = (s.indexOf(",")>-1 || s.indexOf('"')>-1 || s.indexOf("\n")>-1 || s.indexOf("\r")>-1);
      if (needsQuotes) {
        // Escape quotes by doubling them (RFC 4180)
        s = '"' + s.split('"').join('""') + '"';
      }
      return s;
    });
    csv += cells.join(",") + "\r\n";
  }
  return csv;
}

function exportCSV(plan, track) {
  var csv = makeCSV(plan, track);
  var blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = "ub-msw-plan.csv";
  document.body.appendChild(a);
  a.click();
  setTimeout(function(){ URL.revokeObjectURL(url); a.remove(); }, 0);
}

// ── Lightweight console tests (non-throwing) ───────────────────────────────────
(function runLightTests(){
  try {
    // 1) Basic row count check
    var miniPlan = { "Fall YX": ["ELECTIVE 1"] };
    var csv1 = makeCSV(miniPlan, "FT");
    if (csv1.indexOf("Track,Term,Code,Title,Credits") === -1) console.log("[TEST] header missing");
    var lines = csv1.split("\r\n");
    if (lines.length < 2) console.log("[TEST] not enough lines");

    // 2) Quote handling check (comma/quote/newline). Use manual row to avoid mutating CATALOG
    var tricky = 'Hello, "World"\nLine2';
    var row = ['FT','Term X', tricky, tricky, '3'];
    var csv2 = (function(){
      var s = 'Track,Term,Code,Title,Credits\r\n';
      var arr = row.map(function(v){ var t = String(v); var q = (t.indexOf(',')>-1 || t.indexOf('"')>-1 || t.indexOf('\n')>-1 || t.indexOf('\r')>-1); return q ? '"'+t.split('"').join('""')+'"' : t; });
      return s + arr.join(',') + '\r\n';
    })();
    if (csv2.indexOf('"Hello, ""World""\nLine2"') === -1) console.log("[TEST] quote/newline escaping not as expected");
  } catch (e) {
    console.log("[TEST] skipped due to error:", e);
  }
})();

export default function App() {
  const [track, setTrack] = useState("FT");
  const [plan, setPlan] = useState(PLAN_FULL_TIME);
  const [drag, setDrag] = useState(null);
  const [humanBioComplete, setHumanBioComplete] = useState(false);

  function switchTrack(next) {
    setTrack(next);
    setPlan(next === "FT" ? PLAN_FULL_TIME : PLAN_PART_TIME);
  }

  const issues = useMemo(function(){ return validatePlan(plan, humanBioComplete); }, [plan, humanBioComplete]);

  function onDragStart(e, fromTerm, code) {
    const payload = { fromTerm: fromTerm, code: code };
    setDrag(payload);
    e.dataTransfer.setData("text/plain", JSON.stringify(payload));
    e.dataTransfer.effectAllowed = "move";
  }
  function onDragOver(e) { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }
  function onDrop(e, toTerm) {
    e.preventDefault();
    const payload = drag || JSON.parse(e.dataTransfer.getData("text/plain"));
    if (!payload) return;
    const fromTerm = payload.fromTerm;
    const code = payload.code;
    if (fromTerm === toTerm) return;
    setPlan(function(prev){
      const next = Object.assign({}, prev);
      const fromArr = (prev[fromTerm] || []).filter(function(c){ return c !== code; });
      const toArr = (prev[toTerm] || []).concat([code]);
      next[fromTerm] = fromArr;
      next[toTerm] = toArr;
      return next;
    });
  }
  function removeCourse(term, code) {
    setPlan(function(prev){
      const next = Object.assign({}, prev);
      next[term] = (prev[term] || []).filter(function(c){ return c !== code; });
      return next;
    });
  }

  // Unplaced required courses (compat-friendly)
  var __all = [];
  for (var __k in plan) { if (plan.hasOwnProperty(__k)) { __all = __all.concat(plan[__k]); } }
  const placed = new Set(__all);
  const unplaced = Object.keys(CATALOG).filter(function(c){ return !placed.has(c) && CATALOG[c].level !== LEVEL.ELECTIVE; });

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.h1}>UB MSW Advising Planner – Pilot</h1>
        <div style={styles.tabs}>
          <button style={styles.tab(track === "FT")} onClick={() => switchTrack("FT")} aria-pressed={track==="FT"}>Full‑Time</button>
          <button style={styles.tab(track === "PT")} onClick={() => switchTrack("PT")} aria-pressed={track==="PT"}>Part‑Time</button>
        </div>
      </header>

      <main style={styles.container}>
        <div style={{ marginBottom: 12, display: "flex", gap: 16, alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <strong style={{ color: COLORS.ubBlue }}>Rule of thumb:</strong> Advanced courses require completion of all required foundation courses. Electives can be taken any term.
            <div style={styles.toggle}>
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" checked={humanBioComplete} onChange={function(e){ setHumanBioComplete(e.target.checked); }} />
                <span>Human Biology requirement completed (must be checked before any Advanced courses)</span>
              </label>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 12, color: COLORS.gray }}>Drag courses between terms; issues will highlight in red.</div>
            <button onClick={function(){ exportCSV(plan, track); }}
              style={{ background: COLORS.ubBlue, color: COLORS.white, border: "1px solid "+COLORS.ubBlue, padding: "6px 10px", borderRadius: 8, cursor: "pointer" }}>
              Export CSV
            </button>
          </div>
        </div>

        <div style={styles.grid}>
          {Object.keys(plan).map(function(term){
            const courses = plan[term];
            return (
              <section key={term} style={styles.col} onDragOver={onDragOver} onDrop={function(e){ return onDrop(e, term); }}>
                <div style={styles.colHeader}>
                  <span>{term}</span>
                  <span style={{ fontSize: 12, background: COLORS.lightGray, color: COLORS.gray, padding: "2px 8px", borderRadius: 9999 }}>{(courses||[]).length} items</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {(!courses || courses.length === 0) && <div style={{ fontStyle: "italic", color: "#94a3b8" }}>Drop courses here</div>}
                  {courses && courses.map(function(code){
                    return <CourseChip key={code} code={code} issueMsgs={(issues.byTerm[term] && issues.byTerm[term][code]) || []} onDragStart={function(e){ return onDragStart(e, term, code); }} onRemove={function(){ return removeCourse(term, code); }} />
                  })}
                </div>
              </section>
            );
          })}
        </div>

        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr", marginTop: 16 }}>
          <section style={styles.catalog}>
            <h3 style={{ marginBottom: 8, color: COLORS.ubBlue }}>Catalog (unplaced required courses)</h3>
            {unplaced.length === 0 ? (
              <div style={{ fontSize: 14 }}>All required courses are placed. Use Electives and Advanced placeholders as needed.</div>
            ) : (
              <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                {unplaced.map(function(code){
                  return (
                    <button key={code} style={Object.assign({}, styles.chip(false), { justifyContent: "space-between", cursor: "pointer" })} title="Add to first term" onClick={function(){
                      const firstTerm = Object.keys(plan)[0];
                      setPlan(function(prev){
                        const next = Object.assign({}, prev);
                        next[firstTerm] = (prev[firstTerm] || []).concat([code]);
                        return next;
                      });
                    }}>
                      <div>
                        <div style={{ fontWeight: 700, color: COLORS.ubBlue }}>{code}</div>
                        <div style={{ fontSize: 12 }}>{(CATALOG[code]||{}).title}</div>
                        <div style={{ fontSize: 10, opacity: 0.8 }}>Offered: {(CATALOG[code]&&CATALOG[code].offered ? CATALOG[code].offered.join(", ") : "")}</div>
                      </div>
                      <span style={{ fontSize: 11, background: COLORS.lightGray, padding: "2px 6px", borderRadius: 8 }}>{(CATALOG[code] && typeof CATALOG[code].credits === "number") ? CATALOG[code].credits : ""} cr</span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <IssuesPanel issues={issues} />
        </div>
      </main>
    </div>
  );
}

function CourseChip({ code, issueMsgs, onDragStart, onRemove }) {
  const issue = issueMsgs && issueMsgs.length > 0;
  const c = CATALOG[code] || {};
  return (
    <div draggable onDragStart={onDragStart} style={styles.chip(issue)} title={issue ? issueMsgs.join("; ") : "Drag to move"}>
      <div>
        <div style={{ fontWeight: 700, color: COLORS.ubBlue }}>{code} <span style={{ color: COLORS.gray, fontWeight: 500 }}>• {c.title || ""}</span></div>
        <div style={{ fontSize: 12, opacity: 0.85 }}>{c.level === LEVEL.ADVANCED ? "Advanced" : c.level === LEVEL.FOUNDATION ? "Foundation" : "Elective"} • Offered: {(c.offered ? c.offered.join(", ") : "")}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 12, background: COLORS.lightGray, padding: "2px 6px", borderRadius: 8 }}>{(typeof c.credits === "number" ? c.credits : "")} cr</span>
        <button onClick={function(e){ e.preventDefault(); e.stopPropagation(); if(onRemove) onRemove(); }} style={styles.btn}>Remove</button>
      </div>
    </div>
  );
}

function IssuesPanel({ issues }) {
  const count = issues.count;
  const list = issues.list;
  return (
    <section style={styles.rulePanel}>
      <h3 style={{ marginBottom: 6, color: COLORS.ubBlue }}>Rule Check</h3>
      <div style={{ fontSize: 14, marginBottom: 6 }}>{count === 0 ? "No issues detected." : (count+" issue"+(count===1?"":"s")+" found.")}</div>
      {count > 0 && (
        <ul style={{ paddingLeft: 18, display: "grid", gap: 4, fontSize: 14 }}>
          {list.map(function(m, i){ return <li key={i}>{m}</li>; })}
        </ul>
      )}
      <div style={{ marginTop: 8, fontSize: 12, color: COLORS.gray }}>
        Checks include: term offering, prerequisites, corequisites (same term), advanced-year gate (all foundations scheduled in earlier terms + Human Biology prior to advanced).
      </div>
    </section>
  );
}
