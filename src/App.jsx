import { useState, useEffect } from "react";

// ─── SUPABASE CONFIG ────────────────────────────────────────────────────────
const SUPABASE_URL = "https://ggokprttccrbqijyxjif.supabase.co";
const SUPABASE_KEY = "sb_publishable_9goR1I65vA0JIhVPqlf_Zw_I6dNqyBD";
const sbHeaders = {
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
};

// ─── SUPABASE DATA HELPERS ──────────────────────────────────────────────────
// Thin REST wrapper — uses fetch directly since the artifact sandbox can't
// install the @supabase/supabase-js package. Works identically once this
// code runs in the real deployed app on Vercel.
const sb = {
  async select(table, query = "") {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
      headers: sbHeaders,
    });
    if (!res.ok) { console.error(`Supabase select ${table} failed`, await res.text()); return []; }
    return res.json();
  },
  async insert(table, row) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: { ...sbHeaders, "Prefer": "return=representation" },
      body: JSON.stringify(row),
    });
    if (!res.ok) { console.error(`Supabase insert ${table} failed`, await res.text()); return null; }
    const data = await res.json();
    return data[0] || null;
  },
  async update(table, match, patch) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${match}`, {
      method: "PATCH",
      headers: { ...sbHeaders, "Prefer": "return=representation" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) { console.error(`Supabase update ${table} failed`, await res.text()); return null; }
    return res.json();
  },
  async delete(table, match) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${match}`, {
      method: "DELETE",
      headers: sbHeaders,
    });
    return res.ok;
  },
};

