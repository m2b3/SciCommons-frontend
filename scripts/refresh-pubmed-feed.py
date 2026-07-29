#!/usr/bin/env python3
"""Refresh src/data/pubmedFeed.json against live PubMed.

Why: the bundled demo dataset was hand-assembled and its `doi` / `pmcUrl` fields do not
match their PMIDs -- an audit found only 45/99 DOIs and 1/79 PMC links correct, so the
reader's "Read full text (PMC)" and DOI links pointed at unrelated papers. The PMIDs and
titles themselves are genuine, so every identifier can be re-derived from the PMID.

What it does, in one esummary request:
  * rewrites `doi` and `pmcUrl` from the authoritative `articleids` list
  * adds `pmcid` ("PMC13370164" or "") so the full-text reader doesn't parse URLs at runtime
  * renames `community`/`communityName` -> `topic`/`topicName` (and the top-level
    `communities` key -> `topics`). These were never real backend communities; the feed is
    global and these are topic filters.

Idempotent -- safe to re-run. Usage:
    python3 scripts/refresh-pubmed-feed.py [--check]

--check exits non-zero if the file is out of date instead of writing it.
"""

from __future__ import annotations

import argparse
import json
import pathlib
import subprocess
import sys
import urllib.parse

ESUMMARY = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi"
DATA = pathlib.Path(__file__).resolve().parent.parent / "src" / "data" / "pubmedFeed.json"

# NCBI asks that automated clients identify themselves.
TOOL = "scicommons-feed"
EMAIL = "admin@scicommons.org"


def fetch_ids(pmids: list[str]) -> dict[str, dict[str, str]]:
    """PMID -> {idtype: value}. One request; esummary handles all 99 comfortably.

    Uses curl rather than urllib deliberately: urllib validates against Python's own CA
    bundle, which fails behind TLS-intercepting corporate proxies, while curl uses the
    system trust store. This script is run by hand on developer machines, so portability
    across those networks matters more than avoiding the subprocess.
    """
    query = urllib.parse.urlencode(
        {"db": "pubmed", "retmode": "json", "tool": TOOL, "email": EMAIL, "id": ",".join(pmids)}
    )
    proc = subprocess.run(
        ["curl", "-sSf", "--max-time", "90", "-A", TOOL, f"{ESUMMARY}?{query}"],
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0:
        raise SystemExit(f"esummary request failed: {proc.stderr.strip()}")
    result = json.loads(proc.stdout)["result"]

    out: dict[str, dict[str, str]] = {}
    for uid in result.get("uids", []):
        out[uid] = {i["idtype"]: i["value"] for i in result[uid].get("articleids", [])}
    return out


def rewrite(payload: dict, ids: dict[str, dict[str, str]]) -> tuple[dict, list[str]]:
    problems: list[str] = []

    topics = payload.get("topics") or payload["communities"]
    articles = []

    for art in payload["articles"]:
        pmid = art["pmid"]
        art = dict(art)

        # community -> topic (no-op on a second run)
        if "community" in art:
            art["topic"] = art.pop("community")
        if "communityName" in art:
            art["topicName"] = art.pop("communityName")

        real = ids.get(pmid)
        if real is None:
            problems.append(f"{pmid}: not found in PubMed, identifiers left untouched")
            art.setdefault("pmcid", "")
            articles.append(art)
            continue

        art["doi"] = real.get("doi", "")
        pmcid = real.get("pmc", "")
        art["pmcid"] = pmcid
        # Canonical host: www.ncbi.nlm.nih.gov/pmc/... now redirects to pmc.ncbi.nlm.nih.gov.
        art["pmcUrl"] = f"https://pmc.ncbi.nlm.nih.gov/articles/{pmcid}/" if pmcid else ""

        if not art["doi"]:
            problems.append(f"{pmid}: no DOI in PubMed record")

        # Stable key order so diffs stay readable.
        articles.append(
            {
                k: art[k]
                for k in (
                    "pmid", "title", "abstract", "authors", "journal", "pubDate",
                    "doi", "tags", "pmcid", "pmcUrl", "topic", "topicName", "source",
                )
            }
        )

    return {"topics": topics, "articles": articles}, problems


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="verify only; do not write")
    args = parser.parse_args()

    payload = json.loads(DATA.read_text())
    pmids = [a["pmid"] for a in payload["articles"]]
    print(f"{len(pmids)} articles; querying PubMed...")

    ids = fetch_ids(pmids)
    print(f"resolved {len(ids)}/{len(pmids)}")

    updated, problems = rewrite(payload, ids)

    with_pmc = sum(1 for a in updated["articles"] if a["pmcid"])
    print(f"open-access full text available: {with_pmc}/{len(updated['articles'])}")
    for p in problems:
        print(f"  warn: {p}")

    serialized = json.dumps(updated, indent=2, ensure_ascii=False) + "\n"

    if args.check:
        if serialized != DATA.read_text():
            print("OUT OF DATE - run without --check to refresh", file=sys.stderr)
            return 1
        print("up to date")
        return 0

    DATA.write_text(serialized)
    print(f"wrote {DATA}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
