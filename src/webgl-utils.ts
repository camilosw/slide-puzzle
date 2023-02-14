export function initGL(canvasId: string) {
  const canvas = document.getElementById(canvasId);
  if (canvas instanceof HTMLCanvasElement) {
    const gl = canvas.getContext('webgl');
    if (!gl) {
      throw new Error('Could not get WebGL context');
    }
    return { gl, canvas };
  }
  throw new Error('Could not find a canvas with canvasId');
}

function createShader(gl: WebGLRenderingContext, source: string, type: number) {
  const shader = gl.createShader(type);
  if (!shader) {
    throw new Error(
      `Could not create ${
        type === gl.VERTEX_SHADER ? 'vertex' : 'fragment'
      } shader`,
    );
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!success) {
    throw 'Could not compile shader:' + gl.getShaderInfoLog(shader);
  }

  return shader;
}

export function createProgram(
  gl: WebGLRenderingContext,
  vertexShaderText: string,
  fragmentShaderText: string,
) {
  const program = gl.createProgram();
  if (!program) {
    throw new Error('Could not create WebGL program');
  }
  const vertexShader = createShader(gl, vertexShaderText, gl.VERTEX_SHADER);
  const fragmentShader = createShader(
    gl,
    fragmentShaderText,
    gl.FRAGMENT_SHADER,
  );

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!success) {
    throw 'Program failed to link:' + gl.getProgramInfoLog(program);
  }

  return program;
}

export function initAttributeAndBuffer(
  gl: WebGLRenderingContext,
  program: WebGLProgram,
  attribName: string,
  data: Iterable<number>,
) {
  const location = gl.getAttribLocation(program, attribName);
  const buffer = gl.createBuffer();
  if (!buffer) {
    throw new Error(`Could not create a buffer for ${attribName}`);
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
  return { location, buffer };
}

export function initUniform(
  gl: WebGLRenderingContext,
  program: WebGLProgram,
  uniformName: string,
) {
  const location = gl.getUniformLocation(program, uniformName);
  if (!location) {
    throw new Error(`Could not get the uniform ${uniformName}`);
  }
  return location;
}

export function resizeCanvasToDisplaySize(canvas: HTMLCanvasElement) {
  const displayWidth = canvas.clientWidth;
  const displayHegiht = canvas.clientHeight;

  const needResize =
    canvas.width !== displayHegiht || canvas.height !== displayHegiht;

  if (needResize) {
    canvas.width = displayWidth;
    canvas.height = displayHegiht;
  }

  return needResize;
}

export function enableAttrib(
  gl: WebGLRenderingContext,
  attribute: ReturnType<typeof initAttributeAndBuffer>,
  size: number,
  options: Partial<{
    normalize: boolean;
    stride: number;
    offset: number;
  }> = {},
) {
  const { location, buffer } = attribute;
  const { normalize = false, stride = 0, offset = 0 } = options;

  gl.enableVertexAttribArray(location);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(location, size, gl.FLOAT, normalize, stride, offset);
}

export function setupTexture(gl: WebGLRenderingContext) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  return texture;
}
