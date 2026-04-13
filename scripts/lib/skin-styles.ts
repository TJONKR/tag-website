export interface SkinStyle {
  name: string
  prompt: string
  rarity: 'common' | 'rare' | 'epic'
  generation_type: '2d' | '3d'
  weight: number
}

export const GLOBAL_STYLES: SkinStyle[] = [
  // ─── COMMON (20 styles, 2D only, weight 10) ─────────────────

  {
    name: 'Sin City',
    prompt:
      'Transform this portrait into a graphic novel noir style. Heavy black ink, dramatic shadows, extreme high contrast. Only orange (#ff5f1f) as accent color for rim lighting and highlights. Sin City meets tech branding. Dark moody background, bold ink strokes. Keep the person clearly recognizable. Do not add any text or watermarks.',
    rarity: 'common',
    generation_type: '2d',
    weight: 10,
  },
  {
    name: 'Neon Wire',
    prompt:
      'Transform this portrait into a cyberpunk wireframe style. Dark black background, face outlined in glowing neon-orange (#ff5f1f) wireframe lines. Tron-style digital grid overlay, circuit board patterns tracing the facial features. Glowing data streams. The person should be clearly recognizable through the wireframe. Do not add any text or watermarks.',
    rarity: 'common',
    generation_type: '2d',
    weight: 10,
  },
  {
    name: 'Ink Wash',
    prompt:
      'Transform this portrait into Japanese sumi-e ink wash painting style. Loose expressive brush strokes, wabi-sabi imperfection. Black ink on dark textured paper, subtle ink gradients. Minimal orange (#ff5f1f) seal/chop mark accent in the corner. Zen-like simplicity, negative space. The person should be clearly recognizable. Do not add any text or watermarks.',
    rarity: 'common',
    generation_type: '2d',
    weight: 10,
  },
  {
    name: 'Pixel Lord',
    prompt:
      'Transform this portrait into 16-bit retro pixel art style. Chunky visible pixels, limited palette: black, charcoal gray, and orange (#ff5f1f). Retro game character portrait feel, reminiscent of classic SNES/Genesis era character select screens. Dark background. The person should be clearly recognizable. Do not add any text or watermarks.',
    rarity: 'common',
    generation_type: '2d',
    weight: 10,
  },
  {
    name: 'Risograph',
    prompt:
      'Transform this portrait into a risograph / screen print style. Visible halftone dot patterns, limited ink layers with slight misregistration between colors. Two ink colors only: deep black and bright orange (#ff5f1f) on dark charcoal paper. High contrast, grainy texture, vintage band poster aesthetic. The person should be clearly recognizable. Do not add any text or watermarks.',
    rarity: 'common',
    generation_type: '2d',
    weight: 10,
  },
  {
    name: 'Glitch',
    prompt:
      'Transform this portrait into digital glitch art style. Corrupted data aesthetic with RGB channel split, horizontal scan lines, pixel sorting artifacts. Dark base with orange (#ff5f1f) glitch streaks and data corruption effects. The face should be recognizable but digitally disrupted. CRT monitor distortion feel. Do not add any text or watermarks.',
    rarity: 'common',
    generation_type: '2d',
    weight: 10,
  },
  {
    name: 'Woodcut',
    prompt:
      'Transform this portrait into a medieval woodblock print style. Bold carved lines, intricate cross-hatching, high contrast relief print aesthetic. Black and orange (#ff5f1f) ink on dark background. Inspired by Albrecht Dürer engravings. The person should be clearly recognizable through the carved linework. Do not add any text or watermarks.',
    rarity: 'common',
    generation_type: '2d',
    weight: 10,
  },
  {
    name: 'Thermal',
    prompt:
      'Transform this portrait into a thermal/infrared camera vision style. Heat signature rendered in orange-to-black gradient, like viewing through military thermal imaging. Scientific overlay UI elements, temperature readings, crosshair markers. Dark background with heat map of the face. The person should be clearly recognizable. Do not add any text or watermarks.',
    rarity: 'common',
    generation_type: '2d',
    weight: 10,
  },
  {
    name: 'Stencil',
    prompt:
      'Transform this portrait into Banksy-style stencil street art. Bold high-contrast stencil graffiti on a dark concrete wall texture. Spray paint texture with drip effects. Orange (#ff5f1f) and black only. The person should be clearly recognizable through the stencil. Gritty urban feel. Do not add any text or watermarks.',
    rarity: 'common',
    generation_type: '2d',
    weight: 10,
  },
  {
    name: 'Manga',
    prompt:
      'Transform this portrait into clean Japanese manga panel style. Precise manga linework, speed lines in background, screentone dot shading. Black and white with orange (#ff5f1f) as the only color accent for highlights and effects. Dramatic manga character portrait. The person should be clearly recognizable. Do not add any text or watermarks.',
    rarity: 'common',
    generation_type: '2d',
    weight: 10,
  },
  {
    name: 'Blueprint',
    prompt:
      'Transform this portrait into a technical blueprint drawing style. Dark blueprint paper background, white and orange (#ff5f1f) technical drawing lines. Face rendered as architectural schematic with measurement annotations, dimension lines, cross-section markers. Engineering drawing aesthetic. The person should be clearly recognizable. Do not add any text or watermarks.',
    rarity: 'common',
    generation_type: '2d',
    weight: 10,
  },
  {
    name: 'Chalk',
    prompt:
      'Transform this portrait into detailed chalk art on a dark blackboard. White and orange chalk, smudged edges, dusty chalk texture. Blackboard background with subtle chalk dust. Expressive chalk drawing with visible stroke marks. The person should be clearly recognizable. Do not add any text or watermarks.',
    rarity: 'common',
    generation_type: '2d',
    weight: 10,
  },
  {
    name: 'Linocut',
    prompt:
      'Transform this portrait into a modern linocut print style. Clean geometric shapes, bold flat areas, sharp carved edges. Two-color print: orange (#ff5f1f) and black on dark background. Strong graphic design feel with modernist simplicity. The person should be clearly recognizable. Do not add any text or watermarks.',
    rarity: 'common',
    generation_type: '2d',
    weight: 10,
  },
  {
    name: 'ASCII',
    prompt:
      'Transform this portrait into ASCII text art displayed on a dark terminal screen. Face rendered using ASCII characters and symbols. Green and orange monochrome CRT phosphor glow effect. Retro computer terminal aesthetic with scan lines and slight screen curvature. The person should be clearly recognizable through the characters. Do not add any text or watermarks.',
    rarity: 'common',
    generation_type: '2d',
    weight: 10,
  },
  {
    name: 'Noir Photo',
    prompt:
      'Transform this portrait into classic 1940s film noir photography style. Extreme high contrast black and white, venetian blind shadow patterns across the face, dramatic side lighting, wisps of cigarette smoke. Subtle warm orange (#ff5f1f) tint on highlights only. Classic detective movie atmosphere. The person should be clearly recognizable. Do not add any text or watermarks.',
    rarity: 'common',
    generation_type: '2d',
    weight: 10,
  },
  {
    name: 'Pop Art',
    prompt:
      'Transform this portrait into Andy Warhol-style pop art screen print. Bold flat color areas, visible Ben-Day dots pattern, thick black outlines. Limited palette: black, charcoal, orange (#ff5f1f), and cream. High contrast, graphic poster feel. The person should be clearly recognizable. Do not add any text or watermarks.',
    rarity: 'common',
    generation_type: '2d',
    weight: 10,
  },
  {
    name: 'Engraving',
    prompt:
      'Transform this portrait into fine currency-style line engraving. Intricate cross-hatched parallel lines like on a banknote or stock certificate. Formal portrait composition. Orange (#ff5f1f) and black line work on dark background. Extremely detailed linework creating tone through line density. The person should be clearly recognizable. Do not add any text or watermarks.',
    rarity: 'common',
    generation_type: '2d',
    weight: 10,
  },
  {
    name: 'Mosaic',
    prompt:
      'Transform this portrait into an ancient Roman-style tile mosaic. Small square tessera tile pieces in black, charcoal, burnt orange (#ff5f1f), and cream. Visible grout lines between tiles. Classical mosaic portrait on dark background. The person should be clearly recognizable through the tile pattern. Do not add any text or watermarks.',
    rarity: 'common',
    generation_type: '2d',
    weight: 10,
  },
  {
    name: 'Papercut',
    prompt:
      'Transform this portrait into multi-layered paper cutout art style. Visible shadow depth between paper layers creating dimension. Dark paper tones (black, charcoal) with orange (#ff5f1f) layer accents. Intricate silhouette cutting with fine detail. The person should be clearly recognizable. Do not add any text or watermarks.',
    rarity: 'common',
    generation_type: '2d',
    weight: 10,
  },
  {
    name: 'VHS',
    prompt:
      'Transform this portrait into 80s VHS tape recording aesthetic. Tracking errors, color bleeding, horizontal scan lines, timestamp overlay in corner. Warm orange (#ff5f1f) color cast, magnetic tape distortion. CRT television screen feel with slight static noise. The person should be clearly recognizable through the distortion. Do not add any text or watermarks.',
    rarity: 'common',
    generation_type: '2d',
    weight: 10,
  },

  // ─── RARE (7 styles, 3D generation, weight 3) ────────────────

  {
    name: 'Chrome',
    prompt:
      'Transform this portrait into liquid chrome / mercury sculpture style. Hyper-reflective metallic surface catching studio lighting. Smooth flowing chrome forms defining facial features. Orange (#ff5f1f) environment reflections visible in the chrome surface. Dark studio background. The person should be clearly recognizable through the metallic rendering. Do not add any text or watermarks.',
    rarity: 'rare',
    generation_type: '3d',
    weight: 3,
  },
  {
    name: 'Stone',
    prompt:
      'Transform this portrait into a classical marble bust sculpture. Smooth polished white stone texture with subtle veining. Museum lighting with soft shadows. Subtle orange (#ff5f1f) accent lighting from one side. Pedestal base visible. Classical sculpture proportions. The person should be clearly recognizable as a marble portrait bust. Do not add any text or watermarks.',
    rarity: 'rare',
    generation_type: '3d',
    weight: 3,
  },
  {
    name: 'Mecha',
    prompt:
      'Transform this portrait into a detailed anime mecha pilot style. Gundam-inspired mechanical armor portrait with intricate plate details. Orange (#ff5f1f) accent panels on dark titanium base. Glowing visor element, mechanical joints, ventilation ports. The person should be clearly recognizable as a mecha-armored character. Do not add any text or watermarks.',
    rarity: 'rare',
    generation_type: '3d',
    weight: 3,
  },
  {
    name: 'Oni',
    prompt:
      'Transform this portrait into a stylized Japanese oni demon mask fusion. Subtle horns, ceremonial face paint in kabuki style. Red-orange (#ff5f1f) and black dramatic coloring. Fierce expression merged with the original facial features. Traditional Japanese theatrical mask aesthetic. The person should be clearly recognizable beneath the oni styling. Do not add any text or watermarks.',
    rarity: 'rare',
    generation_type: '3d',
    weight: 3,
  },
  {
    name: 'Hologram',
    prompt:
      'Transform this portrait into a sci-fi holographic projection. Transparent blue and orange (#ff5f1f) holographic light, visible scan lines and horizontal interference. Floating data particles and small glitch artifacts. Star Wars hologram communication feel. The face flickers with light. Dark background. The person should be clearly recognizable. Do not add any text or watermarks.',
    rarity: 'rare',
    generation_type: '3d',
    weight: 3,
  },
  {
    name: 'Samurai',
    prompt:
      'Transform this portrait into an ornate samurai warrior portrait. Lacquered black armor plates, orange (#ff5f1f) silk cord binding (odoshi), elaborate kabuto helmet with crest, menpo face guard partially revealing the face. Feudal Japanese warrior aesthetic. Dark atmospheric background. The person should be clearly recognizable. Do not add any text or watermarks.',
    rarity: 'rare',
    generation_type: '3d',
    weight: 3,
  },
  {
    name: 'Biomech',
    prompt:
      'Transform this portrait into H.R. Giger-inspired biomechanical style. Organic tissue merging with machine components, dark metallic textures, ribbed tubing, skeletal mechanical structures beneath translucent skin. Dark atmospheric tones with subtle orange (#ff5f1f) bioluminescent accents. The person should be clearly recognizable through the biomechanical transformation. Do not add any text or watermarks.',
    rarity: 'rare',
    generation_type: '3d',
    weight: 3,
  },

  // ─── EPIC (3 styles, 3D generation, weight 1) ────────────────

  {
    name: 'Phoenix',
    prompt:
      'Transform this portrait into a phoenix fire rebirth scene. The face is half-formed from living flame, dissolving into a phoenix shape of fire and glowing embers. Sparks and ash particles swirling around. Molten orange-gold-crimson palette with deep blacks. Intense heat distortion. Divine fire transformation. The person should be clearly recognizable through the flames. Do not add any text or watermarks.',
    rarity: 'epic',
    generation_type: '3d',
    weight: 1,
  },
  {
    name: 'Void',
    prompt:
      'Transform this portrait into a cosmic void entity. The face is emerging from deep space, with skin cracking to reveal stars, nebulae, and swirling galaxies beneath. Deep space purples and blues visible through fissures in the face, with orange (#ff5f1f) energy crackling along the crack edges. Cosmic dust and star particles. The person should be clearly recognizable as a cosmic being. Do not add any text or watermarks.',
    rarity: 'epic',
    generation_type: '3d',
    weight: 1,
  },
  {
    name: 'Sovereign',
    prompt:
      'Transform this portrait into a mythic sovereign ruler. Ornate golden crown with jewels, celestial halo of divine light behind the head, radiant light rays emanating outward. Renaissance oil painting technique merged with sci-fi elements. Rich golds, deep royal purples, and fiery orange (#ff5f1f) accents. Regal, commanding presence. The person should be clearly recognizable. Do not add any text or watermarks.',
    rarity: 'epic',
    generation_type: '3d',
    weight: 1,
  },
]
