precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_displacement;
uniform vec2 u_displacement_origin;
uniform float u_tiles;
uniform sampler2D u_texture;
uniform sampler2D u_offset;
 
void main() {
   vec2 st = gl_FragCoord.xy / u_resolution;
   st = vec2(st.x, 1.0 - st.y);

   float tile_size = 1.0 / u_tiles;
   vec2 displacement_tile = floor(u_displacement_origin * u_tiles) / u_tiles;
   vec2 displacement_stripe = 
      step(displacement_tile.yx, st.yx) - 
      step(displacement_tile.yx + tile_size, st.yx);
   st -= u_displacement * displacement_stripe;

   vec2 offset = texture2D(u_offset, st).ra * 255.0;

   st = st * u_tiles;
   st = (fract(st) + offset) / u_tiles;

   gl_FragColor = texture2D(u_texture, st);
}