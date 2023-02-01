import './styles/style.css';
import {
  createProgram,
  createRectangleVertex,
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

interface LoadImage extends ImageData {
  image: HTMLImageElement;
}

async function loadImage() {
  const imageData = await getRandomImage();

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

  const rectangle = createRectangleVertex(0, 0, 500, 500);
  const position = initAttributeAndBuffer(gl, program, 'a_position', rectangle);
  const texCoord = initAttributeAndBuffer(
    gl,
    program,
    'a_texCoord',
    [0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0],
  );

  const resolutionLocation = initUniform(gl, program, 'u_resolution');

  return {
    gl,
    canvas,
    program,
    attributes: {
      position,
      texCoord,
    },
    uniforms: {
      resolutionLocation,
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
    attributes: { position, texCoord },
    uniforms,
  } = programInfo;

  resizeCanvasToDisplaySize(canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(program);

  enableAttrib(gl, position, 2);
  enableAttrib(gl, texCoord, 2);

  gl.uniform2f(uniforms.resolutionLocation, canvas.width, canvas.height);

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

(async function () {
  const programInfo = initWebGL();
  const imageData = await loadImage();
  setUnsplashCredit(imageData.name, imageData.username);
  draw(programInfo, imageData.image);
})();
