precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_displacement;
uniform float u_tiles;
uniform sampler2D u_texture;
uniform sampler2D u_offset;
 
void main() {
   vec2 st = gl_FragCoord.xy / u_resolution;
   st = vec2(st.x, 1.0 - st.y);
   st -= u_displacement;
   st = vec2(st.x - step(1.0, st.x), st.y - step(1.0, st.y));

   vec2 offset = texture2D(u_offset, st).ra * 255.0;

   st = st * u_tiles;
   st = (fract(st) + offset) / u_tiles;

   gl_FragColor = texture2D(u_texture, st);
}