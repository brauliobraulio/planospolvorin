import { useState, useCallback, useRef } from "react";

const PARED    = 0.08;
const SCALE    = 28;
const SCALE_VP = 80;

const DEFAULT = {
  empresa: "Inversiones Muñoz SPA",
  rut: "77.675.933-3",
  mina: "Mina Don Manuel",
  nivel: "Del 1 al 9",
  capacidad: "358",
  utm_norte: "6.546.357",
  utm_este: "269.812",
  fecha: "Marzo 2024",
  largo_total: 21.85,
  ancho_total: 3.6,
  separacion: 18,
  det_largo: 0.20,
  det_ancho: 1.4,
  exp_largo: 1.0,
  exp_ancho: 1.5,
  puerta_ancho: 1.4,
  puerta_pos: 1.5,
  puerta_lado: "inferior",
  postes_cantidad: 4,
  postes_dist: 7.3,
  offset_almacenes: 0,
  postes_inf_cantidad: 4,
  postes_inf_dist: 7.3,
  det_alto: 1.0,
  exp_alto: 1.0,
  pararrayos_alto: 6.0,
};

/* ── small helpers ─────────────────────────────────────────────────────────── */

function Campo({ label, name, value, onChange, unit = "mts.", tipo = "number", grande = false }) {
  return (
    <tr>
      <td style={{ padding: "5px 8px", fontSize: grande ? 14 : 12, fontWeight: grande ? "bold" : "normal", color: "#222", borderBottom: "1px solid #ddd", whiteSpace: "nowrap" }}>{label}</td>
      <td style={{ padding: "5px 6px", borderBottom: "1px solid #ddd" }}>
        <input type={tipo} step="0.01" name={name} value={value} onChange={onChange}
          style={{ width: tipo === "number" ? 80 : "100%", padding: grande ? "5px 8px" : "3px 6px", fontSize: grande ? 15 : 13, fontWeight: grande ? "bold" : "normal", border: grande ? "2px solid #2c5f9e" : "1px solid #aaa", borderRadius: 3, background: grande ? "#eef4ff" : "#fff", fontFamily: "Arial, sans-serif" }} />
      </td>
      {unit && <td style={{ padding: "5px 4px", fontSize: 11, color: "#666", borderBottom: "1px solid #ddd" }}>{unit}</td>}
    </tr>
  );
}

function Seccion({ titulo, children }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ background: "#4a7ab5", color: "#fff", padding: "4px 10px", fontSize: 11, fontWeight: "bold", fontFamily: "Arial, sans-serif" }}>{titulo}</div>
      <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function CotaH({ x1, y1, x2, label, offsetY, sfx = "" }) {
  const y = y1 + offsetY;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x1} y2={y} stroke="#000" strokeWidth="0.6" />
      <line x1={x2} y1={y1} x2={x2} y2={y} stroke="#000" strokeWidth="0.6" />
      <line x1={x1} y1={y} x2={x2} y2={y} stroke="#000" strokeWidth="0.9" markerStart={`url(#arr-s${sfx})`} markerEnd={`url(#arr-e${sfx})`} />
      <text x={(x1+x2)/2} y={offsetY < 0 ? y-3 : y+9} textAnchor="middle" fontSize="8.5" fill="#000" fontFamily="Arial">{label}</text>
    </g>
  );
}

function CotaV({ x1, y1, y2, label, offsetX, sfx = "" }) {
  const x = x1 + offsetX;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x} y2={y1} stroke="#000" strokeWidth="0.6" />
      <line x1={x1} y1={y2} x2={x} y2={y2} stroke="#000" strokeWidth="0.6" />
      <line x1={x} y1={y1} x2={x} y2={y2} stroke="#000" strokeWidth="0.9" markerStart={`url(#arr-s${sfx})`} markerEnd={`url(#arr-e${sfx})`} />
      <text x={x+(offsetX>0?4:-4)} y={(y1+y2)/2+3} textAnchor={offsetX>0?"start":"end"} fontSize="8.5" fill="#000" fontFamily="Arial">{label}</text>
    </g>
  );
}

