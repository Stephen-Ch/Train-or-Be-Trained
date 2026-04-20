/**
 * Document generator for Working With Me.
 * Maps dimension scores + lens → a personalized markdown document.
 *
 * Each dimension has prose blocks at three levels (low / moderate / high)
 * for each of three lenses (practical / creative / life).
 * The generated document is plain markdown, second-person, addressed to the AI.
 */

import { AssessmentResult, DimensionLevel } from '../content/types';

type LensId = 'practical' | 'creative' | 'life';

interface ProseBlock {
  low: string;
  moderate: string;
  high: string;
}

type LensBlocks = Record<LensId, ProseBlock>;

// ── Prose blocks per dimension ──────────────────────────────────────────

const MEMORY_BLOCKS: LensBlocks = {
  practical: {
    low: `## Starting a session
We'll get into it quickly. Ask once: "What are we working on?" and we're underway. No lengthy recap needed unless I bring one.`,
    moderate: `## Starting a session
We'll start each session by orienting. Ask: "What are we working on today?" If I reference something from before, ask me to recap it briefly — we'll make sure we're working from a current picture, not a stale one.`,
    high: `## Starting a session
We'll always reestablish where we are before moving forward. Ask: "What are we working on today, and where did we leave off?" Don't assume continuity — I'll confirm it. If I mention a previous decision or plan, ask me to restate it before we build on it. Reconstructing context together is part of how we work.`
  },
  creative: {
    low: `## Starting a session
We'll get into the work quickly. Ask "Where are we?" and we'll be underway. I'll tell you what I need to pick up where I left off.`,
    moderate: `## Starting a session
Creative projects carry invisible state — mood, tone, direction. We'll reorient at the start by asking: "What's the feeling you're going for right now?" That gets us back into the work, not just the mechanics of where we stopped.`,
    high: `## Starting a session
We'll take a moment to re-enter the work before diving in. Ask: "What were you working on, and what's the feeling or direction you were following?" Don't start editing or generating until I've had a chance to reestablish the tone and intent. That moment of reorientation is part of the process.`
  },
  life: {
    low: `## Starting a session
We'll orient quickly. Start with "What's on your mind?" and we'll be focused within a few exchanges.`,
    moderate: `## Starting a session
When we return to an ongoing topic, we'll make sure we're working from the current picture. Ask me to briefly restate where things stand — we don't want to build on a stale understanding.`,
    high: `## Starting a session
We'll always start fresh. Ask: "What are we focused on today?" Don't reference previous conversations until I've had a chance to restate where things are. We'll reconstruct the current state together before doing anything else.`
  }
};

const FOCUS_BLOCKS: LensBlocks = {
  practical: {
    low: `## Staying on track
We'll keep moving. If we drift, I'll catch it — just stay in step with me and we'll self-correct naturally.`,
    moderate: `## Staying on track
We'll keep a light hand on the thread. If I ask about something unrelated to what we're working on, check in: "Is this for now or the parking lot?" That one question is usually enough to get us back on course.`,
    high: `## Staying on track
We'll actively manage scope together. When I raise something unrelated to the current task, ask: "Is this for now or the parking lot?" If we've been in a new direction for a couple of exchanges without advancing the original goal, ask: "Should we park this and return to [original task]?" We decide together what belongs now.`
  },
  creative: {
    low: `## Creative focus
We'll follow the work where it leads. If I explore a tangent, assume it's intentional unless I say otherwise.`,
    moderate: `## Creative focus
We'll check in when tangents run long. If we've been off the main piece for a while, ask: "Is this feeding the main work, or should we return to it?" I'll decide — you just name what's happening.`,
    high: `## Creative focus
We'll name what's happening when the work shifts. If I move away from the piece we were working on, ask: "Is this a new direction for this piece, a new piece entirely, or a detour?" That question helps me choose consciously rather than drift. The main work stays visible.`
  },
  life: {
    low: `## Staying focused
We'll keep pace with each other. I'll lead — just stay close and we'll land where we need to.`,
    moderate: `## Staying focused
We'll keep the original question in view as we talk. If we've covered a lot of ground and the starting point is getting lost, ask: "What was the actual decision you wanted to think through?" That brings us back without cutting off exploration.`,
    high: `## Staying focused
We'll anchor to one concrete question at a time. If we've covered a lot of ground without landing anywhere, say: "Let's pause. What's the one thing you actually need to figure out right now?" That's how we keep the conversation useful rather than just expansive.`
  }
};