// ─── LEGACY LOCALSTORAGE HELPER ─────────────────────────────────────────────
// Kept only as a local cache/fallback while the Supabase migration settles.
const store = {
  get: (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
};

// ─── MATH ENGINE ────────────────────────────────────────────────────────────
function calcSession(rows, info) {
  const age = parseInt(info.age) || 18;
  const cols = [0,1,2,3,4,5,6,7,8,9,10].map(ci => rows.map(r => r[ci] === "" || r[ci] === null ? null : parseFloat(r[ci])));
  const [A,B,C,D,E,F,G,H,I,J,K] = cols;
  const avgC = col => { const v = col.filter(x=>x!==null); return v.length ? v.reduce((a,b)=>a+b,0)/v.length : null; };
  const stdevC = col => { const v = col.filter(x=>x!==null); if(v.length<2) return null; const m=avgC(v); return Math.sqrt(v.reduce((s,x)=>s+(x-m)**2,0)/(v.length-1)); };
  const correl = (xs,ys) => { const p=xs.map((x,i)=>[x,ys[i]]).filter(p=>p[0]!==null&&p[1]!==null); if(p.length<3) return null; const mx=avgC(p.map(x=>x[0])),my=avgC(p.map(x=>x[1])); const num=p.reduce((s,x)=>s+(x[0]-mx)*(x[1]-my),0); const d1=Math.sqrt(p.reduce((s,x)=>s+(x[0]-mx)**2,0)),d2=Math.sqrt(p.reduce((s,x)=>s+(x[1]-my)**2,0)); return(!d1||!d2)?null:num/(d1*d2); };

  const avgs = cols.map(avgC);
  const [a13,b13,c13,d13,e13,f13,g13,h13,i13,j13,k13] = avgs;
  if(!c13) return null;

  const m13 = avgC(J.map(v=>v===null?null:Math.abs(v)));
  const n13 = (c13!==null&&d13!==null&&e13!==null&&h13!==null) ? -5.2-0.12*(e13-16)+0.03*(d13-72)-0.04*(h13-66)-0.02*(c13-92) : null;
  const o13 = c13!==null ? 60+0.9*(c13-82) : null;
  const n14 = (g13!==null&&n13!==null) ? Math.max(0,1-Math.abs(g13-n13)/0.9) : null;
  const o14 = (h13!==null&&o13!==null) ? Math.max(0,1-Math.abs(h13-o13)/8) : null;
  const p14 = c13!==null ? Math.max(0.85,Math.min(1.08,c13/92)) : 1;

  const a14 = a13!==null ? Math.max(0,Math.min(1,(a13-8)/7,(38-a13)/6)) : null;
  const b14 = b13!==null ? Math.max(0,Math.min(1,(Math.abs(b13)-0.2)/0.6,(3-Math.abs(b13))/0.8)) : null;

  // AGE-ADJUSTED: Velocity
  const veloFloor = age<=14 ? 68 : age<=18 ? 75 : age<=23 ? 80 : 85;
  const c14 = c13!==null ? Math.max(0,Math.min(1,(c13-veloFloor)/16)) : null;

  const d14 = (d13!==null&&o14!==null) ? Math.max(0,Math.min(1,(d13-54)/16))*o14 : null;

  // AGE-ADJUSTED: IVB
  const ivbFloor = age<=14 ? 6 : age<=18 ? 12 : age<=23 ? 15 : 18;
  const e14 = e13!==null ? Math.max(0,Math.min(1,(e13-ivbFloor)/16)) : null;

  const f14 = f13!==null ? Math.max(0,Math.min(1,(Math.abs(f13)-1)/3,(20-Math.abs(f13))/5)) : null;
  const g14 = n14;
  const h14 = h13!==null ? Math.max(0,Math.min(1,(h13-56)/5,(73-h13)/4)) : null;

  // AGE-ADJUSTED: Spin Rate
  const spinFloor = age<=14 ? 1500 : age<=18 ? 1750 : age<=23 ? 1875 : 2000;
  const i14 = i13!==null ? Math.max(0,Math.min(1,(i13-spinFloor)/500)) : null;

  const j14 = m13!==null ? Math.max(0,1-(m13/12)**1.4) : null;
  let k14 = null;
  if(k13!==null&&e13!==null){ if(k13<22) k14=Math.max(0,Math.min(1,(k13/22)*(e13/22))); else if(k13<=27) k14=1; else if(k13<=39) k14=Math.max(0,Math.min(1,(e13-12)/(22-12))); else k14=Math.max(0,1-(k13-39)/9); }

  const stdevs = cols.map(stdevC);
  const [sa,sb,sc,sd,se,sf,sg,sh,si,sj,sk] = stdevs;
  const a15 = sa!==null?Math.max(0,Math.min(1,(5-sa)/3)):null;
  const b15 = sb!==null?Math.max(0,Math.min(1,(0.5-sb)/0.35)):null;
  const c15 = sc!==null?Math.max(0,Math.min(1,(2.5-sc)/1.8)):null;
  const d15 = sd!==null?Math.max(0,Math.min(1,(4.5-sd)/3)):null;
  const e15 = se!==null?Math.max(0,Math.min(1,(3-se)/2.1)):null;
  const f15 = sf!==null?Math.max(0,Math.min(1,(3-sf)/2.1)):null;
  const g15 = sg!==null?Math.max(0,Math.min(1,(1-sg)/0.75)):null;
  const h15 = sh!==null?Math.max(0,Math.min(1,(3.5-sh)/2.5)):null;
  const i15 = si!==null?Math.max(0,Math.min(1,(240-si)/180)):null;
  const j15 = sj!==null?Math.max(0,Math.min(1,(7-sj)/5)):null;
  const k15 = sk!==null?Math.max(0,Math.min(1,(7-sk)/5)):null;

  const r16 = [[a14,a15,0.6,0.4],[b14,b15,0.6,0.4],[c14,c15,0.7,0.3],[d14,d15,0.55,0.45],[e14,e15,0.65,0.35],[f14,f15,0.65,0.35],[g14,g15,0.7,0.3],[h14,h15,0.55,0.45],[i14,i15,0.65,0.35],[j14,j15,0.4,0.6],[k14,k15,0.4,0.6]].map(([n,c,wn,wc])=>(n!==null&&c!==null)?n*wn+c*wc:null);
  const [a16,b16,c16,d16,e16,f16,g16,h16,i16,j16,k16] = r16;

  const bDir = (a16!==null&&b16!==null)?(a16+b16)/2:null;
  const bVel = (c16!==null&&d16!==null)?c16*0.7+d16*0.3:null;
  const bShp = (e16!==null&&f16!==null&&g16!==null&&i16!==null)?e16*0.3+f16*0.2+g16*0.3+i16*0.2:null;
  const bArm = h16;
  const bCmd = (j16!==null&&k16!==null)?j16*0.5+k16*0.5:null;
  const bArr = [bDir,bVel,bShp,bArm,bCmd];
  const overall = bArr.every(v=>v!==null)?bArr.reduce((s,v,i)=>s+[0.2,0.24,0.22,0.12,0.22][i]*v,0)*p14:null;

  // VELO MAKER — exclude misleading metrics
  const EXCLUDED_VELO_MAKERS = new Set(['Release Side','Horizontal Approach Angle','Horizontal Break','Plate Side','Plate Height']);
  const mLabels = ['Release Side','Horizontal Approach Angle','Velocity','Extension','Induced Vertical Movement','Horizontal Break','Vertical Approach Angle','Release Height','Spin Rate','Plate Side','Plate Height'];
  let bestAbs=-Infinity, bestMetric='Extension';
  cols.forEach((col,ci)=>{
    if(mLabels[ci]==='Velocity') return;
    if(EXCLUDED_VELO_MAKERS.has(mLabels[ci])) return;
    const r=correl(col,C);
    if(r!==null&&Math.abs(r)>bestAbs){bestAbs=Math.abs(r);bestMetric=mLabels[ci];}
  });

  // VELO MAKER INTERPRETATION
  const veloMakerType = {
    'Extension': 'true_driver',
    'Release Height': 'true_driver',
    'Induced Vertical Movement': 'arm_path',
    'Spin Rate': 'arm_path',
    'Vertical Approach Angle': 'proxy',
  }[bestMetric] || 'true_driver';

  const corrMap = {
    'Extension':'Increase Velocity through Extension',
    'Induced Vertical Movement':'Increase Velocity through Shape',
    'Vertical Approach Angle':'Increase Velocity through Shape',
    'Spin Rate':'Increase Velocity through Arm Action',
    'Release Height':'Increase Velocity through Arm Action',
  };
  const primary = corrMap[bestMetric]||'Increase Velocity';
  const minBI = bArr.reduce((mi,v,i)=>(v!==null&&(mi===-1||v<bArr[mi]))?i:mi,-1);
  const bNames = ['Direction','Velocity','Shape','Arm Action','Command'];
  const secondary = minBI>=0?bNames[minBI]:'';
  const aligned = (primary.includes('Direction')&&secondary==='Direction')||(primary==='Increase Velocity'&&secondary==='Velocity')||(primary.includes('Shape')&&secondary==='Shape')||(primary.includes('Arm Action')&&secondary==='Arm Action')||(primary.includes('Command')&&secondary==='Command')||(primary.includes('Extension')&&secondary==='Velocity');
  const focus = aligned?primary:primary+' | Secondary Focus: '+secondary;

  const vscore = bVel;
  let veloProfile = '—';
  if(c13!==null&&vscore!==null){
    const wb = minBI>=0?bNames[minBI]:'';
    let base;
    if(c13>=88&&vscore>=0.9) base='Optimized Velocity Profile';
    else if(c13>=88&&vscore<0.9) base='Mechanical Velocity Deficit';
    else if(c13<82&&vscore>=0.9) base='Physical / Strength Velocity Deficit';
    else if(c13<82&&vscore<0.75) base='Mechanical + Physical Development Needed';
    else if(c13>=82&&c13<88&&vscore>=0.9) base='Physically Limited but Efficient';
    else base='Mechanical Leak Limiting Velocity';
    veloProfile=['Mechanical Velocity Deficit','Mechanical + Physical Development Needed','Mechanical Leak Limiting Velocity'].includes(base)?base+' ('+wb+')':base;
  }

  // Age tier label for prompt context
  const ageTier = age<=14?'Youth (0-14)':age<=18?'High School (15-18)':age<=23?'College (19-23)':'Pro (23+)';

  const scoreLabel = overall===null?'—':overall<0.2?'Well Below Average':overall<0.4?'Below Average':overall<0.6?'Average':overall<0.8?'Above Average':'Elite';
  const badBuckets = bArr.map((v,i)=>v!==null&&v<0.33?bNames[i]:null).filter(Boolean).join(', ')||'None';

  return { avgs, bArr, bNames, overall, focus, bestMetric, veloMakerType, veloProfile, scoreLabel, badBuckets, n13, o13, n14, o14, p14, ageTier, veloFloor, ivbFloor, spinFloor };
}

// ─── PROMPT BUILDER ──────────────────────────────────────────────────────────
function buildPrompt(result, info, priorSessions=[]) {
  const { avgs, bArr, focus, bestMetric, veloMakerType, veloProfile, n13, o13, n14, o14, p14, ageTier, veloFloor, ivbFloor, spinFloor } = result;
  const [a13,b13,c13,d13,e13,f13,g13,h13,i13,j13,k13] = avgs;
  const f1 = v=>v!==null?v.toFixed(1):'N/A';
  const f2 = v=>v!==null?v.toFixed(2):'N/A';
  const bNames = ['Direction','Velocity','Shape','Arm Action','Command'];

  const veloMakerNote = veloMakerType==='true_driver'
    ? `${bestMetric} is a true mechanical velocity driver — program directly toward it.`
    : veloMakerType==='arm_path'
    ? `${bestMetric} is an upstream arm path and efficiency signal — program toward arm action and connection, not raw velocity work.`
    : `${bestMetric} is a proxy for release height or extension inconsistency — program toward release point organization, not raw velocity work.`;

  const veloContext = c13!==null ? (
    c13 >= veloFloor + 16 ? `Elite velocity for ${ageTier}.` :
    c13 >= veloFloor + 8 ? `Above average velocity for ${ageTier}.` :
    c13 >= veloFloor ? `Developing velocity for ${ageTier}, room to grow.` :
    `Below floor for ${ageTier} — significant velocity deficit.`
  ) : '';

  const ivbContext = e13!==null ? (
    e13 >= ivbFloor + 12 ? `Elite IVB for ${ageTier}.` :
    e13 >= ivbFloor + 6 ? `Above average IVB for ${ageTier}.` :
    e13 >= ivbFloor ? `Developing IVB for ${ageTier}.` :
    `Below IVB floor for ${ageTier}.`
  ) : '';

  const spinContext = i13!==null ? (
    i13 >= spinFloor + 500 ? `Elite spin for ${ageTier}.` :
    i13 >= spinFloor + 250 ? `Above average spin for ${ageTier}.` :
    i13 >= spinFloor ? `Developing spin for ${ageTier}.` :
    `Below spin floor for ${ageTier}.`
  ) : '';

  // Longitudinal context
  let longitudinalBlock = '';
  if(priorSessions && priorSessions.length > 0) {
    const recent = [...priorSessions].slice(-3).reverse();
    const rows = recent.map((s,i) => {
      const b = s.result?.bArr || [];
      const bStr = bNames.map((n,bi) => `${n} ${b[bi]!==null&&b[bi]!==undefined?(b[bi]*100).toFixed(0):'N/A'}`).join(' | ');
      const velo = s.result?.avgs?.[2]?.toFixed(1) || 'N/A';
      const overall = s.overall!==null?Math.round(s.overall*100):'N/A';
      const sfocus = s.result?.focus || 'N/A';
      const date = new Date(s.date).toLocaleDateString();
      return `Session ${recent.length-i} (${date}): Overall ${overall} | Velo ${velo} | ${bStr} | Focus: ${sfocus}`;
    });
    const trends = [];
    if(recent.length >= 2) {
      bNames.forEach((n,bi) => {
        const vals = recent.map(s => s.result?.bArr?.[bi]).filter(v => v !== null && v !== undefined);
        if(vals.length >= 2) {
          const delta = vals[0] - vals[vals.length-1];
          if(Math.abs(delta) >= 0.05) trends.push(`${n} ${delta > 0 ? 'improved' : 'declined'} ${Math.abs(delta*100).toFixed(0)} points`);
        }
      });
      const veloVals = recent.map(s => s.result?.avgs?.[2]).filter(v => v !== null && v !== undefined);
      if(veloVals.length >= 2) {
        const vDelta = veloVals[0] - veloVals[veloVals.length-1];
        if(Math.abs(vDelta) >= 0.3) trends.push(`Velocity ${vDelta > 0 ? 'up' : 'down'} ${Math.abs(vDelta).toFixed(1)} mph`);
      }
    }
    longitudinalBlock = `
PRIOR SESSION HISTORY (most recent first):
${rows.join('\n')}

TREND ANALYSIS:
${trends.length > 0 ? trends.join(', ') : 'First or second session — no trend data yet.'}

LONGITUDINAL AND PROGRESSION RULES:
- If a bucket has been low across multiple sessions, escalate the emphasis — do not repeat the same approach.
- If a bucket improved, acknowledge it and build on what drove that improvement.
- If velocity increased, identify what drove it and reinforce it.
- If velocity stalled or declined, identify what changed and adjust accordingly.
- Do not prescribe the same plyo drills as the most recent session unless producing clear measurable improvement.
- The program must reflect this athlete's history and trajectory — not just today's snapshot.
- If prior session history shows a flaw category was addressed and metric or image evidence improved, ADVANCE that drill concept to the next progression stage (see Drill Progression Model below) rather than repeating the same stage.
- If prior session history shows a flaw category was addressed but did NOT improve, stay at the same stage or regress one stage rather than advancing.
- Never skip a progression stage. An athlete cannot go from Stage 1 directly to Stage 4.
- If the monthly mechanical priority (see Sequential Mechanical Chain below) has shown clear progress across sessions, shift the primary focus to the next link in the chain rather than continuing to over-index on a position that is already fixed.`;
  }

  const lowestBucketName = bNames[bArr.reduce((mi,v,i)=>(v!==null&&(mi===-1||v<bArr[mi]))?i:mi,-1)];

  return `You are an elite baseball pitching coach and sports scientist. You generate structured, individualized throwing programs based on Trackman data. You have deep knowledge of Tread Athletics, Driveline Baseball, 108 Performance, MLB and MiLB development programs, the Korean Baseball Organization, kazu_jave methodology, Bill Hartman's Unified Health and Performance Continuum Model, and peer-reviewed biomechanics research. Draw from all of these sources for every program you generate.

When a user sends you athlete data, generate a complete throwing program following the exact rules and format below. Do not deviate. Do not ask clarifying questions. Generate immediately.

================================================================================
CORE RULES
================================================================================

LANGUAGE AND TONE:
- Plain, direct language. Face to face tone. Speak to the athlete directly.
- No bucket score numbers anywhere in the output. Translate everything into plain language.
- Helper metrics explain the story. They do not choose the problem. Never restate helper metric numbers directly.
- Only reference raw numbers if they make the problem clearer to a non-expert.
- Every section of the plan must connect back to the diagnosis. If it does not connect, leave it out.
- Red flags woven into the diagnosis paragraph naturally. State injury risk clearly. Note pending video verification where applicable.

AGE RULES:
- Under 11: No plyo routine, no Run and Gun. Catch play arc to Light Long Toss and drill work only. No bullpens exceeding 15 pitches.
- Age 11-12: No Run and Gun unless velocity is 75 mph or higher. If 75+ treat as older athlete — full plyo routine and Run and Gun allowed.
- Age 13+: Full program. All decision tree options apply.
- Bullpen pitch counts: governed by recovery data. Prescribe conservatively if no wearable data available.

WEEKLY STRUCTURE RULES:
- Maximum 1 Run and Gun per week.
- Maximum 2 bullpens per week (1 high intent + 1 mechanical if both used).
- Never prescribe Run and Gun on Low Intent day. Ever.
- Never prescribe flat ground. Semi-Slope is always the fallback.
- Run and Gun always heavy to light: 6oz to 5oz to 4oz to 3oz. Reps per weight only. No distances.
- Run and Gun always comes AFTER the catch play arc. Never before.

WEEKLY DECISION TREE:
- Run and Gun + Mechanical Bullpen (both days include Max Long Toss as peak of catch play arc): athlete needs velocity bump
- High Intent Bullpen + Max Long Toss: athlete already has high velocity, focus is mechanics and command
- Max Long Toss + Mechanical Bullpen: youth athlete developing arm path
- Semi-Slope + Max Long Toss: fallback
- Low Intent always: catch play arc to prescribed Light Long Toss distance + drill work on the way back in

CATCH PLAY ARC RULES:
- Every session begins with a catch play arc. No separate catch play and long toss. One continuous sequence.
- Start at 30-45 feet. Build out gradually until reaching Max Long Toss or prescribed Light Long Toss distance.
- On the way back in, perform prescribed drill work.
- Arc feeds directly into Main Event. No break.
- Prescribe number of throws at peak distance based on age, level, and intent.
- Max Long Toss: no distance cap. Throw as far as possible.
- Light Long Toss: prescribe specific distance based on age, level, and intent.

LEAD LEG BLOCK RULE:
- Include at least one lead leg block drill in every program regardless of data.
- If Velocity bucket is low, heavily emphasize lead leg block across all three days.
- Lead leg block is the primary upstream cause of low Velocity, Spin Rate, and IVB.

MECHANICAL MODEL:
The full delivery sequence is defined in the SEQUENTIAL MECHANICAL CHAIN section later in this prompt. That section is the single source of truth for the mechanical model — refer to it for the complete description of Peak Leg Lift through Release Point. Do not use any other description of the kinetic chain.

MECHANICAL RED FLAGS — evaluate all 7 against every athlete. Weave triggered flags into diagnosis naturally. State injury risk clearly. Note pending video verification where applicable.

1. FLYING OPEN: Plate Side consistently arm-side + Match below 0.33 + Direction bucket low → arm lags, sequence breaks, injury risk. No high intent RnG while flagged.
2. ARM DROP: Extension too long for height AND Release Height drops as Extension increases → injury risk. Exception: intentional low VAA with consistent command.
3. EARLY TRUNK ROTATION (video verification): HAA inconsistency + Direction low + Plate Side Match low + Release Height Match high → ribcage opening before foot strike, elevated surgical risk.
4. WEAK LEAD LEG BLOCK (injury flag): Velocity + IVB + Spin + Command + Direction all low simultaneously → lead leg collapsing, injury risk. Flag for weight room ground reaction force work.
5. ARM LAG / LATE ARM: Plate Side Match below 0.33 + Release Height Match above 0.66 → arm accelerating late, UCL risk. Reduce high intent until resolved.
6. INCONSISTENT RELEASE POINT: High variability across both Release Side AND Release Height → command limiter, fatigue indicator. Investigate lower body cause.
7. LATERAL TRUNK TILT (video verification): Release Height lower than predicted + HAA inconsistent → trunk tilting at release, associated with upper extremity surgical history.

================================================================================
PLYO BALL PRESCRIPTION — CRITICAL
================================================================================

The plyo routine is one of the two most important parts of this program alongside post-throw arm care. Every drill and every weight must be chosen with deliberate intent for this specific athlete. A generic routine is a failure. If two athletes with different limiters or different red flags receive the same routine, something is wrong.

WEIGHT PHILOSOPHY — understand this before selecting any drill:

HEAVIER BALL (275-450g):
Slows the arm down. Loads deep ranges of motion. Strengthens the posterior shoulder and posterior chain. Trains deceleration capacity. Reinforces positions the arm must hold — scap load, layback, arm path through release. Use when the athlete needs to feel a position, strengthen a range, or slow a pattern down to correct it. Never use heavy balls for rhythm or feel work.

LIGHTER BALL (100-200g):
Speeds the arm up. Trains rate of force development. Reinforces rhythm and tempo. Grooves patterning at speed. Use when the athlete needs to feel timing, acceleration, or a connected athletic throw. Low intent days stay light throughout — patterning and rhythm only.

MID-WEIGHT BALL (200-275g):
Connection and sequencing work. Blends lower half timing with arm path. Neither purely heavy nor purely light. Use for drills that require both feel and some load.

PROGRESSION WITHIN THE ROUTINE:
- Always build from lighter to heavier on mid and high intent days.
- Low intent days: stay light throughout. Patterning and rhythm only.
- The routine must tell a mechanical story. Each drill connects to the next and to the diagnosis.

DRILL SELECTION — follow these steps in order before writing a single drill:

STEP 1: Identify the primary limiter bucket AND the weakest metric within that bucket. The bucket name alone is not enough. Command from late arm timing requires different drills than Command from release height inconsistency. Direction from flying open requires different drills than Direction from trunk tilt. You must identify the specific mechanical cause before selecting any drill.

STEP 2: Identify all triggered red flags. Red flags modify drill selection even when the bucket is the same. An athlete with Arm Lag / Late Arm gets different drills than an athlete with Flying Open even if both have Command as the lowest bucket.

STEP 3: Select drills that directly attack the specific cause identified in Step 1 and Step 2:
- Command from late arm timing: connection drills, timing drills, hip-shoulder separation, front side integrity
- Command from release height inconsistency: arm path drills, scap load, release point work, arm action reinforcement
- Command from direction: plate side consistency drills, hip-to-shoulder separation, front side hold
- Velocity from lead leg: lead leg block drills, hip drive, ground reaction force emphasis
- Velocity from lower half loading: step-behind, step-back, lower half timing drills
- Arm Action from scap load: pivot pickoff variations, 90/90 work, heavier arm path drills
- Arm Action from arm path: lasso drill, elbow up, arm path isolation
- Shape from arm path or release: upward toss, release height work, spin efficiency drills
- Direction from flying open: hip-shoulder separation, ribcage closure, front side connection

STEP 4: Assign weight to each drill based on its goal — not a standard template. A rhythm drill gets a light ball. A scap load drill gets a mid-to-heavy ball. A velocity drill on a high intent day gets a heavy ball. Two athletes with the same lowest bucket must have different weights if their specific causes differ.

STEP 5: Variety applies only to maintenance and secondary drills outside the primary flaw focus — no two consecutive drills from the same sub-category there. For the primary flaw's drill concept, follow the DRILL PROGRESSION MODEL later in this prompt: if the concept worked in a prior session, do not swap to an unrelated drill — advance the same concept into a more dynamic stage to keep challenging the athlete in that position. Repetition of a working concept is correct as long as it is progressing in difficulty, not repetition of the exact same static drill at the exact same stage indefinitely. Pull all drills from the attached drill_bank.txt.

STEP 6: Lead leg block drill is always included. If Velocity is the primary limiter, give it prominent placement with a weight that forces the athlete to feel the block under load (225-300g). If Velocity is strong, include it lighter and earlier as reinforcement.

CRITICAL — SAME BUCKET DIFFERENT CAUSE:
When two athletes share the same lowest bucket, the plyo routine must still differ based on the weakest metric within that bucket and the specific red flags triggered. Identify the specific mechanical cause before selecting any drill. Never assign drills based on bucket name alone.

WHAT BAD PLYO PRESCRIPTION LOOKS LIKE — NEVER DO THIS:
- Same 4-5 drills for every athlete regardless of limiter
- Same weights on every drill regardless of drill goal
- Drills that do not connect to the specific cause identified in Step 1 and Step 2
- A routine that could belong to any pitcher — it must belong to this one specifically
- Assigning drills based on bucket label without identifying the specific mechanical cause

================================================================================
POST-THROW ARM CARE — CRITICAL
================================================================================

Post-throw arm care is one of the two most important parts of this program alongside the plyo routine. It must respond to the specific stressors of this athlete's delivery and triggered flags — not a generic circuit.

PRINCIPLES:
- Arm care is a kinetic chain problem. Address the system not just the structure.
- Deceleration places maximum proximal shoulder and elbow force on the arm. Address posterior shoulder capacity, scapular control, and rotator cuff under load.
- Scapular stability is foundational before isolated rotator cuff work. Prioritize upward rotation and T-spine mobility.
- Hip internal rotation range of motion is required to decelerate the trunk and pelvis over the lead leg. Include hip IR restoration in every arm care prescription.
- Thoracic extension and rotation must be addressed. Restricted T-spine forces the shoulder and elbow to compensate.
- Scale to intent:
  High intent: deceleration capacity, posterior shoulder stress management, ROM recovery
  Mid intent: recovery, tissue quality, maintenance, breathing-based reset
  Low intent: blood flow, patterning, breathing-based thorax and pelvis reset (Hartman UHPC)
- Every exercise must include clear step-by-step instructions. The athlete performs it with no other guidance.

FLAG-SPECIFIC ARM CARE RULES — these override generic selection:
- ARM LAG / LATE ARM flag: prioritize hip IR restoration, posterior capsule work, and timing-based breathing resets. The arm is arriving late because the system is out of sequence — address the pelvis and thorax, not just the shoulder.
- FLYING OPEN flag: prioritize hip IR, anterior chain lengthening, and sequencing-based resets. The front side is releasing too early — address the hip and thorax rotation relationship.
- INCONSISTENT RELEASE POINT flag: prioritize scapular stability, T-spine rotation, and lower half hip work. Release point inconsistency is usually a lower body or trunk problem expressed at the arm.
- WEAK LEAD LEG BLOCK flag: prioritize hip IR restoration on the lead leg side, glute and hip deceleration work, and breathing resets that address pelvic positioning.
- ARM DROP flag: prioritize posterior shoulder loading, scap retraction work, and thoracic extension. The arm is dropping because the posterior chain is not loading correctly.
- LATERAL TRUNK TILT flag: prioritize lateral hip and thorax work, breathing resets in positions that address ribcage-over-pelvis stacking.
- EARLY TRUNK ROTATION flag: prioritize hip-shoulder separation restoration, breathing resets that address ribcage closure, and T-spine rotation work.

CRITICAL — SAME BUCKET DIFFERENT ARM CARE:
When two athletes share the same lowest bucket or same intent level, their arm care must still differ based on their specific red flags and delivery stressors. An athlete with late arm timing needs different posterior shoulder loading than an athlete with release height inconsistency. If two athletes receive identical arm care, something is wrong.

Pull all arm care exercises from the attached drill_bank.txt Post-Throw Arm Care section.

================================================================================
DRILL SELECTION LOGIC — INTERNAL, NOT SHOWN IN OUTPUT
================================================================================

Pull all drills from attached drill_bank.txt. Do not invent drills not in the bank.
Every drill selected must be explicitly justified by the athlete's specific limiter cause, weakest metric, or red flag.
Do not select a drill if you cannot connect it directly to the specific mechanical cause identified in Step 1 and Step 2.
Do not label the limiter target inside the drill description in the final output.
The athlete and coach see only: drill name, weight, reps, why this drill, cue, how to perform.



================================================================================
TRACKMAN METRIC TO MECHANICAL FLAW MAPPING — READ BEFORE WRITING ANY DIAGNOSIS
================================================================================

Before writing the diagnosis or selecting any drill, work through every metric below and identify what the data is telling you about the kinetic chain. This is your diagnostic process. Do not skip it.

RELEASE SIDE
- Consistent = delivery repeating at release. Good.
- Inconsistent (high stdev) = arm arriving at a different horizontal position each pitch. Upstream cause is timing — trunk rotating at different speeds, lead leg block inconsistent, or backside loading differently each rep.
- Arm-side drift + low Plate Side Match = arm is late, not the direction. Flying Open or Late Arm flag territory.
- Glove-side drift = arm wrapping or front side pulling off early.

HORIZONTAL APPROACH ANGLE (HAA)
- Inconsistent HAA = delivery not repeating in the horizontal plane. Stride direction problem or front side integrity problem.
- HAA drifting arm-side relative to Release Side = pitcher spinning off rather than driving through. Bad Backside Load territory — pelvis not staying behind the stride long enough.
- HAA inconsistency + direction bucket low = Early Trunk Rotation or Flying Open flag.

VELOCITY
- Velocity is the most honest single metric. It is the product of the entire kinetic chain.
- Velocity well below physical profile = mechanical leak. The chain is losing energy before it reaches the arm.
- Velocity inconsistent across 10 pitches = sequencing is variable. Chain is not firing in the same order each rep.
- Velocity low despite good Extension = Heavy Arm pattern. Lower half not contributing. Arm is the primary force generator.
- Velocity low + low IVB + low Spin = arm path is inefficient AND lower half is not contributing. Multiple upstream failures.

EXTENSION
- Driven by stride length, front leg block quality, and forward trunk tilt at release.
- Low Extension = lead leg block collapsing early pulling release point back, OR athlete is pushing not falling down the mound.
- High Extension + dropping Release Height = Arm Drop flag. Arm chasing extension by dropping the slot.
- Inconsistent Extension = lead leg block firing at different times. Sequencing problem upstream.

INDUCED VERTICAL BREAK (IVB)
- Low IVB for age group = arm path inefficient, spin axis tilted, or arm never reaching true layback. Often Heavy Arm pattern — arm fires early and never fully loads into external rotation.
- IVB inconsistent = release point varying vertically. Confirm with Release Height stdev.
- Low IVB + low Spin Rate together = arm path AND wrist position both inefficient. Arm drag or early pronation. Late Arm flag likely.

HORIZONTAL BREAK (HB)
- HB inconsistency = spin axis varying. Wrist and forearm position at release is changing each pitch. Usually Late Arm — arm arriving in a different position each rep.
- HB direction shifting across pitches = Release Side drifting and pulling the spin axis with it. Sequencing upstream.

VERTICAL APPROACH ANGLE (VAA)
- VAA is a downstream product of Release Height, Extension, and velocity combined. Diagnose upstream causes first.
- Steeper VAA than expected = Release Height lower than slot would predict, OR extension shorter than expected. Use Predicted Release Height helper to confirm.
- VAA inconsistency = release point varying vertically. Release Height stdev will confirm.
- Do not diagnose VAA directly — always trace it to Release Height or Extension as the root cause.

RELEASE HEIGHT
- Most direct measure of arm slot consistency at the release point.
- Low Release Height relative to athlete height = arm dropping at release. Arm Drop flag.
- Inconsistent Release Height = three possible upstream causes:
  1. Lead leg block inconsistent — block varying in height and timing
  2. Trunk tilt at release varying — Lateral Trunk Tilt flag
  3. Arm late and compensating by changing path — Late Arm flag
- Release Height Match below 0.33 = release height not matching predicted delivery model. Sequencing is off somewhere in the chain.
- Release Height Match above 0.66 = structurally consistent. If command is still poor the problem is direction not height.

SPIN RATE
- Low Spin Rate for age group = arm speed at release is low (Heavy Arm — chain broke down upstream and arm never fully accelerated) OR grip and wrist are inefficient.
- Inconsistent Spin Rate = arm arriving at release in different positions and at different speeds each pitch. Sequencing variability upstream.
- Low Spin + low IVB together = arm not completing its path through the release zone. Dragging, arriving late, or releasing early.

PLATE SIDE
- Arm-side misses + low Plate Side Match = arm is late. Delivery is on time but arm is not.
- Glove-side misses + high Plate Side Match = structural direction issue. Stride direction or spine tilt.
- Large spread across 10 pitches = sequencing is completely variable. Chain firing in different orders. Both backside load and lead leg block are suspect.
- Plate Side Match is the single most powerful diagnostic metric. It separates timing failures (arm-side, low match) from structural failures (glove-side, high match).

PLATE HEIGHT
- Low Plate Height = Release Height low, VAA steep, or arm collapsing through release.
- High Plate Height = Release Height high, VAA flat, or athlete throwing uphill. Trunk tilt problem.
- Inconsistent Plate Height = Release Height inconsistent upstream. Lead leg block or sequencing.

CROSS-METRIC FLAW IDENTIFICATION — use these patterns to confirm flaws before diagnosing:

HEAVY ARM: Low IVB + low Spin Rate + velocity below physical potential. Release Side may be consistent (delivery repeats) but velocity and movement are weak because the arm is doing the work alone.

BAD BACKSIDE LOAD: Inconsistent Release Side + inconsistent Plate Side + HAA drifting arm-side. Low Extension. Velocity inconsistent. The chain never loaded properly so nothing downstream is consistent.

LATE ARM: Plate Side Match low + Release Height Match high. Arm-side Plate Side misses. Inconsistent HB. The delivery structure is intact but the arm is arriving late to it.

WEAK LEAD LEG BLOCK: Low Extension + inconsistent Release Height + low Velocity bucket. Low IVB, low Spin, steep VAA. Everything downstream of the block is inconsistent because the block never happened consistently.

FLYING OPEN: Plate Side arm-side + low Plate Side Match + low Direction bucket. HAA inconsistent. HB varying. The front side released before the arm was ready.

INCONSISTENT SEQUENCING (no single dominant flaw): High stdev across Release Side, Release Height, AND Plate Side simultaneously. Velocity inconsistent. IVB inconsistent. The chain is firing in a different order every pitch.

================================================================================
FLAW-BASED DRILL SELECTION — BIOMECHANICAL PATTERNING BANK
================================================================================

THE KINETIC CHAIN SEQUENCE THIS SYSTEM TEACHES:
Every plyo drill must teach one or more pieces of this sequence. The sequence is non-negotiable.

1. Rear hip finds and holds internal rotation during leg lift. Front side leg also finds IR without orienting the pelvis or sending the rear hip into external rotation prematurely.
2. The athlete FALLS down the mound. Gravity and momentum drive the sink. Not a muscular push. The rear hip tension is maintained through the entire fall phase.
3. The lead leg catches the fall and blocks hard. This releases all stored rear hip tension upward through the kinetic chain. The lead leg block is a product of everything that happened before foot contact.
4. The ribcage stays closed through foot strike and opens last.
5. The arm comes for the ride. It does not initiate the throw. The arm is the last link in the chain, not the first.

When a mechanical flaw is identified from the data or red flags, select at least one drill from the corresponding flaw category below. These drills teach the pattern, not just correct a symptom. Every drill must connect to the sequence above.

FLAW: HEAVY ARM
Definition: Athlete uses the arm as the primary force generator. The pelvis, trunk, and ribcage are not sequencing properly so the arm fires early and hard to compensate. The arm is not passive — it is doing work it should not be doing.
Data triggers: Early Trunk Rotation flag, low IVB, inconsistent Spin Rate, low Shape bucket, stiff finish, short arm action, arm drag
Drill targets: Teach the arm to be passive. Pelvis fires first, thorax follows, arm arrives last and is pulled through the zone by the sequence — not thrown.

Supine Segmental Roll Throw (100-150g)
Lie flat on your back with knees bent and feet flat on the ground. Hold the plyo ball in the throwing hand with the arm completely relaxed at your side. Begin by rotating the pelvis toward the throwing side — feel the glute and low back initiate. Let the thorax follow the pelvis. Let the shoulder follow the thorax. The arm releases last — it should feel like the ball was pulled out of the hand, not thrown. This drill removes all leg-driven momentum and exaggerates the pelvis-trunk-arm sequence so the athlete can feel the true order.
Weight: 100-150g — light enough that the arm feels passive, not loaded
Cue: Pelvis first, chest second, arm last — the arm is just along for the ride

Infielder Throw (150-200g)
Stand with feet parallel and no stride. Complete a full throw using only rotation — no stride, no leg drive. The absence of a lower half anchor forces the oblique chains to create the throw rotationally. The arm cannot muscle it effectively from this position because there is no lower half momentum to piggyback on.
Weight: 150-200g
Cue: Feel the core pull the arm through — not the arm pulling itself

Reverse Throw (150-200g)
Stand upright facing away from the target. Rock the torso forward to simulate the release position, then rotate the torso only — no leg drive, no hip rotation, torso rotation alone produces the throw. Keep the front knee from collapsing and keep the throwing thumb pointed up throughout. Trains posterior shoulder activation and T-spine counter-rotation before the arm fires, while teaching the trunk to stay stacked rather than collapsing forward.
Weight: 150-200g
Cue: Rock and unwind through the torso — the arm comes last

Seated Rotation Throw (150-200g)
Sit on the ground with legs extended straight in front of you. Complete a full throw against the wall using only the torso and arm from this seated position. Removes all lower half input entirely. Teaches the pure rotational sequence of pelvis-thorax-arm with no compensation available.
Weight: 150-200g
Cue: Rotate through the belly button first — shoulder follows, arm follows the shoulder

Hip-to-Shoulder Separation Hold Drill (no ball first, then 150g)
Stand in stride position. Rotate the pelvis to face the target and hold it there with the chest still closed. Feel the tension between open hips and closed chest. Hold for two seconds. Then release the chest and throw. Teaches the athlete what true hip-shoulder separation feels like before being asked to produce it at full speed.
Weight: Start with no ball. Progress to 150g.
Cue: Hips open and wait — chest stays closed until you choose to open it

FLAW: BAD BACKSIDE LOAD
Definition: Athlete fails to find and maintain internal rotation in the rear hip during leg lift and the sink phase. The rear hip leaks into external rotation early, the pelvis orients prematurely, and the athlete loses the stored tension that should drive hip rotation into the lead leg block. The fall never happens — the athlete pushes instead of falls.
Data triggers: Flying Open flag, Early Trunk Rotation flag, low Direction bucket, rushing in the delivery, early hip turn, weak Lead Leg Block flag, low velocity despite obvious effort, inconsistent Plate Side
Drill targets: Find the rear hip load. Maintain it through the fall. Let the lead leg catch it. The throw happens because the fall was caught — not because the arm was thrown.

Rocker with Rear Hip Pause (150-200g)
Rock back onto the rear leg and pause at the top of the load. At the peak of the load feel the rear hip in internal rotation with the glute engaged and the front hip also slightly internally rotated without the pelvis turning. Hold for two seconds. Then fall forward into the stride and throw. Do not rotate the pelvis to initiate — the fall initiates the sequence.
Weight: 150-200g
Cue: Load the back hip and wait — fall into the throw, do not push into it

Step-Behind with IR Hold (150-200g)
Step the stride foot behind and across the pivot foot, loading the rear hip deeply into internal rotation. Feel the tension build across the entire back side from the glute through the oblique. Step out and throw without releasing the rear hip tension early — let the fall and the lead leg block release it for you.
Weight: 150-200g
Cue: Feel the tension in the back hip — do not let it go until the front foot lands

Single Leg Deadlift into Throw (150g)
Hinge onto the rear leg in a single leg deadlift position. This loads the glute and maintains the hip in internal rotation naturally without having to think about it. From this position step forward and throw. Teaches the sensation of a properly loaded rear hip and how it transitions into forward movement.
Weight: 150g — light enough to focus on the sensation not the throw
Cue: Push the ground away — do not step away from the ground

Roll-In Throw (150-225g)
Face the target directly. Take one walking step toward the target while keeping the hips facing the catcher the entire time — the hips do not rotate during the step. As you plant, rotate the shoulders toward the target while the hips stay facing forward, creating separation between hips and shoulders before throwing. This teaches the athlete to feel hip-shoulder separation building dynamically through a walking step rather than from a static position.
Weight: 150-225g depending on intent level
Cue: Hips stay facing the catcher — shoulders rotate, hips do not

FLAW: LATE ARM / ARM LAG
Definition: The trunk rotates before the arm is organized in layback. The arm arrives late and has to accelerate under stress to catch up to the body. Creates excessive shoulder and elbow stress. Distinct from Flying Open — this is a timing issue, not a direction issue.
Data triggers: Plate Side Match below 0.33, Release Height Match above 0.66, low Command bucket, ARM LAG flag active
Drill targets: Connect the arm to the sequence earlier. Scapular load must happen simultaneously with hip-shoulder separation — not after the trunk has already begun rotating.

Pivot Pickoff with Early Scap Load (150-225g)
From the pivot position, initiate the scapular load the moment the hips begin to rotate — not after. The scap should be retracted and the arm should be approaching layback as the front foot plants. Train this timing specifically — the arm is being organized while the hips are opening, not after.
Weight: 150-225g
Cue: Scap loads when hips open — not after the hips open

90/90 Wall Throw with Layback Hold (150-275g)
Get into the 90/90 position against the wall. Before throwing, actively load the scap and hold the full layback position for one second. Feel the arm completely organized before the throw happens. Then throw from that organized position. Teaches the difference between an arm that arrives on time versus one that is still catching up.
Weight: 150-275g depending on intent
Cue: Get the arm ready before you throw — not during

Step-Back with Arm Timing Constraint (150-200g)
Step back to load, but apply one specific constraint: the arm must be in external rotation before the front foot lands. If the arm is not organized at foot strike, stop and reset. Do not complete the throw until the arm timing is correct. Teaches the athlete to feel and control when the arm arrives in the sequence.
Weight: 150-200g
Cue: Arm in layback before the foot lands — then and only then throw

FLAW: WEAK LEAD LEG BLOCK
Definition: The front knee collapses at or after foot strike, dissipating the energy that should transfer up the kinetic chain into the throw. The lead leg becomes a gate that swings open rather than a wall that stops the body and forces energy upward.
Data triggers: Low Velocity bucket, low IVB, low Spin Rate, Weak Lead Leg Block flag active, forward trunk tilt, inconsistent Release Height, low p14 velocity scaling
Drill targets: Brace and stop. The front leg is a wall. Everything upstream of the block depends on the block existing.

Lead Leg Block Stomp Drill (150-225g)
Walk into the stride position and stomp the front foot aggressively into the ground. The emphasis is entirely on the stomp and brace — the throw is almost secondary. Commit to the block first, then let the arm release. If the focus is on the throw, the block will collapse again.
Weight: 150-225g
Cue: Stomp and stop — then let it go

Stride and Freeze (no ball first, then 150g)
Take a full stride and freeze completely at foot strike with the front leg fully braced — front knee straight, front hip blocked, weight transferred. Hold for two seconds. Feel what a true block position feels like with no momentum carrying you through it. From that frozen position, complete the throw.
Weight: Start with no ball. Progress to 150g.
Cue: Stick the landing — feel the front leg like a post in the ground

Downhill Lead Leg Block Throw (175-225g)
Find a pitching mound or slight downward slope. Stride down the slope and drive aggressively into the lead leg block at the bottom. The slope amplifies the forward fall and makes a firm block mechanically necessary — the athlete cannot collapse the front leg without falling forward visibly.
Weight: 175-225g
Cue: Fall into the block — the slope does the work, you just stop it


================================================================================
DRILL PROGRESSION MODEL — ISOMETRIC TO DYNAMIC TO FREE
================================================================================

Every flaw category follows the same four-stage progression model. This is not optional — it determines which specific drill within a category to select, and how to advance an athlete across sessions.

STAGE 1 — ISOMETRIC HOLD (capture the position)
The athlete finds the correct position and holds it under tension with no movement. The goal is pure position awareness — feeling where the body should be before being asked to move through it. Use this stage when the athlete has never demonstrated the position before, or when red flags indicate the position is being lost entirely (not just inconsistently).

STAGE 2 — REPETITIONS IN POSITION (build the pattern)
The athlete repeats the position multiple times with light movement, reinforcing the same hold from Stage 1 but now building a repeatable pattern. Use this stage once the athlete can find the position in Stage 1 consistently but has not yet built a rhythm or repeatable pattern around it.

STAGE 3 — DROP AND RECAPTURE (dynamic re-acquisition)
The athlete unweights or destabilizes the position and must recapture it dynamically — simulating the real-time demand of the delivery where the position must be found and held under motion, not in a static setup. Use this stage once Stage 2 is consistent and the athlete is ready to prove the position holds under more realistic, less controlled conditions.

STAGE 4 — FREE EXECUTION (remove constraints)
All constraints are removed. The athlete performs the full drill or delivery and the position must hold on its own without cues, holds, or artificial constraint. This is the test of whether the pattern has actually been acquired. Use this stage once Stage 3 is consistent.

CRITICAL PROGRESSION RULE:
Once a drill concept is working for an athlete, do not swap to a different concept. Advance the SAME concept through the next stage. If Rocker with Rear Hip Pause (Stage 1, isometric) has been successful for an athlete across sessions, the next session should progress to Step-Behind with IR Hold or a dynamic variation of the same rocker concept (Stage 2 or 3) — not switch to an unrelated drill. The phrase to follow is "if it isn't broken, don't fix it" — progress the same concept, do not replace it.

MAPPING DRILLS TO PROGRESSION STAGES WITHIN EACH FLAW CATEGORY:

BAD BACKSIDE LOAD:
Stage 1 (isometric): Rocker with Rear Hip Pause — hold the loaded position with no movement, find the rear hip IR feeling in isolation
Stage 2 (reps in position): Step-Behind with IR Hold — repeat the load with light movement, build the pattern of finding it
Stage 3 (drop and recapture): Single Leg Deadlift into Throw, Roll-In Throw — the athlete must find and re-find the load dynamically through movement
Stage 4 (free): Full delivery with no cues — backside load must hold on its own during a bullpen or live throw

HEAVY ARM:
Stage 1 (isometric): Hip-to-Shoulder Separation Hold Drill (no ball) — hold the separation position statically
Stage 2 (reps in position): Supine Segmental Roll Throw — repeat the sequence slowly and deliberately
Stage 3 (drop and recapture): Infielder Throw, Seated Rotation Throw — dynamic rotation without a stable lower half to lean on
Stage 4 (free): Reverse Throw progressed to full speed, then full delivery with no cues

LATE ARM / ARM LAG:
Stage 1 (isometric): 90/90 Wall Throw with Layback Hold — hold the organized arm position statically against the wall
Stage 2 (reps in position): Pivot Pickoff with Early Scap Load — repeat the timing connection at moderate speed
Stage 3 (drop and recapture): Step-Back with Arm Timing Constraint — the constraint forces the athlete to find arm timing dynamically or the rep does not count
Stage 4 (free): Full bullpen with no timing cue — arm must arrive on time without being told

WEAK LEAD LEG BLOCK:
Stage 1 (isometric): Stride and Freeze (no ball) — hold the braced block position statically with no throw
Stage 2 (reps in position): Stride and Freeze progressed to include the throw — repeat the brace into a throw
Stage 3 (drop and recapture): Lead Leg Block Stomp Drill, Downhill Lead Leg Block Throw — the slope or stomp forces dynamic re-acquisition of the brace under more force
Stage 4 (free): Full bullpen or Run and Gun with no cue — block must hold on its own under full intent

HOW TO DETERMINE WHICH STAGE AN ATHLETE IS AT:
- If this is the first session addressing this flaw, or if the position is completely absent in images/data, start at Stage 1.
- If prior session history shows this same flaw category was addressed and the metric or image evidence improved, advance to the next stage rather than repeating Stage 1.
- If prior session history shows this flaw category was addressed but the metric or image evidence did NOT improve, stay at the same stage or regress one stage rather than advancing.
- Never skip a stage. An athlete cannot go from Stage 1 directly to Stage 4.
- Note the stage explicitly in the Goal line of the plyo section so progression is visible across sessions: "Goal: Stage 2 — building the backside load pattern through repetition before progressing to dynamic re-acquisition."

================================================================================
FLAW CATEGORY PRIORITY — WHEN MULTIPLE FLAWS ARE TRIGGERED
================================================================================

Bad Backside Load is the foundational flaw. It is the root of the kinetic chain — the rear hip load and fall is the first event in the entire delivery, and every subsequent piece of the chain depends on it. If Bad Backside Load is triggered alongside any other flaw category, address Bad Backside Load as the primary flaw. Do not blend equal representation from both categories.

PRIORITY ORDER (highest to lowest):
1. BAD BACKSIDE LOAD — always primary if triggered. This is the root cause of most other flaws. A late arm, a weak lead leg block, or a heavy arm pattern frequently trace back to a backside that never loaded correctly. Fixing the backside often resolves these downstream symptoms without needing to address them directly.
2. WEAK LEAD LEG BLOCK — second priority if Bad Backside Load is not triggered, or as a close secondary focus if it is. The block is the next link in the chain after the backside load and fall.
3. LATE ARM / ARM LAG — third priority. Often a downstream symptom of either Bad Backside Load or Weak Lead Leg Block rather than an independent problem.
4. HEAVY ARM — fourth priority. The most downstream of the four flaws. An arm that is working too hard is very often compensating for a chain that did not deliver energy correctly from the ground up.

WHEN MULTIPLE FLAWS ARE TRIGGERED:
- Identify the highest priority flaw using the order above.
- The plyo routine's primary emphasis (Position 1 and Position 2 drills, and the most prominent placement) goes to the highest priority flaw.
- If a lower priority flaw is also triggered, you may include ONE drill from that category later in the sequence (Position 3 or 4) as secondary work, but do not give it equal weighting in the routine.
- In the Limiter Identified line, name both the primary and secondary flaw, and explain in one sentence why the primary flaw is being prioritized: "Limiter identified: Bad Backside Load (primary) with Late Arm pattern present as a likely downstream symptom — prioritizing backside load correction before addressing arm timing directly."
- Do not treat all triggered flaws as equally important. A program addressing four flaws at once is unfocused and will not produce results. Pick the root, fix the root.

================================================================================
IMAGES AND DATA AS EQUAL PARTNERS FOR STAGE PLACEMENT AND FLAW CONFIRMATION
================================================================================

Images and Trackman data are equal partners, not a ranked hierarchy. The images reflect how the numbers are created — they show the actual position that produces the output the data measures. Treat them as two views of the same delivery, not as competing sources where one wins by default.

IMPORTANT: An athlete can have a broken position and still produce decent velocity or movement numbers if they have an exceptional strength or elasticity profile. Raw physical ability can mask a mechanical flaw in the output data even when the flaw is clearly visible in the image. This does not mean the flaw is acceptable — it means this athlete is currently getting away with it on physical talent rather than efficiency. The flaw still needs to be addressed, because it caps the athlete's ceiling and is very likely to cost them down the line as physical talent alone stops being enough, or it becomes an injury risk regardless of current output. When this situation occurs, state it directly: the position is broken even though the numbers do not yet show it, and physical ability is currently compensating for the inefficiency.

STAGE PLACEMENT FROM IMAGES:
- If an image clearly shows the target position being held correctly (for example, the rear knee pinched and loaded inward at Bottom of the Drop), this is strong evidence the athlete has acquired at least Stage 1 for that flaw category. Do not place the athlete back at Stage 1 if the image already shows the position has been found, even if this is the first session with image data. Start at Stage 2 or higher based on what the image shows.
- If an image shows the position breaking down or absent entirely (for example, the rear knee flaring outward at Bottom of the Drop), this confirms Stage 1 is the correct starting point regardless of what the data alone might have suggested, and regardless of whether the data still looks acceptable due to the athlete's physical profile.
- If an image shows the position partially held — present but inconsistent or collapsing under tension — this places the athlete at Stage 2, working on repetition and consistency rather than initial acquisition.
- If multiple images are provided across different positions in the delivery, and they tell a consistent story, that consistency is strong confirmation of the stage placement. If they conflict — for example Peak Leg Lift looks loaded but Bottom of the Drop shows the knee has already flared — trust the later position in the sequence, since it represents what actually happened after the earlier position, and flag this directly in the diagnosis as a key finding: the load was present but was lost during the drop.

FLAW CONFIRMATION FROM IMAGES AND DATA TOGETHER:
- Use the cross-reference rule already defined in the image analysis section to connect image findings with data findings — both are needed for a complete picture.
- If the image clearly shows a broken position, select drills for that flaw category even if the data looks clean. Note in the diagnosis that the athlete's physical ability or elasticity is currently producing acceptable output despite the mechanical inefficiency, and that addressing it now protects both ceiling and durability.
- If the image confirms a flaw that the data also shows, state this directly in the Limiter Identified line: "Limiter identified: Bad Backside Load, confirmed by Bottom of the Drop image showing the rear knee flaring outward into external rotation rather than holding the pinch."
- If the image looks clean but the data shows a clear flaw signature, consider that the image may have been taken on a rep that does not represent the athlete's typical pattern, or the issue may be occurring at a different point in the chain than the one photographed. Note this directly and recommend the coach capture images at the position the data suggests is breaking down.
- Never silently ignore a conflict between image and data. Always name it in the diagnosis and explain the reasoning, including whether physical talent is masking a mechanical inefficiency.

WHAT THIS LOOKS LIKE IN THE GOAL LINE:
"Goal: Stage 2 — repetition work on the backside load pattern. The Bottom of the Drop image shows the rear knee finding the pinch position but losing it inconsistently across the delivery; this session builds repeatable consistency before progressing to dynamic re-acquisition in Stage 3."

If no images are provided, fall back to using prior session history and data trends alone to determine stage, as already defined in the progression model above.

================================================================================
SEQUENTIAL MECHANICAL CHAIN — FINDING THE EARLIEST BREAK
================================================================================

The delivery is one continuous, connected movement. Peak Leg Lift, Bottom of the Drop, Foot Strike, Max Layback, and Release Point are not five independent checkpoints to grade in isolation — they are five consecutive links in a single chain, and a break at any link compromises every link that follows it. You cannot fix Foot Strike in isolation if Peak Leg Lift already failed, because Foot Strike was never given a correct position to work from.

THE CORRECT CONNECTED SEQUENCE (this is the standard every image is evaluated against):

1. PEAK LEG LIFT: The stride foot maintains medial foot contact (weight on the inside of the foot, not rolling to the outside edge). The rear knee avoids external rotation — it stays pinched and tracking inward, not flaring out. The rear hip is loaded and coiled in internal rotation. This is the foundational position. Everything downstream depends on this being correct.

2. BOTTOM OF THE DROP: The athlete holds the Peak Leg Lift position through the drop and catches a slight impulse that propels them into the ride phase. The internal rotation in the back hip must be HELD through this phase, not released yet. The shoulders stay closed. This is a continuation and preservation of what was loaded in step 1 — it is not a new position, it is proof that step 1 is being maintained under motion.

3. FOOT STRIKE (RIDE INTO FRONT LEG): The held internal rotation in the back hip is finally released into rotation toward the front leg. The hips begin opening while the shoulders remain closed — this is the hip-shoulder separation moment. The front foot lands and the hips continue rotating into a firm front leg. This step only works correctly if the internal rotation was actually preserved through steps 1 and 2 — if it leaked early, there is nothing to release here and the hips will rotate weakly or too early.

4. MAX LAYBACK: The hips have rotated into the firm front leg. The arm reaches max layback as this rotation completes. This position is a downstream result of a firm front leg accepting the rotational energy that was built and preserved since Peak Leg Lift.

5. RELEASE POINT: The front leg locks out at the moment of release, stopping the forward momentum of the hips and torso so that ground reaction force already traveled up the body can finish into the ball — creating the whip effect through the arm. This is the final expression of everything that happened in steps 1 through 4. A clean release with a collapsed or weak lock-out at this stage usually traces back to a failure much earlier in the chain, not a release-point problem in isolation.

================================================================================
HOW TO USE THIS CHAIN FOR DIAGNOSIS AND DRILL SELECTION
================================================================================

WHEN IMAGES ARE PROVIDED, evaluate them in chain order, not independently:

CHAIN STEP 1: Look at Peak Leg Lift first, always. Check medial foot contact, rear knee IR (no flaring), and rear hip load. If this position is broken, this is very likely the root cause of the month's program, regardless of what later images or data show. A break here invalidates clean-looking evaluation of every later position, because those later positions are likely compensating for or masking this earlier failure.

CHAIN STEP 2: If Peak Leg Lift looks correct, check Bottom of the Drop for whether the internal rotation loaded in chain step 1 is being PRESERVED through the drop, or whether it is leaking out before the ride phase even begins. A clean Peak Leg Lift followed by a leaking Bottom of the Drop means the athlete can find the position but cannot hold it under motion — this is a different problem than not being able to find it at all, and requires different drill selection (Stage 2 or 3 of the progression model, not Stage 1).

CHAIN STEP 3: If chain steps 1 and 2 are clean, check Foot Strike for whether the held rotation is being released correctly into a firm front leg with the proper hip-shoulder separation (hips opening, shoulders staying closed). If this breaks down despite clean upstream positions, the issue is isolated to the release/timing of the rotation itself, not the loading of it.

CHAIN STEP 4 and 5: Only evaluate Max Layback and Release Point as independent problems if everything upstream (chain steps 1-3) is clean. If upstream positions are broken, Max Layback and Release Point issues are almost always downstream symptoms — note this in the diagnosis, but do not build the program around fixing them directly. Fixing the upstream cause will very likely resolve them as a byproduct.

================================================================================
MONTHLY PROGRAM PRIORITY RULE
================================================================================

Identify the EARLIEST point in the chain (steps 1 through 5) where a break occurs. This becomes the PRIMARY MECHANICAL GOAL for the month-long program — it gets the most prominent drill placement, the most session-to-session progression attention, and the clearest explanation in the diagnosis.

Every other position further down the chain is still touched in the program (do not ignore them entirely — the athlete is still throwing and still needs arm care and some variety) but they are addressed as MAINTENANCE or SECONDARY work, not as the main focus, until the primary goal shows real progress across sessions.

This means:
- If Peak Leg Lift is broken, that is the month's primary goal. Drills targeting medial foot contact, rear knee IR, and hip loading get top placement (Position 1 of the biomechanical drill order) every session, progressing through the Stage 1-4 model across the month. Bottom of the Drop, Foot Strike, Max Layback, and Release Point are touched at lower intent and lower drill volume as maintenance, with the explicit understanding in the diagnosis that improvement here is expected to be partly a byproduct of fixing Peak Leg Lift, not the direct target yet.
- If Peak Leg Lift is clean but Bottom of the Drop shows the load leaking, that becomes the month's primary goal instead — different drills, different stage placement, even though Peak Leg Lift drills may still appear briefly as a foundation reminder.
- This priority shifts down the chain over time. As the primary goal at the earliest break shows clear progress (confirmed by images and data together, both within this prompt's existing rules), the next session's primary goal can shift to the next link in the chain that needs work, even if that link was previously treated as maintenance.

STATE THE MONTHLY PRIORITY EXPLICITLY in the diagnosis: "This month's primary mechanical goal is correcting the rear hip load at Peak Leg Lift. The Bottom of the Drop, Foot Strike, and release point issues you can see in the data are very likely downstream consequences of this — we are not ignoring them, but we expect meaningful improvement in those areas as a byproduct once the backside load is corrected, rather than addressing each one as a separate problem this month."

================================================================================
IMAGES AND DATA WORKING TOGETHER — EQUAL WEIGHTING
================================================================================

Images and Trackman data are equally important sources of evidence and must be used together, not in a strict hierarchy. Each fills a gap the other cannot:

- Data shows you the outcome and the consistency across 10 pitches — something a single image cannot show, since an image is one frozen frame from a recent session.
- Images show you the actual position and movement quality — something data cannot show directly, since metrics are downstream numerical outcomes, not visual proof of the position itself.

WHEN THEY AGREE: This is strong confirmation. State both pieces of evidence together in the diagnosis and proceed confidently with the chain-priority logic above.

WHEN THEY DISAGREE: Investigate why before deciding which to trust.
- If the image clearly shows a broken position (for example, rear knee flaring at Peak Leg Lift) but the data looks clean, trust the image as the more direct evidence — the data may not be sensitive enough to catch this specific position fault across only 10 pitches, or the athlete may be compensating downstream in a way that still produces acceptable numbers despite the faulty position. Flag this directly: the position is broken even though current output metrics have not yet been affected — this is the earliest opportunity to correct it before it costs the athlete velocity or command.
- If the image looks clean but the data shows a clear flaw signature, consider that the image may have been taken on a rep that does not represent the athlete's typical pattern, or the issue may be occurring at a different point in the chain than the one photographed. Note this directly and recommend the coach capture images at the position the data suggests is breaking down.
- Never silently ignore a conflict. Always name it in the diagnosis and explain the reasoning for which signal is being prioritized and why.

================================================================================
DRILL SELECTION INTEGRATION RULE
================================================================================
BIOMECHANICAL DRILL ORDER — GROUND UP SEQUENCING
================================================================================

Plyo drills must be ordered from the ground up following the kinetic chain sequence. Each drill teaches one piece of the sequence and builds on the previous drill. The athlete should be able to feel the progression from one drill to the next — each one adds one more link in the chain.

CORRECT BIOMECHANICAL ORDER:

Position 1 — REAR HIP LOAD AND FALL (ground initiation)
The first drill must address the foundation of the delivery. The rear hip loads, finds internal rotation, and the athlete learns to fall rather than push. No delivery works without this piece. Select from: Rocker with Rear Hip Pause, Step-Behind with IR Hold, Single Leg Deadlift into Throw, Walking Wind-Up with Pause at Peak.
Weight: Lightest of the routine. This is patterning work. 100-175g.

Position 2 — PELVIS AND LOWER HALF SEQUENCING
The second drill adds the hip-to-shoulder separation piece. The pelvis fires while the chest stays closed. The athlete feels the tension between the lower half moving and the upper half waiting. Select from: Hip-to-Shoulder Separation Drill, Step-Behind Drill, QB Drop Drill, Rocker with Full Stride, Roll-In Throw.
Weight: Light to mid. 150-225g.

Position 3 — LEAD LEG BLOCK AND ENERGY TRANSFER
The third drill introduces the lead leg block as the pivot point that stops the body and transfers energy upward. Without the block there is no whip. Select from: Lead Leg Block Drill, Lead Leg Block Stomp Drill, Stride and Freeze, Downhill Lead Leg Block Throw, Pivot Pickoff with Stride.
Weight: Mid. 175-250g. Heavy enough to feel the block under load.

Position 4 — ARM PATH AND CONNECTION (ribcage closed, arm organizing)
The fourth drill adds the arm to the sequence. The ribcage is still closed. The arm is organizing into layback while everything below it has already fired. Select from: Pivot Pickoff, 90/90 Stationary Throw with Hold, Pivot Pickoff with Early Scap Load, Step-Back with Arm Timing Constraint, Lasso Drill.
Weight: Mid to heavy. 200-300g. Heavy enough to feel the scap load and layback.

Position 5 — FULL PATTERN HIGH INTENT (everything fires in sequence)
The final drill is the highest intent drill in the routine. All pieces of the chain are present. The goal is to execute the full sequence at speed and feel the arm arrive last as a result of everything below it working correctly. Select from: High Intent Roll-In Throw, High Intent Step-Back Throw, High Intent Pivot Pickoff, High Intent Crow Hop, Reverse Throw (High Intent).
Weight: Heaviest of the routine. 275-450g depending on age and intent level.

CRITICAL ORDER RULE:
Never put a high intent velocity drill before the lower half patterning drills. Never put an arm path drill before the lead leg block drill. The order is not flexible — it is the teaching sequence of the kinetic chain itself. An athlete who cannot feel the rear hip load in drill 1 will not be able to use the arm path drill in drill 4 correctly. Build from the ground up every session.

HOW THIS 5-POSITION ORDER INTERACTS WITH THE MONTHLY PRIORITY RULE:
The 5 positions are not five mandatory slots to fill every session. They are the ground-up order in which drills must be sequenced WHEN they appear. The actual content of the routine is governed by where the chain breaks down, per the Sequential Mechanical Chain and Monthly Program Priority Rule.

- The majority of the routine's volume and intent goes to the broken link, progressing that single concept from slower and more isometric toward faster and more dynamic across sessions, per the Stage 1-4 progression model. This is not a full month of isometric work in isolation — the progression itself moves the athlete toward more dynamic, more demanding expressions of the same position.
- Once the broken link is showing real progress, do not jump straight to the end of the chain. Test the athlete by connecting the corrected link to the next one or two links downstream — for example, if Peak Leg Lift was the break and is now holding, the next test is whether the athlete can carry that load through Bottom of the Drop and into Foot Strike, not whether they can suddenly execute a clean Release Point. Build the chain back together one or two links at a time, not the whole thing at once.
- A routine can legitimately consist mostly of drills targeting the broken link plus one drill connecting it to the next link downstream as a test. It does not need to populate all 5 positions every session if doing so would mean including drills for parts of the chain that have not been earned yet.
- Do not include a Position 5 high-intent full-pattern drill just to complete the template if the athlete has not yet shown the broken link holding through at least the next link downstream. A high-intent full-pattern drill performed on top of an unresolved break in the chain reinforces the broken pattern at speed, which is counterproductive.
- As the broken link and its immediate downstream connection both become reliable, continue extending the chain forward one link at a time, eventually arriving at full Position 5 high-intent work once the entire sequence has been rebuilt and connected.

If a flaw-specific drill is prescribed from the flaw bank, insert it at the position in the sequence that corresponds to the piece of the chain it addresses:
- Rear hip and backside drills go in Position 1 or 2
- Lead leg block drills go in Position 3
- Arm path and late arm drills go in Position 4
- Heavy Arm drills (Supine Segmental Roll, Infielder Throw, Seated Rotation) go in Position 1 or 2 because the flaw is a sequencing failure that starts at the base of the chain

================================================================================

When building the plyo routine, always check the flaw categories above before selecting drills from the general bank. If a flaw is active — either from data triggers or from a red flag — the routine must include at least one drill from that flaw category. The routine should tell the story of the kinetic chain from ground up. Every drill must connect to one piece of the sequence. The athlete should be able to feel what they are working on and why.
${longitudinalBlock}

REQUIRED OUTPUT FORMAT — follow exactly. No asterisks, no decorative dashes, no markdown anywhere.

Athlete: ${info.name}
Age: ${info.age} (${ageTier}) | Height: ${info.height||'N/A'} in | Throwing Hand: ${info.hand} | Position: ${info.position}
Date: ${new Date().toLocaleDateString()} through ${new Date(Date.now()+30*24*60*60*1000).toLocaleDateString()}

COACHING DIAGNOSIS

[One paragraph. No labels. What this athlete does well, what is limiting them, the specific mechanical cause, the earliest break in the sequential chain, this month's primary mechanical goal, how it all connects, what changes when fixed. Red flags woven in naturally. Plain language. No bucket numbers. If longitudinal data is present, reference what has improved or stalled and whether the monthly priority has shifted.]

IMAGE ANALYSIS

[Only include this section if images were provided. One to two sentences per image, in chain order, identifying the earliest break and cross-referencing with data per the equal-weighting rule.]

DAILY STRUCTURE

Dynamic Warm Up
[Each movement on its own line: movement name, sets and reps or duration. Tailored to this athlete's limiter and needs.]

Band Work
Reverse T's
Reverse Y's
Pec Fly's
Overhead Tricep Extension
Low ER/IR
High ER/IR

Plyo Drills

Limiter identified: [primary limiter bucket AND specific mechanical cause — name primary and secondary flaw if multiple triggered, with one-sentence priority reasoning]
Red flags active: [list all triggered flags or write None]
Progression stage: [state the stage — Stage 1 isometric, Stage 2 reps in position, Stage 3 drop and recapture, or Stage 4 free — and whether image evidence informed this placement]
Weight strategy: [one sentence explaining weight progression for this specific athlete's cause and stage]
Goal: [one sentence — specific to this athlete and stage. Must differ between athletes with different causes even if bucket is the same.]

[Drill Name]
Weight: [Xg]
Reps: 1x8
Why this drill: [one sentence connecting to specific cause and progression stage above]
Cue: [one sentence]
How to perform: [2-3 sentences step-by-step]

[4-5 drills in biomechanical sequence order — ground up]

HIGH INTENT DAY

Catch Play Arc
Start at 30-45 feet, build out to Max Long Toss
[Number of throws at max distance]
On the way back in: [drill name and one-sentence cue]
Feed directly into main event with no break

[Main Event Name]
[Run and Gun: each weight on its own line with reps / Bullpen: pitch count and focus]
Cue: [one coaching cue]
Constraint: [one constraint tied to specific mechanical cause]

Post-Throw Arm Care

Stressors identified: [one sentence — specific delivery stressors and flags driving selection for this athlete]

[Exercise Name]
How to perform: [step-by-step. Athlete performs with no other instruction.]
Sets and Reps: [prescription]
Why: [one sentence tied to specific stressor for this athlete]

[4-6 exercises. High intent: deceleration, posterior shoulder, scapular control, T-spine mobility, hip IR restoration. Must reflect this athlete's specific flags.]

MID INTENT DAY

Catch Play Arc
Start at 30-45 feet, build out to Max Long Toss
[Number of throws at max distance]
On the way back in: [drill name and cue]
Feed directly into main event with no break

[Main Event Name]
[Prescription]
Cue: [one coaching cue]
Constraint: [one constraint]

Post-Throw Arm Care

Stressors identified: [one sentence]

[Exercise Name]
How to perform: [step-by-step]
Sets and Reps: [prescription]
Why: [one sentence]

[4-6 exercises. Mid intent: recovery, maintenance, breathing-based reset. Must reflect this athlete's flags.]

LOW INTENT DAY

Catch Play Arc
Start at 30-45 feet, build out to [prescribed Light Long Toss distance]
[Number of throws at prescribed distance]
On the way back in: [drill work tied to limiter cause and red flags]

Post-Throw Arm Care

Stressors identified: [one sentence]

[Exercise Name]
How to perform: [step-by-step]
Sets and Reps: [prescription]
Why: [one sentence]

[4-6 exercises. Low intent: blood flow, patterning, breathing-based thorax and pelvis reset.]

ATHLETE DATA
Athlete: ${info.name} | Age: ${info.age} (${ageTier}) | Hand: ${info.hand} | Position: ${info.position} | Height: ${info.height||'N/A'} in
Primary Focus: ${focus}
Velo Maker: ${bestMetric}
Velo Maker Note: ${veloMakerNote}
Velocity Profile: ${veloProfile}

Buckets (programming logic only — never quote in output):
Direction: ${f2(bArr[0])} | Velocity: ${f2(bArr[1])} | Shape: ${f2(bArr[2])} | Arm Action: ${f2(bArr[3])} | Command: ${f2(bArr[4])}
Lowest bucket: ${lowestBucketName}

Primary Anchors: Velo ${f1(c13)} (${veloContext}) | Ext ${f1(d13)} | RelSide ${f1(a13)} | RelHt ${f1(h13)} | IVB ${f1(e13)} (${ivbContext}) | HB ${f1(f13)} | Spin ${f1(i13)} (${spinContext})
Secondary: VAA ${f1(g13)} | HAA ${f1(b13)}
Tertiary: PlateSide ${f1(j13)} | PlateHt ${f1(k13)}
Helpers: PredPlateSide ${f2(n13)} | PredRelHt ${f2(o13)} | PlateSideMatch ${f2(n14)} | RelHtMatch ${f2(o14)} | VeloScale ${f2(p14)}

DATA RULES:
- PlateSideMatch ${f2(n14)}: ${n14!==null&&n14<0.33?'LOW = timing issue, arm late, not structural':n14!==null&&n14>0.66?'HIGH = matches delivery, structural or directional issue':'MODERATE = use other indicators'}
- RelHtMatch ${f2(o14)}: ${o14!==null&&o14>0.66?'HIGH = release height structurally consistent':o14!==null&&o14<0.33?'LOW = inconsistent, likely sequencing':'MODERATE = check other indicators'}
- Velo Maker is ${bestMetric}: ${veloMakerNote}
- Lowest bucket is ${lowestBucketName} — identify specific mechanical cause before selecting any drill
- Evaluate all 7 red flags before writing the diagnosis
- For ARM DROP flag: athlete is ${info.height||'unknown'} inches tall. Research optimal extension range for this height and evaluate whether ${f1(d13)} inches of extension is appropriate, excessive, or within range
- Age group is ${ageTier}: velocity floor ${veloFloor} mph, IVB floor ${ivbFloor} inches, spin floor ${spinFloor} rpm
- Velocity ${f1(c13)} mph: ${veloContext}
- IVB ${f1(e13)} inches: ${ivbContext}
- Spin Rate ${f1(i13)} rpm: ${spinContext}`;
}


// ─── RADAR CHART ────────────────────────────────────────────────────────────
function RadarChart({ scores, labels, size = 220 }) {
  const cx = size/2, cy = size/2, r = size*0.38;
  const n = labels.length;
  const pts = (vals, scale=1) => vals.map((v,i) => {
    const a = (i/n)*2*Math.PI - Math.PI/2;
    return [cx + r*v*scale*Math.cos(a), cy + r*v*scale*Math.sin(a)];
  });
  const gridLevels = [0.25,0.5,0.75,1.0];
  const colors = ['#E84855','#F4A261','#2EC4B6','#3A86FF','#8338EC'];
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {gridLevels.map(lv => {
        const gpts = pts(Array(n).fill(lv));
        return <polygon key={lv} points={gpts.map(p=>p.join(',')).join(' ')} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>;
      })}
      {Array.from({length:n},(_,i)=>{
        const a=(i/n)*2*Math.PI-Math.PI/2;
        return <line key={i} x1={cx} y1={cy} x2={cx+r*Math.cos(a)} y2={cy+r*Math.sin(a)} stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>;
      })}
      <polygon points={pts(scores).map(p=>p.join(',')).join(' ')} fill="rgba(58,134,255,0.25)" stroke="#3A86FF" strokeWidth="2"/>
      {pts(scores).map((p,i) => <circle key={i} cx={p[0]} cy={p[1]} r="4" fill={colors[i]}/>)}
      {labels.map((l,i)=>{
        const a=(i/n)*2*Math.PI-Math.PI/2;
        const lx=cx+(r+22)*Math.cos(a), ly=cy+(r+22)*Math.sin(a);
        return <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="rgba(255,255,255,0.7)" fontFamily="'DM Mono', monospace">{l}</text>;
      })}
    </svg>
  );
}

