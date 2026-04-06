'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BookMarked, BookOpen, ChevronDown, ChevronUp, Cpu, FlaskConical,
  Loader2, MessageSquare, RefreshCw, ShieldCheck, Sliders, Sparkles,
  Star, TrendingUp, User, Zap,
} from 'lucide-react';
import { toast } from 'sonner';

import { useAIWorker } from './useAIWorker';
import { useAuthStore } from '@/stores/authStore'; 

// ─── Types ─────────────────────────────────────────────────────────────────

export interface FeedPaper {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  journal?: string;
  publishedAt: string;
  doi?: string;
  tags?: string[];
}

interface InteractionSignal {
  paper: FeedPaper;
  weight: number;
  signalType: 'bookmark' | 'review' | 'comment' | 'upvote';
}

interface ScoredPaper extends FeedPaper {
  score: number;
  embedding: number[];
}

type SortMode = 'relevance' | 'recent' | 'trending';
type FilterSignal = 'all' | 'bookmark' | 'review' | 'comment';

// ─── Signal weights ─────────────────────────────────────────────────────────
const SIGNAL_WEIGHTS: Record<InteractionSignal['signalType'], number> = {
  review: 3.0,
  bookmark: 1.5,
  comment: 1.0,
  upvote: 0.8,
};

// ─── Math helpers ───────────────────────────────────────────────────────────

function cosineSim(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-8);
}

function weightedMean(vectors: number[][], weights: number[]): number[] {
  const dim = vectors[0].length;
  const result = new Array(dim).fill(0);
  const total = weights.reduce((s, w) => s + w, 0);
  for (let i = 0; i < vectors.length; i++) {
    for (let d = 0; d < dim; d++) {
      result[d] += (vectors[i][d] * weights[i]) / total;
    }
  }
  const norm = Math.sqrt(result.reduce((s, v) => s + v * v, 0)) + 1e-8;
  return result.map(v => v / norm);
}

function paperText(p: FeedPaper): string {
  return `${p.title}. ${p.abstract ?? ''}`.slice(0, 400);
}

// ─── Sub-components ─────────────────────────────────────────────────────────

const SignalBadge = ({ type }: { type: InteractionSignal['signalType'] }) => {
  const config = {
    bookmark: { icon: <BookMarked size={10} />, label: 'Bookmarked', cls: 'text-functional-blue bg-functional-blue/10 border-functional-blue/20' },
    review: { icon: <FlaskConical size={10} />, label: 'Reviewed', cls: 'text-functional-purple bg-functional-purple/10 border-functional-purple/20' },
    comment: { icon: <MessageSquare size={10} />, label: 'Commented', cls: 'text-functional-green bg-functional-green/10 border-functional-green/20' },
    upvote: { icon: <Star size={10} />, label: 'Upvoted', cls: 'text-functional-yellow bg-functional-yellow/10 border-functional-yellow/20' },
  }[type];

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xxs font-medium ${config.cls}`}>
      {config.icon}{config.label}
    </span>
  );
};

const RelevanceBar = ({ score }: { score: number }) => {
  const pct = Math.max(0, Math.min(100, Math.round(score * 100))); // Clamp between 0-100
  const color = pct >= 75 ? 'bg-functional-green' : pct >= 50 ? 'bg-functional-blue' : 'bg-common-minimal';
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-common-minimal">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-7 text-right text-xxs text-text-tertiary">{pct}%</span>
    </div>
  );
};

interface PaperCardProps {
  paper: ScoredPaper;
  rank: number;
  showScore: boolean;
}

const PaperCard: React.FC<PaperCardProps> = ({ paper, rank, showScore }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="rounded-xl border border-common-minimal bg-common-cardBackground p-4 transition-shadow hover:shadow-md">
      <div className="mb-2 flex items-start justify-between gap-3">
        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-common-minimal text-xxs font-bold text-text-tertiary">
          {rank}
        </span>
        {showScore && (
          <div className="flex-1">
            <RelevanceBar score={paper.score} />
          </div>
        )}
      </div>

      <h3 className="mb-1 line-clamp-2 text-sm font-semibold leading-snug text-text-primary">
        {paper.title}
      </h3>

      <p className="mb-2 text-xxs text-text-tertiary">
        {paper.authors.slice(0, 3).join(', ')}{paper.authors.length > 3 ? ' et al.' : ''}
        {paper.journal ? ` · ${paper.journal}` : ''}
        {' · '}{new Date(paper.publishedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
      </p>

      {paper.tags && paper.tags.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {paper.tags.slice(0, 4).map(tag => (
            <span key={tag} className="rounded-full border border-common-minimal px-2 py-0.5 text-xxs text-text-tertiary">
              {tag}
            </span>
          ))}
        </div>
      )}

      <button
        onClick={() => setExpanded(e => !e)}
        className="mb-1 flex items-center gap-1 text-xxs text-text-tertiary transition-colors hover:text-functional-blue"
      >
        {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        {expanded ? 'Hide' : 'Show'} abstract
      </button>
      {expanded && (
        <p className="line-clamp-6 text-xs leading-relaxed text-text-secondary">
          {paper.abstract}
        </p>
      )}

      <div className="mt-3 flex gap-2">
        {paper.doi && (
          <a
            href={`https://doi.org/${paper.doi}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-common-minimal px-3 py-1.5 text-xxs text-text-secondary transition-colors hover:border-functional-blue hover:text-functional-blue"
          >
            View Paper
          </a>
        )}
        <a
          href={`/article/${paper.id}`}
          className="rounded-lg border border-common-minimal px-3 py-1.5 text-xxs text-text-secondary transition-colors hover:border-functional-blue hover:text-functional-blue"
        >
          Discuss on SciCommons
        </a>
      </div>
    </article>
  );
};

