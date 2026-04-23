-- Prophecy rework: adaptive 3-round draw with pixel-art imagery.
--
-- Replaces the single-shot 14-card deck with a round-by-round funnel:
-- round 1 surface → round 2 undercurrent → round 3 horizon. Each round
-- is generated conditionally on prior picks. Cards carry pixel-art
-- image URLs generated via fal-ai/flux/schnell.
--
-- See design-mockups/milestones-and-prophecy-plan.md § 7 for rationale.

-- Drop the old full-deck column. Only Tijs has had data here in prod,
-- and he will redraw under the new flow.
ALTER TABLE builder_profiles
  DROP COLUMN IF EXISTS prophecy_deck;

-- Add the new round state. Shape:
--   [
--     { cards: [{id, round, title, narrative, image_url}, ...4], picked_id: "r1-c2" },
--     { cards: [...4], picked_id: "r2-c1" },
--     { cards: [...4], picked_id: null }
--   ]
-- Length grows 1 → 2 → 3 as the member advances.
ALTER TABLE builder_profiles
  ADD COLUMN IF NOT EXISTS prophecy_rounds jsonb;

-- Clear stale picks under the old schema so nobody sees orphan cards.
UPDATE builder_profiles
   SET prophecy_chosen = NULL,
       prophecy_drawn_at = NULL;

COMMENT ON COLUMN builder_profiles.prophecy_rounds IS
  'Live state of the adaptive draw. Array of {cards, picked_id} — length 1..3. See milestones-and-prophecy-plan.md § 7.';
COMMENT ON COLUMN builder_profiles.prophecy_chosen IS
  'Final 3 picked cards, written when round 3 is sealed. Public statement.';

-- Public bucket for pixel-art card images. Read: anyone. Write:
-- service role only (images are generated server-side by the pipeline).
INSERT INTO storage.buckets (id, name, public)
VALUES ('prophecy-images', 'prophecy-images', true)
ON CONFLICT (id) DO NOTHING;
