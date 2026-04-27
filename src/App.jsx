import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

function ll(lat, lon, r = 1) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta)
  );
}

const CITIES = [
  { id:1,  name:"New York",    sub:"Times Square",      c:"USA",         f:"🇺🇸", lat:40.758,  lon:-73.985, yt:"ByXlt_NLgaU" },
  { id:2,  name:"London",      sub:"Westminster",        c:"UK",          f:"🇬🇧", lat:51.501,  lon:-0.125,  yt:"DVjsyDsGE9M" },
  { id:3,  name:"Paris",       sub:"Eiffel Tower",       c:"France",      f:"🇫🇷", lat:48.858,  lon:2.294,   yt:"9yFRLIyInAI" },
  { id:4,  name:"Tokyo",       sub:"Shibuya Crossing",   c:"Japan",       f:"🇯🇵", lat:35.659,  lon:139.700, yt:"MZOm2c7qe6E" },
  { id:5,  name:"Sydney",      sub:"Opera House",        c:"Australia",   f:"🇦🇺", lat:-33.857, lon:151.215, yt:"KV8I1P6vPJQ" },
  { id:6,  name:"Dubai",       sub:"Burj Khalifa",       c:"UAE",         f:"🇦🇪", lat:25.197,  lon:55.274,  yt:"7WXkNdP9R0Y" },
  { id:7,  name:"Singapore",   sub:"Marina Bay Sands",   c:"Singapore",   f:"🇸🇬", lat:1.285,   lon:103.861, yt:"86YLFOog4GM" },
  { id:8,  name:"Rome",        sub:"Colosseum",          c:"Italy",       f:"🇮🇹", lat:41.890,  lon:12.492,  yt:"dHmkzQOc_kM" },
  { id:9,  name:"Seoul",       sub:"Gangnam District",   c:"S. Korea",    f:"🇰🇷", lat:37.498,  lon:127.028, yt:"ZzrMk0pBRz8" },
  { id:10, name:"Hong Kong",   sub:"Victoria Harbour",   c:"HK",          f:"🇭🇰", lat:22.286,  lon:114.158, yt:"3YGqA5h74kw" },
  { id:11, name:"Mumbai",      sub:"Marine Drive",       c:"India",       f:"🇮🇳", lat:18.932,  lon:72.826,  yt:"Eq1iqgHk44Q" },
  { id:12, name:"Berlin",      sub:"Brandenburg Gate",   c:"Germany",     f:"🇩🇪", lat:52.516,  lon:13.378,  yt:"G9jcBGpOQiA" },
  { id:13, name:"Chicago",     sub:"The Riverwalk",      c:"USA",         f:"🇺🇸", lat:41.883,  lon:-87.624, yt:"NyLF8nHIjnk" },
  { id:14, name:"Toronto",     sub:"CN Tower",           c:"Canada",      f:"🇨🇦", lat:43.643,  lon:-79.387, yt:"0YdaMF6jk7g" },
  { id:15, name:"Amsterdam",   sub:"Canal District",     c:"Netherlands", f:"🇳🇱", lat:52.375,  lon:4.900,   yt:"fE3gMoI_EaY" },
  { id:16, name:"Bangkok",     sub:"Silom Road",         c:"Thailand",    f:"🇹🇭", lat:13.729,  lon:100.529, yt:"9k-dpS5HB84" },
  { id:17, name:"Istanbul",    sub:"Bosphorus Strait",   c:"Turkey",      f:"🇹🇷", lat:41.045,  lon:29.032,  yt:"BfvYuWEEVDo" },
  { id:18, name:"Los Angeles", sub:"Hollywood Blvd",     c:"USA",         f:"🇺🇸", lat:34.102,  lon:-118.327,yt:"C2ylpBBbEeY" },
  { id:19, name:"Sao Paulo",   sub:"Av. Paulista",       c:"Brazil",      f:"🇧🇷", lat:-23.551, lon:-46.633, yt:"YdgNhplzqcg" },
  { id:20, name:"Cairo",       sub:"Tahrir Square",      c:"Egypt",       f:"🇪🇬", lat:30.044,  lon:31.236,  yt:"bXpvZ2kXoV0" },
];