// ─── LINE CHART ─────────────────────────────────────────────────────────────
function LineChart({ sessions }) {
  if(!sessions||sessions.length<1) return <div style={{color:'rgba(255,255,255,0.3)',fontSize:13,textAlign:'center',padding:'2rem'}}>No session data yet</div>;
  const w=500, h=160, pad={t:16,r:16,b:32,l:40};
  const iw=w-pad.l-pad.r, ih=h-pad.t-pad.b;
  const scores = sessions.map(s=>s.overall!==null?Math.round(s.overall*100):0);
  const xScale = i => pad.l + (sessions.length>1?i/(sessions.length-1):0.5)*iw;
  const yScale = v => pad.t + ih - (v/100)*ih;
  const pathD = scores.map((v,i)=>`${i===0?'M':'L'}${xScale(i)},${yScale(v)}`).join(' ');
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{overflow:'visible'}}>
      {[0,25,50,75,100].map(v=>(
        <g key={v}>
          <line x1={pad.l} y1={yScale(v)} x2={pad.l+iw} y2={yScale(v)} stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
          <text x={pad.l-6} y={yScale(v)} textAnchor="end" dominantBaseline="middle" fontSize="9" fill="rgba(255,255,255,0.3)" fontFamily="'DM Mono',monospace">{v}</text>
        </g>
      ))}
      <path d={pathD} fill="none" stroke="#3A86FF" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
      <path d={pathD+` L${xScale(sessions.length-1)},${yScale(0)} L${xScale(0)},${yScale(0)} Z`} fill="url(#lineGrad)" opacity="0.3"/>
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3A86FF" stopOpacity="0.8"/>
          <stop offset="100%" stopColor="#3A86FF" stopOpacity="0"/>
        </linearGradient>
      </defs>
      {scores.map((v,i)=>(
        <circle key={i} cx={xScale(i)} cy={yScale(v)} r="4" fill="#3A86FF" stroke="#0a0a0f" strokeWidth="2"/>
      ))}
      {sessions.map((s,i)=>(
        <text key={i} x={xScale(i)} y={h-6} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.3)" fontFamily="'DM Mono',monospace">
          {new Date(s.date).toLocaleDateString('en',{month:'numeric',day:'numeric'})}
        </text>
      ))}
    </svg>
  );
}

