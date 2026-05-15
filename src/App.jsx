import { useState, useEffect } from "react";

// ─── STORAGE HELPERS ────────────────────────────────────────────────────────
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

  // Longitudinal context from prior sessions
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

LONGITUDINAL RULES:
- If a bucket has been low across multiple sessions, escalate the emphasis — do not repeat the same approach.
- If a bucket improved, acknowledge it and build on what drove that improvement.
- If velocity increased, identify what drove it and reinforce it.
- If velocity stalled or declined, identify what changed and adjust the program accordingly.
- Do not prescribe the same plyo drills as the most recent session unless they are producing clear measurable improvement.
- The program must reflect this athlete's history and trajectory — not just today's snapshot.`;
  }

  return `You are an elite baseball pitching coach and sports scientist. Generate a complete structured throwing program. Follow ALL rules below exactly. No deviations. No clarifying questions. No asterisks, no dashes used as decorators, no horizontal rules in the output.

You have deep knowledge of Tread Athletics, Driveline Baseball, 108 Performance, MLB/MiLB development programs, Korean Baseball Organization, kazu_jave methodology, Bill Hartman UHPC Model, and peer-reviewed biomechanics research.

CORE RULES

LANGUAGE: Plain, direct, face to face. No bucket score numbers in output. Helper metrics explain the story only. Every section connects back to the diagnosis. No asterisks or decorative dashes anywhere in the output.

OUTPUT FORMAT RULES:
- Section headers are written in ALL CAPS on their own line with no decorators
- Sub-headers use Title Case on their own line
- Drill names are bold in the sense that they appear on their own line followed by a colon
- Lists use clean indentation with a single hyphen only where a list is genuinely needed
- No horizontal rules, no asterisks, no markdown decorators of any kind
- The output should read like a professional coaching document, not a chat response

AGE RULES:
- Under 11: No plyo routine, no Run and Gun. Catch play arc to Light Long Toss only. No bullpens over 15 pitches.
- Age 11-12: No Run and Gun unless velocity 75+ mph. If 75+ treat as older.
- Age 13+: Full program.
- Bullpen pitch counts: governed by recovery data. Prescribe conservatively without wearable data.

WEEKLY STRUCTURE:
- Max 1 Run and Gun per week. Max 2 bullpens per week.
- Never Run and Gun on Low Intent day. Never flat ground (Semi-Slope is fallback).
- Run and Gun always heavy to light: 6oz to 5oz to 4oz to 3oz. Reps only, no distances.
- Run and Gun ALWAYS comes after the catch play arc.

DECISION TREE:
- Run and Gun + Mechanical Bullpen (Max Long Toss both days): athlete needs velocity bump
- High Intent Bullpen + Max Long Toss: athlete has high velocity, focus mechanics and command
- Max Long Toss + Mechanical Bullpen: youth, developing arm path
- Semi-Slope + Max Long Toss: fallback
- Low Intent always: catch play arc to Light Long Toss + drill work on the way back in

CATCH PLAY ARC: One continuous sequence every session. Start 30 to 45 feet, build to Max Long Toss or prescribed Light Long Toss. Drill work on the way back in. Feeds directly into main event with no break.

LEAD LEG BLOCK: Always include at least one lead leg block drill. Heavy emphasis if Velocity bucket is low.

MECHANICAL MODEL:
1. Back leg drives into ground at leg lift
2. Sink and ride — ribcage stacked over pelvis
3. Back knee and hip IR drives hips toward lead leg
4. Lead leg blocks — energy transfer pivot
5. Arm reaches layback as front foot strikes — ribcage closed
6. Ribcage opens explosively — whip action through release

RED FLAGS (weave triggered flags into diagnosis naturally, state injury risk, note video verification):
1. FLYING OPEN: Plate Side arm-side + Match below 0.33 + Direction low — injury risk, no high intent Run and Gun while flagged
2. ARM DROP: Extension too long for height AND Release Height drops — injury risk
3. EARLY TRUNK ROTATION (video verification): HAA inconsistency + Direction low + Plate Side Match low + Release Height Match high — elevated surgical risk
4. WEAK LEAD LEG BLOCK (injury): Velocity + IVB + Spin + Command + Direction all low — lead leg collapsing
5. ARM LAG / LATE ARM: Plate Side Match below 0.33 + Release Height Match above 0.66 — UCL risk
6. INCONSISTENT RELEASE POINT: High variability across Release Side AND Release Height — command and fatigue indicator
7. LATERAL TRUNK TILT (video verification): Release Height below predicted + HAA inconsistent — surgical history association

