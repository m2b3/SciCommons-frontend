'use client';

/**
 * PersonalisedFeed.tsx
 *
 * How it works:
 *  1. Fetches the user's interaction signals: bookmarks, reviews written, posts/comments
 *  2. Embeds each interacted paper's title+abstract locally (MiniLM via ai.worker)
 *  3. Builds a "taste profile" = mean vector of all interaction embeddings,
 *     weighted by signal strength (review > bookmark > comment)
 *  4. Embeds candidate papers from the global feed
 *  5. Ranks candidates by cosine similarity to taste profile
 *  6. Displays a ranked, filterable feed with relevance scores
 *
 * No data ever leaves the browser — 100% local inference.
 * Reuses the same ai.worker.ts / useAIWorker hook as AskAISidebar.
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  BookMarked,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Cpu,
  FlaskConical,
  Loader2,
  MessageSquare,
  RefreshCw,
  ShieldCheck,
  Sliders,
  Sparkles,
  Star,
  TrendingUp,
  User,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

import { useAIWorker } from './useAIWorker'; // same hook as AskAISidebar

// ─── Types ─────────────────────────────────────────────────────────────────

export interface FeedPaper {
  id:         string;
  title:      string;
  abstract:   string;
  authors:    string[];
  journal?:   string;
  publishedAt: string;
  doi?:       string;
  tags?:      string[];
}

interface InteractionSignal {
  paper:     FeedPaper;
  /** Higher weight = stronger signal of interest */
  weight:    number;
  signalType: 'bookmark' | 'review' | 'comment' | 'upvote';
}

interface ScoredPaper extends FeedPaper {
  score:     number; // cosine similarity 0–1
  embedding: number[];
}

type SortMode = 'relevance' | 'recent' | 'trending';
type FilterSignal = 'all' | 'bookmark' | 'review' | 'comment';

// ─── Signal weights ─────────────────────────────────────────────────────────
// Writing a review signals much stronger interest than a bookmark
const SIGNAL_WEIGHTS: Record<InteractionSignal['signalType'], number> = {
  review:   3.0,
  bookmark: 1.5,
  comment:  1.0,
  upvote:   0.8,
};

// ─── Math helpers ───────────────────────────────────────────────────────────

function cosineSim(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na  += a[i] * a[i];
    nb  += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-8);
}

/** Weighted mean of a list of embedding vectors */
function weightedMean(vectors: number[][], weights: number[]): number[] {
  const dim    = vectors[0].length;
  const result = new Array(dim).fill(0);
  const total  = weights.reduce((s, w) => s + w, 0);
  for (let i = 0; i < vectors.length; i++) {
    for (let d = 0; d < dim; d++) {
      result[d] += (vectors[i][d] * weights[i]) / total;
    }
  }
  // L2-normalise the profile vector
  const norm = Math.sqrt(result.reduce((s, v) => s + v * v, 0)) + 1e-8;
  return result.map(v => v / norm);
}

function paperText(p: FeedPaper): string {
  return `${p.title}. ${p.abstract ?? ''}`.slice(0, 400);
}

// ─── Mock data fetcher (replace with real API calls) ────────────────────────
// In production these would be TanStack Query hooks hitting your Django API:
//   GET /api/users/me/bookmarks/
//   GET /api/users/me/reviews/
//   GET /api/articles/feed/

async function fetchUserSignals(): Promise<InteractionSignal[]> {
  // TODO: replace with real fetch('/api/users/me/bookmarks') etc.
  // Returning empty array so the component shows the empty state gracefully.
  return [];
}

async function fetchCandidatePapers(): Promise<FeedPaper[]> {
  // TODO: replace with real fetch('/api/articles/feed/?limit=60')
  return [];
}

// ─── Sub-components ─────────────────────────────────────────────────────────