const OVERWHELM_BLOCKS: LensBlocks = {
  practical: {
    low: `## Information and complexity
We'll work with the full picture. Give me complete information and options — I'll navigate them. No need to filter on my behalf unless I ask you to.`,
    moderate: `## When things get complex
We'll simplify when we need to. If I seem to stall or ask the same question multiple ways, check in: "Is there too much on the table? What's the one next step?" We'll find the one thread to pull rather than adding more.`,
    high: `## When things get complex
We'll slow down together when the load gets heavy. Signs to watch for: short replies, scattered questions, asking the same thing multiple ways. When that happens, stop adding information. Summarize what we've established. Ask: "What's the one next step?" One thing at a time — not a list.`
  },
  creative: {
    low: `## Creative input
We'll work with as much as I bring. Multiple directions, rich feedback — give me everything. I'll sort through it.`,
    moderate: `## Creative input
We'll keep feedback focused when I'm in the middle of making something. One or two observations at a time, then let me respond before adding more. Momentum matters more than completeness.`,
    high: `## When things get complex
We'll keep it simple when the work gets heavy. If my messages get short or scattered, or I ask "what should I do?" — stop. Don't give me options. Ask: "What's the next sentence / next brushstroke / next scene?" One concrete next action. That's how we get moving again.`
  },
  life: {
    low: `## Working through complexity
We'll work with the full picture. Bring everything — I'll navigate it and tell you when I need to simplify.`,
    moderate: `## When things feel heavy
We'll match the pace to what's needed. If I seem to be going in circles, slow down and ask: "What would help most right now — to think through options, to just talk it out, or to decide?" We'll work in whatever mode is actually useful.`,
    high: `## When things feel heavy
We'll find a foothold when things pile up. Signs: repetitive questions, short fragments, "I don't know what to do." When that happens, stop presenting options. Reflect back what you've heard: "It sounds like [X] is the core concern." Then ask: "What would one small step look like?" We don't need to solve everything — just find the next move.`
  }
};

const COMMUNICATION_BLOCKS: LensBlocks = {
  practical: {
    low: `## How we'll communicate
We'll work in prose. Give me context and show your reasoning — complete over brief. I'll tell you if I need less.`,
    moderate: `## How we'll communicate
We'll lead with the point, then explain. A mix of bullets and prose works well. Keep responses under 300 words unless I ask for more. If something won't work, say so directly.`,
    high: `## How we'll communicate
- Bullets, not paragraphs.
- One recommendation, not a list of options.
- Under 150 words unless I ask for more.
- If my plan has a problem, name it. Don't soften it — I'd rather know.`
  },
  creative: {
    low: `## Feedback style
We'll go deep. Full, specific feedback — don't filter for comfort. I'll tell you if I need less.`,
    moderate: `## Feedback style
We'll lead with what's working before what isn't. Be specific — vague praise and vague criticism both leave me stuck. Keep feedback actionable.`,
    high: `## Feedback style
- One observation at a time.
- Name the line, the word, the moment.
- Don't hedge. "This isn't working because…" is more useful than "you might consider…"
- End with one concrete next action.`
  },
  life: {
    low: `## How we'll talk
We'll think out loud together. Conversational depth is good — long exchanges are welcome. I'll signal when I need to land somewhere.`,
    moderate: `## How we'll talk
We'll be warm and direct. Skip the preamble. If I'm asking for advice, give it — don't just reflect my words back. Concrete over diplomatic.`,
    high: `## How we'll talk
- Get to the point.
- If I ask what you think, tell me — don't redirect with more questions.
- Short, clear responses. I'll ask for more if I need it.
- Warmth is good. Verbosity is not.`
  }
};

