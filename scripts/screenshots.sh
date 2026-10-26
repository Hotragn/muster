#!/bin/sh
# Captures real screenshots of the running app with headless Chrome.
# Usage: npm start (in another terminal), then: sh scripts/screenshots.sh
set -e
CH="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
BASE="${BASE:-http://localhost:4173}"
OUT="$(dirname "$0")/../public/shots"
mkdir -p "$OUT"
D="today=2026-10-26&example=1&theme=${THEME:-light}"
shot() { "$CH" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=2 --virtual-time-budget=3000 --window-size="$2" --screenshot="$OUT/$1.png" "$BASE/$3" 2>/dev/null; echo "$1.png"; }
shot planner-before 1280,860 "app?$D"
shot planner-after 1280,860 "app?$D&after=1"
shot planner-after-full 1280,1900 "app?$D&after=1"
shot editor 1280,860 "app?$D&edit=ex-2"
shot card 900,760 "app?$D&card=1"
shot brand 1280,2400 "brand?theme=${THEME:-light}"
shot landing 1280,3200 "?theme=${THEME:-light}"
