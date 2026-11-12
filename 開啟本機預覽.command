#!/bin/zsh
set -e
cd "$(dirname "$0")"
export ASTRO_TELEMETRY_DISABLED=1
if [ -x .local-runtime/bin/node ]; then
  export PATH="$PWD/.local-runtime/bin:$PATH"
fi
if ! command -v npm >/dev/null; then
  echo '請先安裝 .nvmrc 指定的 Node 版本，再執行 npm ci。'
  exit 1
fi
if [ ! -d node_modules ]; then npm ci; fi
printf '\n開啟 http://localhost:4321/fansi-notes/ 檢視。按 Control+C 關閉預覽。\n\n'
npm run dev -- --host 127.0.0.1
