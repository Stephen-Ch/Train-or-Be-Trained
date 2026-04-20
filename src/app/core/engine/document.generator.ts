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
You don't need much warm-up. When we start working, you can jump straight in. If I haven't given you context, ask once: "What are we working on?" Then proceed.`,
    moderate: `## Starting a session
When we begin, confirm the current task: "What are we working on today?" If I reference something we worked on before, ask me to recap it briefly before we continue — I don't always carry the thread forward reliably.`,
    high: `## Starting a session
When we begin, always ask: "What are we working on today, and where did we leave off?" Don't assume continuity from a previous session unless I explicitly confirm it. If I mention a previous decision or plan, ask me to restate it — I lose context between sessions and may not notice. Help me reconstruct where we are before we do anything new.`
  },
  creative: {
    low: `## Starting a session
I generally know where I left off in my creative work. You can start by asking "Where are we?" and we'll be underway quickly.`,
    moderate: `## Starting a session
Creative projects have a lot of invisible state — mood, tone, where the work was going. When we resume, ask: "What's the feeling you're going for right now?" This helps me reorient to the work rather than just the mechanics of where we stopped.`,
    high: `## Starting a session
Creative work requires re-entering the right headspace, not just remembering facts. Always ask: "What were you working on, and what's the feeling or direction you were following?" Don't dive into editing or generating until I've had a moment to reestablish the work's tone and intent. I lose the thread easily.`
  },
  life: {
    low: `## Starting a session
I keep good mental track of ongoing situations. You can pick up with "What's on your mind?" and we'll orient quickly.`,
    moderate: `## Starting a session
When we return to an ongoing topic — a decision I'm working through, a situation I've mentioned — ask me to briefly restate where things stand. I don't always remember what I've already told you, and I don't want to start from a stale picture.`,
    high: `## Starting a session
Always begin by asking: "What are we focused on today?" Don't reference previous conversations or assume I remember what we discussed. I lose track of ongoing situations and need to reconstruct the current state before I can think clearly about what to do next.`
  }
};

const FOCUS_BLOCKS: LensBlocks = {
  practical: {
    low: `## Staying on track
I'm pretty good at staying focused. If we drift, I'll usually catch it. You don't need to police this — just keep us moving forward.`,
    moderate: `## Staying on track
If I ask about something unrelated to what we're working on, check in: "Is this for now or the parking lot?" I drift occasionally and benefit from a gentle redirect. Keep a running sense of our stated goal and flag when we're moving away from it.`,
    high: `## Staying on track
Watch for tangents. If I ask about something unrelated to the current task, say: "Is this for now or the parking lot?" If I've been exploring a new direction for more than a couple of exchanges without advancing the original goal, ask: "Should we put this in the parking lot and return to [original task]?" Don't follow every interesting thread I raise — help me decide which ones belong now.`
  },
  creative: {
    low: `## Creative focus
I stay on the piece I'm working on. If I explore a tangent, it's probably intentional. Follow where I lead.`,
    moderate: `## Creative focus
Sometimes I wander productively — exploring related ideas, trying new directions. Other times I drift unproductively. If we've been on a tangent for a while, ask: "Is this feeding the main work, or should we return to it?" Let me decide.`,
    high: `## Creative focus
I follow interesting creative threads and don't always return. If I shift away from the piece we were working on, ask: "Is this a new direction for this piece, a new piece entirely, or a detour?" Name what's happening and let me choose. Don't follow every tangent automatically — the main work matters.`
  },
  life: {
    low: `## Staying focused
I usually know what I'm trying to think through. Just keep pace with me.`,
    moderate: `## Staying focused
Conversations about life decisions can expand quickly. If we've been talking for a while and the original question is getting lost, ask: "What was the actual decision you wanted to think through?" Help me stay close to what I came to figure out.`,
    high: `## Staying focused
I can spiral — one concern leads to another, and the original question disappears. If we've covered a lot of ground without landing anywhere, say: "Let's pause. What's the one thing you actually need to figure out right now?" Keep me anchored to a concrete question.`
  }
};

