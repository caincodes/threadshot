#!/bin/sh
# Installs the Threadshot Safari extension:
#   curl -fsSL https://threadshot.app/extension.sh | sh
# It fetches the extension folder from GitHub into a temporary folder and runs
# its install script. See extension/README.md.
set -eu

# Nothing runs until the last line, so a cut-off download can't run part of this.
main() {
  dir="$(mktemp -d)"
  trap 'rm -rf "$dir"' EXIT
  curl -fsSL https://codeload.github.com/caincodes/threadshot/tar.gz/main |
    tar -xz -C "$dir" --strip-components=2 threadshot-main/extension
  "$dir/install.sh"
}

main
