// Aurora hero shader — fragment + vertex pair.
// Technique: fbm over a domain-warped flow field, evolved by uTime.
// Luminous on white: alpha-driven ribbons over the near-white page via NormalBlending.
// Cursor warps the domain around uMouse, scaled by uMouseVel for physical "parting" feel.

export const vertexShader = /* glsl */ `
  varying vec2 vUv;

  // Clip-space passthrough — the PlaneGeometry(2,2) spans exactly -1..1 in clip space,
  // so we bypass the camera/model matrices entirely. This makes the plane fullscreen
  // regardless of camera frustum units.
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

export const fragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec2  uResolution;
  uniform vec2  uMouse;      // normalized 0..1 cursor position
  uniform vec2  uMouseVel;   // frame-delta velocity (pixels/frame equivalent)
  uniform vec3  uColorA;     // violet #7C5CFF
  uniform vec3  uColorB;     // teal   #2DD4BF
  uniform float uIntensity;  // master brightness multiplier

  varying vec2 vUv;

  // ── Noise primitives ──────────────────────────────────────────────────────

  // Hash: deterministic pseudo-random 2D → 2D
  vec2 hash22(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)),
             dot(p, vec2(269.5,  83.3)));
    return fract(sin(p) * 43758.5453123);
  }

  // Smooth value noise, returns value in [-1, 1]
  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f); // smoothstep

    float a = dot(hash22(i + vec2(0.0, 0.0)) * 2.0 - 1.0, f - vec2(0.0, 0.0));
    float b = dot(hash22(i + vec2(1.0, 0.0)) * 2.0 - 1.0, f - vec2(1.0, 0.0));
    float c = dot(hash22(i + vec2(0.0, 1.0)) * 2.0 - 1.0, f - vec2(0.0, 1.0));
    float d = dot(hash22(i + vec2(1.0, 1.0)) * 2.0 - 1.0, f - vec2(1.0, 1.0));

    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  // fbm: 4 octaves — keep low on mobile, deep enough for organics on desktop
  float fbm(vec2 p) {
    float v    = 0.0;
    float amp  = 0.5;
    float freq = 1.0;
    // 4 octaves: good balance of detail vs GPU cost
    for (int i = 0; i < 4; i++) {
      v   += amp * vnoise(p * freq);
      amp  *= 0.5;
      freq *= 2.1; // slightly irrational ratio → avoids grid artifacts
    }
    return v; // roughly in [-1, 1]
  }

  // Domain-warped fbm: noise(p + noise(p)) — the key to organic aurora tendrils
  float warpedFbm(vec2 p, float time) {
    // First layer: slow drift
    vec2 q = vec2(
      fbm(p + vec2(0.0,  0.0) + time * 0.08),
      fbm(p + vec2(5.2,  1.3) + time * 0.06)
    );

    // Second layer: warp by q — this is the domain warping pass
    vec2 r = vec2(
      fbm(p + 3.5 * q + vec2(1.7, 9.2) + time * 0.04),
      fbm(p + 3.5 * q + vec2(8.3, 2.8) + time * 0.03)
    );

    // Final sample warped by both layers
    return fbm(p + 2.0 * r + time * 0.05);
  }

  // ── Cursor interaction ────────────────────────────────────────────────────

  // Repulsion field: pushes the domain away from the cursor,
  // scaled by velocity magnitude so fast movement = strong parting.
  vec2 cursorWarp(vec2 uv, vec2 mouse, vec2 vel) {
    vec2  delta   = uv - mouse;
    // Correct for aspect ratio so the falloff is circular
    delta.x      *= uResolution.x / uResolution.y;
    float dist    = length(delta);
    // Smoothstep falloff avoids the 1/r² singularity at dist→0; the field bends
    // gently rather than pinching at the cursor center.
    float falloff = 1.0 - smoothstep(0.0, 0.45, dist);
    float speed   = clamp(length(vel) * 40.0, 0.0, 1.0); // velocity amplifier
    // mix(delta, normalized, t) keeps the direction smooth at very small dist
    vec2  dir     = mix(delta, normalize(delta + vec2(1e-4)), smoothstep(0.0, 0.05, dist));
    return dir * falloff * (0.10 + speed * 0.20);
  }

  // ── Color mapping ─────────────────────────────────────────────────────────

  // Map fbm value → (color, alpha) for luminous ribbons on a white page.
  // Strategy: NormalBlending with straight alpha — dark areas transparent (white shows
  // through), bright ribbons = saturated violet/teal "ink in water" over the bg.
  // Returns vec4(premultiplied_color, alpha) — Canvas uses premultipliedAlpha:false
  // so we output straight color (no premultiply needed).
  vec4 auroraColor(float field, vec2 uv, float time) {
    // Primary band mask: gamma curve creates crisp-edged, tapering ribbons
    float band   = pow(max(0.0, field * 0.5 + 0.5), 2.4);

    // Secondary offset band — crossing strands for aurora layering
    float band2  = pow(max(0.0, (field + 0.28) * 0.5 + 0.5), 3.2) * 0.5;

    // Combined band strength drives alpha — quiet areas fully transparent
    float mask   = clamp((band + band2) * uIntensity, 0.0, 1.0);

    // Hue: biased toward violet — oscillates between uColorA and uColorB but
    // spends more time in the violet half. Offset of -0.25 pulls the midpoint
    // toward uColorA so roughly 60% of the field reads violet.
    float hue    = smoothstep(-0.1, 1.1,
                     uv.x * 0.55 + (1.0 - uv.y) * 0.45 + time * 0.04 - 0.25);
    vec3  color  = mix(uColorA, uColorB, hue);

    // Soft white core at peak intensity — ribbons feel lit from within
    color        = mix(color, vec3(0.96, 0.94, 1.0), smoothstep(0.52, 0.82, band));

    return vec4(color, mask);
  }

  // ── Main ─────────────────────────────────────────────────────────────────

  void main() {
    vec2 uv = vUv;

    // Aspect-correct UV for the noise domain
    vec2 p = uv;
    p.x   *= uResolution.x / uResolution.y;
    p     *= 1.8; // scale — wider field = slower apparent motion

    // Apply cursor domain warp
    p += cursorWarp(uv, uMouse, uMouseVel);

    // Evaluate the warped flow field
    float field = warpedFbm(p, uTime);

    // Map to luminous color + alpha
    vec4 ribbon = auroraColor(field, uv, uTime);

    // Soft vignette — fade ribbons at the very edges of the viewport
    float vig    = 1.0 - smoothstep(0.38, 1.1, length(uv - 0.5) * 1.4);
    ribbon.a    *= vig;

    // Straight alpha output with NormalBlending + premultipliedAlpha:false.
    // White page shows through where alpha=0; full ribbon color where alpha=1.
    gl_FragColor = vec4(ribbon.rgb, ribbon.a);
  }
`