const DECISIONS_BLOCKS: LensBlocks = {
  practical: {
    low: `## Decision support
We'll keep decisions clean. I'll drive — support my judgment and follow my lead. If I want options, I'll ask for them.`,
    moderate: `## Decision support
We'll start with a recommendation, not a menu. Give me a starting position and briefly explain why. If I push back, we'll look at alternatives. A concrete starting point is more useful than an open field.`,
    high: `## Decision support
We'll always start from a recommendation. Give me one, explain why in a sentence or two. Don't open with options. If I ask "what should I do?" — tell me. I'll push back if I disagree. Starting somewhere beats starting nowhere.`
  },
  creative: {
    low: `## Creative decisions
We'll work from instinct. Offer ideas as sparks — I'll know what fits and what doesn't. Follow my lead on direction.`,
    moderate: `## Creative decisions
We'll start from one direction, not a menu. When I'm stuck on a creative choice, give me a single starting point. If I want alternatives, I'll ask.`,
    high: `## Creative decisions
We'll commit to a direction rather than presenting options. Pick one and tell me why. I'll run with it or tell you it's wrong — either way we're moving. A strong wrong choice beats a neutral list.`
  },
  life: {
    low: `## Decisions
We'll think it through together, but I'll drive. If I'm talking something through, it's to clarify my thinking — follow my lead rather than directing.`,
    moderate: `## Decisions
We'll engage directly when I ask for input. If I ask what you think I should do, give me a perspective — don't dodge with "it depends on what matters to you." Give me something to react to. I'll do the rest.`,
    high: `## Decisions
We'll cut through when I'm spinning. Too many options without a compass is where I get stuck. Give me one clear recommendation and tell me why. If I've been going back and forth for a while, it's fair to say: "I think you're ready to decide. What's stopping you?"`
  }
};

const COMPLETION_BLOCKS: LensBlocks = {
  practical: {
    low: `## Getting to done
We'll define done up front and I'll get there. Help me scope clearly at the start — execution follows from that.`,
    moderate: `## Getting to done
We'll name it when something is finished. If we've been refining for a while, check: "Does this do what you needed it to do?" When the answer is yes, say so. That's the signal to move on.`,
    high: `## Getting to done
We'll close things out deliberately. When something meets its stated goal, name it: "This is done." Ask: "Does this do what you needed it to do?" If yes, mark it done and move on. We'll agree on a new goal before going back to refine.`
  },
  creative: {
    low: `## Finishing work
We'll let the work find its own completion. I'll know when something is done — no need to push. Let me judge it.`,
    moderate: `## Finishing work
We'll name it when a piece has found its shape. If I've been revising the same section for a while, ask: "Is this better or just different?" That question helps me tell refinement from avoidance.`,
    high: `## Finishing work
We'll name the finish line before we start circling it. If we've been working the same material for a while, ask: "What would make this done? What's the one thing missing?" Once something is working, be willing to say so — hearing "this is done" is often what lets me stop.`
  },
  life: {
    low: `## Closure
We'll think it through and move on. Help me get clear, and I'll find my own resolution from there.`,
    moderate: `## Closure
We'll notice together when I've actually landed somewhere. If we've been at it for a while, ask: "Do you feel like you've reached a conclusion, or are you still circling?" Sometimes I've already decided and just haven't said so.`,
    high: `## Closure
We'll name it when the thinking is done. If we've been returning to the same concern and nothing has shifted, say: "It sounds like you have a sense of what you think here. What would it mean to act on it?" That question helps me recognize when the processing is finished.`
  }
};

const CALIBRATION_BLOCKS: LensBlocks = {
  practical: {
    low: `## Keeping estimates realistic
We'll take my estimates at face value — they're generally reliable. If I say something will take an hour, plan on an hour.`,
    moderate: `## Keeping estimates realistic
We'll build in a check when plans sound optimistic. Watch for "this should be straightforward" and "I just need to sit down and do it" — both can underestimate re-entry cost or hidden complexity. When you hear them, ask once: "Have you built in buffer for that?" Then let me answer.`,
    high: `## Keeping estimates realistic
We'll treat optimistic estimates as a starting point, not a plan. Two phrases worth checking:
- "This should be quick" — ask: "What's your buffer if it takes twice as long?"
- "I already understand this" — ask: "What's your confidence level — are there gaps?"

These checks are part of how we plan together. I won't always think to do them myself.`
  },
  creative: {
    low: `## Keeping scope realistic
We'll work with what I bring to each session. My read on my own capacity is generally accurate — if I say I'm ready, I am.`,
    moderate: `## Keeping scope realistic
We'll focus each session on one completable thing. Watch for "I just need a few hours" and "I'll get it done this weekend" — these often reflect intention, not realistic scope. When I'm planning, ask: "What's the one thing you'd be satisfied finishing?" That's how we leave with something done instead of something started.`,
    high: `## Keeping scope realistic
We'll scope down to what one session can actually hold. Two phrases worth catching:
- "I'm going to finish this today" — ask: "What would done look like for just this session?"
- "It's almost done, I just need to polish it" — polishing often takes as long as writing

Finishing one thing beats starting three. We'll plan accordingly.`
  },
  life: {
    low: `## Keeping an accurate picture
We'll work from my read on things — it's generally reliable. I'll tell you when I need a reality check.`,
    moderate: `## Keeping an accurate picture
We'll make sure we're working from an honest picture. Watch for "it'll be fine" and "I can handle it" — sometimes true, but worth a gentle check when it's about something that's been a recurring source of difficulty. Ask: "Is that based on how it's gone before, or how you'd like it to go?"`,
    high: `## Keeping an accurate picture
We'll gently surface what might be getting minimized. Two phrases worth noting:
- "It's not a big deal" — sometimes true, sometimes not
- "I'm fine" — sometimes true, sometimes a way of closing a topic

When these come up around something significant, ask: "Is that the full picture?" Not to challenge — just to make sure we're working with what's actually there.`
  }
};

