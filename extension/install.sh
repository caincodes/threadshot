#!/usr/bin/env bash
# Installs Threadshot as a Safari "Describe an Extension" extension. If one
# already exists, this replaces its script. Otherwise it adds a folder and the
# row in Safari's own database that makes Safari list it, which needs Safari to
# be quit. See extension/README.md.
set -euo pipefail
shopt -s nullglob

HERE="$(cd "$(dirname "$0")" && pwd)"
MAGIC="$HOME/Library/Containers/com.apple.Safari/Data/Library/Safari/MagicExtensions"
DB="$MAGIC/Extensions.db"

fail() {
  echo "error: $1" >&2
  exit 1
}

ls "$MAGIC" >/dev/null 2>&1 ||
  fail "could not read $MAGIC. Give your terminal app Full Disk Access. If it already has that, use Describe an Extension in Safari once so Safari creates the folder."

matches=("$MAGIC"/Threadshot-*/)
[ "${#matches[@]}" -le 1 ] || fail "found more than one Threadshot extension. Delete the extras in Safari."

if [ "${#matches[@]}" -eq 1 ]; then
  target="${matches[0]%/}"
  for permission in activeTab scripting; do
    grep -q "\"$permission\"" "$target/manifest.json" ||
      fail "the extension does not have the $permission permission. Delete it in Safari and run this again."
  done

  if cmp -s "$HERE/background.js" "$target/background.js"; then
    echo "Already up to date: $target"
    exit 0
  fi

  cp "$HERE/background.js" "$target/background.js"
  cmp -s "$HERE/background.js" "$target/background.js" || fail "the copy did not match."

  echo "Installed to $target"
  echo "Turn Threadshot off and on in Safari Settings > Extensions to reload it."
  exit 0
fi

[ -f "$DB" ] || fail "Safari has no extension database yet. Use Describe an Extension in Safari once, then run this again."
! pgrep -x Safari >/dev/null || fail "quit Safari first, then run this again."

backup="$HOME/Desktop/Threadshot-install-backup-$(date +%Y%m%d-%H%M%S)"
mkdir "$backup"
cp "$MAGIC"/Extensions.db* "$backup/"

folder="Threadshot-$(openssl rand -hex 2 | tr 'a-f' 'A-F')"
mkdir "$MAGIC/$folder"
cp "$HERE/background.js" "$HERE/manifest.json" "$MAGIC/$folder/"

# Dates count from 2001, as Safari's own rows do.
if ! sqlite3 "$DB" <<SQL
.bail on
BEGIN IMMEDIATE;
INSERT INTO magic_extensions (id, version, creation_date, modified_date, name, description, selected_symbol, prompt, directory_name, symbol_color_name, crdt_generation, sync_state, sync_generation, sync_data)
SELECT '$(uuidgen)', 1, strftime('%s','now') - 978307200.0, strftime('%s','now') - 978307200.0, 'Threadshot', 'Sends the Reddit post you are reading to threadshot.app.', 'camera.fill', 'make extension with toolbar button named "threadshot" (icon should be a camera of some sort)', '$folder', 'blue', '1 | $(uuidgen)', 0, value, NULL FROM metadata WHERE key = 'next_sync_generation';
UPDATE metadata SET value = value + 1 WHERE key = 'next_sync_generation';
COMMIT;
SQL
then
  rm -rf "${MAGIC:?}/$folder"
  fail "could not update Safari's database. A copy is in $backup."
fi

echo "Installed to $MAGIC/$folder"
echo "A copy of Safari's database is in $backup."
echo "Open Safari and turn on Threadshot in Settings > Extensions."
