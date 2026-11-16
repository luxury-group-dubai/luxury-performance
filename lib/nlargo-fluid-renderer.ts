import type { NlargoHeroImage } from './nlargo-hero-images';
import { frontQuarterRegistration, registrationRange, registrationSize } from './nlargo-front-quarter-registration';

const vertex = `attribute vec2 a_position;
varying vec2 v_uv;
void main(){ v_uv=vec2((a_position.x+1.0)*.5,(1.0-a_position.y)*.5); gl_Position=vec4(a_position,0.,1.); }`;

// A small persistent flow field carries the reveal along the stroke. The field
// is advected and dissipated, rather than moving a cut-out over the photograph.
const flowFragment = `precision highp float;
varying vec2 v_uv;
uniform sampler2D u_field;
uniform vec2 u_pointer,u_previous,u_velocity,u_aspect;
uniform float u_dt,u_inject,u_speed;
vec4 field(vec2 uv){return texture2D(u_field,vec2(uv.x,1.-uv.y));}
void main(){
 vec4 old=field(v_uv); vec2 velocity=(old.rg-.5)*.5;
 if(length(velocity)<.002) velocity=vec2(0.);
 vec2 back=v_uv-velocity*u_dt*.9;
 vec4 carried=field(back);
 vec2 v=(carried.rg-.5)*.5*exp(-u_dt*2.1);
 float ink=max(0.,carried.b*exp(-u_dt*1.1)-u_dt*.018);
 if(u_inject>.5){
  vec2 a=u_previous*u_aspect,b=u_pointer*u_aspect,p=v_uv*u_aspect;
  vec2 segment=b-a; float along=clamp(dot(p-a,segment)/max(dot(segment,segment),.000001),0.,1.);
  float distance=length(p-mix(a,b,along));
  float radius=.19*clamp(u_speed*u_speed*18.,.035,1.);
  float brush=exp(-distance*distance/(radius*radius));
  v+=u_velocity*brush*u_dt*1.65;
  ink+=brush*u_dt*6.5*min(u_speed*6.,1.);
 }
 v=clamp(v,vec2(-.24),vec2(.24));
 gl_FragColor=vec4(v*2.+.5,clamp(ink,0.,1.),1.);
}`;

const revealFragment = `precision highp float;
varying vec2 v_uv;
uniform sampler2D u_field,u_photo,u_edge,u_registration;
uniform vec2 u_registrationScale;
uniform vec4 u_box;
uniform vec2 u_edgeBox;
uniform vec3 u_background;
vec4 field(vec2 uv){return texture2D(u_field,vec2(uv.x,1.-uv.y));}
vec3 scene(vec2 uv){
 vec2 photoUV=(uv-u_box.xy)/u_box.zw;
 // A fixed geometric correction, independent of the reveal animation.
 vec2 correction=(texture2D(u_registration,photoUV).rg*255.-128.)/127.;
 photoUV+=correction*u_registrationScale;
 float vertical=smoothstep(0.,.08,photoUV.y)*(1.-smoothstep(.88,1.,photoUV.y));
 float edgeY=(uv.y-u_edgeBox.x)/u_edgeBox.y;
 float edgeFade=smoothstep(0.,.08,edgeY)*(1.-smoothstep(.88,1.,edgeY));
 vec3 base=mix(u_background,texture2D(u_edge,vec2(.5,edgeY)).rgb,edgeFade);
 float horizontal=smoothstep(0.,.2,photoUV.x)*(1.-smoothstep(.88,1.,photoUV.x));
 return mix(base,texture2D(u_photo,photoUV).rgb,horizontal*vertical);
}
void main(){
 float density=field(v_uv).b;
 float alpha=smoothstep(.01,.65,density);
 if(alpha<.001){gl_FragColor=vec4(0.);return;}
 vec3 rgb=scene(v_uv);
 gl_FragColor=vec4(rgb*alpha,alpha);
}`;

function image(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image(); img.onload = () => resolve(img); img.onerror = () => reject(new Error('Hero image unavailable')); img.src = src;
  });
}

