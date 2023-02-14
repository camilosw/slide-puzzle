import './styles/style.css';
import {
  createProgram,
  enableAttrib,
  initAttributeAndBuffer,
  initGL,
  initUniform,
  resizeCanvasToDisplaySize,
} from './webgl-utils';
import vertexShader from './shaders/vertex-shader.glsl?raw';
import fragmentShader from './shaders/fragment-shader.glsl?raw';
import { getRandomImage, ImageData } from './api';
import { setUnsplashCredit } from './ui';

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
    },
  };
}

function draw(
  programInfo: ReturnType<typeof initWebGL>,
  image: HTMLImageElement,
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

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  gl.uniform2f(uniforms.resolutionLocation, canvas.width, canvas.height);
  gl.uniform1f(uniforms.tilesLocation, tiles);

  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

(async function () {
  const programInfo = initWebGL();
  const imageData = await loadImage();
  setUnsplashCredit(imageData.name, imageData.username);
  draw(programInfo, imageData.image);
})();
