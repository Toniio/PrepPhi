#!/usr/bin/env python3
"""Build the PrepPhi exercise catalog from hasaneyldrm/exercises-dataset.

Why this script exists: the app embeds a closed catalog (no exercise the coach
can invent) with animated media small enough to fit in a single published HTML
file (16 MB limit). The dataset is general-purpose and gym-oriented, so we keep
only what Anthony's setup allows, tag each exercise with the equipment it needs,
and convert the GIFs to animated WebP (quality 40, about 22 % of the GIF size).

Usage:
    pip install pillow
    python scripts/build-catalog.py --dataset ../exercises-dataset
    # or let the script clone the dataset into .cache/:
    python scripts/build-catalog.py

Inputs besides the dataset:
    data/ladders.json                ladder steps (verifyMedia flags)
    data/catalog-overrides.json      exclusions and corrections after the GIF review
    data/names-fr.json               French names

Outputs:
    src/data/catalog.json           exercise metadata (French steps, tags, contexts)
    src/assets/exercises/<id>.webp   animated media, one per exercise
    scripts/catalog-report.md        counts and items needing a human look
"""
from __future__ import annotations

import argparse
import io
import json
import re
import subprocess
import sys
from pathlib import Path

from PIL import Image

DATASET_URL = "https://github.com/hasaneyldrm/exercises-dataset.git"
WEBP_QUALITY = 40  # validated by Anthony on 2026-10-04
ATTRIBUTION = "© Gym visual — https://gymvisual.com/"

ROOT = Path(__file__).resolve().parent.parent
OUT_JSON = ROOT / "src" / "data" / "catalog.json"
OUT_MEDIA = ROOT / "src" / "assets" / "exercises"
OUT_REPORT = ROOT / "scripts" / "catalog-report.md"
NAMES_FR = ROOT / "data" / "names-fr.json"  # {"0652": "Traction pronation", ...}, written by Claude Code

# Equipment Anthony has. "bar" is a DOORWAY pull-up bar: no muscle-up at home.
HOME_EQUIPMENT = {"none", "bar", "wall", "table", "towel", "chair"}
TRAVEL_EQUIPMENT = {"none", "wall"}  # hotel room: a free wall at best
PARK_EQUIPMENT = HOME_EQUIPMENT | {"park-bar", "low-bar"}

# Dataset "equipment" values we keep. Everything else needs gear he does not own.
KEPT_EQUIPMENT = {"body weight", "elliptical machine"}

# Names that reveal gear even when the dataset says "body weight". Excluded.
EXCLUDE_NAME = re.compile(
    r"machine|cable|cage|\brings?\b|straps|suspended|parallel bars|stability|bosu|"
    r"\bball\b|sled|rope|band|smith|captains chair|leverage|vertical bar|"
    r"on high|weighted|dip station"
)

# Name pattern -> equipment tag. First matches win per tag; several tags allowed.
TAG_RULES: list[tuple[str, re.Pattern[str]]] = [
    ("bar", re.compile(r"pull-?\s?up|chin|hanging|hang\b|scapular pull|l-pull|archer pull|muscle|front lever|back lever")),
    ("park-bar", re.compile(r"muscle[- ]?up")),
    ("low-bar", re.compile(r"straight bar")),
    ("table", re.compile(r"inverted row|squatting row")),
    ("towel", re.compile(r"towel")),
    ("wall", re.compile(r"wall|handstand")),
    ("chair", re.compile(r"bench|chair|\bbox\b|staircase|on (a )?step|step-?up")),
]

# Exercises referenced by data/ladders.json: always kept, whatever the filters say.
LADDER_IDS = {
    "0688", "0652", "1429", "3293", "1326", "0651",  # pull vertical
    "2300", "0499",  # pull horizontal
    "0659", "0493", "3211", "0662", "0283", "0279", "3294", "1399",  # push
    "3470", "2368", "1476", "1759",  # legs, front chain
    "3013", "3645", "0696", "1373", "1387", "0489",  # legs, posterior chain
    "0872", "0472", "0475", "3419", "3544",  # core
    "3302", "0471",  # handstand
    "0558", "0631",  # muscle-up (park)
    "1160", "0630", "0514",  # travel cardio circuit
    "2141",  # elliptical
}

# Ladder steps flagged "verifyMedia": double-check their GIF before trusting them.
LADDERS = ROOT / "data" / "ladders.json"
REVIEW_IDS = {
    step["exercise"].removeprefix("ds:")
    for ladder in json.loads(LADDERS.read_text(encoding="utf-8"))["ladders"]
    for step in ladder["steps"]
    if step.get("verifyMedia")
}

# Manual corrections after reviewing the GIFs: exclusions, equipment, French steps.
OVERRIDES = json.loads((ROOT / "data" / "catalog-overrides.json").read_text(encoding="utf-8"))


def ensure_dataset(path: Path | None) -> Path:
    if path:
        return path
    cache = ROOT / ".cache" / "exercises-dataset"
    if not cache.exists():
        cache.parent.mkdir(parents=True, exist_ok=True)
        subprocess.run(["git", "clone", "--depth", "1", DATASET_URL, str(cache)], check=True)
    return cache


def tags_for(name: str, equipment: str) -> list[str]:
    if equipment == "elliptical machine":
        return ["elliptical"]
    tags = [tag for tag, rx in TAG_RULES if rx.search(name)]
    return tags or ["none"]