// ─── CSV UPLOAD ──────────────────────────────────────────────────────────────
function CsvUpload({ onLoad }) {
  const [status, setStatus] = useState('');

  const handleFile = (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target.result;
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

        // Find rows 3-12 (index 2-11 if 1-indexed, but CSV may not have header)
        // Strategy: take up to 10 rows that have at least 11 columns of numeric data
        const dataRows = [];
        for(let i = 0; i < lines.length && dataRows.length < 10; i++) {
          const cols = lines[i].split(',').map(v => v.trim().replace(/"/g,''));
          if(cols.length >= 11) {
            // Check if columns A-K (0-10) look numeric
            const vals = cols.slice(0, 11);
            const numericCount = vals.filter(v => v !== '' && !isNaN(parseFloat(v))).length;
            if(numericCount >= 8) { // at least 8 of 11 columns are numeric
              dataRows.push(vals.map(v => v === '' || isNaN(parseFloat(v)) ? '' : v));
            }
          }
        }

        if(dataRows.length === 0) {
          setStatus('No valid pitch data found. Make sure the CSV has 11 columns of numeric data.');
          return;
        }

        // Pad to 10 rows if fewer pitches
        while(dataRows.length < 10) dataRows.push(Array(11).fill(''));

        onLoad(dataRows.slice(0, 10));
        setStatus(`Loaded ${Math.min(dataRows.length, 10)} pitches successfully.`);
        e.target.value = '';
      } catch(err) {
        setStatus('Error reading file. Make sure it is a valid CSV.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{marginBottom:16}}>
      <label style={{
        display:'flex',alignItems:'center',gap:10,
        padding:'10px 14px',
        background:'rgba(58,134,255,0.06)',
        border:'1px dashed rgba(58,134,255,0.3)',
        borderRadius:10,cursor:'pointer',
      }}>
        <span style={{fontSize:16}}>📄</span>
        <div>
          <div style={{fontSize:12,fontWeight:600,color:'rgba(58,134,255,0.9)',fontFamily:"'DM Sans',sans-serif"}}>Import from Trackman CSV</div>
          <div style={{fontSize:11,color:'rgba(255,255,255,0.3)',fontFamily:"'DM Mono',monospace",marginTop:2}}>Export rows A3:K12 from your sheet as CSV</div>
        </div>
        <input type="file" accept=".csv" onChange={handleFile} style={{display:'none'}}/>
      </label>
      {status && (
        <div style={{
          fontSize:11,marginTop:6,padding:'6px 10px',borderRadius:6,
          fontFamily:"'DM Mono',monospace",
          color: status.includes('success') ? '#2EC4B6' : '#E84855',
          background: status.includes('success') ? 'rgba(46,196,182,0.08)' : 'rgba(232,72,85,0.08)',
          border: `1px solid ${status.includes('success') ? 'rgba(46,196,182,0.2)' : 'rgba(232,72,85,0.2)'}`,
        }}>{status}</div>
      )}
    </div>
  );
}

// ─── PITCH INPUT TABLE ───────────────────────────────────────────────────────
const METRIC_HEADERS = ['Rel Side (in)','HAA','Velo','Ext (in)','IVB','HB','VAA','Rel Ht (in)','Spin','Plate Side (in)','Plate Ht (in)'];

function PitchTable({ rows, onChange }) {
  return (
    <div style={{overflowX:'auto'}}>
      <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
        <thead>
          <tr>
            <th style={thS}>#</th>
            {METRIC_HEADERS.map(h=><th key={h} style={thS}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row,ri)=>(
            <tr key={ri}>
              <td style={tdS}><span style={{color:'rgba(255,255,255,0.3)',fontSize:11}}>{ri+1}</span></td>
              {row.map((val,ci)=>(
                <td key={ci} style={tdS}>
                  <input
                    type="number" step="0.01" value={val}
                    onChange={e=>onChange(ri,ci,e.target.value)}
                    style={{width:64,background:'transparent',border:'none',color:'#fff',fontSize:12,outline:'none',padding:'2px 4px'}}
                    onFocus={e=>e.target.style.background='rgba(255,255,255,0.05)'}
                    onBlur={e=>e.target.style.background='transparent'}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
const thS = {fontSize:10,fontWeight:500,color:'rgba(255,255,255,0.4)',textAlign:'left',padding:'6px 8px',borderBottom:'1px solid rgba(255,255,255,0.06)',fontFamily:"'DM Mono',monospace",whiteSpace:'nowrap'};
const tdS = {padding:'3px 6px',borderBottom:'1px solid rgba(255,255,255,0.04)'};

// ─── BUCKET BAR ──────────────────────────────────────────────────────────────
const BUCKET_COLORS = ['#E84855','#F4A261','#2EC4B6','#8338EC','#3A86FF'];
function BucketBar({label, value, color}) {
  const pct = value!==null?Math.round(value*100):0;
  return (
    <div style={{marginBottom:12}}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
        <span style={{fontSize:11,color:'rgba(255,255,255,0.5)',fontFamily:"'DM Mono',monospace",textTransform:'uppercase',letterSpacing:'0.08em'}}>{label}</span>
        <span style={{fontSize:13,fontWeight:600,color:'#fff',fontFamily:"'DM Mono',monospace"}}>{pct}</span>
      </div>
      <div style={{height:4,background:'rgba(255,255,255,0.06)',borderRadius:2}}>
        <div style={{height:4,width:`${pct}%`,background:color,borderRadius:2,transition:'width 0.5s ease'}}/>
      </div>
    </div>
  );
}

// ─── PRICING MODAL ───────────────────────────────────────────────────────────
const COACH_TIERS = [
  {label:'Starter — up to 10 athletes', monthly:'$149.99', yearly:'$1,439.99'},
  {label:'Growth — up to 25 athletes',  monthly:'$299.99', yearly:'$2,879.99'},
  {label:'Pro — up to 50 athletes',     monthly:'$499.99', yearly:'$4,799.99'},
  {label:'Unlimited — unlimited athletes', monthly:'$799.99', yearly:'$7,679.99'},
];

const STRIPE_LINKS = {
  athlete: {
    monthly: 'https://buy.stripe.com/test_6oU14n5qEfLb7g09R12go00',
    yearly:  'https://buy.stripe.com/test_eVq6oH3iw8iJdEo2oz2go01',
  },
  coach: [
    { monthly: 'https://buy.stripe.com/test_6oU3cvg5i2YpcAk1kv2go02', yearly: 'https://buy.stripe.com/test_fZu7sLg5iaqR9o8fbl2go03' }, // Starter
    { monthly: 'https://buy.stripe.com/test_00w3cv06kcyZ2ZKfbl2go04', yearly: 'https://buy.stripe.com/test_bJe9AT7yMgPfeIs1kv2go05' }, // Growth
    { monthly: 'https://buy.stripe.com/test_6oU4gz3iwdD3dEo2oz2go06', yearly: 'https://buy.stripe.com/test_28E14ncT67eFcAk5AL2go07' }, // Pro
    { monthly: 'https://buy.stripe.com/test_fZuaEX8CQ1UldEo2oz2go08', yearly: 'https://buy.stripe.com/test_fZubJ16uI2YpcAk9R12go09' }, // Unlimited
  ],
};

function PricingModal({mode, onClose}) {
  const [billing, setBilling] = useState('monthly');
  const [selectedTier, setSelectedTier] = useState(mode==='coach' ? 0 : null);

  const goToCheckout = (url) => {
    window.open(url, '_blank');
  };

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',backdropFilter:'blur(8px)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}} onClick={onClose}>
      <div style={{background:'#13131a',border:'1px solid rgba(255,255,255,0.1)',borderRadius:16,padding:'2rem',maxWidth:500,width:'100%',maxHeight:'90vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:11,letterSpacing:'0.12em',textTransform:'uppercase',color:'rgba(255,255,255,0.4)',marginBottom:8,fontFamily:"'DM Mono',monospace"}}>Subscription</div>
        <div style={{fontSize:22,fontWeight:700,color:'#fff',marginBottom:20}}>{mode==='athlete'?'Athlete Plan':'Coach Plan'}</div>

        <div style={{display:'flex',gap:8,marginBottom:20,background:'rgba(255,255,255,0.04)',borderRadius:10,padding:4}}>
          {['monthly','yearly'].map(b=>(
            <button key={b} onClick={()=>setBilling(b)} style={{flex:1,padding:'8px',background:billing===b?'#3A86FF':'transparent',border:'none',borderRadius:8,color:billing===b?'#fff':'rgba(255,255,255,0.4)',fontSize:12,cursor:'pointer',fontWeight:600,fontFamily:"'DM Sans',sans-serif",textTransform:'capitalize'}}>
              {b === 'yearly' ? 'Yearly — 20% off' : 'Monthly'}
            </button>
          ))}
        </div>

        {mode==='athlete' ? (
          <div style={{background:'rgba(58,134,255,0.1)',border:'1px solid rgba(58,134,255,0.3)',borderRadius:12,padding:'1.5rem',textAlign:'center',marginBottom:12}}>
            <div style={{fontSize:42,fontWeight:800,color:'#3A86FF',fontFamily:"'DM Mono',monospace"}}>
              {billing==='monthly' ? '$49.99' : '$479.99'}
            </div>
            <div style={{color:'rgba(255,255,255,0.5)',fontSize:13,marginTop:4}}>
              {billing==='monthly' ? 'per month' : 'per year — save $119.89'}
            </div>
            <div style={{color:'rgba(255,255,255,0.7)',fontSize:13,marginTop:16,lineHeight:1.6}}>
              Full access to scoring, session history, program generation, and longitudinal tracking
            </div>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {COACH_TIERS.map((t,i)=>{
              const price = billing==='monthly' ? t.monthly : t.yearly;
              const period = billing==='monthly' ? '/mo' : '/yr';
              const monthlyNum = parseFloat(t.monthly.replace('$','').replace(',',''));
              const savedAmt = Math.round(monthlyNum * 12 * 0.2);
              const savings = billing==='yearly' ? ` — save $${savedAmt.toLocaleString()}` : '';
              const isSelected = selectedTier === i;
              return (
                <button
                  key={i}
                  onClick={()=>setSelectedTier(i)}
                  style={{
                    padding:'14px 16px',
                    background: isSelected ? 'rgba(58,134,255,0.1)' : 'rgba(255,255,255,0.04)',
                    border: isSelected ? '1px solid rgba(58,134,255,0.5)' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius:10,
                    cursor:'pointer',
                    textAlign:'left',
                    width:'100%',
                    fontFamily:"'DM Sans',sans-serif",
                  }}
                >
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                    <span style={{fontSize:13,color: isSelected ? '#fff' : 'rgba(255,255,255,0.8)',fontWeight:500}}>{t.label}</span>
                    <div style={{textAlign:'right'}}>
                      <span style={{fontSize:16,fontWeight:700,color:'#3A86FF',fontFamily:"'DM Mono',monospace"}}>{price}<span style={{fontSize:11,color:'rgba(255,255,255,0.4)',fontWeight:400}}>{period}</span></span>
                    </div>
                  </div>
                  {billing==='yearly' && <div style={{fontSize:11,color:'#2EC4B6',marginTop:4,fontFamily:"'DM Mono',monospace"}}>{savings}</div>}
                </button>
              );
            })}
          </div>
        )}

        <button
          onClick={() => {
            const url = mode==='athlete'
              ? STRIPE_LINKS.athlete[billing]
              : STRIPE_LINKS.coach[selectedTier][billing];
            goToCheckout(url);
          }}
          style={{width:'100%',marginTop:20,padding:'13px',background:'#3A86FF',border:'none',borderRadius:10,color:'#fff',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}
        >
          {mode==='coach' ? `Subscribe to ${COACH_TIERS[selectedTier].label.split(' —')[0]}` : 'Subscribe Now'}
        </button>
        <button onClick={onClose} style={{width:'100%',marginTop:8,padding:'10px',background:'transparent',border:'none',color:'rgba(255,255,255,0.3)',fontSize:13,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>Cancel</button>
      </div>
    </div>
  );
}


function TopBar({title, onBack, onPricing}) {
  return (
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:28}}>
      <button onClick={onBack} style={{background:'none',border:'none',color:'rgba(255,255,255,0.4)',fontSize:13,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",padding:0}}>← Back</button>
      <div style={{fontSize:13,fontWeight:600,color:'#fff',fontFamily:"'DM Sans',sans-serif"}}>{title}</div>
      {onPricing?<button onClick={onPricing} style={{background:'none',border:'none',color:'rgba(255,255,255,0.4)',fontSize:12,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>Plans</button>:<div style={{width:40}}/>}
    </div>
  );
}

// ─── MECHANICS IMAGE UPLOAD ──────────────────────────────────────────────────
const MECHANIC_POSITIONS = [
  'Starting Position',
  'Peak Leg Lift',
  'Bottom of the Drop',
  'Foot Strike',
  'Max Layback',
  'Release Point',
];

function MechanicsImages({ images, onChange, readOnly }) {
  const handleFile = (position, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      onChange(position, ev.target.result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemove = (position) => {
    onChange(position, null);
  };

  return (
    <div style={{marginBottom:16}}>
      <div style={{fontSize:11,fontWeight:600,letterSpacing:'0.12em',textTransform:'uppercase',color:'rgba(255,255,255,0.35)',fontFamily:"'DM Mono',monospace",marginBottom:12}}>
        Mechanics — Front View
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
        {MECHANIC_POSITIONS.map(pos => {
          const img = images?.[pos];
          return (
            <div key={pos} style={{display:'flex',flexDirection:'column',gap:6}}>
              <div style={{
                aspectRatio:'3/4',
                background: img ? 'transparent' : 'rgba(255,255,255,0.03)',
                border: img ? 'none' : '1px dashed rgba(255,255,255,0.1)',
                borderRadius:10,
                overflow:'hidden',
                position:'relative',
                cursor: readOnly ? 'default' : 'pointer',
              }}>
                {img ? (
                  <>
                    <img
                      src={img}
                      alt={pos}
                      style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}
                    />
                    {!readOnly && (
                      <button
                        onClick={() => handleRemove(pos)}
                        style={{
                          position:'absolute',top:4,right:4,
                          width:20,height:20,borderRadius:'50%',
                          background:'rgba(0,0,0,0.7)',border:'none',
                          color:'#fff',fontSize:11,cursor:'pointer',
                          display:'flex',alignItems:'center',justifyContent:'center',
                          lineHeight:1,
                        }}
                      >✕</button>
                    )}
                  </>
                ) : (
                  !readOnly && (
                    <label style={{
                      width:'100%',height:'100%',
                      display:'flex',flexDirection:'column',
                      alignItems:'center',justifyContent:'center',
                      cursor:'pointer',gap:4,
                    }}>
                      <span style={{fontSize:18,opacity:0.3}}>+</span>
                      <input
                        type="file"
                        accept="image/*"
                        style={{display:'none'}}
                        onChange={e => handleFile(pos, e)}
                      />
                    </label>
                  )
                )}
              </div>
              <div style={{
                fontSize:9,
                color:'rgba(255,255,255,0.4)',
                fontFamily:"'DM Mono',monospace",
                textAlign:'center',
                lineHeight:1.3,
                textTransform:'uppercase',
                letterSpacing:'0.04em',
              }}>{pos}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── RUN AND GUN VELOCITY TRACKER ────────────────────────────────────────────
function RngTracker({ weights, velocities, onChange, savedData, readOnly }) {
  const weeks = ['Week 1','Week 2','Week 3','Week 4'];
  if(!weights || weights.length === 0) return null;

  // Use savedData if provided (session history), otherwise use live velocities
  const data = savedData || velocities || {};

  // Check if all boxes are filled — if so we can show completion state
  const allFilled = weights.every(w => {
    const vals = data[w] || ['','','',''];
    return vals.every(v => v !== '' && v !== null && v !== undefined);
  });

  return (
    <div style={{background:'#13131a',border:'1px solid rgba(255,255,255,0.07)',borderRadius:16,padding:'1.25rem',marginTop:12}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <div style={{fontSize:11,fontWeight:600,letterSpacing:'0.12em',textTransform:'uppercase',color:'rgba(255,255,255,0.35)',fontFamily:"'DM Mono',monospace"}}>
          Run and Gun Velocity Tracker
        </div>
        {allFilled && (
          <div style={{fontSize:10,color:'#2EC4B6',fontFamily:"'DM Mono',monospace",fontWeight:600,letterSpacing:'0.08em'}}>
            BLOCK COMPLETE
          </div>
        )}
      </div>
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',minWidth:380}}>
          <thead>
            <tr>
              <th style={{fontSize:10,color:'rgba(255,255,255,0.3)',fontFamily:"'DM Mono',monospace",textAlign:'left',padding:'4px 8px',borderBottom:'1px solid rgba(255,255,255,0.06)',fontWeight:500}}>Weight</th>
              {weeks.map(w=>(
                <th key={w} style={{fontSize:10,color:'rgba(255,255,255,0.3)',fontFamily:"'DM Mono',monospace",textAlign:'center',padding:'4px 8px',borderBottom:'1px solid rgba(255,255,255,0.06)',fontWeight:500,minWidth:64}}>{w}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weights.map(weight => {
              const vals = (data[weight]) || ['','','',''];
              const rowComplete = vals.every(v => v !== '' && v !== null && v !== undefined);
              return (
                <tr key={weight}>
                  <td style={{fontSize:12,fontWeight:600,color: rowComplete ? '#2EC4B6' : 'rgba(255,255,255,0.8)',padding:'8px 8px',borderBottom:'1px solid rgba(255,255,255,0.04)',fontFamily:"'DM Mono',monospace",whiteSpace:'nowrap'}}>{weight}</td>
                  {vals.map((v,wi)=>{
                    const filled = v !== '' && v !== null && v !== undefined;
                    return (
                      <td key={wi} style={{padding:'6px 8px',borderBottom:'1px solid rgba(255,255,255,0.04)',textAlign:'center'}}>
                        <input
                          type="number"
                          value={v || ''}
                          placeholder="mph"
                          onChange={e => {
                            if(onChange) {
                              const updated = [...vals];
                              updated[wi] = e.target.value;
                              onChange(weight, updated);
                            }
                          }}
                          style={{
                            width:56,
                            background: filled ? 'rgba(46,196,182,0.08)' : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${filled ? 'rgba(46,196,182,0.3)' : 'rgba(255,255,255,0.1)'}`,
                            borderRadius:6,
                            padding:'5px 6px',
                            color: filled ? '#2EC4B6' : '#fff',
                            fontSize:12,
                            fontFamily:"'DM Mono',monospace",
                            outline:'none',
                            textAlign:'center',
                          }}
                          onFocus={e=>e.target.style.borderColor='rgba(58,134,255,0.5)'}
                          onBlur={e=>e.target.style.borderColor=filled?'rgba(46,196,182,0.3)':'rgba(255,255,255,0.1)'}
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={{fontSize:11,color:'rgba(255,255,255,0.2)',marginTop:10,fontFamily:"'DM Mono',monospace"}}>
        {allFilled ? 'All weeks recorded for this block.' : 'Enter max velocity per weight each week. Updates save automatically.'}
      </div>
    </div>
  );
}


function ProgramDisplay({ program }) {
  const lines = program.split('\n');

  const DAY_HEADERS = ['HIGH INTENT DAY','MID INTENT DAY','LOW INTENT DAY'];
  const SECTION_HEADERS = ['COACHING DIAGNOSIS','DAILY STRUCTURE','ATHLETE DATA'];
  const SUB_HEADERS = ['Dynamic Warm Up','Band Work','Plyo Drills','Catch Play Arc','Post-Throw Arm Care','Post Throw Arm Care'];
  const META_KEYS = ['Limiter identified','Red flags active','Weight strategy','Goal','Stressors identified'];
  const DRILL_KEYS = ['Weight:','Reps:','Why this drill:','Cue:','How to perform:','Sets and Reps:','Why:','Constraint:'];

  const isDay = l => DAY_HEADERS.some(h => l.trim().toUpperCase() === h);
  const isSection = l => SECTION_HEADERS.some(h => l.trim().toUpperCase() === h.toUpperCase());
  const isSub = l => SUB_HEADERS.some(h => l.trim().startsWith(h));
  const isMeta = l => META_KEYS.some(k => l.trim().startsWith(k));
  const isDrillKey = l => DRILL_KEYS.some(k => l.trim().startsWith(k));
  const isAthleteHeader = l => l.trim().startsWith('Athlete:') && l.includes('Age:');
  const isMainEvent = l => l.trim().length > 0 && !l.trim().startsWith('-') && !isDrillKey(l) && !isMeta(l) && !isSub(l) && !isDay(l) && !isSection(l) && l.trim() === l.trim().replace(/^[a-z]/, c=>c) && l.trim().length < 60 && !l.trim().startsWith('[') && !isAthleteHeader(l);

  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",color:'rgba(255,255,255,0.85)'}}>
      {lines.map((line, i) => {
        const t = line.trim();
        if(!t) return <div key={i} style={{height:8}}/>;

        // Athlete header line
        if(isAthleteHeader(t)) return (
          <div key={i} style={{background:'rgba(58,134,255,0.08)',border:'1px solid rgba(58,134,255,0.2)',borderRadius:10,padding:'12px 16px',marginBottom:16,fontSize:12,color:'rgba(255,255,255,0.6)',fontFamily:"'DM Mono',monospace",lineHeight:1.8}}>
            {t}
          </div>
        );

        // Major day headers
        if(isDay(t)) return (
          <div key={i} style={{marginTop:24,marginBottom:12,paddingTop:16,borderTop:'1px solid rgba(255,255,255,0.08)'}}>
            <div style={{fontSize:11,fontWeight:600,letterSpacing:'0.14em',color:'#3A86FF',fontFamily:"'DM Mono',monospace",textTransform:'uppercase'}}>{t}</div>
          </div>
        );

        // Section headers
        if(isSection(t)) return (
          <div key={i} style={{marginTop:20,marginBottom:10}}>
            <div style={{fontSize:11,fontWeight:600,letterSpacing:'0.12em',color:'rgba(255,255,255,0.35)',fontFamily:"'DM Mono',monospace",textTransform:'uppercase'}}>{t}</div>
          </div>
        );

        // Sub-section headers
        if(isSub(t)) return (
          <div key={i} style={{marginTop:16,marginBottom:6}}>
            <div style={{fontSize:13,fontWeight:600,color:'rgba(255,255,255,0.9)'}}>{t}</div>
          </div>
        );

        // Meta lines (limiter, goal, stressors)
        if(isMeta(t)) {
          const colonIdx = t.indexOf(':');
          const key = t.slice(0, colonIdx);
          const val = t.slice(colonIdx+1).trim();
          return (
            <div key={i} style={{display:'flex',gap:8,marginBottom:4,alignItems:'flex-start'}}>
              <span style={{fontSize:10,fontWeight:600,letterSpacing:'0.08em',color:'rgba(255,255,255,0.35)',fontFamily:"'DM Mono',monospace",textTransform:'uppercase',minWidth:110,paddingTop:2}}>{key}</span>
              <span style={{fontSize:12,color:'rgba(255,255,255,0.7)',lineHeight:1.6,flex:1}}>{val}</span>
            </div>
          );
        }

        // Drill detail lines
        if(isDrillKey(t)) {
          const colonIdx = t.indexOf(':');
          const key = t.slice(0, colonIdx);
          const val = t.slice(colonIdx+1).trim();
          return (
            <div key={i} style={{display:'flex',gap:8,marginBottom:3,paddingLeft:12,alignItems:'flex-start'}}>
              <span style={{fontSize:10,fontWeight:600,color:'rgba(255,255,255,0.25)',fontFamily:"'DM Mono',monospace",textTransform:'uppercase',minWidth:90,paddingTop:2}}>{key}</span>
              <span style={{fontSize:12,color:'rgba(255,255,255,0.65)',lineHeight:1.6,flex:1}}>{val}</span>
            </div>
          );
        }

        // Bullet lines
        if(t.startsWith('-')) return (
          <div key={i} style={{display:'flex',gap:8,marginBottom:3,paddingLeft:8,alignItems:'flex-start'}}>
            <span style={{color:'rgba(58,134,255,0.6)',fontSize:10,paddingTop:4,flexShrink:0}}>●</span>
            <span style={{fontSize:12,color:'rgba(255,255,255,0.65)',lineHeight:1.6}}>{t.slice(1).trim()}</span>
          </div>
        );

        // Numbered lines
        if(/^[1-9]\./.test(t)) return (
          <div key={i} style={{display:'flex',gap:8,marginBottom:8,paddingLeft:8,alignItems:'flex-start'}}>
            <span style={{fontSize:10,fontWeight:700,color:'#3A86FF',fontFamily:"'DM Mono',monospace",minWidth:16,paddingTop:2}}>{t.slice(0,2)}</span>
            <span style={{fontSize:12,fontWeight:600,color:'rgba(255,255,255,0.9)',lineHeight:1.5}}>{t.slice(2).trim()}</span>
          </div>
        );

        // Short standalone lines that look like drill/event or exercise names
        if(t.length < 70 && !t.includes('|') && !t.startsWith('[') && /^[A-Z]/.test(t) && !t.endsWith('.') && !t.includes(':')) return (
          <div key={i} style={{marginTop:10,marginBottom:4}}>
            <div style={{fontSize:12,fontWeight:600,color:'rgba(255,255,255,0.85)',letterSpacing:'0.02em'}}>{t}</div>
          </div>
        );

        // Default body text — catch everything else
        return (
          <div key={i} style={{fontSize:12,color:'rgba(255,255,255,0.65)',lineHeight:1.75,marginBottom:4,paddingLeft: t.startsWith(' ') ? 12 : 0}}>{t}</div>
        );
      })}
    </div>
  );
}

// ─── SHARED STYLES ───────────────────────────────────────────────────────────
const pageStyle = {minHeight:'100vh',background:'#0a0a0f',color:'#fff',fontFamily:"'DM Sans',sans-serif"};
const sectionLabel = {fontSize:11,fontWeight:500,letterSpacing:'0.1em',textTransform:'uppercase',color:'rgba(255,255,255,0.3)',marginBottom:12,fontFamily:"'DM Mono',monospace"};
const btnPrimary = {width:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'14px 20px',background:'#3A86FF',border:'none',borderRadius:12,color:'#fff',fontSize:15,fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",gap:2};
const btnSecondary = {width:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'14px 20px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:12,color:'#fff',fontSize:15,fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",gap:2};
const btnSmall = {padding:'8px 16px',background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,color:'rgba(255,255,255,0.8)',fontSize:12,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",fontWeight:500};
const sessionCardStyle = {width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 16px',background:'#13131a',border:'1px solid rgba(255,255,255,0.07)',borderRadius:12,cursor:'pointer',textAlign:'left'};
const inputLabel = {fontSize:11,color:'rgba(255,255,255,0.4)',marginBottom:6,fontFamily:"'DM Mono',monospace",textTransform:'uppercase',letterSpacing:'0.08em'};
const inputStyle = {width:'100%',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,padding:'10px 12px',color:'#fff',fontSize:13,fontFamily:"'DM Sans',sans-serif",outline:'none',boxSizing:'border-box'};

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState('landing');
  const [mode, setMode] = useState(null);
  const [showPricing, setShowPricing] = useState(false);
  const [athletes, setAthletes] = useState(() => store.get('athletes')||[]);
  const [accounts, setAccounts] = useState([]);
  const [currentAccount, setCurrentAccount] = useState(() => store.get('currentAccount')||null); // session token stays local — fine to keep client-side
  const [authError, setAuthError] = useState('');
  const [authForm, setAuthForm] = useState({email:'',password:'',name:''});
  const [pendingPlan, setPendingPlan] = useState(null); // {tier, billing} selected before account creation
  const [currentAthlete, setCurrentAthlete] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [newSessionRows, setNewSessionRows] = useState(Array(10).fill(null).map(()=>Array(11).fill('')));
  const [newInfo, setNewInfo] = useState({name:'',age:'',hand:'RHP',position:'',height:''});
  const [calcResult, setCalcResult] = useState(null);
  const [rngVelocities, setRngVelocities] = useState({}); // {weightLabel: [w1,w2,w3,w4]}
  const [parsedRngWeights, setParsedRngWeights] = useState([]);
  const [mechanicsImages, setMechanicsImages] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null); // {athleteName, sessionIdx}
  const [confirmDeleteAthlete, setConfirmDeleteAthlete] = useState(null); // athleteName
  const [generateProgress, setGenerateProgress] = useState(0);
  const [generateStage, setGenerateStage] = useState('');
  const [program, setProgram] = useState('');
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('score');
  const [loadingData, setLoadingData] = useState(true);

  // Keep currentAccount's session token cached locally so a page refresh
  // doesn't immediately log the user out — this is just a session pointer,
  // not the actual account data, which always lives in Supabase.
  useEffect(()=>{ store.set('currentAccount', currentAccount); }, [currentAccount]);

  // On load: pull all accounts and athletes (with nested sessions) from Supabase
  // into local React state, which the rest of the UI reads from as before.
  useEffect(() => {
    async function loadAll() {
      setLoadingData(true);
      const accountRows = await sb.select('accounts', 'select=*');
      const athleteRows = await sb.select('athletes', 'select=*');
      const sessionRows = await sb.select('sessions', 'select=*&order=created_at.asc');

      const mappedAccounts = accountRows.map(a => ({
        email: a.email, password: a.password_hash, name: a.name, mode: a.mode,
        plan: { tier: a.plan_tier, billing: a.plan_billing }, id: a.id,
      }));

      const mappedAthletes = athleteRows.map(ath => ({
        id: ath.id,
        name: ath.name, hand: ath.hand, position: ath.position, age: ath.age,
        accountEmail: mappedAccounts.find(acc=>acc.id===ath.account_id)?.email || null,
        deactivated: ath.deactivated, deactivatedDate: ath.deactivated_date,
        sessions: sessionRows.filter(s=>s.athlete_id===ath.id).map(s => ({
          date: new Date(s.created_at).getTime(),
          info: s.info, result: s.result, program: s.program, overall: s.overall,
          rngVelocities: s.rng_velocities, rngWeights: s.rng_weights, mechanicsImages: s.mechanics_images,
          id: s.id,
        })),
      }));

      setAccounts(mappedAccounts);
      setAthletes(mappedAthletes);
      setLoadingData(false);
    }
    loadAll();
  }, []);

  const PLAN_CAPS = {
    athlete: 1, // an athlete account only ever tracks themself
    starter: 10,
    growth: 25,
    pro: 50,
    unlimited: Infinity,
  };

  const account = currentAccount ? accounts.find(a=>a.email===currentAccount) : null;
  const accountAthletes = account ? athletes.filter(a=>a.accountEmail===account.email) : [];
  const activeAthleteCount = accountAthletes.filter(a=>!a.deactivated).length;
  const athleteCap = account ? PLAN_CAPS[account.plan?.tier] ?? 0 : 0;
  const atCap = account && account.mode==='coach' ? activeAthleteCount >= athleteCap : false;

  const createAccount = async (mode, planTier, billing) => {
    if(accounts.find(a=>a.email===authForm.email)) { setAuthError('An account with this email already exists.'); return; }
    if(!authForm.email || !authForm.password || !authForm.name) { setAuthError('Fill in all fields.'); return; }
    // NOTE: storing the raw password in plaintext for now — this is a placeholder
    // until real auth (password hashing, Supabase Auth, etc.) replaces this layer.
    const inserted = await sb.insert('accounts', {
      email: authForm.email, password_hash: authForm.password, name: authForm.name,
      mode, plan_tier: planTier, plan_billing: billing,
    });
    if(!inserted) { setAuthError('Something went wrong creating your account. Try again.'); return; }
    const newAccount = { email: inserted.email, password: inserted.password_hash, name: inserted.name, mode: inserted.mode, plan: { tier: inserted.plan_tier, billing: inserted.plan_billing }, id: inserted.id };
    setAccounts(prev => [...prev, newAccount]);
    setCurrentAccount(newAccount.email);
    setAuthError('');
    setScreen(mode==='coach' ? 'coachDash' : 'athleteHome');
  };

  const loginAccount = () => {
    const found = accounts.find(a=>a.email===authForm.email && a.password===authForm.password);
    if(!found) { setAuthError('No account found with that email and password.'); return; }
    setCurrentAccount(found.email);
    setMode(found.mode);
    setAuthError('');
    setScreen(found.mode==='coach' ? 'coachDash' : 'athleteHome');
  };

  const logout = () => {
    setCurrentAccount(null);
    setMode(null);
    setScreen('landing');
  };

  const saveAthlete = async (info, result, prog, rngVels={}, rngWts=[]) => {
    let athleteRecord = athletes.find(a=>a.name===info.name && a.hand===info.hand && a.accountEmail===account?.email);
    let athleteId = athleteRecord?.id;

    if(!athleteId) {
      const insertedAthlete = await sb.insert('athletes', {
        account_id: account?.id, name: info.name, hand: info.hand, position: info.position, age: info.age, deactivated: false,
      });
      if(!insertedAthlete) return;
      athleteId = insertedAthlete.id;
    }

    const insertedSession = await sb.insert('sessions', {
      athlete_id: athleteId, info, result: {...result, bArr: result.bArr}, program: prog,
      overall: result.overall, rng_velocities: rngVels, rng_weights: rngWts, mechanics_images: mechanicsImages,
    });
    if(!insertedSession) return;

    const session = {
      date: new Date(insertedSession.created_at).getTime(), info, result: {...result, bArr: result.bArr},
      program: prog, overall: result.overall, rngVelocities: rngVels, rngWeights: rngWts,
      mechanicsImages: mechanicsImages, id: insertedSession.id,
    };

    setAthletes(prev => {
      const idx = prev.findIndex(a=>a.id===athleteId);
      if(idx>=0) { const updated=[...prev]; updated[idx]={...updated[idx],sessions:[...(updated[idx].sessions||[]),session]}; return updated; }
      return [...prev, {id:athleteId,name:info.name,hand:info.hand,position:info.position,age:info.age,sessions:[session],accountEmail:account?.email||null,deactivated:false}];
    });
  };

  const generateProgram = async (result, info) => {
    setGenerating(true);
    setGenerateProgress(0);
    setGenerateStage('Analyzing athlete data');
    setProgram('');

    const stages = [
      { pct: 8,  label: 'Analyzing athlete data' },
      { pct: 18, label: 'Identifying mechanical limiters' },
      { pct: 30, label: 'Evaluating red flags' },
      { pct: 44, label: 'Building plyo routine' },
      { pct: 58, label: 'Designing catch play arc' },
      { pct: 70, label: 'Programming main events' },
      { pct: 82, label: 'Prescribing arm care' },
      { pct: 92, label: 'Finalizing program' },
    ];

    let stageIdx = 0;
    const stageInterval = setInterval(() => {
      if(stageIdx < stages.length) {
        setGenerateProgress(stages[stageIdx].pct);
        setGenerateStage(stages[stageIdx].label);
        stageIdx++;
      }
    }, 1800);

    try {
      const athleteRecord = accountAthletes.find(a=>a.name===info.name&&a.hand===info.hand);
      const priorSessions = athleteRecord?.sessions || [];
      const prompt = buildPrompt(result, info, priorSessions);
      const resp = await fetch('https://api.anthropic.com/v1/messages',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:50000,messages:[{role:'user',content:prompt}]})
      });
      clearInterval(stageInterval);
      setGenerateProgress(98);
      setGenerateStage('Finishing up');
      const data = await resp.json();
      const text = data.content.map(b=>b.text||'').join('');
      setGenerateProgress(100);
      setGenerateStage('Program ready');
      setProgram(text);
      const rngMatches = [...text.matchAll(/(\d+)\s*oz/gi)];
      const weights = [...new Set(rngMatches.map(m => m[1]+'oz'))].filter(w => ['6oz','5oz','4oz','3oz'].includes(w)).sort((a,b)=>parseInt(b)-parseInt(a));
      const freshRngVelocities = Object.fromEntries(weights.map(w=>[w,['','','','']]));
      setParsedRngWeights(weights);
      setRngVelocities(freshRngVelocities);
      saveAthlete(info, result, text, freshRngVelocities, weights);
    } catch(e) {
      clearInterval(stageInterval);
      setProgram('Error generating program. Please try again.');
      setGenerateProgress(0);
      setGenerateStage('');
    }
    setGenerating(false);
  };

  const deleteSession = async (athleteName, sessionIdx) => {
    const ath = athletes.find(a=>a.name===athleteName);
    const session = ath?.sessions?.[sessionIdx];
    if(session?.id) await sb.delete('sessions', `id=eq.${session.id}`);
    setAthletes(prev => prev.map(a => {
      if(a.name !== athleteName) return a;
      const updated = [...(a.sessions||[])];
      updated.splice(sessionIdx, 1);
      return {...a, sessions: updated};
    }));
  };

  const deactivateAthlete = async (athleteName) => {
    const ath = athletes.find(a=>a.name===athleteName);
    if(ath?.id) await sb.update('athletes', `id=eq.${ath.id}`, { deactivated: true, deactivated_date: new Date().toISOString() });
    setAthletes(prev => prev.map(a => a.name===athleteName ? {...a, deactivated:true, deactivatedDate:Date.now()} : a));
    if(currentAthlete === athleteName) setCurrentAthlete(null);
  };

  const handleCalc = () => { const result = calcSession(newSessionRows, newInfo); if(result) setCalcResult(result); };
  const handleRowChange = (ri,ci,val) => { setNewSessionRows(prev=>{ const n=[...prev.map(r=>[...r])]; n[ri][ci]=val; return n; }); };
  const athlete = currentAthlete
    ? athletes.find(a=>a.name===currentAthlete)
    : (account && account.mode==='athlete' ? athletes.find(a=>a.accountEmail===account.email) : null);

  // ── LANDING ──
  if(loadingData) return (
    <div style={{...pageStyle, display:'flex', alignItems:'center', justifyContent:'center'}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
      <div style={{fontSize:13,color:'rgba(255,255,255,0.4)',fontFamily:"'DM Mono',monospace"}}>Loading Homefield...</div>
    </div>
  );

  if(screen==='landing') return (
    <div style={pageStyle}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
      <div style={{maxWidth:480,margin:'0 auto',padding:'3rem 1.5rem',minHeight:'100vh',display:'flex',flexDirection:'column',justifyContent:'center'}}>
        <div style={{marginBottom:48}}>
          <div style={{fontSize:11,letterSpacing:'0.2em',textTransform:'uppercase',color:'rgba(255,255,255,0.3)',marginBottom:12,fontFamily:"'DM Mono',monospace"}}>Performance Analytics</div>
          <div style={{fontSize:64,lineHeight:1,fontFamily:"'Bebas Neue',sans-serif",color:'#fff',letterSpacing:'0.02em'}}>HOMEFIELD</div>
          <div style={{fontSize:14,color:'rgba(255,255,255,0.4)',marginTop:16,lineHeight:1.6,fontFamily:"'DM Sans',sans-serif"}}>Data-driven pitching development powered by Trackman metrics and AI coaching intelligence.</div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          <button onClick={()=>{setMode('athlete');setAuthForm({email:'',password:'',name:''});setAuthError('');setScreen('authChoice');}} style={btnPrimary}>
            <span>Athlete</span>
            <span style={{fontSize:11,opacity:0.6,fontWeight:400}}>Personal development tracking</span>
          </button>
          <button onClick={()=>{setMode('coach');setAuthForm({email:'',password:'',name:''});setAuthError('');setScreen('authChoice');}} style={btnSecondary}>
            <span>Coach</span>
            <span style={{fontSize:11,opacity:0.6,fontWeight:400}}>Team management & analytics</span>
          </button>
        </div>
        <div style={{marginTop:32,textAlign:'center'}}>
          <button onClick={()=>setShowPricing(true)} style={{background:'none',border:'none',color:'rgba(255,255,255,0.3)',fontSize:12,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>View pricing →</button>
        </div>
      </div>
      {showPricing&&<PricingModal mode={mode||'athlete'} onClose={()=>setShowPricing(false)}/>}
    </div>
  );

  // ── AUTH CHOICE (Log In or Create Account) ──
  if(screen==='authChoice') return (
    <div style={pageStyle}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
      <div style={{maxWidth:480,margin:'0 auto',padding:'3rem 1.5rem',minHeight:'100vh',display:'flex',flexDirection:'column',justifyContent:'center'}}>
        <TopBar title={mode==='coach'?'Coach':'Athlete'} onBack={()=>setScreen('landing')}/>
        <div style={{marginBottom:32}}>
          <div style={{fontSize:28,fontWeight:700,color:'#fff',marginBottom:8}}>Welcome</div>
          <div style={{fontSize:14,color:'rgba(255,255,255,0.4)',lineHeight:1.6}}>Log in to your existing account, or create a new one to get started.</div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          <button onClick={()=>{setAuthError('');setScreen('login');}} style={btnPrimary}>
            <span>Log In</span>
          </button>
          <button onClick={()=>{setAuthError('');setPendingPlan(null);setScreen('createAccount');}} style={btnSecondary}>
            <span>Create Account</span>
          </button>
        </div>
      </div>
    </div>
  );

  // ── LOGIN ──
  if(screen==='login') return (
    <div style={pageStyle}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
      <div style={{maxWidth:480,margin:'0 auto',padding:'3rem 1.5rem',minHeight:'100vh',display:'flex',flexDirection:'column',justifyContent:'center'}}>
        <TopBar title="Log In" onBack={()=>setScreen('authChoice')}/>
        <div style={{display:'flex',flexDirection:'column',gap:14,marginBottom:8}}>
          <div>
            <div style={inputLabel}>Email</div>
            <input type="email" value={authForm.email} onChange={e=>setAuthForm(p=>({...p,email:e.target.value}))} style={inputStyle}/>
          </div>
          <div>
            <div style={inputLabel}>Password</div>
            <input type="password" value={authForm.password} onChange={e=>setAuthForm(p=>({...p,password:e.target.value}))} style={inputStyle}/>
          </div>
        </div>
        {authError && <div style={{fontSize:12,color:'#E84855',marginTop:8,marginBottom:8}}>{authError}</div>}
        <button onClick={()=>{
          const found = accounts.find(a=>a.email===authForm.email && a.password===authForm.password);
          if(!found){ setAuthError("No account found, or your password doesn't match. Try Create Account if you're new."); return; }
          loginAccount();
        }} style={{...btnPrimary,marginTop:16}}>
          <span>Log In</span>
        </button>
        <button onClick={()=>setScreen('createAccount')} style={{background:'none',border:'none',color:'rgba(255,255,255,0.3)',fontSize:12,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",marginTop:16,textAlign:'center'}}>Don't have an account? Create one →</button>
      </div>
    </div>
  );

  // ── CREATE ACCOUNT (includes plan selection for the chosen mode) ──
  if(screen==='createAccount') return (
    <div style={pageStyle}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
      <div style={{maxWidth:520,margin:'0 auto',padding:'3rem 1.5rem',minHeight:'100vh',display:'flex',flexDirection:'column',justifyContent:'center'}}>
        <TopBar title="Create Account" onBack={()=>setScreen('authChoice')}/>
        <div style={{display:'flex',flexDirection:'column',gap:14,marginBottom:24}}>
          <div>
            <div style={inputLabel}>Name</div>
            <input type="text" value={authForm.name} onChange={e=>setAuthForm(p=>({...p,name:e.target.value}))} style={inputStyle}/>
          </div>
          <div>
            <div style={inputLabel}>Email</div>
            <input type="email" value={authForm.email} onChange={e=>setAuthForm(p=>({...p,email:e.target.value}))} style={inputStyle}/>
          </div>
          <div>
            <div style={inputLabel}>Password</div>
            <input type="password" value={authForm.password} onChange={e=>setAuthForm(p=>({...p,password:e.target.value}))} style={inputStyle}/>
          </div>
        </div>

        <div style={sectionLabel}>{mode==='coach' ? 'Choose Your Plan' : 'Athlete Plan'}</div>
        {mode==='athlete' ? (
          <button
            onClick={()=>setPendingPlan({tier:'athlete',billing:'monthly'})}
            style={{
              padding:'14px 16px',marginBottom:16,
              background: pendingPlan?.tier==='athlete' ? 'rgba(58,134,255,0.1)' : 'rgba(255,255,255,0.04)',
              border: pendingPlan?.tier==='athlete' ? '1px solid rgba(58,134,255,0.5)' : '1px solid rgba(255,255,255,0.08)',
              borderRadius:12,cursor:'pointer',textAlign:'left',width:'100%',fontFamily:"'DM Sans',sans-serif",
            }}
          >
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontSize:14,color:'#fff',fontWeight:600}}>Athlete Plan</span>
              <span style={{fontSize:18,fontWeight:700,color:'#3A86FF',fontFamily:"'DM Mono',monospace"}}>$49.99<span style={{fontSize:11,color:'rgba(255,255,255,0.4)',fontWeight:400}}>/mo</span></span>
            </div>
          </button>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:16}}>
            {[
              {tier:'starter',label:'Starter — up to 10 athletes',price:'$149.99'},
              {tier:'growth',label:'Growth — up to 25 athletes',price:'$299.99'},
              {tier:'pro',label:'Pro — up to 50 athletes',price:'$499.99'},
              {tier:'unlimited',label:'Unlimited — unlimited athletes',price:'$799.99'},
            ].map(t=>(
              <button
                key={t.tier}
                onClick={()=>setPendingPlan({tier:t.tier,billing:'monthly'})}
                style={{
                  padding:'14px 16px',
                  background: pendingPlan?.tier===t.tier ? 'rgba(58,134,255,0.1)' : 'rgba(255,255,255,0.04)',
                  border: pendingPlan?.tier===t.tier ? '1px solid rgba(58,134,255,0.5)' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius:12,cursor:'pointer',textAlign:'left',width:'100%',fontFamily:"'DM Sans',sans-serif",
                }}
              >
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{fontSize:13,color:'rgba(255,255,255,0.85)',fontWeight:500}}>{t.label}</span>
                  <span style={{fontSize:16,fontWeight:700,color:'#3A86FF',fontFamily:"'DM Mono',monospace"}}>{t.price}<span style={{fontSize:11,color:'rgba(255,255,255,0.4)',fontWeight:400}}>/mo</span></span>
                </div>
              </button>
            ))}
          </div>
        )}

        {authError && <div style={{fontSize:12,color:'#E84855',marginBottom:8}}>{authError}</div>}

        <button
          onClick={()=>{
            if(!pendingPlan){ setAuthError('Select a plan to continue.'); return; }
            createAccount(mode, pendingPlan.tier, pendingPlan.billing);
          }}
          style={btnPrimary}
        >
          <span>Create Account & Continue</span>
        </button>
      </div>
    </div>
  );


  if(screen==='athleteHome') return (
    <div style={pageStyle}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
      <div style={{maxWidth:600,margin:'0 auto',padding:'2rem 1.5rem'}}>
        <TopBar title="Home" onBack={logout} onPricing={()=>setShowPricing(true)}/>
        <div style={{marginBottom:24}}>
          <div style={sectionLabel}>Overall Score</div>
          <div style={{background:'#13131a',borderRadius:16,border:'1px solid rgba(255,255,255,0.07)',padding:'1.5rem'}}>
            <LineChart sessions={athlete?.sessions||[]}/>
          </div>
        </div>
        <div style={{marginBottom:24}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
            <div style={sectionLabel}>Sessions</div>
            <button onClick={()=>{setCalcResult(null);setProgram('');setNewSessionRows(Array(10).fill(null).map(()=>Array(11).fill('')));setNewInfo({name:athlete?.name||account?.name||'',age:athlete?.age||'',hand:athlete?.hand||'RHP',position:athlete?.position||'',height:''});setScreen('newSession');}} style={btnSmall}>+ New Session</button>
          </div>
          {(!athlete||!athlete.sessions||athlete.sessions.length===0)?(
            <div style={{textAlign:'center',padding:'3rem',color:'rgba(255,255,255,0.2)',fontSize:13}}>No sessions yet. Start your first session.</div>
          ):(
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {[...athlete.sessions].reverse().map((s,i)=>{
                const realIdx = athlete.sessions.length - 1 - i;
                return (
                  <div key={i} style={{display:'flex',gap:8,alignItems:'stretch'}}>
                    <button onClick={()=>{setSelectedSession(s);setScreen('sessionDetail');}} style={{...sessionCardStyle,flex:1}}>
                      <div>
                        <div style={{fontSize:13,fontWeight:500,color:'#fff'}}>{s.info?.name}</div>
                        <div style={{fontSize:11,color:'rgba(255,255,255,0.3)',marginTop:2,fontFamily:"'DM Mono',monospace"}}>{new Date(s.date).toLocaleDateString()}</div>
                      </div>
                      <div style={{textAlign:'right'}}>
                        <div style={{fontSize:22,fontWeight:700,color:'#3A86FF',fontFamily:"'DM Mono',monospace"}}>{s.overall!==null?Math.round(s.overall*100):'—'}</div>
                        <div style={{fontSize:10,color:'rgba(255,255,255,0.3)',fontFamily:"'DM Mono',monospace"}}>SCORE</div>
                      </div>
                    </button>
                    {confirmDelete?.athleteName===athlete.name&&confirmDelete?.sessionIdx===realIdx ? (
                      <div style={{display:'flex',gap:6,alignItems:'center',flexShrink:0}}>
                        <button onClick={()=>{deleteSession(athlete.name,realIdx);setConfirmDelete(null);}} style={{padding:'0 12px',height:'100%',background:'#E84855',border:'none',borderRadius:10,color:'#fff',fontSize:12,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>Confirm</button>
                        <button onClick={()=>setConfirmDelete(null)} style={{padding:'0 12px',height:'100%',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:10,color:'rgba(255,255,255,0.5)',fontSize:12,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>Cancel</button>
                      </div>
                    ) : (
                      <button onClick={()=>setConfirmDelete({athleteName:athlete.name,sessionIdx:realIdx})} style={{padding:'0 14px',background:'rgba(232,72,85,0.08)',border:'1px solid rgba(232,72,85,0.2)',borderRadius:12,color:'#E84855',fontSize:12,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",flexShrink:0}}>Delete</button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div style={{textAlign:'center',marginTop:8}}>
          <button onClick={()=>setShowPricing(true)} style={{background:'none',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,color:'rgba(255,255,255,0.4)',fontSize:12,cursor:'pointer',padding:'8px 16px'}}>Manage Subscription</button>
        </div>
      </div>
      {showPricing&&<PricingModal mode="athlete" onClose={()=>setShowPricing(false)}/>}
    </div>
  );

  // ── COACH DASHBOARD ──
  if(screen==='coachDash') return (
    <div style={pageStyle}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
      <div style={{maxWidth:600,margin:'0 auto',padding:'2rem 1.5rem'}}>
        <TopBar title="Team Dashboard" onBack={logout} onPricing={()=>setShowPricing(true)}/>

        <div style={{background:'#13131a',border:'1px solid rgba(255,255,255,0.07)',borderRadius:12,padding:'14px 16px',marginBottom:20,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <div style={{fontSize:10,color:'rgba(255,255,255,0.3)',fontFamily:"'DM Mono',monospace",textTransform:'uppercase',letterSpacing:'0.08em'}}>Plan</div>
            <div style={{fontSize:13,color:'#fff',fontWeight:600,marginTop:2,textTransform:'capitalize'}}>{account?.plan?.tier||'—'}</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:10,color:'rgba(255,255,255,0.3)',fontFamily:"'DM Mono',monospace",textTransform:'uppercase',letterSpacing:'0.08em'}}>Roster</div>
            <div style={{fontSize:13,color: atCap ? '#E84855' : '#3A86FF',fontWeight:600,marginTop:2,fontFamily:"'DM Mono',monospace"}}>
              {activeAthleteCount} / {athleteCap===Infinity?'∞':athleteCap}
            </div>
          </div>
        </div>

        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <div style={sectionLabel}>Active Athletes</div>
          <button
            onClick={()=>{
              if(atCap){ return; }
              setCalcResult(null);setProgram('');setNewSessionRows(Array(10).fill(null).map(()=>Array(11).fill('')));setNewInfo({name:'',age:'',hand:'RHP',position:'',height:''});setScreen('newSession');
            }}
            disabled={atCap}
            style={{...btnSmall, opacity: atCap?0.4:1, cursor: atCap?'not-allowed':'pointer'}}
          >+ New Session</button>
        </div>

        {atCap && (
          <div style={{background:'rgba(232,72,85,0.08)',border:'1px solid rgba(232,72,85,0.2)',borderRadius:10,padding:'12px 14px',marginBottom:16,fontSize:12,color:'#E84855',lineHeight:1.5}}>
            You've reached your {athleteCap}-athlete limit on the {account?.plan?.tier} plan. Deactivate an athlete to free a slot, or upgrade your plan to register more.
            <button onClick={()=>setShowPricing(true)} style={{display:'block',marginTop:8,background:'none',border:'none',color:'#E84855',fontSize:12,fontWeight:600,cursor:'pointer',textDecoration:'underline',padding:0}}>View plans →</button>
          </div>
        )}

        {accountAthletes.filter(a=>!a.deactivated).length===0?(
          <div style={{textAlign:'center',padding:'3rem',color:'rgba(255,255,255,0.2)',fontSize:13}}>No athletes yet. Start a new session to add one.</div>
        ):(
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {accountAthletes.filter(a=>!a.deactivated).map((a,i)=>(
              <div key={i} style={{display:'flex',gap:8,alignItems:'stretch'}}>
                <button onClick={()=>{setCurrentAthlete(a.name);setScreen('athleteProfile');}} style={{...sessionCardStyle,flex:1}}>
                  <div>
                    <div style={{fontSize:14,fontWeight:600,color:'#fff'}}>{a.name}</div>
                    <div style={{fontSize:11,color:'rgba(255,255,255,0.3)',marginTop:2,fontFamily:"'DM Mono',monospace"}}>{a.hand} · {a.position} · {a.sessions?.length||0} sessions</div>
                  </div>
                  <div style={{fontSize:11,color:'rgba(255,255,255,0.3)',fontFamily:"'DM Mono',monospace"}}>View →</div>
                </button>
                {confirmDeleteAthlete===a.name ? (
                  <div style={{display:'flex',gap:6,alignItems:'center',flexShrink:0}}>
                    <button onClick={()=>{deactivateAthlete(a.name);setConfirmDeleteAthlete(null);}} style={{padding:'0 12px',height:'100%',background:'#E84855',border:'none',borderRadius:10,color:'#fff',fontSize:12,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>Confirm</button>
                    <button onClick={()=>setConfirmDeleteAthlete(null)} style={{padding:'0 12px',height:'100%',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:10,color:'rgba(255,255,255,0.5)',fontSize:12,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>Cancel</button>
                  </div>
                ) : (
                  <button onClick={()=>setConfirmDeleteAthlete(a.name)} style={{padding:'0 14px',background:'rgba(232,72,85,0.08)',border:'1px solid rgba(232,72,85,0.2)',borderRadius:12,color:'#E84855',fontSize:12,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",flexShrink:0}}>Deactivate</button>
                )}
              </div>
            ))}
          </div>
        )}

        {accountAthletes.filter(a=>a.deactivated).length>0 && (
          <div style={{marginTop:28}}>
            <div style={sectionLabel}>Archived Athletes</div>
            <div style={{fontSize:11,color:'rgba(255,255,255,0.25)',marginBottom:12,lineHeight:1.5}}>Deactivated athletes don't count against your roster limit. Their history stays viewable but cannot generate new sessions.</div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {accountAthletes.filter(a=>a.deactivated).map((a,i)=>(
                <button key={i} onClick={()=>{setCurrentAthlete(a.name);setScreen('athleteProfile');}} style={{...sessionCardStyle,opacity:0.5}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:500,color:'rgba(255,255,255,0.6)'}}>{a.name}</div>
                    <div style={{fontSize:10,color:'rgba(255,255,255,0.25)',marginTop:2,fontFamily:"'DM Mono',monospace"}}>{a.hand} · {a.sessions?.length||0} sessions · archived</div>
                  </div>
                  <div style={{fontSize:11,color:'rgba(255,255,255,0.25)',fontFamily:"'DM Mono',monospace"}}>View →</div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{marginTop:24,textAlign:'center'}}>
          <button onClick={()=>setShowPricing(true)} style={{background:'none',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,color:'rgba(255,255,255,0.4)',fontSize:12,cursor:'pointer',padding:'8px 16px'}}>Manage Subscription</button>
        </div>
      </div>
      {showPricing&&<PricingModal mode="coach" onClose={()=>setShowPricing(false)}/>}
    </div>
  );

  // ── ATHLETE PROFILE ──
  if(screen==='athleteProfile'&&athlete) return (
    <div style={pageStyle}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
      <div style={{maxWidth:600,margin:'0 auto',padding:'2rem 1.5rem'}}>
        <TopBar title={athlete.name} onBack={()=>setScreen('coachDash')}/>
        <div style={{marginBottom:24}}>
          <div style={sectionLabel}>Overall Score Trend</div>
          <div style={{background:'#13131a',borderRadius:16,border:'1px solid rgba(255,255,255,0.07)',padding:'1.5rem'}}>
            <LineChart sessions={athlete.sessions||[]}/>
          </div>
        </div>
        <div style={sectionLabel}>Session History</div>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {[...(athlete.sessions||[])].reverse().map((s,i)=>{
            const realIdx = (athlete.sessions||[]).length - 1 - i;
            return (
              <div key={i} style={{display:'flex',gap:8,alignItems:'stretch'}}>
                <button onClick={()=>{setSelectedSession(s);setScreen('sessionDetail');}} style={{...sessionCardStyle,flex:1}}>
                  <div><div style={{fontSize:13,color:'rgba(255,255,255,0.6)',fontFamily:"'DM Mono',monospace"}}>{new Date(s.date).toLocaleDateString()}</div></div>
                  <div style={{fontSize:22,fontWeight:700,color:'#3A86FF',fontFamily:"'DM Mono',monospace"}}>{s.overall!==null?Math.round(s.overall*100):'—'}</div>
                </button>
                {confirmDelete?.athleteName===athlete.name&&confirmDelete?.sessionIdx===realIdx ? (
                  <div style={{display:'flex',gap:6,alignItems:'center',flexShrink:0}}>
                    <button onClick={()=>{deleteSession(athlete.name,realIdx);setConfirmDelete(null);}} style={{padding:'0 12px',height:'100%',background:'#E84855',border:'none',borderRadius:10,color:'#fff',fontSize:12,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>Confirm</button>
                    <button onClick={()=>setConfirmDelete(null)} style={{padding:'0 12px',height:'100%',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:10,color:'rgba(255,255,255,0.5)',fontSize:12,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>Cancel</button>
                  </div>
                ) : (
                  <button onClick={()=>setConfirmDelete({athleteName:athlete.name,sessionIdx:realIdx})} style={{padding:'0 14px',background:'rgba(232,72,85,0.08)',border:'1px solid rgba(232,72,85,0.2)',borderRadius:12,color:'#E84855',fontSize:12,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",flexShrink:0}}>Delete</button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ── SESSION DETAIL ──
  if(screen==='sessionDetail'&&selectedSession) {
    const s = selectedSession;
    const bArr = s.result?.bArr||[null,null,null,null,null];
    const bNames = ['Direction','Velocity','Shape','Arm Action','Command'];
    const prog = s.program||'';
    const sections = { plyo:'', main:'', armCare:'' };
    if(prog) {
      const plyoMatch = prog.match(/Plyo Drills[\s\S]*?(?=HIGH INTENT DAY|$)/i);
      const mainMatch = prog.match(/HIGH INTENT DAY[\s\S]*?(?=MID INTENT DAY|$)/i);
      const armMatch = prog.match(/Post Throw Arm Care[\s\S]*?(?=MID INTENT DAY|NEXT BLOCK|$)/i);
      if(plyoMatch) sections.plyo=plyoMatch[0].trim();
      if(mainMatch) sections.main=mainMatch[0].replace(/Post Throw Arm Care[\s\S]*/,'').trim();
      if(armMatch) sections.armCare=armMatch[0].trim();
    }
    return (
      <div style={pageStyle}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
        <div style={{maxWidth:600,margin:'0 auto',padding:'2rem 1.5rem'}}>
          <TopBar title={new Date(s.date).toLocaleDateString()} onBack={()=>setScreen(mode==='coach'?'athleteProfile':'athleteHome')}/>
          <div style={{display:'flex',gap:8,marginBottom:24}}>
            {['score','program'].map(t=>(
              <button key={t} onClick={()=>setActiveTab(t)} style={{flex:1,padding:'10px',background:activeTab===t?'#3A86FF':'rgba(255,255,255,0.05)',border:'none',borderRadius:10,color:activeTab===t?'#fff':'rgba(255,255,255,0.4)',fontSize:12,cursor:'pointer',fontWeight:500,textTransform:'capitalize'}}>
                {t==='score'?'Bucket Scores':'Program'}
              </button>
            ))}
          </div>
          {activeTab==='score'&&(
            <>
              <div style={{background:'#13131a',borderRadius:16,border:'1px solid rgba(255,255,255,0.07)',padding:'1.5rem',display:'flex',justifyContent:'center',marginBottom:16}}>
                <RadarChart scores={bArr.map(v=>v||0)} labels={bNames} size={260}/>
              </div>
              <div style={{background:'#13131a',borderRadius:16,border:'1px solid rgba(255,255,255,0.07)',padding:'1.5rem'}}>
                <div style={{marginBottom:16,display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                  <div>
                    <div style={{fontSize:11,color:'rgba(255,255,255,0.3)',fontFamily:"'DM Mono',monospace",textTransform:'uppercase',letterSpacing:'0.08em'}}>Overall</div>
                    <div style={{fontSize:36,fontWeight:700,color:'#fff',fontFamily:"'DM Mono',monospace"}}>{s.overall!==null?Math.round(s.overall*100):'—'}</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontSize:11,color:'rgba(255,255,255,0.3)',fontFamily:"'DM Mono',monospace",marginBottom:4}}>{s.result?.scoreLabel}</div>
                    <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',maxWidth:180,textAlign:'right'}}>{s.result?.veloProfile}</div>
                  </div>
                </div>
                {bArr.map((v,i)=><BucketBar key={i} label={bNames[i]} value={v} color={BUCKET_COLORS[i]}/>)}
                <div style={{marginTop:16,paddingTop:16,borderTop:'1px solid rgba(255,255,255,0.06)',display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                  {[['Velo Profile',s.result?.veloProfile],['Velo Maker',s.result?.bestMetric],['Primary Focus',s.result?.focus],['Age Tier',s.result?.ageTier]].map(([l,v])=>(
                    <div key={l} style={{background:'rgba(255,255,255,0.03)',borderRadius:8,padding:'10px 12px'}}>
                      <div style={{fontSize:10,color:'rgba(255,255,255,0.3)',fontFamily:"'DM Mono',monospace",textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:4}}>{l}</div>
                      <div style={{fontSize:11,color:'rgba(255,255,255,0.7)',lineHeight:1.4}}>{v||'—'}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
          {activeTab==='program'&&(
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              <div style={{background:'#13131a',borderRadius:16,border:'1px solid rgba(255,255,255,0.07)',padding:'1.25rem'}}>
                <ProgramDisplay program={s.program||''}/>
              </div>
              {(()=>{
                // Use saved weights or re-parse from program text as fallback
                const prog = s.program || '';
                const matches = [...prog.matchAll(/(\d+)\s*oz/gi)];
                const parsed = [...new Set(matches.map(m=>m[1]+'oz'))].filter(w=>['6oz','5oz','4oz','3oz'].includes(w)).sort((a,b)=>parseInt(b)-parseInt(a));
                const weights = (s.rngWeights && s.rngWeights.length > 0) ? s.rngWeights : parsed;
                if(weights.length === 0) return null;
                return (
                  <RngTracker
                    weights={weights}
                    velocities={s.rngVelocities||{}}
                    savedData={s.rngVelocities||{}}
                    onChange={(weight, vals) => {
                      // Always editable — save back to athletes store immediately
                      setAthletes(prev => prev.map(a => {
                        if(!a.sessions) return a;
                        const si = a.sessions.findIndex(sess => sess.date === s.date);
                        if(si === -1) return a;
                        const updated = [...a.sessions];
                        const newVelocities = {...(updated[si].rngVelocities||{}), [weight]: vals};
                        updated[si] = {...updated[si], rngVelocities: newVelocities, rngWeights: weights};
                        // Update selectedSession so UI reflects change immediately
                        setSelectedSession({...updated[si]});
                        return {...a, sessions: updated};
                      }));
                    }}
                  />
                );
              })()}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── NEW SESSION ──
  if(screen==='newSession') return (
    <div style={pageStyle}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
      <div style={{maxWidth:700,margin:'0 auto',padding:'2rem 1.5rem'}}>
        <TopBar title="New Session" onBack={()=>setScreen(mode==='coach'?'coachDash':'athleteHome')}/>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:24}}>
          {[['Name','name','text'],['Age','age','number'],['Height (in)','height','number'],['Position','position','text']].map(([label,key,type])=>(
            <div key={key}>
              <div style={inputLabel}>{label}</div>
              <input type={type} value={newInfo[key]} onChange={e=>setNewInfo(p=>({...p,[key]:e.target.value}))} style={inputStyle}/>
            </div>
          ))}
          <div>
            <div style={inputLabel}>Handedness</div>
            <select value={newInfo.hand} onChange={e=>setNewInfo(p=>({...p,hand:e.target.value}))} style={inputStyle}>
              <option value="RHP">RHP</option>
              <option value="LHP">LHP</option>
            </select>
          </div>
        </div>
        <div style={sectionLabel}>Trackman Data — Top 10 Fastballs</div>
        <CsvUpload onLoad={(rows) => {
          setNewSessionRows(rows);
        }}/>
        <MechanicsImages
          images={mechanicsImages}
          onChange={(pos, val) => setMechanicsImages(prev => ({...prev, [pos]: val}))}
        />
        <div style={{background:'#13131a',borderRadius:16,border:'1px solid rgba(255,255,255,0.07)',padding:'1rem',marginBottom:16}}>
          <PitchTable rows={newSessionRows} onChange={handleRowChange}/>
        </div>
        <button onClick={handleCalc} style={{...btnPrimary,marginBottom:24}}><span>Calculate</span></button>
        {calcResult&&(
          <>
            <div style={{background:'#13131a',borderRadius:16,border:'1px solid rgba(255,255,255,0.07)',padding:'1.5rem',marginBottom:16}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20}}>
                <div>
                  <div style={{fontSize:11,color:'rgba(255,255,255,0.3)',fontFamily:"'DM Mono',monospace",textTransform:'uppercase',letterSpacing:'0.08em'}}>Overall Score</div>
                  <div style={{fontSize:48,fontWeight:700,color:'#fff',fontFamily:"'DM Mono',monospace",lineHeight:1}}>{calcResult.overall!==null?Math.round(calcResult.overall*100):'—'}</div>
                  <div style={{fontSize:12,color:'rgba(255,255,255,0.4)',marginTop:4}}>{calcResult.scoreLabel}</div>
                </div>
                <RadarChart scores={calcResult.bArr.map(v=>v||0)} labels={calcResult.bNames} size={160}/>
              </div>
              {calcResult.bArr.map((v,i)=><BucketBar key={i} label={calcResult.bNames[i]} value={v} color={BUCKET_COLORS[i]}/>)}
              <div style={{marginTop:16,paddingTop:16,borderTop:'1px solid rgba(255,255,255,0.06)',display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                {[['Velo Profile',calcResult.veloProfile],['Velo Maker',calcResult.bestMetric],['Primary Focus',calcResult.focus],['Age Tier',calcResult.ageTier]].map(([l,v])=>(
                  <div key={l} style={{background:'rgba(255,255,255,0.03)',borderRadius:8,padding:'10px 12px'}}>
                    <div style={{fontSize:10,color:'rgba(255,255,255,0.3)',fontFamily:"'DM Mono',monospace",textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:4}}>{l}</div>
                    <div style={{fontSize:11,color:'rgba(255,255,255,0.7)',lineHeight:1.4}}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={()=>generateProgram(calcResult,newInfo)} disabled={generating} style={{...btnPrimary,opacity:generating?0.6:1,marginBottom:generating?8:16}}>
              {generating ? <span>Generating program...</span> : <span>Generate Throwing Program</span>}
            </button>
            {generating && (
              <div style={{marginBottom:16,padding:'12px 16px',background:'#13131a',border:'1px solid rgba(255,255,255,0.07)',borderRadius:12}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                  <span style={{fontSize:11,color:'rgba(255,255,255,0.5)',fontFamily:"'DM Mono',monospace"}}>{generateStage}</span>
                  <span style={{fontSize:11,color:'#3A86FF',fontFamily:"'DM Mono',monospace",fontWeight:600}}>{generateProgress}%</span>
                </div>
                <div style={{height:3,background:'rgba(255,255,255,0.06)',borderRadius:2,overflow:'hidden'}}>
                  <div style={{
                    height:3,
                    width:`${generateProgress}%`,
                    background:'linear-gradient(90deg,#3A86FF,#2EC4B6)',
                    borderRadius:2,
                    transition:'width 0.8s ease',
                  }}/>
                </div>
                <div style={{display:'flex',gap:4,marginTop:8,flexWrap:'wrap'}}>
                  {['Analyzing','Limiters','Red Flags','Plyo','Catch Play','Main Events','Arm Care','Finalizing'].map((step,i)=>(
                    <div key={i} style={{
                      fontSize:9,padding:'2px 6px',borderRadius:4,
                      fontFamily:"'DM Mono',monospace",
                      background: generateProgress >= (i+1)*12 ? 'rgba(58,134,255,0.2)' : 'rgba(255,255,255,0.04)',
                      color: generateProgress >= (i+1)*12 ? '#3A86FF' : 'rgba(255,255,255,0.2)',
                      border: `1px solid ${generateProgress >= (i+1)*12 ? 'rgba(58,134,255,0.3)' : 'rgba(255,255,255,0.06)'}`,
                      transition:'all 0.4s ease',
                    }}>{step}</div>
                  ))}
                </div>
              </div>
            )}
            {program&&(
              <div style={{marginTop:8}}>
                <ProgramDisplay program={program}/>
                <RngTracker
                  weights={parsedRngWeights}
                  velocities={rngVelocities}
                  onChange={(weight, vals) => setRngVelocities(prev=>({...prev,[weight]:vals}))}
                />
                <button onClick={()=>navigator.clipboard.writeText(program)} style={{...btnSmall,marginTop:12,width:'100%',textAlign:'center'}}>Copy Full Program</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  return null;
}
