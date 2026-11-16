import { frontQuarterRegistration, registrationRange, registrationSize } from './nlargo-front-quarter-registration';

// Render the approved fixed correction once per size change. Gallery fades
// remain CSS opacity transitions; there is no animation loop or fluid effect.
export async function createRegisteredGalleryImage(canvas: HTMLCanvasElement, src: string, signal: AbortSignal) {
  const photo = new Image();
  await new Promise<void>((resolve, reject) => {
    photo.onload = () => resolve(); photo.onerror = () => reject(new Error('Gallery photo unavailable')); photo.src = src;
  });
  if (signal.aborted) throw new DOMException('Cancelled', 'AbortError');
  const gl = canvas.getContext('webgl2', { alpha: false, antialias: false, depth: false, powerPreference: 'low-power' });
  if (!gl) throw new Error('WebGL unavailable');
  const program = gl.createProgram()!;
  const shaders: WebGLShader[] = [], textures: WebGLTexture[] = [];
  const buffer = gl.createBuffer()!;
  function dispose() {
    textures.forEach(texture => gl!.deleteTexture(texture)); shaders.forEach(shader => gl!.deleteShader(shader));
    gl!.deleteBuffer(buffer); gl!.deleteProgram(program);
  }
  try {
    const vertex = `#version 300 es
in vec2 position; out vec2 uv;
void main(){uv=vec2((position.x+1.)*.5,(1.-position.y)*.5);gl_Position=vec4(position,0.,1.);}`;
    const fragment = `#version 300 es
precision highp float;
in vec2 uv; out vec4 color;
uniform sampler2D photo,registration;
uniform vec4 crop;
void main(){
 vec2 p=crop.xy+uv*crop.zw;
 p.y-=16.5000348/2133.;
 vec2 offset=(texture(registration,p).rg*255.-128.)/127.;
 p+=offset*vec2(${registrationRange}. /3200.,${registrationRange}. /2133.);
 color=texture(photo,p);
}`;
    for (const [type, source] of [[gl.VERTEX_SHADER, vertex], [gl.FRAGMENT_SHADER, fragment]] as const) {
      const shader = gl.createShader(type)!; shaders.push(shader); gl.shaderSource(shader, source); gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? 'Shader compilation failed');
      gl.attachShader(program, shader);
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Shader linking failed');
    gl.useProgram(program); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'position'); gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
    for (let unit = 0; unit < 2; unit++) {
      const texture = gl.createTexture()!; textures.push(texture); gl.activeTexture(gl.TEXTURE0+unit); gl.bindTexture(gl.TEXTURE_2D,texture);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      if (unit === 0) {
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,photo); gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
      } else {
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,registrationSize,registrationSize,0,gl.RGBA,gl.UNSIGNED_BYTE,frontQuarterRegistration());
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
      }
    }
    gl.uniform1i(gl.getUniformLocation(program,'photo'),0); gl.uniform1i(gl.getUniformLocation(program,'registration'),1);
    const crop = gl.getUniformLocation(program,'crop');
    return {
      resize(width: number, height: number) {
        const density=Math.min(window.devicePixelRatio || 1,2,4096/width,4096/height);
        canvas.width=Math.max(1,Math.round(width*density)); canvas.height=Math.max(1,Math.round(height*density));
        const scale=Math.max(width/3200,height/2133), iw=3200*scale, ih=2133*scale;
        gl!.viewport(0,0,canvas.width,canvas.height); gl!.uniform4f(crop,(iw-width)/2/iw,(ih-height)/2/ih,width/iw,height/ih);
        gl!.drawArrays(gl!.TRIANGLES,0,6);
      },
      dispose,
    };
  } catch (error) { dispose(); throw error; }
}