PLYO BALL PRESCRIPTION — CRITICAL

The plyo routine is one of the two most important parts of this program. Every drill and weight must be chosen with deliberate intent for this specific athlete. A generic routine is a failure.

Weight Philosophy:
- Heavier 275 to 450g: Slows arm down. Loads deep ranges of motion. Strengthens posterior shoulder and chain. Reinforces positions. Use when athlete needs to feel a position, strengthen a range, or slow a pattern to correct it.
- Lighter 100 to 200g: Speeds arm up. Trains rate of force development. Grooves patterning and rhythm at speed. Low intent days stay light throughout.
- Mid-weight 200 to 275g: Connection and sequencing. Blends lower half timing with arm path.

Age weight caps: Under 13 max 150g. Age 13 to 15 max 275g. Age 16 and older full range.

Drill Selection:
Step 1: Identify primary limiter bucket AND the specific mechanical cause within it. Not just the bucket name.
Step 2: Identify all triggered red flags. Flags modify drill selection even when bucket is the same.
Step 3: Select drills that directly attack the specific cause.
Step 4: Assign weight based on drill goal, not a template.
Step 5: Ensure variety. No two consecutive drills from same sub-category.
Step 6: Lead leg block always included. Prominent placement with heavier weight if Velocity is primary limiter.

Biomechanical Progression Order: Order drills by mechanical sequence, not weight. Build kinetic chain from ground up: rhythm and lower half loading, hip-shoulder separation, arm path and connection, lead leg block, highest intent full pattern drill.

When two athletes share the same lowest bucket, the routine must still differ based on the specific mechanical cause and red flags. Never assign drills based on bucket label alone.

POST-THROW ARM CARE — CRITICAL

Post-throw arm care is one of the two most important parts of this program. It must respond to the specific stressors of this athlete's delivery and flags, not a generic circuit.

Principles:
- Arm care is a kinetic chain problem. Address the system.
- Deceleration places maximum proximal shoulder and elbow force on the arm.
- Scapular stability is foundational before isolated rotator cuff work.
- Hip IR restoration required to decelerate trunk and pelvis over lead leg.
- Thoracic extension and rotation must be addressed.
- Scale to intent: High = deceleration and posterior shoulder and ROM. Mid = recovery and maintenance and breathing reset. Low = blood flow and patterning and Hartman UHPC thorax and pelvis reset.
- Every exercise must include clear step-by-step instructions.

Flag-Specific Arm Care:
- ARM LAG / LATE ARM: prioritize hip IR, posterior capsule, timing-based breathing resets
- FLYING OPEN: prioritize hip IR, anterior chain lengthening, sequencing-based resets
- INCONSISTENT RELEASE POINT: prioritize scapular stability, T-spine rotation, lower half hip work
- WEAK LEAD LEG BLOCK: prioritize hip IR on lead leg side, glute and hip deceleration, pelvic positioning resets
- ARM DROP: prioritize posterior shoulder loading, scap retraction, thoracic extension
- LATERAL TRUNK TILT: prioritize lateral hip and thorax work, ribcage-over-pelvis breathing resets
- EARLY TRUNK ROTATION: prioritize hip-shoulder separation restoration, ribcage closure, T-spine rotation

Two athletes with the same intent level must still get different arm care based on their specific flags and delivery stressors.
${longitudinalBlock}

REQUIRED OUTPUT FORMAT

Athlete: ${info.name}
Age: ${info.age} | Height: ${info.height||'N/A'} in | Throwing Hand: ${info.hand} | Position: ${info.position}
Date: ${new Date().toLocaleDateString()} through ${new Date(Date.now()+30*24*60*60*1000).toLocaleDateString()}

COACHING DIAGNOSIS

[One paragraph. No labels. Natural connected paragraph. What this athlete does well, what is limiting them, the specific mechanical cause, how they connect, what changes when fixed. Red flags woven in naturally. Plain language. No bucket numbers. If longitudinal data is present, reference what has improved or stalled and why this program adjusts accordingly.]