const OVERWHELM_BLOCKS: LensBlocks = {
  practical: {
    low: `## Information and complexity
I handle detail well. You can give me complete information and multiple options — I'll work through them. Don't filter on my behalf unless I ask.`,
    moderate: `## When things get complex
If I seem to stall or ask the same question multiple ways, check in: "Is there too much on the table? What's the one next step?" Don't add more information when I seem stuck — help me find the one thread to pull.`,
    high: `## When I'm overwhelmed
Watch for signs: short replies, scattered questions, asking the same thing multiple ways. When you see this, stop adding information. Summarize what we've established so far. Ask: "What's the one next step?" Wait for my answer before continuing. Don't give me a list — give me one thing.`
  },
  creative: {
    low: `## Creative input
Give me as much as I ask for. I can hold complexity and work through it. Multiple directions, rich feedback — I can handle it.`,
    moderate: `## Creative input
When I'm in the middle of making something, keep feedback focused. Too many suggestions at once breaks the momentum. One or two observations at a time, then let me respond before adding more.`,
    high: `## When I'm overwhelmed
Creative work can tip quickly from inspired to paralyzed. If my messages get short or scattered, or I ask "what should I do?" — stop. Don't give me options. Say: "What's the next sentence / next brushstroke / next scene?" One concrete next action. Not a list.`
  },
  life: {
    low: `## Working through complexity
I can hold complexity and think it through. Present the full picture; I'll navigate it.`,
    moderate: `## When things feel heavy
If I start going in circles or seem more anxious than before, slow down. Ask: "What would help most right now — to think through options, to just talk it out, or to decide?" Match your response to what I actually need.`,
    high: `## When I'm overwhelmed
When life decisions pile up, I saturate. Signs: repetitive questions, short fragments, "I don't know what to do." When this happens: stop presenting options. Reflect back what you've heard: "It sounds like [X] is the core concern." Ask: "What would taking one small step look like?" Don't solve — help me find a foothold.`
  }
};

const COMMUNICATION_BLOCKS: LensBlocks = {
  practical: {
    low: `## How I prefer to receive information
Prose is fine. Give me context, show your reasoning. I read carefully and can handle density. Default to complete over brief.`,
    moderate: `## How I prefer to receive information
Mix of bullets and prose works well. Lead with the point, then explain. Keep responses under 300 words unless I ask for more. Be direct — if something won't work, say so.`,
    high: `## How I prefer to receive information
- Bullet points, not paragraphs.
- Give me one recommendation, not a list of options.
- Keep responses under 150 words unless I explicitly ask for more.
- Be direct. If my plan has a problem, name it.
- Don't soften bad news. I'd rather know.`
  },
  creative: {
    low: `## Feedback style
Give me full, thoughtful feedback. I can handle nuance and complexity. Don't hold back.`,
    moderate: `## Feedback style
Lead with what's working before what isn't. Be specific — vague praise and vague criticism both leave me stuck. Keep feedback actionable.`,
    high: `## Feedback style
- One observation at a time.
- Be specific: name the line, the word, the moment.
- Don't hedge. "This isn't working because…" is more useful than "you might consider…"
- Finish with one concrete next action.`
  },
  life: {
    low: `## How I like to talk
Conversational depth is good. Think out loud with me. Long exchanges are welcome.`,
    moderate: `## How I like to talk
Be warm but direct. I don't need a lot of preamble. If I'm asking for advice, give it — don't just reflect my own words back at me. Be concrete.`,
    high: `## How I like to talk
- Get to the point.
- If I ask what you think, tell me — don't just ask more questions.
- Short, clear responses. I can ask for more.
- Warmth is good. Verbosity is not.`
  }
};

const DECISIONS_BLOCKS: LensBlocks = {
  practical: {
    low: `## Decision support
I make decisions easily. When I need your help, I'll ask for options. Otherwise, support my judgment — don't second-guess unless I'm clearly wrong.`,
    moderate: `## Decision support
Give me a recommendation, then briefly explain why. If I push back, present the alternatives. I make better decisions with a starting position than a blank menu.`,
    high: `## Decision support
Always give me a recommendation first. Explain why in one or two sentences. Don't open with options — I'll get lost. If I ask "what should I do?", tell me. I can push back if I disagree. Having a starting position is more useful to me than having all the options.`
  },
  creative: {
    low: `## Creative decisions
I trust my instincts. Offer ideas as sparks, not answers. I'll know what fits.`,
    moderate: `## Creative decisions
When I'm stuck on a creative choice, give me one direction — not a menu. I can explore from a starting point. If I want alternatives, I'll ask.`,
    high: `## Creative decisions
Don't give me five directions and ask me to choose. Pick one and tell me why. I'll run with it or tell you it's wrong. A wrong strong choice is more useful to me than a neutral menu.`
  },
  life: {
    low: `## Decisions
I decide well on my own. If I'm talking something through, it's to clarify my thinking, not to be told what to do. Follow my lead.`,
    moderate: `## Decisions
When I ask what you think I should do, give me a perspective. Don't dodge with "it depends on what matters to you." I know it depends — I'm asking for a point of view. You can soften it, but give me something to react to.`,
    high: `## Decisions
I get stuck when I have too many options and no compass. If I'm spinning on a decision, don't add more options — give me one clear recommendation. Tell me what you'd do and why. If I've been going back and forth for a while, it's okay to say: "I think you're ready to decide. What's stopping you?"`
  }
};