const SignalBadge = ({ type }: { type: InteractionSignal['signalType'] }) => {
  const config = {
    bookmark: { icon: <BookMarked size={10} />, label: 'Bookmarked', cls: 'text-functional-blue   bg-functional-blue/10   border-functional-blue/20' },
    review:   { icon: <FlaskConical size={10} />, label: 'Reviewed',   cls: 'text-functional-purple bg-functional-purple/10 border-functional-purple/20' },
    comment:  { icon: <MessageSquare size={10} />, label: 'Commented', cls: 'text-functional-green  bg-functional-green/10  border-functional-green/20' },
    upvote:   { icon: <Star size={10} />, label: 'Upvoted',            cls: 'text-functional-yellow bg-functional-yellow/10 border-functional-yellow/20' },
  }[type];

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xxs font-medium ${config.cls}`}>
      {config.icon}{config.label}
    </span>
  );
};

const RelevanceBar = ({ score }: { score: number }) => {
  const pct  = Math.round(score * 100);
  const color = pct >= 75 ? 'bg-functional-green' : pct >= 50 ? 'bg-functional-blue' : 'bg-common-minimal';
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 rounded-full bg-common-minimal overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xxs text-text-tertiary w-7 text-right">{pct}%</span>
    </div>
  );
};

interface PaperCardProps {
  paper:    ScoredPaper;
  rank:     number;
  showScore: boolean;
}

const PaperCard: React.FC<PaperCardProps> = ({ paper, rank, showScore }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="rounded-xl border border-common-minimal bg-common-cardBackground p-4 transition-shadow hover:shadow-md">
      {/* Rank + score row */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className="shrink-0 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-common-minimal text-xxs font-bold text-text-tertiary">
          {rank}
        </span>
        {showScore && (
          <div className="flex-1">
            <RelevanceBar score={paper.score} />
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-text-primary leading-snug mb-1 line-clamp-2">
        {paper.title}
      </h3>

      {/* Authors + date */}
      <p className="text-xxs text-text-tertiary mb-2">
        {paper.authors.slice(0, 3).join(', ')}{paper.authors.length > 3 ? ' et al.' : ''}
        {paper.journal ? ` · ${paper.journal}` : ''}
        {' · '}{new Date(paper.publishedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
      </p>

      {/* Tags */}
      {paper.tags && paper.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {paper.tags.slice(0, 4).map(tag => (
            <span key={tag} className="rounded-full border border-common-minimal px-2 py-0.5 text-xxs text-text-tertiary">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Abstract toggle */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="flex items-center gap-1 text-xxs text-text-tertiary hover:text-functional-blue transition-colors mb-1"
      >
        {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        {expanded ? 'Hide' : 'Show'} abstract
      </button>
      {expanded && (
        <p className="text-xs text-text-secondary leading-relaxed line-clamp-6">
          {paper.abstract}
        </p>
      )}

      {/* Actions */}
      <div className="mt-3 flex gap-2">
        {paper.doi && (
          <a
            href={`https://doi.org/${paper.doi}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-common-minimal px-3 py-1.5 text-xxs text-text-secondary hover:border-functional-blue hover:text-functional-blue transition-colors"
          >
            View Paper
          </a>
        )}
        <a
          href={`/articles/${paper.id}`}
          className="rounded-lg border border-common-minimal px-3 py-1.5 text-xxs text-text-secondary hover:border-functional-blue hover:text-functional-blue transition-colors"
        >
          Discuss on SciCommons
        </a>
      </div>
    </article>
  );
};

// ─── Main component ──────────────────────────────────────────────────────────

interface PersonalisedFeedProps {
  /** Pass pre-fetched signals + candidates if using SSR / TanStack Query */
  initialSignals?:    InteractionSignal[];
  initialCandidates?: FeedPaper[];
  userId?:            string;
}

