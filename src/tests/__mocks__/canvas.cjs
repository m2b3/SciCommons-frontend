/* Fixed by Codex on 2026-03-14
   Problem: Jest only needs jsdom to treat canvas as unavailable, but a real transitive native package can still be discovered during test resolution
   Solution: Provide an empty canvas module stub with no createCanvas export so jsdom falls back to its non-canvas path
   Result: Tests stay portable and do not require a compiled canvas binary */
module.exports = {};