export async function createFluidReveal(canvas: HTMLCanvasElement, light: NlargoHeroImage, signal: AbortSignal) {
  const [photo, edgeImage] = await Promise.all([image(light.src), image(light.edge)]);
  if (signal.aborted) throw new DOMException('Cancelled', 'AbortError');
  const options: WebGLContextAttributes = { alpha: true, antialias: false, depth: false, stencil: false, premultipliedAlpha: true, powerPreference: 'low-power' };
  const gl2 = canvas.getContext('webgl2', options);
  const gl = gl2 ?? canvas.getContext('webgl', options);
  if (!gl) throw new Error('WebGL unavailable');
  const shaders: WebGLShader[] = [], programs: WebGLProgram[] = [], textures: WebGLTexture[] = [], targets: WebGLFramebuffer[] = [];
  function program(fragment: string) {
    const result = gl!.createProgram()!; programs.push(result);
    for (const [kind, source] of [[gl!.VERTEX_SHADER, vertex], [gl!.FRAGMENT_SHADER, fragment]] as const) {
      const shader = gl!.createShader(kind)!; shaders.push(shader);
      const shaderSource = gl2 ? '#version 300 es\n' + source
        .replace('attribute vec2', 'in vec2')
        .replace('varying vec2', kind === gl!.VERTEX_SHADER ? 'out vec2' : 'in vec2')
        .replace('precision highp float;', 'precision highp float;\nout vec4 fragmentColor;')
        .replaceAll('texture2D(', 'texture(').replaceAll('gl_FragColor', 'fragmentColor') : source;
      gl!.shaderSource(shader, shaderSource); gl!.compileShader(shader);
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) throw new Error(gl!.getShaderInfoLog(shader) ?? 'Shader compilation failed');
      gl!.attachShader(result, shader);
    }
    gl!.linkProgram(result);
    if (!gl!.getProgramParameter(result, gl!.LINK_STATUS)) throw new Error('Shader linking failed');
    return result;
  }
  function texture(source?: TexImageSource) {
    const value = gl!.createTexture()!; textures.push(value); gl!.bindTexture(gl!.TEXTURE_2D, value);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR); gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE); gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
    if (source) {
      gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, source);
      // Filter the high-resolution photograph when it is scaled down, so thin
      // grille and carbon details do not shimmer or turn into jagged pixels.
      if (gl2) { gl!.generateMipmap(gl!.TEXTURE_2D); gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR_MIPMAP_LINEAR); }
    }
    else gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, 128, 128, 0, gl!.RGBA, gl!.UNSIGNED_BYTE, null);
    return value;
  }
  const flow = program(flowFragment), reveal = program(revealFragment);
  const buffer = gl.createBuffer()!; gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
  const photoTexture = texture(photo);
  const registered = light.id === 'front-quarter-light';
  const registrationTexture = texture();
  const registrationPixels = registered ? frontQuarterRegistration() : new Uint8Array([128,128,0,255]);
  const mapSize = registered ? registrationSize : 1;
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, mapSize, mapSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, registrationPixels);
  // Bake only the tiny studio-edge gradient once; photographs never pass through
  // a per-frame 2D canvas or CPU image-processing loop.
  let edgeSource: TexImageSource = edgeImage;
  if (light.extension) {
    const strip = document.createElement('canvas'); strip.width = 1; strip.height = 512;
    const ctx = strip.getContext('2d')!, gradient = ctx.createLinearGradient(0, 0, 0, 512);
    const entries = [...light.extension.matchAll(/rgb\(([^)]+)\)(?: (\d+)%)?/g)];
    entries.forEach((stop, index) => gradient.addColorStop(stop[2] ? Number(stop[2])/100 : index === 0 ? 0 : 1, `rgb(${stop[1]})`));
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, 1, 512); edgeSource = strip;
  }
  const edgeTexture = texture(edgeSource);
  const fields = [texture(), texture()];
  for (const field of fields) {
    const framebuffer = gl.createFramebuffer()!; targets.push(framebuffer); gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, field, 0);
  }
  const flowNames = ['u_field','u_pointer','u_previous','u_velocity','u_aspect','u_dt','u_inject','u_speed'];
  const revealNames = ['u_field','u_photo','u_edge','u_box','u_edgeBox','u_background','u_registration','u_registrationScale'];
  const f = Object.fromEntries(flowNames.map(name => [name, gl.getUniformLocation(flow, name)]));
  const r = Object.fromEntries(revealNames.map(name => [name, gl.getUniformLocation(reveal, name)]));
  function use(p: WebGLProgram) {
    gl!.useProgram(p); gl!.bindBuffer(gl!.ARRAY_BUFFER, buffer); const position = gl!.getAttribLocation(p, 'a_position'); gl!.enableVertexAttribArray(position); gl!.vertexAttribPointer(position, 2, gl!.FLOAT, false, 0, 0);
  }
  function bind(unit: number, value: WebGLTexture) { gl!.activeTexture(gl!.TEXTURE0 + unit); gl!.bindTexture(gl!.TEXTURE_2D, value); }
  let width = 1, height = 1, index = 0, frame = 0, disposed = false, lastFrame = 0, lastMove = -10000, demoStart = 0;
  let pointer = [.5,.5], previous = [.5,.5], velocity = [0,0];
  let box = [0,0,1,1], edgeBox = [0,1], aspect = [1,1];
  const background = (light.background.match(/[\d.]+/g) ?? []).map(Number).map(value => value/255);
  function clear() {
    for (const target of targets) { gl!.bindFramebuffer(gl!.FRAMEBUFFER, target); gl!.clearColor(.5,.5,0,1); gl!.clear(gl!.COLOR_BUFFER_BIT); }
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, null); gl!.clearColor(0,0,0,0); gl!.clear(gl!.COLOR_BUFFER_BIT);
    canvas.dataset.active = 'false';
  }
  function resize(w: number, h: number) {
    width=w; height=h;
    // Keep the flow simulation tiny, but display the photograph at screen density.
    const scale=Math.min(window.devicePixelRatio || 1,2,4096/width,4096/height); canvas.width=Math.max(1,Math.round(width*scale)); canvas.height=Math.max(1,Math.round(height*scale));
    const mobile=window.matchMedia('(max-width:760px)').matches;
    const iw=Math.max(width*(mobile?1.46465:.820204),height*.82429), ih=Math.max(width*(mobile?.97643:.546801),height*.54953);
    const x=width*(mobile?.5:.72)-iw/2;
    const y=height*(mobile?.67:.61)-Math.max(width*(mobile?.61391:.284087),height*(mobile?.345504:.285504))+ih*light.shift/100;
    const photoScale=light.scale ?? 1;
    box=[(x+iw*(light.offsetX ?? 0)/100-iw*(photoScale-1)/2)/width,(y-ih*(photoScale-1)/2)/height,iw*photoScale/width,ih*photoScale/height];
    edgeBox=[y/height,ih/height]; aspect=[width/Math.min(width,height),height/Math.min(width,height)];
    cancelAnimationFrame(frame); frame=0; demoStart=0; previous=[...pointer]; clear();
  }
  function render(now: number) {
    frame=0; if(disposed)return;
    const dt=Math.min(.033,Math.max(.008,(now-lastFrame)/1000)); lastFrame=now;
    if(demoStart){ const t=(now-demoStart)/2400; if(t>=1)demoStart=0; else {const mobile=width<=760;pointer=[(mobile?.5:.72)+(mobile?.27:.17)*Math.cos(t*Math.PI*4),.57+.12*Math.sin(t*Math.PI*4)];lastMove=now;} }
    const delta=[pointer[0]-previous[0],pointer[1]-previous[1]];
    const moving=Math.hypot(...delta)>.00001 && now-lastMove<100;
    velocity=velocity.map((v,i)=>v*.75+Math.max(-2,Math.min(2,delta[i]/dt))*.25);
    const speed=Math.hypot(velocity[0]*aspect[0],velocity[1]*aspect[1]);
    use(flow);gl!.bindFramebuffer(gl!.FRAMEBUFFER,targets[1-index]);gl!.viewport(0,0,128,128);bind(0,fields[index]);
    gl!.uniform1i(f.u_field,0);gl!.uniform2fv(f.u_pointer,pointer);gl!.uniform2fv(f.u_previous,previous);gl!.uniform2fv(f.u_velocity,velocity);gl!.uniform2fv(f.u_aspect,aspect);gl!.uniform1f(f.u_dt,dt);gl!.uniform1f(f.u_inject,moving?1:0);gl!.uniform1f(f.u_speed,speed);gl!.drawArrays(gl!.TRIANGLES,0,6);index=1-index;
    use(reveal);gl!.bindFramebuffer(gl!.FRAMEBUFFER,null);gl!.viewport(0,0,canvas.width,canvas.height);bind(0,fields[index]);bind(1,photoTexture);bind(2,edgeTexture);bind(3,registrationTexture);
    gl!.uniform1i(r.u_field,0);gl!.uniform1i(r.u_photo,1);gl!.uniform1i(r.u_edge,2);gl!.uniform1i(r.u_registration,3);gl!.uniform2f(r.u_registrationScale,registrationRange/3200,registrationRange/2133);gl!.uniform4fv(r.u_box,box);gl!.uniform2fv(r.u_edgeBox,edgeBox);gl!.uniform3fv(r.u_background,background);gl!.drawArrays(gl!.TRIANGLES,0,6);
    previous=[...pointer]; canvas.dataset.active='true';
    if(demoStart || now-lastMove<4600)frame=requestAnimationFrame(render);else clear();
  }
  function start() { if(!frame&&!disposed){lastFrame=performance.now();frame=requestAnimationFrame(render);} }
  return {
    resize,
    move(x:number,y:number){const now=performance.now();if(now-lastMove>200){previous=[x/width,y/height];velocity=[0,0];}pointer=[x/width,y/height];lastMove=now;demoStart=0;start();},
    play(){demoStart=performance.now();lastMove=demoStart;pointer=[width<=760?.77:.89,.57];previous=[...pointer];start();},
    stop(){cancelAnimationFrame(frame);frame=0;demoStart=0;lastMove=-10000;clear();},
    dispose(){disposed=true;cancelAnimationFrame(frame);for(const value of textures)gl!.deleteTexture(value);for(const value of targets)gl!.deleteFramebuffer(value);for(const value of programs)gl!.deleteProgram(value);for(const value of shaders)gl!.deleteShader(value);gl!.deleteBuffer(buffer);},
  };
}
