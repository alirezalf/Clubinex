#!/bin/bash
# Temporary verification script for the Freebuff preview.
BASE="https://8000-ifhq5dnu7qkc167ktn796.e2b.app"
JAR=/tmp/vfy_cookies.txt
rm -f "$JAR"

echo "== 1. Public pages =="
for p in / /login /register; do
  code=$(curl -s -o /dev/null -w "%{http_code}" -c "$JAR" "$BASE$p")
  echo "GET $p -> $code"
done

echo "== 2. Login as admin =="
# Obtain XSRF token from cookie jar (url-decoded via php)
XSRF=$(grep -o 'XSRF-TOKEN\s.*' "$JAR" | awk '{print $NF}')
DEC=$(php -r 'echo urldecode($argv[1]);' "$XSRF" 2>/dev/null)
login_code=$(curl -s -o /tmp/vfy_login.html -w "%{http_code} -> %{redirect_url}" -b "$JAR" -c "$JAR" \
  -H "X-XSRF-TOKEN: $DEC" \
  -X POST "$BASE/login" \
  --data-urlencode "email=alirezalf@gmail.com" \
  --data-urlencode "password=admin")
echo "POST /login -> $login_code"

echo "== 3. Authenticated pages =="
for p in /dashboard /admin/users /admin/reports /admin/sliders /admin/rewards /admin/settings /admin/tickets /admin/levels /admin/clubs /rewards /lucky-wheel /tickets; do
  code=$(curl -s -o /dev/null -w "%{http_code}" -b "$JAR" -c "$JAR" "$BASE$p")
  echo "GET $p -> $code"
done

echo "== 4. Backup functionality =="
XSRF=$(grep -o 'XSRF-TOKEN\s.*' "$JAR" | awk '{print $NF}')
DEC=$(php -r 'echo urldecode($argv[1]);' "$XSRF" 2>/dev/null)
backup_code=$(curl -s -o /tmp/vfy_backup.sql -w "%{http_code}" -b "$JAR" -c "$JAR" \
  -H "X-XSRF-TOKEN: $DEC" "$BASE/admin/settings/backup-database")
echo "GET /admin/settings/backup-database -> $backup_code, bytes: $(wc -c < /tmp/vfy_backup.sql)"
head -c 120 /tmp/vfy_backup.sql; echo

echo "== 5. Report search (AJAX) =="
XSRF=$(grep -o 'XSRF-TOKEN\s.*' "$JAR" | awk '{print $NF}')
DEC=$(php -r 'echo urldecode($argv[1]);' "$XSRF" 2>/dev/null)
r1=$(curl -s -o /tmp/vfy_report.json -w "%{http_code}" -b "$JAR" -c "$JAR" -H "X-XSRF-TOKEN: $DEC" \
  -H "Accept: application/json" "$BASE/admin/reports?search=%D9%85%D8%AF%DB%8C%D8%B1")
echo "GET /admin/reports?search=مدیر -> $r1"
r2=$(curl -s -o /tmp/vfy_dynamic.json -w "%{http_code}" -b "$JAR" -c "$JAR" \
  -H "X-XSRF-TOKEN: $DEC" -H "Content-Type: application/json" -H "Accept: application/json" \
  -X POST "$BASE/admin/reports/dynamic/fetch" \
  -d '{"table":"users","fields":["id","first_name","last_name","email"],"page":1,"per_page":10,"sort_dir":"desc","advanced_filters":[]}')
echo "POST /admin/reports/dynamic/fetch -> $r2"
head -c 300 /tmp/vfy_dynamic.json; echo

echo "== 6. Ticket flow (create + admin reply; verify no 500) =="
XSRF=$(grep -o 'XSRF-TOKEN\s.*' "$JAR" | awk '{print $NF}')
DEC=$(php -r 'echo urldecode($argv[1]);' "$XSRF" 2>/dev/null)
t1=$(curl -s -o /tmp/vfy_ticket.json -w "%{http_code}" -b "$JAR" -c "$JAR" \
  -H "X-XSRF-TOKEN: $DEC" -H "Content-Type: application/json" -H "Accept: application/json" \
  -X POST "$BASE/tickets" -d '{"subject":"تست پیش‌نمایش","message":"پیام تستی برای بررسی پاسخ مدیر","category":"support"}')
echo "POST /tickets (user) -> $t1"; head -c 200 /tmp/vfy_ticket.json; echo
tid=$(php -r '$j=json_decode(file_get_contents("/tmp/vfy_ticket.json"),true); echo $j["ticket"]["id"] ?? $j["id"] ?? "";' 2>/dev/null)
echo "ticket id: $tid"
if [ -n "$tid" ]; then
  XSRF=$(grep -o 'XSRF-TOKEN\s.*' "$JAR" | awk '{print $NF}')
  DEC=$(php -r 'echo urldecode($argv[1]);' "$XSRF" 2>/dev/null)
  t2=$(curl -s -o /tmp/vfy_reply1.json -w "%{http_code}" -b "$JAR" -c "$JAR" \
    -H "X-XSRF-TOKEN: $DEC" -H "Content-Type: application/json" -H "Accept: application/json" \
    -X POST "$BASE/admin/tickets/$tid/reply" -d '{"message":"پاسخ تستی مدیر"}')
  echo "POST /admin/tickets/$tid/reply (1st) -> $t2"; head -c 200 /tmp/vfy_reply1.json; echo
  XSRF=$(grep -o 'XSRF-TOKEN\s.*' "$JAR" | awk '{print $NF}')
  DEC=$(php -r 'echo urldecode($argv[1]);' "$XSRF" 2>/dev/null)
  t3=$(curl -s -o /tmp/vfy_reply2.json -w "%{http_code}" -b "$JAR" -c "$JAR" \
    -H "X-XSRF-TOKEN: $DEC" -H "Content-Type: application/json" -H "Accept: application/json" \
    -X POST "$BASE/admin/tickets/$tid/reply" -d '{"message":"پاسخ دوم مدیر"}')
  echo "POST /admin/tickets/$tid/reply (2nd) -> $t3"; head -c 200 /tmp/vfy_reply2.json; echo
fi

echo "== 7. User bulk actions & report/user search endpoints =="
XSRF=$(grep -o 'XSRF-TOKEN\s.*' "$JAR" | awk '{print $NF}')
DEC=$(php -r 'echo urldecode($argv[1]);' "$XSRF" 2>/dev/null)
s1=$(curl -s -o /tmp/vfy_users.json -w "%{http_code}" -b "$JAR" -c "$JAR" -H "X-XSRF-TOKEN: $DEC" \
  -H "Accept: application/json" "$BASE/admin/users?search=admin")
echo "GET /admin/users?search=admin -> $s1"; head -c 200 /tmp/vfy_users.json; echo

echo "== DONE =="
