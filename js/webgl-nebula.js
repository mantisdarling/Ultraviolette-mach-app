/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   WEBGL NEBULA BACKGROUND — Particle Shaders & Parallax
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

(function initWebGL() {
  try {
    const reducedMotion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;
    if (reducedMotion) return;

    const c = document.getElementById('shader');
    if (!c) return;

    /* Resize canvas to match display size */
    let boundsDirty = true;
    let canvasBounds = { left: 0, top: 0, width: 1, height: 1 };
    let viewportDirty = true;
    const renderScale = window.matchMedia?.('(pointer: fine)').matches ? 0.75 : 0.65;

    function updateCanvasBounds() {
      const rect = c.getBoundingClientRect();
      canvasBounds = {
        left: rect.left,
        top: rect.top,
        width: rect.width || c.clientWidth || window.innerWidth,
        height: rect.height || c.clientHeight || window.innerHeight
      };
      boundsDirty = false;
    }

    function sz() {
      const cssWidth = c.clientWidth  || window.innerWidth;
      const cssHeight = c.clientHeight || window.innerHeight;
      const w = Math.max(1, Math.floor(cssWidth * renderScale));
      const h = Math.max(1, Math.floor(cssHeight * renderScale));
      if (c.width !== w || c.height !== h) {
        c.width = w;
        c.height = h;
        viewportDirty = true;
      }
      boundsDirty = true;
      updateCanvasBounds();
    }
    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(sz).observe(c);
    } else {
      window.addEventListener('resize', sz, { passive: true });
    }
    sz();

    const contextOptions = {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'low-power',
      preserveDrawingBuffer: false
    };
    const gl = c.getContext('webgl', contextOptions) || c.getContext('experimental-webgl', contextOptions);
    if (!gl) return; /* CSS fallback gradient in stylesheet takes over */

    /* Vertex shader: full-screen quad */
    const vs = `attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.0,1.0);}`;

    /* Fragment shader: noise-driven purple nebula with mouse parallax and velocity ripples.
       This decorative background does not require highp precision. */
    const fs = `precision mediump float;
varying vec2 v;uniform float t;uniform vec2 r,m;uniform float vL;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
void main(){
  vec2 uv=v,ms=m/r;
  float dist = length(uv - ms);
  float warp = smoothstep(0.4, 0.0, dist) * vL * 0.45;
  uv += vec2(sin(t + uv.y * 10.), cos(t + uv.x * 10.)) * warp;
  
  vec3 col=vec3(.015,.011,.02);
  col+=vec3(.48,.17,.75)*n(uv*3.+t*.055)*.14;
  col+=vec3(.48,.17,.75)*smoothstep(.78,0.,length(uv-vec2(.5+(ms.x-.5)*.14,.56+(ms.y-.5)*.12)))*.22;
  col+=vec3(.48,.17,.75)*smoothstep(1.,.3,uv.y)*.05;
  col*=.58+.42*(1.-smoothstep(.32,1.1,length((uv-.5)*vec2(1.,.72))));
  col+=sin(uv.y*480.)*0.008;
  gl_FragColor=vec4(clamp(col,0.,1.),1.0);
}`;

    function mkShader(type, src) {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.warn('Shader compile log:', gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    }

    const vShader = mkShader(gl.VERTEX_SHADER, vs);
    const fShader = mkShader(gl.FRAGMENT_SHADER, fs);
    if (!vShader || !fShader) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vShader);
    gl.attachShader(prog, fShader);
    gl.linkProgram(prog);

    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn('Program link log:', gl.getProgramInfoLog(prog));
      return;
    }

    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uT = gl.getUniformLocation(prog, 't');
    const uR = gl.getUniformLocation(prog, 'r');
    const uM = gl.getUniformLocation(prog, 'm');
    const uV = gl.getUniformLocation(prog, 'vL');

    let mmx = 0.5, mmy = 0.5;
    let lmx = 0.5, lmy = 0.5;
    let vel = 0.0;
    
    window.addEventListener('scroll', () => {
      boundsDirty = true;
    }, { passive: true });

    window.addEventListener('mousemove', e => {
        if (boundsDirty) updateCanvasBounds();
        const rc = canvasBounds;
        if (rc.width && rc.height) {
          lmx = mmx;
          lmy = mmy;
          mmx = (e.clientX - rc.left) / rc.width;
          mmy = 1 - (e.clientY - rc.top)  / rc.height;
        
        const dx = mmx - lmx;
        const dy = mmy - lmy;
        vel += Math.sqrt(dx * dx + dy * dy) * 0.15;
      }
    }, { passive: true });

    let isVisible = true;
    let rafId     = null;
    let lastFrameTime = -Infinity;
    const frameInterval = 1000 / 30;

    function render(t) {
      if (!isVisible) { 
        rafId = null; 
        return; 
      }
      if (t - lastFrameTime < frameInterval) {
        rafId = requestAnimationFrame(render);
        return;
      }
      lastFrameTime = t;
      if (viewportDirty) {
        gl.viewport(0, 0, c.width, c.height);
        viewportDirty = false;
      }

      vel *= 0.94; // smooth velocity decay
      
      gl.uniform1f(uT, t * 0.001);
      gl.uniform2f(uR, c.width, c.height);
      gl.uniform2f(uM, mmx * c.width, mmy * c.height);
      gl.uniform1f(uV, vel);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafId = requestAnimationFrame(render);
    }

    /* Pause render RAF loops when hero is scrolled out of viewport or tab is inactive */
    if (typeof IntersectionObserver !== 'undefined') {
      new IntersectionObserver(entries => {
        isVisible = entries[0].isIntersecting && !document.hidden;
        if (isVisible && !rafId) {
          rafId = requestAnimationFrame(render);
        }
      }, { threshold: 0 }).observe(c);
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        isVisible = false;
      } else {
        const rc = c.getBoundingClientRect();
        const isInViewport = typeof IntersectionObserver !== 'undefined'
          ? isVisible
          : (rc.top < window.innerHeight && rc.bottom > 0);
        isVisible = isInViewport;
      }
      if (isVisible && !rafId) {
        rafId = requestAnimationFrame(render);
      }
    });

    rafId = requestAnimationFrame(render);
  } catch (e) {
    console.error('WebGL failed to run:', e);
  }
})();