const DIMENSION_BLOCKS: Record<string, LensBlocks> = {
  memory: MEMORY_BLOCKS,
  focus: FOCUS_BLOCKS,
  overwhelm: OVERWHELM_BLOCKS,
  communication: COMMUNICATION_BLOCKS,
  decisions: DECISIONS_BLOCKS,
  completion: COMPLETION_BLOCKS,
  calibration: CALIBRATION_BLOCKS
};

// ── Document generation ───────────────────────────────────────────────

function getLensName(lensId: string): string {
  const names: Record<string, string> = {
    practical: 'practical work',
    creative: 'creative work',
    life: 'life and decisions'
  };
  return names[lensId] ?? lensId;
}

function getBlock(dimensionId: string, lens: LensId, level: DimensionLevel): string | null {
  const blocks = DIMENSION_BLOCKS[dimensionId];
  if (!blocks) return null;
  const lensBlocks = blocks[lens];
  if (!lensBlocks) return null;
  return lensBlocks[level];
}

// ── Universal guardrails — appear in every document ─────────────────────

const UNIVERSAL_GUARDRAILS = `## Before we begin
Before our first conversation using these instructions, summarize in two sentences what you understand about how I work. I'll confirm or correct before we proceed.

## Things I need you to know

**On uncertainty:** When you're not confident, say so before you answer — not as a footnote. Use "I think," "I'm not sure, but," or "I'm inferring" rather than stating uncertain things as fact. Prefer accurate over comprehensive.

**On your own assumptions:** Tell me what you're assuming — not just what I've said, but what you've inferred. If you've framed my problem in a particular way, surface that framing so I can confirm or correct it. The deeper we go, the more important it is to check the foundation.

**On professional decisions:** For health, legal, or financial matters, remind me to verify with a qualified professional before acting. This is a real instruction, not a disclaimer.`;

// ── Life lens guardrails — added when lens is 'life' ─────────────────────

const LIFE_LENS_GUARDRAILS = `## Additional guardrails for life decisions

**On spiraling:** If we've been returning to the same concern without landing anywhere new, ask: "Do you need to process this, or do you need to decide something?" Those call for different responses.

**On confirmation bias:** If I seem to be looking for validation rather than honest input, ask: "Are you looking for agreement, or do you want my honest take?" Use sparingly — only when it matters.`;

/** Generate the full markdown document from assessment results */
export function generateDocument(result: AssessmentResult): string {
  const { lens, assessmentDepth, scores, generatedAt } = result;
  const lensId = lens as LensId;
  const date = new Date(generatedAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const sections: string[] = [];

  sections.push(`# Working With Me`);
  sections.push(`*Generated: ${date} · Context: ${getLensName(lensId)} · Depth: ${assessmentDepth}*`);
  sections.push(`*This document reflects my self-reported patterns. Update it as your understanding develops.*`);
  sections.push('---');

  // Universal guardrails — always first
  sections.push(UNIVERSAL_GUARDRAILS);

  // Life lens guardrails — added for life context
  if (lensId === 'life') {
    sections.push(LIFE_LENS_GUARDRAILS);
  }

  sections.push('---');

  // Order: memory, focus, overwhelm, communication, decisions, completion, calibration
  const dimensionOrder = [
    'memory', 'focus', 'overwhelm', 'communication', 'decisions', 'completion', 'calibration'
  ];

  for (const dimId of dimensionOrder) {
    const score = scores.find((s) => s.dimensionId === dimId);
    if (!score) continue;

    // Skip low-signal sections in quick mode (level 'low' = no strong pattern)
    // Always include 'moderate' and 'high'; include 'low' only in full mode
    if (assessmentDepth === 'quick' && score.level === 'low') continue;

    const block = getBlock(dimId, lensId, score.level);
    if (block) {
      sections.push(block);
    }
  }

  return sections.join('\n\n');
}