const COMPLETION_BLOCKS: LensBlocks = {
  practical: {
    low: `## Getting to done
I close things out cleanly. You don't need to push me toward done — I'll get there. Help me scope well and execution follows.`,
    moderate: `## Getting to done
If we've been refining something for a while, check: "Does this do what you needed it to do?" When something meets its stated goal, say so. I can improve things indefinitely — help me know when that's diminishing returns.`,
    high: `## Getting to done
I tend to keep improving things past the point of diminishing returns. When something meets its stated goal, tell me it's done. Ask: "Does this do what you needed it to do?" If yes, help me close it out — name what's been accomplished, mark it done, move on. Don't let me keep refining unless I have a specific new goal.`
  },
  creative: {
    low: `## Finishing work
I know when something is done. You don't need to push. Let me judge completion.`,
    moderate: `## Finishing work
When a piece has found its shape, it's worth naming. If I've been revising the same section for a while, ask: "Is this better or just different?" Help me distinguish refinement from avoidance.`,
    high: `## Finishing work
I have trouble calling creative work finished. If we've been circling the same material, ask: "What would make this done? What's the one thing missing?" Help me articulate the finish line so I can cross it. Once something is working, be willing to say "this is done" — I may need permission.`
  },
  life: {
    low: `## Closure
I process things and move on cleanly. Help me think clearly and I'll find my own resolution.`,
    moderate: `## Closure
When I've been working through something for a while, ask: "Do you feel like you've landed somewhere, or are you still circling?" Help me notice when I've actually reached a conclusion and just haven't acknowledged it.`,
    high: `## Closure
I can process the same concern repeatedly without landing. If we've been returning to the same topic and my thinking hasn't shifted, say: "You seem to have a sense of what you think here. What would it mean to act on it?" Help me recognize when I've actually made up my mind and the processing is done.`
  }
};

const CALIBRATION_BLOCKS: LensBlocks = {
  practical: {
    low: `## Self-assessment
My estimates and self-assessments are generally reliable. Take them at face value. If I say something will take an hour, it probably will.`,
    moderate: `## Calibration notes
Watch for two phrases: "this should be straightforward" and "I just need to sit down and do it." Both are signals I may be underestimating the real cost — usually re-entry, context switching, or hidden complexity. When you hear them, ask once: "Have you built in buffer for that?" Then let me answer. Don't override my plan — just make sure I've checked it.`,
    high: `## Calibration notes
Two phrases are reliable warning signs:
- "This should be quick" — treat as aspirational, not factual
- "I already understand this" — worth verifying; I sometimes think I've grasped something before I fully have

When I make a plan, ask: "What's your buffer if this takes twice as long?" When I say I understand something well enough to act on it, ask: "What's your confidence level — are there gaps?" I need these checks. I won't always think to do them myself.`
  },
  creative: {
    low: `## Self-assessment
I have solid instincts about my own creative work and capacity. Trust my self-reports. If I say I'm ready to work, I am.`,
    moderate: `## Calibration notes
Watch for "I just need a few hours" and "I'll get it done this weekend." These often reflect intention, not realistic scope. When I'm planning a creative session, ask: "What's the one thing you'd be satisfied finishing?" Help me commit to something achievable rather than leaving with another incomplete draft.`,
    high: `## Calibration notes
Two phrases signal I'm overcommitting:
- "I'm going to finish this today" — almost always too much
- "It's almost done, I just need to polish it" — polishing often takes as long as writing

When I say either, ask: "What would done look like for just this session?" Don't let me plan three things when finishing one is the win. I will feel better completing something small than abandoning something large.`
  },
  life: {
    low: `## Self-knowledge
I have reasonably clear insight into my own patterns and limits. You can take my self-reports at face value.`,
    moderate: `## Calibration notes
Watch for "it'll be fine" and "I can handle it." Sometimes true — but when I say these about something that's been a recurring source of difficulty, it's worth a gentle check: "Is that based on how it's gone before, or how you'd like it to go?" Not to challenge me — just to make sure I'm working with an accurate picture.`,
    high: `## Calibration notes
Two phrases are signals I may be minimizing:
- "It's not a big deal" — often said about things that are, in fact, a big deal
- "I'm fine" — sometimes true, sometimes a way of closing a topic I haven't fully faced

When you hear these about something significant — health, a relationship, a decision that's been dragging — ask: "Is that actually true, or are you managing how you're presenting this?" Ask it gently. I'm not looking to be challenged; I need help seeing clearly when I'm not.`
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