def contexts_for(tags: list[str]) -> list[str]:
    s = set(tags)
    if s == {"elliptical"}:
        return ["home"]
    ctx = []
    if s <= HOME_EQUIPMENT:
        ctx.append("home")
    if s <= TRAVEL_EQUIPMENT:
        ctx.append("travel")
    if s <= PARK_EQUIPMENT and s & {"park-bar", "low-bar"}:
        ctx.append("park")
    return ctx


def to_webp(gif_path: Path) -> bytes:
    im = Image.open(gif_path)
    frames, durations = [], []
    try:
        while True:
            frames.append(im.copy().convert("RGB"))
            durations.append(im.info.get("duration", 100))
            im.seek(im.tell() + 1)
    except EOFError:
        pass
    buf = io.BytesIO()
    frames[0].save(
        buf, "WEBP", save_all=True, append_images=frames[1:],
        duration=durations, loop=0, quality=WEBP_QUALITY, method=6,
    )
    return buf.getvalue()


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--dataset", type=Path, help="path to a local clone of exercises-dataset")
    ap.add_argument("--no-media", action="store_true", help="skip the WebP conversion")
    args = ap.parse_args()

    ds = ensure_dataset(args.dataset)
    records = json.loads((ds / "data" / "exercises.json").read_text(encoding="utf-8"))

    names_fr = json.loads(NAMES_FR.read_text(encoding="utf-8")) if NAMES_FR.exists() else {}
    manual_exclude, reviewed = OVERRIDES["exclude"], set(OVERRIDES["reviewed"])
    kept, excluded, excluded_manual, review = [], [], [], []
    for r in records:
        rid, name, eq = r["id"], r["name"], r["equipment"]
        forced = rid in LADDER_IDS
        if not forced and (eq not in KEPT_EQUIPMENT or EXCLUDE_NAME.search(name)):
            if eq == "body weight":
                excluded.append(f"{rid} {name}")
            continue
        if rid in manual_exclude:
            excluded_manual.append(f"{rid} {name}: {manual_exclude[rid]}")
            continue
        override = OVERRIDES["exercises"].get(rid, {})
        tags = override.get("equipment") or tags_for(name, eq)
        ctx = contexts_for(tags)
        if not ctx:
            excluded.append(f"{rid} {name} (tags: {', '.join(tags)})")
            continue
        steps = override.get("stepsFr") or (r.get("instruction_steps") or {}).get("fr") or []
        item = {
            "id": f"ds:{rid}",
            "sourceId": rid,
            "nameEn": name,
            "nameFr": names_fr.get(rid),  # from data/names-fr.json (Claude Code task)
            "stepsFr": steps,
            "bodyPart": r.get("body_part"),
            "target": r.get("target"),
            "secondaryMuscles": r.get("secondary_muscles") or [],
            "equipment": tags,
            "contexts": ctx,
            "media": f"exercises/{rid}.webp",
            "attribution": ATTRIBUTION,
            "inLadder": forced,
        }
        for key in ("cueFr", "mistakeFr", "noteFr"):
            if key in override:
                item[key] = override[key]
        if rid not in reviewed and (rid in REVIEW_IDS or (set(tags) & {"chair"} and not forced)):
            item["needsReview"] = True
            review.append(f"{rid} {name} (tags: {', '.join(tags)})")
        kept.append((item, ds / r["gif_url"]))

    OUT_MEDIA.mkdir(parents=True, exist_ok=True)
    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    # Drop the media of exercises no longer in the catalog (excluded since the last run).
    kept_ids = {item["sourceId"] for item, _ in kept}
    for stale in OUT_MEDIA.glob("*.webp"):
        if stale.stem not in kept_ids:
            stale.unlink()
    total_media = 0
    if not args.no_media:
        for i, (item, gif) in enumerate(kept, 1):
            data = to_webp(gif)
            (OUT_MEDIA / f"{item['sourceId']}.webp").write_bytes(data)
            total_media += len(data)
            if i % 50 == 0:
                print(f"  {i}/{len(kept)} converted", file=sys.stderr)

    catalog = {
        "source": DATASET_URL,
        "webpQuality": WEBP_QUALITY,
        "count": len(kept),
        "exercises": [item for item, _ in kept],
    }
    OUT_JSON.write_text(json.dumps(catalog, ensure_ascii=False, indent=2), encoding="utf-8")

    by_ctx = {c: sum(c in it["contexts"] for it, _ in kept) for c in ("home", "travel", "park")}
    lines = [
        "# Catalog report", "",
        f"- Exercises kept: {len(kept)}",
        f"- Available at home: {by_ctx['home']} · travel: {by_ctx['travel']} · park: {by_ctx['park']}",
        f"- Media total: {total_media / 1e6:.1f} MB raw, ~{total_media * 4 / 3 / 1e6:.1f} MB inlined (limit 16 MB)",
        f"- Excluded body-weight entries: {len(excluded)} by the filters, {len(excluded_manual)} after review",
        f"- French names missing: {sum(1 for it, _ in kept if not it['nameFr'])}", "",
        "## Needs a human look", "", *[f"- {x}" for x in review], "",
        "## Excluded after review (data/catalog-overrides.json)", "", *[f"- {x}" for x in excluded_manual], "",
        "## Excluded body-weight entries", "", *[f"- {x}" for x in excluded], "",
    ]
    OUT_REPORT.write_text("\n".join(lines), encoding="utf-8")
    print("\n".join(lines[:8]))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
