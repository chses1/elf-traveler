#!/bin/zsh
cd "$(dirname "$0")"
port=4174
python3 -m http.server "$port" >/tmp/spirit-traveler-taoyuan-server.log 2>&1 &
sleep 1
open "http://localhost:$port"