export default function EarthLive() {
  const mountRef = useRef(null);
  const activeRef = useRef(null);
  const mountedRef = useRef(true);
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [ready, setReady] = useState(false);
  const [showHint, setShowHint] = useState(true);

  const pick = (city) => { activeRef.current = city; setSelected(city); };
  const close = () => { activeRef.current = null; setSelected(null); };

  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 4000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    const mount = mountRef.current;
    if (!mount) return;
    const W = mount.clientWidth, H = mount.clientHeight;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x02020d);
    mount.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 500);
    camera.position.z = 2.8;
    const sp = new Float32Array(6000 * 3).map(() => (Math.random() - 0.5) * 300);
    const sg = new THREE.BufferGeometry();
    sg.setAttribute("position", new THREE.BufferAttribute(sp, 3));
    scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 0.09, transparent: true, opacity: 0.65 })));
    scene.add(new THREE.AmbientLight(0x223366, 0.55));
    const sun = new THREE.DirectionalLight(0xfff8ee, 1.6);
    sun.position.set(5, 3, 5);
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0x1133ff, 0.3);
    fill.position.set(-5, -2, -3);
    scene.add(fill);
    const globe = new THREE.Group();
    scene.add(globe);
    const tl = new THREE.TextureLoader();
    const BASE = "https://raw.githubusercontent.com/mrdoob/three.js/r128/examples/textures/planets";
    const earthMat = new THREE.MeshPhongMaterial({
      map: tl.load(BASE + "/earth_atmos_2048.jpg", () => mountedRef.current && setReady(true)),
      specularMap: tl.load(BASE + "/earth_specular_2048.jpg"),
      specular: new THREE.Color(0x112244),
      shininess: 22,
    });
    globe.add(new THREE.Mesh(new THREE.SphereGeometry(1, 64, 64), earthMat));
    globe.add(new THREE.Mesh(
      new THREE.SphereGeometry(1.07, 32, 32),
      new THREE.ShaderMaterial({
        vertexShader: "varying vec3 vN;void main(){vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
        fragmentShader: "varying vec3 vN;void main(){float i=pow(.66-dot(vN,vec3(0,0,1)),2.6);gl_FragColor=vec4(.15,.5,1.,i*.9);}",
        blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, side: THREE.FrontSide,
      })
    ));
    const dots = [], rings = [], hitboxes = [];
    CITIES.forEach((city, i) => {
      const pos = ll(city.lat, city.lon, 1.013);
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.013, 8, 8), new THREE.MeshBasicMaterial({ color: 0xff1e4a }));
      dot.position.copy(pos); globe.add(dot); dots.push(dot);
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.018, 0.028, 24), new THREE.MeshBasicMaterial({ color: 0xff1e4a, transparent: true, opacity: 0.5, side: THREE.DoubleSide }));
      ring.position.copy(pos); ring.lookAt(new THREE.Vector3(0, 0, 0)); ring.userData.phase = i * 0.41;
      globe.add(ring); rings.push(ring);
      const hb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), new THREE.MeshBasicMaterial({ visible: false }));
      hb.position.copy(pos); hb.userData = { city }; globe.add(hb); hitboxes.push(hb);
    });
    let downX = 0, downY = 0, prevX = 0, prevY = 0, rotY = -0.5, rotX = 0;
    const raycaster = new THREE.Raycaster();
    const mp = new THREE.Vector2();
    const getHit = (cx, cy) => {
      const r = mount.getBoundingClientRect();
      mp.x = ((cx - r.left) / r.width) * 2 - 1;
      mp.y = -((cy - r.top) / r.height) * 2 + 1;
      raycaster.setFromCamera(mp, camera);
      const hits = raycaster.intersectObjects(hitboxes);
      return hits.length ? hits[0].object.userData.city : null;
    };
    const onDown = e => { downX = prevX = e.clientX; downY = prevY = e.clientY; };
    const onMove = e => {
      if (e.buttons === 1) {
        rotY += (e.clientX - prevX) * 0.006;
        rotX = Math.max(-1.3, Math.min(1.3, rotX + (e.clientY - prevY) * 0.006));
      }
      prevX = e.clientX; prevY = e.clientY;
      const city = getHit(e.clientX, e.clientY);
      mount.style.cursor = city ? "pointer" : e.buttons ? "grabbing" : "grab";
      if (mountedRef.current) setHovered(city);
    };
    const onUp = e => {
      if (Math.hypot(e.clientX - downX, e.clientY - downY) < 7) {
        const city = getHit(e.clientX, e.clientY);
        if (city && mountedRef.current) pick(city);
      }
    };
    const onWheel = e => { e.preventDefault(); camera.position.z = Math.max(1.35, Math.min(5.5, camera.position.z + e.deltaY * 0.003)); };
    let lastPinch = 0;
    const onTouchStart = e => {
      if (e.touches.length === 1) onDown({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
      if (e.touches.length === 2) lastPinch = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
    };
    const onTouchMove = e => {
      e.preventDefault();
      if (e.touches.length === 1) onMove({ buttons: 1, clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
      if (e.touches.length === 2) {
        const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        if (lastPinch) camera.position.z = Math.max(1.35, Math.min(5.5, camera.position.z - (d - lastPinch) * 0.01));
        lastPinch = d;
      }
    };
    const onTouchEnd = e => { if (e.changedTouches.length === 1) onUp({ clientX: e.changedTouches[0].clientX, clientY: e.changedTouches[0].clientY }); };
    mount.addEventListener("mousedown", onDown);
    mount.addEventListener("mousemove", onMove);
    mount.addEventListener("mouseup", onUp);
    mount.addEventListener("wheel", onWheel, { passive: false });
    mount.addEventListener("touchstart", onTouchStart, { passive: false });
    mount.addEventListener("touchmove", onTouchMove, { passive: false });
    mount.addEventListener("touchend", onTouchEnd);
    const clock = new THREE.Clock();
    let raf;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      if (!activeRef.current) rotY += 0.0009;
      globe.rotation.y = rotY;
      globe.rotation.x = rotX;
      dots.forEach((d, i) => d.scale.setScalar(1 + 0.35 * Math.sin(t * 3 + i * 0.85)));
      rings.forEach(r => {
        const p = ((t * 0.7 + r.userData.phase) % 1);
        r.scale.setScalar(1 + p * 3);
        r.material.opacity = 0.5 * (1 - p);
      });
      renderer.render(scene, camera);
    };
    animate();
    const onResize = () => {
      const nw = mount.clientWidth, nh = mount.clientHeight;
      camera.aspect = nw / nh; camera.updateProjectionMatrix(); renderer.setSize(nw, nh);
    };
    window.addEventListener("resize", onResize);
    return () => {
      mountedRef.current = false;
      cancelAnimationFrame(raf);
      mount.removeEventListener("mousedown", onDown);
      mount.removeEventListener("mousemove", onMove);
      mount.removeEventListener("mouseup", onUp);
      mount.removeEventListener("wheel", onWheel);
      mount.removeEventListener("touchstart", onTouchStart);
      mount.removeEventListener("touchmove", onTouchMove);
      mount.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("resize", onResize);
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  const ytSearchUrl = c => "https://www.youtube.com/results?search_query=" + encodeURIComponent(c.name + " " + c.sub + " live webcam") + "&sp=EgJAAQ%3D%3D";

  return (
    <div style={{ position:"relative", width:"100vw", height:"100vh", background:"#02020d", overflow:"hidden", fontFamily:"'Courier New', monospace" }}>
      <div ref={mountRef} style={{ width:"100%", height:"100%", cursor:"grab" }} />
      <div style={{ position:"absolute", top:22, left:"50%", transform:"translateX(-50%)", textAlign:"center", pointerEvents:"none", userSelect:"none" }}>
        <div style={{ fontSize:9, letterSpacing:6, color:"#ff1e4a", marginBottom:7 }}>● LIVE WORLDWIDE FEED</div>
        <h1 style={{ margin:0, fontSize:"clamp(26px,4vw,40px)", fontWeight:900, color:"#fff", letterSpacing:5, textShadow:"0 0 30px rgba(255,30,74,0.4)" }}>EARTH LIVE</h1>
        <div style={{ fontSize:8, color:"#2a2a4a", letterSpacing:4, marginTop:7 }}>DRAG · SCROLL TO ZOOM · CLICK RED MARKERS</div>
      </div>
      <div style={{ position:"absolute", bottom:80, left:"50%", transform:"translateX(-50%)", background:"rgba(255,30,74,0.1)", border:"1px solid rgba(255,30,74,0.25)", borderRadius:8, padding:"8px 18px", color:"rgba(255,255,255,0.6)", fontSize:11, letterSpacing:1, pointerEvents:"none", opacity: showHint ? 1 : 0, transition:"opacity 1s ease" }}>
        👆 Click any pulsing dot to watch live
      </div>
      <div style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", display:"flex", flexDirection:"column", gap:3, maxHeight:"82vh", overflowY:"auto", paddingRight:2, scrollbarWidth:"none" }}>
        {CITIES.map(c => (
          <button key={c.id} onClick={() => pick(c)} style={{ background: selected?.id===c.id ? "rgba(255,30,74,0.22)" : "rgba(255,255,255,0.03)", border: "1px solid " + (selected?.id===c.id ? "rgba(255,30,74,0.4)" : "rgba(255,255,255,0.07)"), color: selected?.id===c.id ? "#fff" : "#555", padding:"4px 11px", borderRadius:5, cursor:"pointer", fontSize:10, textAlign:"left", transition:"all 0.15s", whiteSpace:"nowrap" }}>
            {c.f} {c.name}
          </button>
        ))}
      </div>
      <div style={{ position:"absolute", bottom:18, left:18, color:"#1a1a38", fontSize:9, letterSpacing:3 }}>{CITIES.length} CAMERAS ONLINE</div>
      {hovered && !selected && (
        <div style={{ position:"absolute", bottom:30, left:"50%", transform:"translateX(-50%)", background:"rgba(2,2,13,0.8)", backdropFilter:"blur(20px)", border:"1px solid rgba(255,30,74,0.2)", borderRadius:10, padding:"10px 22px", color:"#fff", fontSize:13, pointerEvents:"none", letterSpacing:0.5, whiteSpace:"nowrap" }}>
          <span style={{ color:"#ff1e4a" }}>●</span> {hovered.f} {hovered.name} — {hovered.sub}
        </div>
      )}
      {!ready && (
        <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"#02020d", color:"#1a1a38", fontSize:11, letterSpacing:5, gap:16 }}>
          <div style={{ width:40, height:40, border:"2px solid #1a1a38", borderTop:"2px solid #ff1e4a", borderRadius:"50%", animation:"spin 1s linear infinite" }} />
          LOADING EARTH
          <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
        </div>
      )}
      {selected && (
        <div onClick={close} style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.85)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100 }}>
          <div onClick={e => e.stopPropagation()} style={{ width:720, maxWidth:"96vw", background:"#07071a", border:"1px solid rgba(255,30,74,0.18)", borderRadius:18, overflow:"hidden", boxShadow:"0 0 100px rgba(255,30,74,0.07), 0 40px 120px rgba(0,0,0,0.95)" }}>
            <div style={{ padding:"17px 22px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:"1px solid #0d0d25", background:"#050510" }}>
              <div>
                <div style={{ color:"#fff", fontSize:20, fontWeight:700 }}>{selected.f} {selected.name}</div>
                <div style={{ color:"#3a3a5c", fontSize:10, marginTop:4, letterSpacing:2 }}>📍 {selected.sub.toUpperCase()} · {selected.c.toUpperCase()}</div>
              </div>
              <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                <div style={{ display:"flex", alignItems:"center", gap:7, background:"rgba(255,50,50,0.08)", border:"1px solid rgba(255,50,50,0.2)", borderRadius:20, padding:"5px 14px" }}>
                  <span style={{ display:"inline-block", width:7, height:7, borderRadius:"50%", background:"#ff3333", boxShadow:"0 0 10px #ff3333", animation:"pulse 1.4s ease-in-out infinite" }}/>
                  <span style={{ color:"#ff5555", fontSize:10, fontWeight:700, letterSpacing:2 }}>LIVE</span>
                </div>
                <button onClick={close} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid #1a1a30", color:"#444", width:33, height:33, borderRadius:8, cursor:"pointer", fontSize:20, lineHeight:"33px", padding:0 }}>×</button>
              </div>
            </div>
            <div style={{ position:"relative", paddingBottom:"56.25%", background:"#000" }}>
              <iframe key={selected.id} src={"https://www.youtube.com/embed/" + selected.yt + "?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3"} allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowFullScreen style={{ position:"absolute", inset:0, width:"100%", height:"100%", border:"none" }} />
            </div>
            <div style={{ padding:"11px 22px", display:"flex", justifyContent:"space-between", alignItems:"center", background:"#050510" }}>
              <span style={{ color:"#222240", fontSize:9, letterSpacing:2 }}>STREAM OFFLINE? FIND ANOTHER BELOW</span>
              <div style={{ display:"flex", gap:16, alignItems:"center" }}>
                <a href={ytSearchUrl(selected)} target="_blank" rel="noopener noreferrer" style={{ color:"#ff1e4a", fontSize:10, textDecoration:"none", letterSpacing:1 }}>🔍 FIND LIVE CAMS</a>
                <a href={"https://www.youtube.com/watch?v=" + selected.yt} target="_blank" rel="noopener noreferrer" style={{ color:"#333", fontSize:10, textDecoration:"none", letterSpacing:1 }}>OPEN YOUTUBE</a>
              </div>
            </div>
          </div>
        </div>
      )}
      <style>{"@keyframes pulse{0%,100%{opacity:1;box-shadow:0 0 10px #ff3333;}50%{opacity:0.5;box-shadow:0 0 4px #ff3333;}}::-webkit-scrollbar{width:0;}*{box-sizing:border-box;}"}</style>
    </div>
  );
}