const PersonalisedFeed: React.FC<PersonalisedFeedProps> = ({
  initialSignals    = [],
  initialCandidates = [],
  userId,
}) => {
  // ── State ────────────────────────────────────────────────────────────────
  const [signals,        setSignals]        = useState<InteractionSignal[]>(initialSignals);
  const [candidates,     setCandidates]     = useState<FeedPaper[]>(initialCandidates);
  const [rankedFeed,     setRankedFeed]     = useState<ScoredPaper[]>([]);
  const [tasteProfile,   setTasteProfile]   = useState<number[] | null>(null);
  const [isBuilding,     setIsBuilding]     = useState(false);
  const [buildStatus,    setBuildStatus]    = useState('');
  const [isLoading,      setIsLoading]      = useState(true);
  const [sortMode,       setSortMode]       = useState<SortMode>('relevance');
  const [filterSignal,   setFilterSignal]   = useState<FilterSignal>('all');
  const [showScoreBars,  setShowScoreBars]  = useState(true);
  const [profileExpanded, setProfileExpanded] = useState(false);
  const profileBuiltRef = useRef(false);

  const { embed } = useAIWorker(setBuildStatus);

  // ── Load data on mount if not passed as props ────────────────────────────
  useEffect(() => {
    if (initialSignals.length > 0 && initialCandidates.length > 0) {
      setIsLoading(false);
      return;
    }
    (async () => {
      try {
        const [sigs, cands] = await Promise.all([fetchUserSignals(), fetchCandidatePapers()]);
        setSignals(sigs);
        setCandidates(cands);
      } catch {
        toast.error('Could not load feed data.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // ── Build taste profile + rank feed ─────────────────────────────────────
  const buildFeed = useCallback(async () => {
    if (isBuilding) return;
    if (signals.length === 0) {
      toast.info('Interact with papers first (bookmark, review, comment) to personalise your feed.');
      return;
    }
    if (candidates.length === 0) {
      toast.info('No candidate papers to rank yet.');
      return;
    }

    setIsBuilding(true);
    profileBuiltRef.current = false;

    try {
      // ── Step 1: Embed interacted papers ──────────────────────────────
      setBuildStatus(`Embedding ${signals.length} interacted papers…`);
      const signalTexts = signals.map(s => paperText(s.paper));

      // Batch in groups of 6 to keep WASM memory stable
      const signalEmbeddings: number[][] = [];
      for (let i = 0; i < signalTexts.length; i += 6) {
        const batch = signalTexts.slice(i, i + 6);
        setBuildStatus(`Embedding interactions ${i + 1}–${Math.min(i + 6, signalTexts.length)} / ${signalTexts.length}…`);
        const embs = await embed(batch);
        signalEmbeddings.push(...embs);
      }

      // ── Step 2: Build weighted taste profile ─────────────────────────
      setBuildStatus('Building taste profile…');
      const weights = signals.map(s => SIGNAL_WEIGHTS[s.signalType]);
      const profile = weightedMean(signalEmbeddings, weights);
      setTasteProfile(profile);
      profileBuiltRef.current = true;

      // ── Step 3: Embed candidate papers ───────────────────────────────
      setBuildStatus(`Embedding ${candidates.length} feed papers…`);
      const candidateTexts = candidates.map(paperText);
      const candidateEmbeddings: number[][] = [];
      for (let i = 0; i < candidateTexts.length; i += 6) {
        const batch = candidateTexts.slice(i, i + 6);
        setBuildStatus(`Embedding candidates ${i + 1}–${Math.min(i + 6, candidateTexts.length)} / ${candidateTexts.length}…`);
        const embs = await embed(batch);
        candidateEmbeddings.push(...embs);
      }

      // ── Step 4: Score + rank ─────────────────────────────────────────
      setBuildStatus('Ranking by relevance…');
      const scored: ScoredPaper[] = candidates.map((paper, i) => ({
        ...paper,
        score:     cosineSim(profile, candidateEmbeddings[i]),
        embedding: candidateEmbeddings[i],
      }));

      // Sort by relevance descending
      scored.sort((a, b) => b.score - a.score);
      setRankedFeed(scored);
      setBuildStatus('');
      toast.success(`Feed personalised — ${scored.length} papers ranked`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to build personalised feed.');
    } finally {
      setIsBuilding(false);
    }
  }, [signals, candidates, embed, isBuilding]);

  // Auto-build once data is ready
  useEffect(() => {
    if (!isLoading && signals.length > 0 && candidates.length > 0 && !profileBuiltRef.current) {
      buildFeed();
    }
  }, [isLoading]);

  // ── Sorted + filtered view ───────────────────────────────────────────────
  const displayFeed = useMemo(() => {
    if (rankedFeed.length === 0) return [];

    // Filter: only show papers similar to a particular signal type
    // (future: could pass tag filters here too)
    let feed = [...rankedFeed];

    // Sort
    if (sortMode === 'recent') {
      feed.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    } else if (sortMode === 'trending') {
      // For now, trending = relevance with a small recency boost
      const now = Date.now();
      feed.sort((a, b) => {
        const ageA = (now - new Date(a.publishedAt).getTime()) / 864e5; // days
        const ageB = (now - new Date(b.publishedAt).getTime()) / 864e5;
        const trendA = a.score * Math.exp(-ageA / 30);
        const trendB = b.score * Math.exp(-ageB / 30);
        return trendB - trendA;
      });
    }
    // 'relevance' is already sorted from buildFeed

    return feed;
  }, [rankedFeed, sortMode]);

  // ── Signal summary for profile panel ────────────────────────────────────
  const signalCounts = useMemo(() => {
    const counts = { bookmark: 0, review: 0, comment: 0, upvote: 0 };
    signals.forEach(s => counts[s.signalType]++);
    return counts;
  }, [signals]);

  // ── Empty / loading states ───────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center gap-3 text-text-tertiary">
        <Loader2 size={18} className="animate-spin text-functional-blue" />
        <span className="text-sm">Loading feed…</span>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-functional-blue" />
            <h2 className="text-base font-semibold text-text-primary">Your Personalised Feed</h2>
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-xxs text-text-tertiary">
            <ShieldCheck size={11} className="text-functional-green" />
            <span>Ranked locally by your reading taste · no data sent to servers</span>
          </div>
        </div>

        <button
          onClick={buildFeed}
          disabled={isBuilding || signals.length === 0}
          className="flex items-center gap-2 self-start rounded-lg border border-common-minimal bg-common-cardBackground px-3 py-1.5 text-xs text-text-secondary hover:border-functional-blue hover:text-functional-blue disabled:opacity-50 transition-colors sm:self-auto"
        >
          {isBuilding
            ? <Loader2 size={12} className="animate-spin" />
            : <RefreshCw size={12} />}
          {isBuilding ? 'Ranking…' : 'Re-rank'}
        </button>
      </div>

      {/* ── Build progress bar ────────────────────────────────────────────── */}
      {isBuilding && (
        <div className="rounded-lg border border-functional-blue/20 bg-functional-blue/5 px-3 py-2.5">
          <div className="flex items-center gap-2 text-xs text-functional-blue">
            <Cpu size={13} className="shrink-0" />
            <span>{buildStatus || 'Processing…'}</span>
          </div>
        </div>
      )}

      {/* ── Taste profile panel ───────────────────────────────────────────── */}
      {signals.length > 0 && (
        <div className="rounded-xl border border-common-minimal bg-common-cardBackground">
          <button
            onClick={() => setProfileExpanded(e => !e)}
            className="flex w-full items-center justify-between px-4 py-3 text-left"
          >
            <div className="flex items-center gap-2">
              <User size={13} className="text-functional-purple" />
              <span className="text-xs font-semibold text-text-primary">Your Taste Profile</span>
              <span className="rounded-full bg-functional-purple/10 px-2 py-0.5 text-xxs text-functional-purple">
                {signals.length} signals
              </span>
            </div>
            {profileExpanded ? <ChevronUp size={13} className="text-text-tertiary" /> : <ChevronDown size={13} className="text-text-tertiary" />}
          </button>

          {profileExpanded && (
            <div className="border-t border-common-minimal px-4 pb-4 pt-3">
              {/* Signal breakdown */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 mb-3">
                {(Object.entries(signalCounts) as [InteractionSignal['signalType'], number][]).map(([type, count]) => (
                  <div key={type} className="flex flex-col items-center rounded-lg border border-common-minimal bg-common-background p-2 gap-1">
                    <SignalBadge type={type} />
                    <span className="text-sm font-bold text-text-primary">{count}</span>
                  </div>
                ))}
              </div>

              {/* Interacted papers list */}
              <p className="text-xxs font-medium uppercase tracking-wide text-text-tertiary mb-2">
                Papers informing your profile
              </p>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {signals.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <SignalBadge type={s.signalType} />
                    <span className="text-xs text-text-secondary truncate">{s.paper.title}</span>
                    <span className="ml-auto shrink-0 text-xxs text-text-tertiary">×{SIGNAL_WEIGHTS[s.signalType]}</span>
                  </div>
                ))}
              </div>

              {tasteProfile && (
                <p className="mt-3 text-xxs text-text-tertiary">
                  Profile vector: {tasteProfile.length}d · built from weighted mean of {signals.length} embeddings
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── No signals state ──────────────────────────────────────────────── */}
      {signals.length === 0 && !isBuilding && (
        <div className="rounded-xl border border-dashed border-common-minimal p-8 text-center">
          <TrendingUp size={36} className="mx-auto mb-3 text-common-minimal" />
          <p className="text-sm font-semibold text-text-primary mb-1">No taste profile yet</p>
          <p className="text-xs text-text-tertiary max-w-xs mx-auto">
            Bookmark papers, write reviews, or leave comments on SciCommons. The more you interact, the better your feed gets.
          </p>
        </div>
      )}

      {/* ── Controls: sort + display ──────────────────────────────────────── */}
      {rankedFeed.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Sliders size={13} className="text-text-tertiary shrink-0" />

          {/* Sort mode */}
          <div className="flex rounded-lg border border-common-minimal overflow-hidden text-xs">
            {(['relevance', 'recent', 'trending'] as SortMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setSortMode(mode)}
                className={`px-3 py-1.5 capitalize transition-colors ${
                  sortMode === mode
                    ? 'bg-functional-blue text-white'
                    : 'text-text-secondary hover:text-text-primary bg-common-cardBackground'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Show/hide score bars */}
          <button
            onClick={() => setShowScoreBars(v => !v)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors ${
              showScoreBars
                ? 'border-functional-blue/40 bg-functional-blue/5 text-functional-blue'
                : 'border-common-minimal text-text-tertiary'
            }`}
          >
            <Zap size={11} />
            Relevance bars
          </button>

          <span className="ml-auto text-xxs text-text-tertiary">
            {displayFeed.length} papers
          </span>
        </div>
      )}

      {/* ── Feed list ─────────────────────────────────────────────────────── */}
      {displayFeed.length > 0 && (
        <div className="space-y-3">
          {displayFeed.map((paper, i) => (
            <PaperCard key={paper.id} paper={paper} rank={i + 1} showScore={showScoreBars} />
          ))}
        </div>
      )}

      {/* ── No candidates state ───────────────────────────────────────────── */}
      {!isBuilding && candidates.length === 0 && signals.length > 0 && (
        <div className="rounded-xl border border-dashed border-common-minimal p-8 text-center">
          <BookOpen size={36} className="mx-auto mb-3 text-common-minimal" />
          <p className="text-sm font-semibold text-text-primary mb-1">No papers in feed yet</p>
          <p className="text-xs text-text-tertiary">
            Candidate papers will appear here once the community adds articles to SciCommons.
          </p>
        </div>
      )}
    </div>
  );
};

export default PersonalisedFeed;