function SliderArrastre({ value, onChange, min, max }) {
  const trackRef = useRef(null);
  const dragging = useRef(false);
  const pct = Math.max(0, Math.min(1, (value-min)/(max-min)));
  const getVal = (cx) => { const r = trackRef.current.getBoundingClientRect(); return min + Math.max(0, Math.min(1,(cx-r.left)/r.width))*(max-min); };
  const onMouseDown = (e) => {
    dragging.current=true; onChange(getVal(e.clientX));
    const mv=(e2)=>{if(dragging.current)onChange(getVal(e2.clientX));};
    const up=()=>{dragging.current=false;window.removeEventListener("mousemove",mv);window.removeEventListener("mouseup",up);};
    window.addEventListener("mousemove",mv); window.addEventListener("mouseup",up);
  };
  const onTouchStart = (e) => {
    dragging.current=true; onChange(getVal(e.touches[0].clientX));
    const mv=(e2)=>{if(dragging.current)onChange(getVal(e2.touches[0].clientX));};
    const end=()=>{dragging.current=false;window.removeEventListener("touchmove",mv);window.removeEventListener("touchend",end);};
    window.addEventListener("touchmove",mv); window.addEventListener("touchend",end);
  };
  const tx = pct*100;
  return (
    <div style={{padding:"10px 12px 14px",background:"#fff",borderBottom:"1px solid #ddd"}}>
      <div style={{fontSize:11,color:"#555",marginBottom:6,fontFamily:"Arial"}}>
        {'<-- Mover conjunto de almacenes -->'}
        <span style={{float:"right",fontWeight:"bold",color:"#2c5f9e"}}>{value>=0?"+":""}{value.toFixed(2)} mts.</span>
      </div>
      <div ref={trackRef} onMouseDown={onMouseDown} onTouchStart={onTouchStart}
        style={{position:"relative",height:28,background:"#e0e0e0",borderRadius:4,border:"1px solid #bbb",cursor:"ew-resize",userSelect:"none"}}>
        <div style={{position:"absolute",left:"50%",top:4,bottom:4,width:1,background:"#aaa"}} />
        <div style={{position:"absolute",top:6,bottom:6,left:pct>=0.5?"50%":`${tx}%`,width:pct>=0.5?`${(pct-0.5)*100}%`:`${(0.5-pct)*100}%`,background:"#4a7ab5",borderRadius:2}} />
        <div style={{position:"absolute",left:`${tx}%`,top:"50%",transform:"translate(-50%,-50%)",width:22,height:22,background:"#2c5f9e",border:"2px solid #fff",borderRadius:3,boxShadow:"0 1px 4px rgba(0,0,0,.3)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:12,fontWeight:"bold",cursor:"ew-resize"}}>|||</div>
      </div>
      <button onClick={()=>onChange(0)} style={{marginTop:6,padding:"3px 10px",fontSize:11,background:"#e8e8e8",border:"1px solid #aaa",borderRadius:3,cursor:"pointer",fontFamily:"Arial"}}>Centrar</button>
    </div>
  );
}

function SvgDefs({ s }) {
  return (
    <defs>
      {/* arr-s: tip at x=0, points outward from line START */}
      <marker id={`arr-s${s}`} markerWidth="8" markerHeight="8" refX="0" refY="4" orient="auto">
        <path d="M0,4 L8,0 L8,8 Z" fill="#000" />
      </marker>
      {/* arr-e: tip at x=8, points outward from line END */}
      <marker id={`arr-e${s}`} markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
        <path d="M8,4 L0,0 L0,8 Z" fill="#000" />
      </marker>
      <pattern id={`hatch${s}`} width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="4" stroke="#444" strokeWidth="1.2" />
      </pattern>
    </defs>
  );
}

function Reja({ x, y, w, h }) {
  const barW = 3;
  const nBars = Math.max(3, Math.round(w / 14));
  const spacing = w / (nBars + 1);
  const nHoriz = 5;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="none" stroke="#000" strokeWidth="2" />
      {Array.from({length: nBars}, (_,i) => (
        <rect key={`vb${i}`} x={x+spacing*(i+1)-barW/2} y={y} width={barW} height={h} fill="#222" />
      ))}
      {Array.from({length: nHoriz}, (_,i) => {
        const hy = y + (h/(nHoriz+1))*(i+1);
        return <line key={`hb${i}`} x1={x} y1={hy} x2={x+w} y2={hy} stroke="#222" strokeWidth="2.5" />;
      })}
    </g>
  );
}

/* ── leader line helper for pararrayos labels ─────────────────────────────── */
function Leader({ x1, y1, x2, y2, label, align = "left" }) {
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#000" strokeWidth="0.7" markerEnd="url(#arr-e-pr)" />
      <text x={x1+(align==="left"?-4:4)} y={y1+3} textAnchor={align==="left"?"end":"start"} fontSize="8.5" fill="#000" fontFamily="Arial">{label}</text>
    </g>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════════════════ */
export default function Polvorin() {
  const [d, setD] = useState(DEFAULT);
  const [tab, setTab] = useState("general");
  const [copiedPlanta,    setCopiedPlanta]    = useState(false);
  const [copiedPerfil,    setCopiedPerfil]    = useState(false);
  const [copiedPararrayo, setCopiedPararrayo] = useState(false);

  const handle = useCallback((e) => {
    const { name, value, type } = e.target;
    setD(prev => ({ ...prev, [name]: type==="number" ? parseFloat(value)||0 : value }));
  }, []);
  const setOffset = useCallback((val) => {
    setD(prev => ({ ...prev, offset_almacenes: parseFloat(val.toFixed(3)) }));
  }, []);

  /* ── Plan view geometry ─────────────────────────────────────────────────── */
  const PAD_TOP=80, PAD_BOT=90, PAD_IZQ=90, PAD_DER=90;
  const W = d.largo_total*SCALE, H = d.ancho_total*SCALE;
  const pared = PARED*SCALE;
  const svgW = W+PAD_IZQ+PAD_DER, svgH = H+PAD_TOP+PAD_BOT;
  const ox=PAD_IZQ, oy=PAD_TOP;
  const offsetPx = d.offset_almacenes*SCALE;
  const det_w=d.det_largo*SCALE, det_h=d.det_ancho*SCALE;
  const det_x=ox+pared+offsetPx,  det_y=oy+(H-det_h)/2;
  const exp_w=d.exp_largo*SCALE,   exp_h=d.exp_ancho*SCALE;
  const exp_x=det_x+det_w+d.separacion*SCALE, exp_y=oy+(H-exp_h)/2;
  const puerta_x=ox+d.puerta_pos*SCALE, puerta_w=d.puerta_ancho*SCALE;
  const es_inferior = d.puerta_lado==="inferior";
  const pSize=6;
  // Posts: evenly distributed from left wall to right wall, regardless of dist input
  // dist input is still used as label, but position is auto-calculated
  const postesN    = Math.max(2, d.postes_cantidad);
  const postesInfN = Math.max(2, d.postes_inf_cantidad);
  const postes     = Array.from({length:postesN},    (_,i) => ox + i*(W/(postesN-1)));
  const postes_inf = Array.from({length:postesInfN}, (_,i) => ox + i*(W/(postesInfN-1)));
  // Auto-calculated spacing label
  const postesDistAuto    = (d.largo_total/(postesN-1)).toFixed(3);
  const postesInfDistAuto = (d.largo_total/(postesInfN-1)).toFixed(3);
  const sliderMax = Math.max(0, d.largo_total-d.det_largo-d.separacion-d.exp_largo-PARED*2);
  const sliderMin = -PARED;

  /* ── Profile view geometry ──────────────────────────────────────────────── */
  const ALTO_SOBRE=2.4, ALTO_BAJO=0.8;
  const PAD_TOP_PR=40, PAD_BOT_PR=60;
  const groundY   = PAD_TOP_PR + ALTO_SOBRE*SCALE_VP;
  const fenceTopY = groundY - ALTO_SOBRE*SCALE_VP;
  const svgPRH    = groundY + ALTO_BAJO*SCALE_VP + PAD_BOT_PR;
  // 9 wires: 5 at 20 cm spacing then 4 at 30 cm spacing (from ground up)
  const wireHm = [0.20,0.40,0.60,0.80,1.00, 1.30,1.60,1.90,2.20];
  const wireY  = wireHm.map(h => groundY - h*SCALE_VP);
  const pr_door_x = ox+d.puerta_pos*SCALE, pr_door_w = d.puerta_ancho*SCALE;
  const detHpx = d.det_alto*SCALE_VP, expHpx = d.exp_alto*SCALE_VP;

  /* ── Pararrayos geometry ────────────────────────────────────────────────── */
  const PR_SCALE    = 40;
  const PAD_PR_TOP  = 60;
  const PAD_PR_BOT  = 80;
  const PR_GROUND_Y = PAD_PR_TOP + d.pararrayos_alto * PR_SCALE;
  const PR_TOP_Y    = PAD_PR_TOP;
  const svgPR_H     = PR_GROUND_Y + 130 + PAD_PR_BOT; // extra for underground elements
  const prCX        = svgW / 2;
  const poleW       = 14;
  const poleH       = d.pararrayos_alto * PR_SCALE;
  const guySpread   = 160;
  // Copper wire: slightly more to the right of pole
  const copperOffX  = poleW / 2 + 5;
  // Abrazaderas: shifted more to the right (asymmetric clips)
  const abrazaderas = [0.22, 0.42, 0.63, 0.80].map(f => PR_TOP_Y + f*poleH);
  // Pollo concreto: at base of pole, outlined, partly underground
  const polloW=42, polloH=52;
  const polloX = prCX - polloW/2;
  const polloY = PR_GROUND_Y - 6; // top slightly above ground
  // Foso: fully underground, immediately right of pollo concreto
  const fosoW=44, fosoH=62;
  const fosoX = polloX + polloW + 5; // tight next to pollo
  const fosoY = PR_GROUND_Y;         // top AT ground → fully buried
  // Vertical conductor line: from copper wire at ground down to foso top-center
  const conductorX  = prCX + copperOffX;

  const tabs = [
    {id:"general",    label:"General"},
    {id:"almacenes",  label:"Almacenes"},
    {id:"postes",     label:"Postes"},
    {id:"puerta",     label:"Puerta"},
    {id:"pararrayos", label:"Pararrayo"},
  ];
  const downloadSvgAsPng = (svgId, filename) => {
    const svg = document.getElementById(svgId);
    if (!svg) return;
    const w = svg.width.baseVal.value;
    const h = svg.height.baseVal.value;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const svgBlob = new Blob([svgStr], {type: "image/svg+xml;charset=utf-8"});
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const scale = 2;
      const canvas = document.createElement("canvas");
      canvas.width = w * scale;
      canvas.height = h * scale;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob(blob => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(a.href); }, 100);
      }, "image/png");
    };
    img.onerror = () => { URL.revokeObjectURL(url); alert("Error al generar PNG"); };
    img.src = url;
  };

  const copyToClipboard = (svgId, setCopied) => {
    const svg = document.getElementById(svgId);
    if (!svg) return;
    const w = svg.width.baseVal.value;
    const h = svg.height.baseVal.value;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const svgBlob = new Blob([svgStr], {type: "image/svg+xml;charset=utf-8"});
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const scale = 2;
      const canvas = document.createElement("canvas");
      canvas.width = w * scale;
      canvas.height = h * scale;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob(blob => {
        navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob })
        ]).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }).catch(() => alert("Tu navegador no permite copiar imágenes al portapapeles."));
      }, "image/png");
    };
    img.onerror = () => { URL.revokeObjectURL(url); alert("Error al copiar"); };
    img.src = url;
  };

  const labelStyle = {background:"#555",color:"#fff",padding:"4px 12px",fontSize:11,fontWeight:"bold",fontFamily:"Arial",letterSpacing:1};

  /* ── render ─────────────────────────────────────────────────────────────── */
  return (
    <div style={{display:"flex",height:"100vh",background:"#d0d0d0",fontFamily:"Arial, sans-serif"}}>

      {/* ── LEFT PANEL ────────────────────────────────────────────────────── */}
      <div style={{width:270,minWidth:270,background:"#f0f0f0",borderRight:"2px solid #999",display:"flex",flexDirection:"column"}}>

        <div style={{background:"#2c5f9e",color:"#fff",padding:"10px 12px",flexShrink:0}}>
          <div style={{fontSize:14,fontWeight:"bold"}}>Editor de Plano — Polvorín</div>
        </div>

        <div style={{display:"flex",flexWrap:"wrap",borderBottom:"2px solid #999",flexShrink:0}}>
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              flex:"1 1 auto",padding:"6px 2px",fontSize:10,fontWeight:tab===t.id?"bold":"normal",
              background:tab===t.id?"#fff":"#ddd",border:"none",borderRight:"1px solid #999",
              borderBottom:tab===t.id?"2px solid #fff":"none",cursor:"pointer",
              color:tab===t.id?"#2c5f9e":"#444",marginBottom:tab===t.id?-2:0,
            }}>{t.label}</button>
          ))}
        </div>

        <div style={{flex:1,overflowY:"auto"}}>
          <div style={{padding:10}}>

            {tab==="general" && (
              <Seccion titulo="Medidas principales">
                <Campo label="Largo total" name="largo_total" value={d.largo_total} onChange={handle} grande />
                <Campo label="Ancho total" name="ancho_total" value={d.ancho_total} onChange={handle} grande />
              </Seccion>
            )}

            {tab==="almacenes" && (
              <>
                <Seccion titulo="Almacén Detonadores (izq.)">
                  <Campo label="Largo"       name="det_largo" value={d.det_largo} onChange={handle} />
                  <Campo label="Ancho"       name="det_ancho" value={d.det_ancho} onChange={handle} />
                  <Campo label="Profundidad" name="det_alto"  value={d.det_alto}  onChange={handle} grande />
                </Seccion>
                <Seccion titulo="Separación entre almacenes">
                  <Campo label="Separación" name="separacion" value={d.separacion} onChange={handle} grande />
                </Seccion>
                <Seccion titulo="Almacén Alto Explosivo (der.)">
                  <Campo label="Largo"       name="exp_largo" value={d.exp_largo} onChange={handle} />
                  <Campo label="Ancho"       name="exp_ancho" value={d.exp_ancho} onChange={handle} />
                  <Campo label="Profundidad" name="exp_alto"  value={d.exp_alto}  onChange={handle} grande />
                </Seccion>
              </>
            )}

            {tab==="postes" && (
              <>
                <Seccion titulo="Postes superiores">
                  <Campo label="Cantidad"        name="postes_cantidad" value={d.postes_cantidad} onChange={handle} unit="u." />
                  <Campo label="Dist. entre pos." name="postes_dist"    value={d.postes_dist}    onChange={handle} grande />
                </Seccion>
                <Seccion titulo="Postes inferiores">
                  <Campo label="Cantidad"        name="postes_inf_cantidad" value={d.postes_inf_cantidad} onChange={handle} unit="u." />
                  <Campo label="Dist. entre pos." name="postes_inf_dist"    value={d.postes_inf_dist}    onChange={handle} grande />
                </Seccion>
              </>
            )}

            {tab==="puerta" && (
              <Seccion titulo="Puerta">
                <Campo label="Ancho"              name="puerta_ancho" value={d.puerta_ancho} onChange={handle} grande />
                <Campo label="Posición desde izq." name="puerta_pos"  value={d.puerta_pos}  onChange={handle} />
                <tr>
                  <td style={{padding:"5px 8px",fontSize:12,color:"#222",borderBottom:"1px solid #ddd"}}>Pared</td>
                  <td colSpan={2} style={{padding:"5px 6px",borderBottom:"1px solid #ddd"}}>
                    <select name="puerta_lado" value={d.puerta_lado} onChange={handle}
                      style={{padding:"3px 6px",fontSize:13,border:"1px solid #aaa",borderRadius:3,background:"#fff",width:"100%"}}>
                      <option value="inferior">Pared inferior</option>
                      <option value="superior">Pared superior</option>
                    </select>
                  </td>
                </tr>
              </Seccion>
            )}

            {tab==="pararrayos" && (
              <Seccion titulo="Pararrayos">
                <Campo label="Altura" name="pararrayos_alto" value={d.pararrayos_alto} onChange={handle} grande />
              </Seccion>
            )}

          </div>

          {tab==="almacenes" && (
            <SliderArrastre value={d.offset_almacenes} onChange={setOffset} min={sliderMin} max={sliderMax} />
          )}
        </div>

        <div style={{padding:10,borderTop:"1px solid #aaa",background:"#e5e5e5",flexShrink:0}}>
          <button onClick={()=>window.print()} style={{width:"100%",padding:"8px",fontSize:13,fontWeight:"bold",background:"#2c5f9e",color:"#fff",border:"none",borderRadius:4,cursor:"pointer"}}>
            🖨️ Imprimir / Guardar PDF
          </button>
        </div>
      </div>

      {/* ── RIGHT PANEL ───────────────────────────────────────────────────── */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"auto",background:"#c0c0c0"}}>
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:20,overflow:"auto",gap:20}}>

          {/* ══ VISTA DE PLANTA ══════════════════════════════════════════════ */}
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={labelStyle}>VISTA DE PLANTA</div>
              <button onClick={()=>downloadSvgAsPng("svg-planta","vista-planta.png")} style={{padding:"3px 10px",fontSize:11,background:"#2c5f9e",color:"#fff",border:"none",borderRadius:3,cursor:"pointer"}}>⬇ PNG</button>
              <button onClick={()=>copyToClipboard("svg-planta",setCopiedPlanta)} style={{padding:"3px 10px",fontSize:11,background:copiedPlanta?"#2a7a3b":"#555",color:"#fff",border:"none",borderRadius:3,cursor:"pointer",transition:"background 0.3s"}}>{copiedPlanta?"✓ Copiado":"📋 Copiar"}</button>
            </div>
            <div style={{background:"#fff",border:"2px solid #888",boxShadow:"3px 3px 10px rgba(0,0,0,.35)"}}>
              <svg id="svg-planta" width={svgW} height={svgH} style={{display:"block"}}>
                <SvgDefs s="" />
                <rect x={0} y={0} width={svgW} height={svgH} fill="#fff" />

                {/* Paredes */}
                <rect x={ox} y={oy} width={W} height={pared} fill="#333" stroke="#000" strokeWidth="0.8" />
                {es_inferior ? (<>
                  <rect x={ox} y={oy+H-pared} width={puerta_x-ox} height={pared} fill="#333" stroke="#000" strokeWidth="0.8" />
                  <rect x={puerta_x+puerta_w} y={oy+H-pared} width={ox+W-(puerta_x+puerta_w)} height={pared} fill="#333" stroke="#000" strokeWidth="0.8" />
                  <path d={`M${puerta_x},${oy+H-pared} A${puerta_w},${puerta_w} 0 0,1 ${puerta_x+puerta_w},${oy+H-pared}`} fill="none" stroke="#000" strokeWidth="0.8" strokeDasharray="3,2" />
                </>) : (
                  <rect x={ox} y={oy+H-pared} width={W} height={pared} fill="#333" stroke="#000" strokeWidth="0.8" />
                )}
                {!es_inferior && (<>
                  <rect x={puerta_x} y={oy} width={puerta_w} height={pared} fill="#fff" />
                  <path d={`M${puerta_x},${oy+pared} A${puerta_w},${puerta_w} 0 0,0 ${puerta_x+puerta_w},${oy+pared}`} fill="none" stroke="#000" strokeWidth="0.8" strokeDasharray="3,2" />
                </>)}
                <rect x={ox} y={oy} width={pared} height={H} fill="#333" stroke="#000" strokeWidth="0.8" />
                <rect x={ox+W-pared} y={oy} width={pared} height={H} fill="#333" stroke="#000" strokeWidth="0.8" />
                <rect x={ox} y={oy} width={W} height={H} fill="none" stroke="#000" strokeWidth="1.8" />

                {/* Postes sup — centered on top wall line */}
                {postes.map((px,i)=><rect key={i} x={px-pSize/2} y={oy+pared/2-pSize/2} width={pSize} height={pSize} fill="#000" />)}
                {postes.length>=2 && postes.map((px,i)=>{
                  if(i===0) return null;
                  const x1=postes[i-1], x2=px, yc=oy-16;
                  return (
                    <g key={`cp${i}`}>
                      <line x1={x1} y1={oy} x2={x1} y2={yc} stroke="#000" strokeWidth="0.6" strokeDasharray="2,2" />
                      <line x1={x2} y1={oy} x2={x2} y2={yc} stroke="#000" strokeWidth="0.6" strokeDasharray="2,2" />
                      <line x1={x1} y1={yc} x2={x2} y2={yc} stroke="#000" strokeWidth="0.8" markerStart="url(#arr-s)" markerEnd="url(#arr-e)" />
                      <text x={(x1+x2)/2} y={yc-3} textAnchor="middle" fontSize="8" fill="#000" fontFamily="Arial">{postesDistAuto} mts.</text>
                    </g>
                  );
                })}

                {/* Postes inf — centered on bottom wall line */}
                {postes_inf.map((px,i)=><rect key={i} x={px-pSize/2} y={oy+H-pared/2-pSize/2} width={pSize} height={pSize} fill="#000" />)}

                {/* Almacenes */}
                <rect x={det_x} y={det_y} width={det_w} height={det_h} fill="url(#hatch)" stroke="#000" strokeWidth="1.5" />
                <text x={det_x+det_w+14} y={oy+H/2-6} textAnchor="start" fontSize="9" fill="#000" fontFamily="Arial" fontWeight="bold">Alm. Detonadores</text>
                <CotaH x1={det_x} y1={det_y+det_h} x2={det_x+det_w} label={`${d.det_largo} mts.`} offsetY={14} />
                <CotaV x1={det_x+det_w} y1={det_y} y2={det_y+det_h} label={`${d.det_ancho} mts.`} offsetX={10} />

                <rect x={exp_x} y={exp_y} width={exp_w} height={exp_h} fill="url(#hatch)" stroke="#000" strokeWidth="1.5" />
                <text x={exp_x+exp_w+38} y={exp_y+exp_h/2-5} textAnchor="start" fontSize="9" fill="#000" fontFamily="Arial" fontWeight="bold">Alm. Alto</text>
                <text x={exp_x+exp_w+38} y={exp_y+exp_h/2+7} textAnchor="start" fontSize="9" fill="#000" fontFamily="Arial" fontWeight="bold">Explosivo</text>
                <CotaH x1={exp_x} y1={exp_y} x2={exp_x+exp_w} label={`${d.exp_largo} mts.`} offsetY={-14} />
                <CotaV x1={exp_x+exp_w} y1={exp_y} y2={exp_y+exp_h} label={`${d.exp_ancho} mts.`} offsetX={14} />

                {/* Separación */}
                {(()=>{const sx1=det_x+det_w,sx2=exp_x,sy=oy+H/2;return(<g>
                  <line x1={sx1} y1={sy} x2={sx2} y2={sy} stroke="#000" strokeWidth="1" markerStart="url(#arr-s)" markerEnd="url(#arr-e)" />
                  <text x={(sx1+sx2)/2} y={sy-7} textAnchor="middle" fontSize="8" fill="#000" fontFamily="Arial" fontStyle="italic">Separación entre almacenes</text>
                  <text x={(sx1+sx2)/2} y={sy+15} textAnchor="middle" fontSize="13" fill="#000" fontFamily="Arial" fontWeight="bold">{d.separacion} mts.</text>
                </g>);})()}

                <CotaH x1={ox} y1={oy} x2={ox+W} label={`${d.largo_total} mts.`} offsetY={-62} />
                <CotaV x1={ox} y1={oy} y2={oy+H} label={`${d.ancho_total} mts.`} offsetX={-32} />
                {es_inferior
                  ? <CotaH x1={puerta_x} y1={oy+H} x2={puerta_x+puerta_w} label={`${d.puerta_ancho} mts.`} offsetY={22} />
                  : <CotaH x1={puerta_x} y1={oy} x2={puerta_x+puerta_w} label={`${d.puerta_ancho} mts.`} offsetY={-14} />
                }


              </svg>
            </div>
          </div>

          {/* ══ VISTA DE PERFIL ══════════════════════════════════════════════ */}
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={labelStyle}>VISTA DE PERFIL</div>
              <button onClick={()=>downloadSvgAsPng("svg-perfil","vista-perfil.png")} style={{padding:"3px 10px",fontSize:11,background:"#2c5f9e",color:"#fff",border:"none",borderRadius:3,cursor:"pointer"}}>⬇ PNG</button>
              <button onClick={()=>copyToClipboard("svg-perfil",setCopiedPerfil)} style={{padding:"3px 10px",fontSize:11,background:copiedPerfil?"#2a7a3b":"#555",color:"#fff",border:"none",borderRadius:3,cursor:"pointer",transition:"background 0.3s"}}>{copiedPerfil?"✓ Copiado":"📋 Copiar"}</button>
            </div>
            <div style={{background:"#fff",border:"2px solid #888",boxShadow:"3px 3px 10px rgba(0,0,0,.35)"}}>
              <svg id="svg-perfil" width={svgW} height={svgPRH} style={{display:"block"}}>
                <SvgDefs s="-pr" />
                <rect x={0} y={0} width={svgW} height={svgPRH} fill="#fff" />

                {/* Soil */}
                <rect x={ox} y={groundY} width={W} height={ALTO_BAJO*SCALE_VP} fill="#d8ccb0" />
                <line x1={ox} y1={groundY} x2={ox+W} y2={groundY} stroke="#555" strokeWidth="2.5" />

                {/* End walls */}
                <rect x={ox}       y={fenceTopY} width={pared} height={ALTO_SOBRE*SCALE_VP} fill="#333" stroke="#000" strokeWidth="0.8" />
                <rect x={ox}       y={groundY}   width={pared} height={ALTO_BAJO*SCALE_VP}  fill="#555" />
                <rect x={ox+W-pared} y={fenceTopY} width={pared} height={ALTO_SOBRE*SCALE_VP} fill="#333" stroke="#000" strokeWidth="0.8" />
                <rect x={ox+W-pared} y={groundY}   width={pared} height={ALTO_BAJO*SCALE_VP}  fill="#555" />

                {/* Interior posts (postes_inf) */}
                {postes_inf.map((px,i)=>(
                  <g key={`prp${i}`}>
                    <rect x={px-3} y={fenceTopY} width={6} height={ALTO_SOBRE*SCALE_VP} fill="#222" />
                    <rect x={px-3} y={groundY}   width={6} height={ALTO_BAJO*SCALE_VP}  fill="#666" />
                  </g>
                ))}

                {/* Door frame + reja */}
                <rect x={pr_door_x-3}           y={fenceTopY} width={6} height={ALTO_SOBRE*SCALE_VP} fill="#000" />
                <rect x={pr_door_x+pr_door_w-3} y={fenceTopY} width={6} height={ALTO_SOBRE*SCALE_VP} fill="#000" />
                <Reja x={pr_door_x} y={fenceTopY} w={pr_door_w} h={ALTO_SOBRE*SCALE_VP} />

                {/* 9 wires */}
                {wireY.map((wy,i)=>(
                  <g key={`wire${i}`}>
                    <line x1={ox+pared} y1={wy} x2={pr_door_x-3}           y2={wy} stroke="#666" strokeWidth="0.9" />
                    <line x1={pr_door_x+pr_door_w+3} y1={wy} x2={ox+W-pared} y2={wy} stroke="#666" strokeWidth="0.9" />
                  </g>
                ))}

                {/* Boxes buried downward from ground */}
                <rect x={det_x} y={groundY} width={det_w} height={detHpx} fill="url(#hatch-pr)" stroke="#000" strokeWidth="1.5" />
                <rect x={exp_x} y={groundY} width={exp_w} height={expHpx} fill="url(#hatch-pr)" stroke="#000" strokeWidth="1.5" />

                {/* Cotas */}
                <CotaV x1={ox+W} y1={fenceTopY} y2={groundY}                  label={`${ALTO_SOBRE} mts.`} offsetX={38} sfx="-pr" />
                <CotaV x1={ox+W} y1={groundY}   y2={groundY+ALTO_BAJO*SCALE_VP} label={`${ALTO_BAJO} mts.`} offsetX={38} sfx="-pr" />
                <CotaV x1={det_x} y1={groundY}  y2={groundY+detHpx}             label={`${d.det_alto} mts.`} offsetX={-30} sfx="-pr" />
                {d.exp_alto !== d.det_alto && (
                  <CotaV x1={exp_x+exp_w} y1={groundY} y2={groundY+expHpx} label={`${d.exp_alto} mts.`} offsetX={14} sfx="-pr" />
                )}


              </svg>
            </div>
          </div>

          {/* ══ CROQUIS PARARRAYOS ═══════════════════════════════════════════ */}
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={labelStyle}>CROQUIS DE UN PARARRAYOS</div>
              <button onClick={()=>downloadSvgAsPng("svg-pararrayos","croquis-pararrayos.png")} style={{padding:"3px 10px",fontSize:11,background:"#2c5f9e",color:"#fff",border:"none",borderRadius:3,cursor:"pointer"}}>⬇ PNG</button>
              <button onClick={()=>copyToClipboard("svg-pararrayos",setCopiedPararrayo)} style={{padding:"3px 10px",fontSize:11,background:copiedPararrayo?"#2a7a3b":"#555",color:"#fff",border:"none",borderRadius:3,cursor:"pointer",transition:"background 0.3s"}}>{copiedPararrayo?"✓ Copiado":"📋 Copiar"}</button>
            </div>
            <div style={{background:"#fff",border:"2px solid #888",boxShadow:"3px 3px 10px rgba(0,0,0,.35)"}}>
              <svg id="svg-pararrayos" width={svgW} height={svgPR_H} style={{display:"block"}}>
                <defs>
                  <marker id="arr-s-pr" markerWidth="8" markerHeight="8" refX="0" refY="4" orient="auto">
                    <path d="M0,4 L8,0 L8,8 Z" fill="#000" />
                  </marker>
                  <marker id="arr-e-pr" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
                    <path d="M8,4 L0,0 L0,8 Z" fill="#000" />
                  </marker>
                  <pattern id="hatch-pr2" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                    <line x1="0" y1="0" x2="0" y2="4" stroke="#666" strokeWidth="1" />
                  </pattern>
                </defs>

                <rect x={0} y={0} width={svgW} height={svgPR_H} fill="#fff" />

                {/* Underground soil */}
                <rect x={prCX-guySpread-40} y={PR_GROUND_Y} width={guySpread*2+fosoX-prCX+fosoW+60} height={110} fill="#d8ccb0" />

                {/* Ground line */}
                <line x1={prCX-guySpread-40} y1={PR_GROUND_Y} x2={fosoX+fosoW+60} y2={PR_GROUND_Y} stroke="#555" strokeWidth="2" />

                {/* ── Guy wires ── */}
                {(()=>{
                  const gLx = prCX - guySpread, gRx = prCX + guySpread;
                  // Inner pair: solid, narrower spread, from mid-pole to ground
                  const innerSpread = guySpread * 0.52;
                  const iLx = prCX - innerSpread, iRx = prCX + innerSpread;
                  const innerY = PR_TOP_Y + poleH * 0.38;
                  return (<>
                    {/* Solid outer triangle */}
                    <line x1={prCX} y1={PR_TOP_Y} x2={gLx} y2={PR_GROUND_Y} stroke="#444" strokeWidth="1.2" />
                    <line x1={prCX} y1={PR_TOP_Y} x2={gRx} y2={PR_GROUND_Y} stroke="#444" strokeWidth="1.2" />
                    {/* Solid inner pair — narrower, starting mid-pole, straight lines */}
                    <line x1={prCX} y1={innerY} x2={iLx} y2={PR_GROUND_Y} stroke="#444" strokeWidth="1.0" />
                    <line x1={prCX} y1={innerY} x2={iRx} y2={PR_GROUND_Y} stroke="#444" strokeWidth="1.0" />
                  </>);
                })()}

                {/* Pole (cañería de Fe 2") — drawn AFTER guy wires so it's on top */}
                <rect x={prCX-poleW/2} y={PR_TOP_Y} width={poleW} height={poleH} fill="#aaa" stroke="#444" strokeWidth="1.2" />
                {/* Pole stub into pollo concreto below ground */}
                <rect x={prCX-poleW/2+1} y={PR_GROUND_Y} width={poleW-2} height={35} fill="#666" />

                {/* Alambre de cobre — right side of pole, slightly offset right */}
                <line x1={prCX+copperOffX} y1={PR_TOP_Y-14} x2={prCX+copperOffX} y2={PR_GROUND_Y} stroke="#333" strokeWidth="1.3" />
                {/* Tip above pole */}
                <line x1={prCX+copperOffX-2} y1={PR_TOP_Y-14} x2={prCX+copperOffX+2} y2={PR_TOP_Y-22} stroke="#333" strokeWidth="1.3" />
                <line x1={prCX+copperOffX+2} y1={PR_TOP_Y-22} x2={prCX+copperOffX}   y2={PR_TOP_Y-30} stroke="#333" strokeWidth="1.3" />

                {/* Conductor: from pole at lowest abrazadera → horizontal right → down into foso */}
                {(()=>{
                  const condY = abrazaderas[3]; // lowest abrazadera level
                  const condX1 = prCX + poleW/2 + 4;
                  const condX2 = fosoX + fosoW/2;
                  return (<>
                    <line x1={condX1} y1={condY} x2={condX2} y2={condY} stroke="#333" strokeWidth="1.1" />
                    <line x1={condX2} y1={condY} x2={condX2} y2={fosoY} stroke="#333" strokeWidth="1.1" />
                  </>);
                })()}

                {/* Abrazaderas — offset slightly to the right of pole center */}
                {abrazaderas.map((ay,i)=>(
                  <rect key={`abr${i}`} x={prCX-poleW/2-2} y={ay-3} width={poleW+14} height={5} fill="#333" rx="1" />
                ))}

                {/* Pollo concreto — outline box, straddles ground line */}
                <rect x={polloX} y={polloY} width={polloW} height={polloH} fill="none" stroke="#444" strokeWidth="1.5" />

                {/* Foso relleno de carboncillo y sal — hatched, fully underground */}
                <rect x={fosoX} y={fosoY} width={fosoW} height={fosoH} fill="url(#hatch-pr2)" stroke="#444" strokeWidth="1.5" />

                {/* Height cota on the left */}
                <line x1={prCX-guySpread-30} y1={PR_TOP_Y}    x2={prCX-guySpread-14} y2={PR_TOP_Y}    stroke="#000" strokeWidth="0.6" />
                <line x1={prCX-guySpread-30} y1={PR_GROUND_Y} x2={prCX-guySpread-14} y2={PR_GROUND_Y} stroke="#000" strokeWidth="0.6" />
                <line x1={prCX-guySpread-22} y1={PR_TOP_Y}    x2={prCX-guySpread-22} y2={PR_GROUND_Y} stroke="#000" strokeWidth="0.9" markerStart="url(#arr-s-pr)" markerEnd="url(#arr-e-pr)" />
                <text x={prCX-guySpread-26} y={(PR_TOP_Y+PR_GROUND_Y)/2+3} textAnchor="end" fontSize="9" fill="#000" fontFamily="Arial" fontWeight="bold">{d.pararrayos_alto.toFixed(2)} mts.</text>

                {/* ── Labels right side ── */}
                {/* ALAMBRE DE COBRE DE 1/2" */}
                <line x1={prCX+copperOffX+2} y1={PR_TOP_Y-28} x2={prCX+guySpread+18} y2={PR_TOP_Y-28} stroke="#000" strokeWidth="0.6" markerEnd="url(#arr-e-pr)" />
                <text x={prCX+guySpread+22} y={PR_TOP_Y-25} fontSize="8.5" fill="#000" fontFamily="Arial">Alambre de Cobre de 1/2"</text>

                {/* CAÑERÍA DE Fe. 2" */}
                <line x1={prCX+poleW/2} y1={PR_TOP_Y+poleH*0.08} x2={prCX+guySpread+18} y2={PR_TOP_Y+poleH*0.08} stroke="#000" strokeWidth="0.6" markerEnd="url(#arr-e-pr)" />
                <text x={prCX+guySpread+22} y={PR_TOP_Y+poleH*0.08+4} fontSize="8.5" fill="#000" fontFamily="Arial">Cañería de Fe. 2" de Ø</text>

                {/* ABRAZADERA APERNADA */}
                <line x1={prCX+poleW/2+12} y1={abrazaderas[1]} x2={prCX+guySpread+18} y2={abrazaderas[1]} stroke="#000" strokeWidth="0.6" markerEnd="url(#arr-e-pr)" />
                <text x={prCX+guySpread+22} y={abrazaderas[1]+4} fontSize="8.5" fill="#000" fontFamily="Arial">Abrazadera Apernada</text>

                {/* ALAMBRE GALVANIZADO — pointing to guy wire at ~55% height */}
                {(()=>{
                  const gy  = PR_TOP_Y + poleH*0.55;
                  const gxR = prCX + guySpread*(0.55);
                  return (<>
                    <line x1={gxR} y1={gy} x2={prCX+guySpread+18} y2={gy} stroke="#000" strokeWidth="0.6" markerEnd="url(#arr-e-pr)" />
                    <text x={prCX+guySpread+22} y={gy+4} fontSize="8.5" fill="#000" fontFamily="Arial">Alambre Galvanizado</text>
                  </>);
                })()}

                {/* POLLO CONCRETO — label below-left */}
                <line x1={polloX+polloW/2} y1={polloY+polloH} x2={polloX-12} y2={polloY+polloH+28} stroke="#000" strokeWidth="0.6" markerEnd="url(#arr-e-pr)" />
                <text x={polloX-16} y={polloY+polloH+26} textAnchor="end" fontSize="8.5" fill="#000" fontFamily="Arial">Pollo</text>
                <text x={polloX-16} y={polloY+polloH+37} textAnchor="end" fontSize="8.5" fill="#000" fontFamily="Arial">Concreto</text>

                {/* FOSO RELLENO — label right */}
                <line x1={fosoX+fosoW} y1={fosoY+fosoH/2} x2={fosoX+fosoW+10} y2={fosoY+fosoH/2} stroke="#000" strokeWidth="0.6" markerEnd="url(#arr-e-pr)" />
                <text x={fosoX+fosoW+14} y={fosoY+fosoH/2-4} fontSize="8.5" fill="#000" fontFamily="Arial">Fosa Relleno de</text>
                <text x={fosoX+fosoW+14} y={fosoY+fosoH/2+8} fontSize="8.5" fill="#000" fontFamily="Arial">Carboncillo y Sal</text>


              </svg>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
