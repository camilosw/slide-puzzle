import './styles/style.css';
import {
  createProgram,
  enableAttrib,
  initAttributeAndBuffer,
  initGL,
  initUniform,
  resizeCanvasToDisplaySize,
  setupTexture,
} from './webgl-utils';
import vertexShader from './shaders/vertex-shader.glsl?raw';
import fragmentShader from './shaders/fragment-shader.glsl?raw';
import { getRandomImage, ImageData } from './api';
import { setUnsplashCredit } from './ui';
import { DragInfo, getDragInfo } from './dragInfo';

const debug = import.meta.env.DEV && import.meta.env.VITE_DEBUG;

interface LoadImage extends ImageData {
  image: HTMLImageElement;
}

async function loadImage() {
  const imageData = await getRandomImage(debug);

  return new Promise<LoadImage>((resolve) => {
    const image = new Image();
    image.crossOrigin = 'Anonymous';
    image.src = imageData.url;
    image.addEventListener('load', () => {
      resolve({
        ...imageData,
        image,
      });
    });
  });
}

function initWebGL() {
  const { gl, canvas } = initGL('c');
  const program = createProgram(gl, vertexShader, fragmentShader);

  const position = initAttributeAndBuffer(
    gl,
    program,
    'a_position',
    [-1, -1, -1, 1, 1, -1, 1, -1, -1, 1, 1, 1],
  );

  const resolutionLocation = initUniform(gl, program, 'u_resolution');
  const tilesLocation = initUniform(gl, program, 'u_tiles');
  const textureLocation = initUniform(gl, program, 'u_texture');
  const offsetLocation = initUniform(gl, program, 'u_offset');
  const displacementLocation = initUniform(gl, program, 'u_displacement');

  return {
    gl,
    canvas,
    program,
    attributes: {
      position,
    },
    uniforms: {
      resolutionLocation,
      tilesLocation,
      textureLocation,
      offsetLocation,
      displacementLocation,
    },
  };
}

// TODO: generate randomly
// prettier-ignore
const offset = [
  [[0, 0],[1, 0],[2, 0],[3, 0]],
  [[0, 1],[2, 3],[2, 1],[3, 1]],
  [[0, 2],[1, 2],[2, 2],[3, 2]],
  [[0, 3],[1, 3],[2, 3],[3, 3]],
].flatMap(i => i).flatMap(i => i);

function draw(
  programInfo: ReturnType<typeof initWebGL>,
  image: HTMLImageElement,
  dragInfo: DragInfo,
) {
  const {
    gl,
    canvas,
    program,
    attributes: { position },
    uniforms,
  } = programInfo;

  const tiles = 4; // TODO: set by user

  resizeCanvasToDisplaySize(canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(program);

  enableAttrib(gl, position, 2);

  const imageTexture = setupTexture(gl);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  const offsetTexture = setupTexture(gl);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.LUMINANCE_ALPHA,
    tiles,
    tiles,
    0,
    gl.LUMINANCE_ALPHA,
    gl.UNSIGNED_BYTE,
    new Uint8Array(offset),
  );

  gl.uniform1i(uniforms.textureLocation, 0);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, imageTexture);

  gl.uniform1i(uniforms.offsetLocation, 1);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, offsetTexture);

  gl.uniform2f(uniforms.resolutionLocation, canvas.width, canvas.height);
  gl.uniform1f(uniforms.tilesLocation, tiles);
  gl.uniform2f(
    uniforms.displacementLocation,
    dragInfo.displacement.x / canvas.width,
    dragInfo.displacement.y / canvas.height,
  );

  gl.drawArrays(gl.TRIANGLES, 0, 6);

  requestAnimationFrame(() => draw(programInfo, image, dragInfo));
}

(async function () {
  const programInfo = initWebGL();
  const imageData = await loadImage();
  setUnsplashCredit(imageData.name, imageData.username);
  const dragInfo = getDragInfo(programInfo.canvas);
  draw(programInfo, imageData.image, dragInfo);
})();