// ─── Main component ──────────────────────────────────────────────────────────

const PersonalisedFeed: React.FC = () => {
  const accessToken = useAuthStore(state => state.accessToken); 
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://backendtest.scicommons.org'; 
  
  const [signals, setSignals] = useState<InteractionSignal[]>([]);
  const [candidates, setCandidates] = useState<FeedPaper[]>([]);
  const [rankedFeed, setRankedFeed] = useState<ScoredPaper[]>([]);
  const [tasteProfile, setTasteProfile] = useState<number[] | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildStatus, setBuildStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sortMode, setSortMode] = useState<SortMode>('relevance');
  const [showScoreBars, setShowScoreBars] = useState(true);
  const [profileExpanded, setProfileExpanded] = useState(false);
  const profileBuiltRef = useRef(false);

  const { embed } = useAIWorker(setBuildStatus);

  // ── Helper to map backend API response to FeedPaper format ──
  const mapArticleToFeedPaper = (item: any): FeedPaper => ({
    id: item.slug || item.id?.toString(),
    title: item.title || "Untitled Paper",
    abstract: item.abstract || item.content || "No abstract available.",
    authors: item.authors?.map((a: any) => a.label || a.name || "Unknown") || ["Unknown Author"],
    publishedAt: item.created_at || item.published_date || new Date().toISOString(),
    tags: item.keywords || [],
  });

  // ── 2. Fetch REAL Data on mount ────────────────────────────
  useEffect(() => {
    if (!accessToken) {
      setIsLoading(false);
      return; 
    }

    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${accessToken}` };
        
        let candidatePapers: FeedPaper[] = [];
        let userSignals: InteractionSignal[] = [];

        // A. Fetch Candidates (Latest articles on platform)
        try {
          // Changed endpoint to standard /api/articles/
          const articlesRes = await fetch(`${baseUrl}/api/articles/?limit=50`, { headers });
          const articlesText = await articlesRes.text(); // Read as text first to avoid JSON crash
          
          if (!articlesRes.ok) throw new Error(`Status ${articlesRes.status}: ${articlesText}`);
          
          const articlesData = JSON.parse(articlesText);
          const articlesArray = articlesData.items || articlesData.results || articlesData;
          
          if (Array.isArray(articlesArray)) {
            candidatePapers = articlesArray.map(mapArticleToFeedPaper);
          }
        } catch (articleErr) {
          console.error("Error fetching articles:", articleErr);
          toast.error("Could not fetch candidate articles.");
        }

        // B. Fetch Bookmarks (User Signals)
        try {
          const bookmarksRes = await fetch(`${baseUrl}/api/users/common/bookmarks/`, { headers });
          const bookmarksText = await bookmarksRes.text();
          
          if (!bookmarksRes.ok) throw new Error(`Status ${bookmarksRes.status}: ${bookmarksText}`);
          
          const bookmarksData = JSON.parse(bookmarksText);
          const bookmarksArray = bookmarksData.items || bookmarksData.results || bookmarksData;

          if (Array.isArray(bookmarksArray)) {
            // Map bookmarks into Interaction Signals
            userSignals = bookmarksArray
              .filter((bm: any) => bm.content_type === 'articlesarticle' || bm.article) 
              .map((bm: any) => ({
                paper: mapArticleToFeedPaper(bm.content_object || bm.article || bm),
                weight: SIGNAL_WEIGHTS.bookmark,
                signalType: 'bookmark' as const
              }));
          }
        } catch (bookmarkErr) {
          console.error("Error fetching bookmarks:", bookmarkErr);
          // Graceful fallback: User simply has no signals
        }

        setCandidates(candidatePapers);
        setSignals(userSignals);

      } catch (err) {
        console.error("Critical error in fetchData:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [accessToken, baseUrl]);

  // ── Build taste profile + rank feed ─────────────────────────────────────
  const buildFeed = useCallback(async () => {
    if (isBuilding) return;
    if (signals.length === 0) {
      toast.info('Bookmark some articles first so the AI can learn your reading taste!');
      return;
    }
    if (candidates.length === 0) {
      toast.info('No candidate papers to rank yet.');
      return;
    }

    setIsBuilding(true);
    profileBuiltRef.current = false;

    try {
      setBuildStatus(`Embedding ${signals.length} interacted papers…`);
      const signalTexts = signals.map(s => paperText(s.paper));

      const signalEmbeddings: number[][] = [];
      for (let i = 0; i < signalTexts.length; i += 6) {
        const batch = signalTexts.slice(i, i + 6);
        setBuildStatus(`Embedding interactions ${i + 1}–${Math.min(i + 6, signalTexts.length)} / ${signalTexts.length}…`);
        const embs = await embed(batch);
        signalEmbeddings.push(...embs);
      }

      setBuildStatus('Building taste profile…');
      const weights = signals.map(s => SIGNAL_WEIGHTS[s.signalType]);
      const profile = weightedMean(signalEmbeddings, weights);
      setTasteProfile(profile);
      profileBuiltRef.current = true;

      setBuildStatus(`Embedding ${candidates.length} feed papers…`);
      const candidateTexts = candidates.map(paperText);
      const candidateEmbeddings: number[][] = [];
      for (let i = 0; i < candidateTexts.length; i += 6) {
        const batch = candidateTexts.slice(i, i + 6);
        setBuildStatus(`Embedding candidates ${i + 1}–${Math.min(i + 6, candidateTexts.length)} / ${candidateTexts.length}…`);
        const embs = await embed(batch);
        candidateEmbeddings.push(...embs);
      }

      setBuildStatus('Ranking by relevance…');
      const scored: ScoredPaper[] = candidates.map((paper, i) => ({
        ...paper,
        score: cosineSim(profile, candidateEmbeddings[i]),
        embedding: candidateEmbeddings[i],
      }));

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
  }, [isLoading, signals.length, candidates.length, buildFeed]);

  const displayFeed = useMemo(() => {
    if (rankedFeed.length === 0) return [];
    let feed = [...rankedFeed];
    if (sortMode === 'recent') {
      feed.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    } else if (sortMode === 'trending') {
      const now = Date.now();
      feed.sort((a, b) => {
        const ageA = (now - new Date(a.publishedAt).getTime()) / 864e5;
        const ageB = (now - new Date(b.publishedAt).getTime()) / 864e5;
        const trendA = a.score * Math.exp(-ageA / 30);
        const trendB = b.score * Math.exp(-ageB / 30);
        return trendB - trendA;
      });
    }
    return feed;
  }, [rankedFeed, sortMode]);

  const signalCounts = useMemo(() => {
    const counts = { bookmark: 0, review: 0, comment: 0, upvote: 0 };
    signals.forEach(s => counts[s.signalType]++);
    return counts;
  }, [signals]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center gap-3 text-text-tertiary">
        <Loader2 size={18} className="animate-spin text-functional-blue" />
        <span className="text-sm">Loading your live data…</span>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-6 py-8 sm:px-10">

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
          className="flex items-center gap-2 self-start rounded-lg border border-common-minimal bg-common-cardBackground px-3 py-1.5 text-xs text-text-secondary transition-colors hover:border-functional-blue hover:text-functional-blue disabled:opacity-50 sm:self-auto"
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
              <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {(Object.entries(signalCounts) as [InteractionSignal['signalType'], number][]).map(([type, count]) => (
                  <div key={type} className="flex flex-col items-center gap-1 rounded-lg border border-common-minimal bg-common-background p-2">
                    <SignalBadge type={type} />
                    <span className="text-sm font-bold text-text-primary">{count}</span>
                  </div>
                ))}
              </div>

              <p className="mb-2 text-xxs font-medium uppercase tracking-wide text-text-tertiary">
                Papers informing your profile
              </p>
              <div className="max-h-40 space-y-1.5 overflow-y-auto pr-1">
                {signals.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <SignalBadge type={s.signalType} />
                    <span className="truncate text-xs text-text-secondary">{s.paper.title}</span>
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
      {(!accessToken || signals.length === 0) && !isBuilding && (
        <div className="rounded-xl border border-dashed border-common-minimal p-8 text-center">
          <TrendingUp size={36} className="mx-auto mb-3 text-common-minimal" />
          <p className="mb-1 text-sm font-semibold text-text-primary">No taste profile yet</p>
          <p className="mx-auto max-w-xs text-xs text-text-tertiary">
            {!accessToken 
              ? "Please log in and interact with papers to generate your AI feed." 
              : "Bookmark papers, write reviews, or leave comments on SciCommons. The more you interact, the better your feed gets."}
          </p>
        </div>
      )}

      {/* ── Controls: sort + display ──────────────────────────────────────── */}
      {rankedFeed.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Sliders size={13} className="shrink-0 text-text-tertiary" />

          <div className="flex overflow-hidden rounded-lg border border-common-minimal text-xs">
            {(['relevance', 'recent', 'trending'] as SortMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setSortMode(mode)}
                className={`px-3 py-1.5 capitalize transition-colors ${
                  sortMode === mode
                    ? 'bg-functional-blue text-white'
                    : 'bg-common-cardBackground text-text-secondary hover:text-text-primary'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

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
    </div>
  );
};

export default PersonalisedFeed;