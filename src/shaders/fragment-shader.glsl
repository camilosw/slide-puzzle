precision mediump float;

uniform vec2 u_resolution;
uniform float u_tiles;
uniform sampler2D u_texture;
 
void main() {
   vec2 st = gl_FragCoord.xy / u_resolution;
   st = vec2(st.x, 1.0 - st.y);

   st = st * u_tiles;
   st = (fract(st)) / u_tiles;

   gl_FragColor = texture2D(u_texture, st);
}