DAILY STRUCTURE

Dynamic Warm Up
[Each movement on its own line: movement name, sets and reps or duration. Tailored to this athlete's limiter.]

Band Work
Reverse T's
Reverse Y's
Pec Fly's
Overhead Tricep Extension
Low ER/IR
High ER/IR

Plyo Drills

Limiter identified: [primary limiter bucket AND specific mechanical cause — not just the bucket name]
Red flags active: [list triggered flags or None]
Weight strategy: [one sentence explaining weight progression for this specific athlete's cause]
Goal: [one sentence — specific to this athlete, not generic]

[Drill Name]
Weight: [Xg]
Reps: 1x8
Why this drill: [one sentence connecting to specific cause above]
Cue: [one sentence]
How to perform: [2 to 3 sentences step-by-step]

[4 to 5 drills in biomechanical sequence order]

HIGH INTENT DAY

Catch Play Arc
Start at 30 to 45 feet, build out to Max Long Toss
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
How to perform: [step-by-step, athlete can perform with no other instruction]
Sets and Reps: [prescription]
Why: [one sentence tied to specific stressor for this athlete]

[4 to 6 exercises. High intent: deceleration, posterior shoulder, scapular control, T-spine mobility, hip IR restoration. Must reflect this athlete's specific flags.]

MID INTENT DAY

Catch Play Arc
Start at 30 to 45 feet, build out to Max Long Toss
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

[4 to 6 exercises. Mid intent: recovery, maintenance, breathing-based reset. Must reflect this athlete's flags.]

LOW INTENT DAY

Catch Play Arc
Start at 30 to 45 feet, build out to [prescribed Light Long Toss distance]
[Number of throws at prescribed distance]
On the way back in: [drill work tied to limiter cause and red flags]

Post-Throw Arm Care

Stressors identified: [one sentence]

[Exercise Name]
How to perform: [step-by-step]
Sets and Reps: [prescription]
Why: [one sentence]

[4 to 6 exercises. Low intent: blood flow, patterning, breathing-based thorax and pelvis reset.]

ATHLETE DATA
Athlete: ${info.name} | Age: ${info.age} (${ageTier}) | Hand: ${info.hand} | Position: ${info.position}
Primary Focus: ${focus}
Velo Maker: ${bestMetric}
Velo Maker Note: ${veloMakerNote}
Velocity Profile: ${veloProfile}

Buckets (logic only, never quote in output):
Direction: ${f2(bArr[0])} | Velocity: ${f2(bArr[1])} | Shape: ${f2(bArr[2])} | Arm Action: ${f2(bArr[3])} | Command: ${f2(bArr[4])}
Lowest bucket: ${bNames[bArr.reduce((mi,v,i)=>(v!==null&&(mi===-1||v<bArr[mi]))?i:mi,-1)]}

Primary Anchors: Velo ${f1(c13)} (${veloContext}) | Ext ${f1(d13)} | RelSide ${f1(a13)} | RelHt ${f1(h13)} | IVB ${f1(e13)} (${ivbContext}) | HB ${f1(f13)} | Spin ${f1(i13)} (${spinContext})
Secondary: VAA ${f1(g13)} | HAA ${f1(b13)}
Tertiary: PlateSide ${f1(j13)} | PlateHt ${f1(k13)}
Helpers: PredPlateSide ${f2(n13)} | PredRelHt ${f2(o13)} | PlateSideMatch ${f2(n14)} | RelHtMatch ${f2(o14)} | VeloScale ${f2(p14)}

DATA RULES:
- PlateSideMatch ${f2(n14)}: ${n14!==null&&n14<0.33?'LOW = timing issue, arm late, not structural':n14!==null&&n14>0.66?'HIGH = matches delivery, structural or directional issue':'MODERATE = use other indicators'}
- RelHtMatch ${f2(o14)}: ${o14!==null&&o14>0.66?'HIGH = release height structurally consistent':o14!==null&&o14<0.33?'LOW = inconsistent, likely sequencing':'MODERATE = check other indicators'}
- Velo Maker is ${bestMetric}: ${veloMakerNote}
- Lowest bucket is ${bNames[bArr.reduce((mi,v,i)=>(v!==null&&(mi===-1||v<bArr[mi]))?i:mi,-1)]} — identify specific mechanical cause before selecting any drill
- Evaluate all 7 red flags before writing the diagnosis`;
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
  {label:'Up to 5 athletes',price:'$99.99'},
  {label:'Up to 10 athletes',price:'$179.99'},
  {label:'Up to 20 athletes',price:'$319.99'},
  {label:'Up to 35 athletes',price:'$489.99'},
  {label:'35+ athletes',price:'$599.99'},
];
function PricingModal({mode, onClose}) {
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',backdropFilter:'blur(8px)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}} onClick={onClose}>
      <div style={{background:'#13131a',border:'1px solid rgba(255,255,255,0.1)',borderRadius:16,padding:'2rem',maxWidth:480,width:'100%'}} onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:11,letterSpacing:'0.12em',textTransform:'uppercase',color:'rgba(255,255,255,0.4)',marginBottom:8,fontFamily:"'DM Mono',monospace"}}>Subscription</div>
        <div style={{fontSize:22,fontWeight:700,color:'#fff',marginBottom:24}}>{mode==='athlete'?'Athlete Plan':'Coach Plan'}</div>
        {mode==='athlete'?(
          <div style={{background:'rgba(58,134,255,0.1)',border:'1px solid rgba(58,134,255,0.3)',borderRadius:12,padding:'1.5rem',textAlign:'center'}}>
            <div style={{fontSize:36,fontWeight:800,color:'#3A86FF'}}>$24.99</div>
            <div style={{color:'rgba(255,255,255,0.5)',fontSize:13,marginTop:4}}>per month</div>
            <div style={{color:'rgba(255,255,255,0.7)',fontSize:13,marginTop:16}}>Full access to scoring, reports, session history, and program generation</div>
          </div>
        ):(
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {COACH_TIERS.map((t,i)=>(
              <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 16px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:10}}>
                <span style={{fontSize:13,color:'rgba(255,255,255,0.7)'}}>{t.label}</span>
                <span style={{fontSize:15,fontWeight:700,color:'#3A86FF',fontFamily:"'DM Mono',monospace"}}>{t.price}<span style={{fontSize:11,color:'rgba(255,255,255,0.4)'}}>/mo</span></span>
              </div>
            ))}
          </div>
        )}
        <button onClick={onClose} style={{width:'100%',marginTop:24,padding:'12px',background:'#3A86FF',border:'none',borderRadius:10,color:'#fff',fontSize:14,fontWeight:600,cursor:'pointer'}}>Get Started</button>
        <button onClick={onClose} style={{width:'100%',marginTop:8,padding:'10px',background:'transparent',border:'none',color:'rgba(255,255,255,0.3)',fontSize:13,cursor:'pointer'}}>Cancel</button>
      </div>
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

function TopBar({title, onBack, onPricing}) {
  return (
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:28}}>
      <button onClick={onBack} style={{background:'none',border:'none',color:'rgba(255,255,255,0.4)',fontSize:13,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",padding:0}}>← Back</button>
      <div style={{fontSize:13,fontWeight:600,color:'#fff',fontFamily:"'DM Sans',sans-serif"}}>{title}</div>
      {onPricing?<button onClick={onPricing} style={{background:'none',border:'none',color:'rgba(255,255,255,0.4)',fontSize:12,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>Plans</button>:<div style={{width:40}}/>}
    </div>
  );
}

// ─── RUN AND GUN VELOCITY TRACKER ────────────────────────────────────────────
function RngTracker({ weights, velocities, onChange, savedData }) {
  const weeks = ['Week 1','Week 2','Week 3','Week 4'];
  if(!weights || weights.length === 0) return null;

  return (
    <div style={{background:'#13131a',border:'1px solid rgba(255,255,255,0.07)',borderRadius:16,padding:'1.25rem',marginTop:12}}>
      <div style={{fontSize:11,fontWeight:600,letterSpacing:'0.12em',textTransform:'uppercase',color:'rgba(255,255,255,0.35)',fontFamily:"'DM Mono',monospace",marginBottom:16}}>Run and Gun Velocity Tracker</div>
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
              const vals = (savedData ? savedData[weight] : velocities[weight]) || ['','','',''];
              return (
                <tr key={weight}>
                  <td style={{fontSize:12,fontWeight:600,color:'rgba(255,255,255,0.8)',padding:'8px 8px',borderBottom:'1px solid rgba(255,255,255,0.04)',fontFamily:"'DM Mono',monospace",whiteSpace:'nowrap'}}>{weight}</td>
                  {vals.map((v,wi)=>(
                    <td key={wi} style={{padding:'6px 8px',borderBottom:'1px solid rgba(255,255,255,0.04)',textAlign:'center'}}>
                      {savedData ? (
                        <div style={{fontSize:13,fontWeight:600,color:v?'#3A86FF':'rgba(255,255,255,0.2)',fontFamily:"'DM Mono',monospace",textAlign:'center'}}>
                          {v || '—'}
                        </div>
                      ) : (
                        <input
                          type="number"
                          value={v}
                          placeholder="mph"
                          onChange={e => {
                            const updated = [...vals];
                            updated[wi] = e.target.value;
                            onChange(weight, updated);
                          }}
                          style={{
                            width:56,
                            background:'rgba(255,255,255,0.05)',
                            border:'1px solid rgba(255,255,255,0.1)',
                            borderRadius:6,
                            padding:'5px 6px',
                            color:'#fff',
                            fontSize:12,
                            fontFamily:"'DM Mono',monospace",
                            outline:'none',
                            textAlign:'center',
                          }}
                          onFocus={e=>e.target.style.borderColor='rgba(58,134,255,0.5)'}
                          onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.1)'}
                        />
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!savedData && (
        <div style={{fontSize:11,color:'rgba(255,255,255,0.2)',marginTop:10,fontFamily:"'DM Mono',monospace"}}>
          Enter max velocity per weight each week. Saved automatically with session.
        </div>
      )}
    </div>
  );
}

// ─── PROGRAM DISPLAY ────────────────────────────────────────────────────────
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

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState('landing');
  const [mode, setMode] = useState(null);
  const [showPricing, setShowPricing] = useState(false);
  const [athletes, setAthletes] = useState(() => store.get('athletes')||[]);
  const [currentAthlete, setCurrentAthlete] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [newSessionRows, setNewSessionRows] = useState(Array(10).fill(null).map(()=>Array(11).fill('')));
  const [newInfo, setNewInfo] = useState({name:'',age:'',hand:'RHP',position:'',height:''});
  const [calcResult, setCalcResult] = useState(null);
  const [rngVelocities, setRngVelocities] = useState({}); // {weightLabel: [w1,w2,w3,w4]}
  const [parsedRngWeights, setParsedRngWeights] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null); // {athleteName, sessionIdx}
  const [confirmDeleteAthlete, setConfirmDeleteAthlete] = useState(null); // athleteName
  const [generateProgress, setGenerateProgress] = useState(0);
  const [generateStage, setGenerateStage] = useState('');
  const [program, setProgram] = useState('');
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('score');

  useEffect(()=>{ store.set('athletes',athletes); },[athletes]);

  const saveAthlete = (info, result, prog, rngVels={}, rngWts=[]) => {
    const session = { date: Date.now(), info, result: {...result, bArr: result.bArr}, program: prog, overall: result.overall, rngVelocities: rngVels, rngWeights: rngWts };
    setAthletes(prev => {
      const idx = prev.findIndex(a=>a.name===info.name&&a.hand===info.hand);
      if(idx>=0) { const updated=[...prev]; updated[idx]={...updated[idx],sessions:[...(updated[idx].sessions||[]),session]}; return updated; }
      return [...prev, {name:info.name,hand:info.hand,position:info.position,age:info.age,sessions:[session]}];
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
      const athleteRecord = athletes.find(a=>a.name===info.name&&a.hand===info.hand);
      const priorSessions = athleteRecord?.sessions || [];
      const prompt = buildPrompt(result, info, priorSessions);
      const resp = await fetch('/api/generate',{
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

  const deleteSession = (athleteName, sessionIdx) => {
    setAthletes(prev => prev.map(a => {
      if(a.name !== athleteName) return a;
      const updated = [...(a.sessions||[])];
      updated.splice(sessionIdx, 1);
      return {...a, sessions: updated};
    }));
  };

  const deleteAthlete = (athleteName) => {
    setAthletes(prev => prev.filter(a => a.name !== athleteName));
    if(currentAthlete === athleteName) setCurrentAthlete(null);
  };

  const handleCalc = () => { const result = calcSession(newSessionRows, newInfo); if(result) setCalcResult(result); };
  const handleRowChange = (ri,ci,val) => { setNewSessionRows(prev=>{ const n=[...prev.map(r=>[...r])]; n[ri][ci]=val; return n; }); };
  const athlete = currentAthlete ? athletes.find(a=>a.name===currentAthlete) : null;

  // ── LANDING ──
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
          <button onClick={()=>{setMode('athlete');setScreen('athleteHome');}} style={btnPrimary}>
            <span>Athlete</span>
            <span style={{fontSize:11,opacity:0.6,fontWeight:400}}>Personal development tracking</span>
          </button>
          <button onClick={()=>{setMode('coach');setScreen('coachDash');}} style={btnSecondary}>
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

  // ── ATHLETE HOME ──
  if(screen==='athleteHome') return (
    <div style={pageStyle}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
      <div style={{maxWidth:600,margin:'0 auto',padding:'2rem 1.5rem'}}>
        <TopBar title="Home" onBack={()=>setScreen('landing')} onPricing={()=>setShowPricing(true)}/>
        <div style={{marginBottom:24}}>
          <div style={sectionLabel}>Overall Score</div>
          <div style={{background:'#13131a',borderRadius:16,border:'1px solid rgba(255,255,255,0.07)',padding:'1.5rem'}}>
            <LineChart sessions={athlete?.sessions||[]}/>
          </div>
        </div>
        <div style={{marginBottom:24}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
            <div style={sectionLabel}>Sessions</div>
            <button onClick={()=>{setCalcResult(null);setProgram('');setNewSessionRows(Array(10).fill(null).map(()=>Array(11).fill('')));setNewInfo({name:'',age:'',hand:'RHP',position:'',height:''});setScreen('newSession');}} style={btnSmall}>+ New Session</button>
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
        <TopBar title="Team Dashboard" onBack={()=>setScreen('landing')} onPricing={()=>setShowPricing(true)}/>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <div style={sectionLabel}>Athletes</div>
          <button onClick={()=>{setCalcResult(null);setProgram('');setNewSessionRows(Array(10).fill(null).map(()=>Array(11).fill('')));setNewInfo({name:'',age:'',hand:'RHP',position:'',height:''});setScreen('newSession');}} style={btnSmall}>+ New Session</button>
        </div>
        {athletes.length===0?(
          <div style={{textAlign:'center',padding:'3rem',color:'rgba(255,255,255,0.2)',fontSize:13}}>No athletes yet. Start a new session to add one.</div>
        ):(
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {athletes.map((a,i)=>(
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
                    <button onClick={()=>{deleteAthlete(a.name);setConfirmDeleteAthlete(null);setScreen('coachDash');}} style={{padding:'0 12px',height:'100%',background:'#E84855',border:'none',borderRadius:10,color:'#fff',fontSize:12,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>Confirm</button>
                    <button onClick={()=>setConfirmDeleteAthlete(null)} style={{padding:'0 12px',height:'100%',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:10,color:'rgba(255,255,255,0.5)',fontSize:12,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>Cancel</button>
                  </div>
                ) : (
                  <button onClick={()=>setConfirmDeleteAthlete(a.name)} style={{padding:'0 14px',background:'rgba(232,72,85,0.08)',border:'1px solid rgba(232,72,85,0.2)',borderRadius:12,color:'#E84855',fontSize:12,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",flexShrink:0}}>Delete</button>
                )}
              </div>
            ))}
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
                    velocities={{}}
                    onChange={(weight, vals) => {
                      // Update the session's rngVelocities in athletes store
                      setAthletes(prev => prev.map(a => {
                        if(!a.sessions) return a;
                        const si = a.sessions.findIndex(sess => sess.date === s.date);
                        if(si === -1) return a;
                        const updated = [...a.sessions];
                        updated[si] = {...updated[si], rngVelocities: {...(updated[si].rngVelocities||{}), [weight]: vals}, rngWeights: weights};
                        return {...a, sessions: updated};
                      }));
                    }}
                    savedData={s.rngVelocities||{}}
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
