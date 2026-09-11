#!/bin/bash
HOST="191.101.228.66"
USER="u851958941.jetleechannel.sg"
PASS="Jetleechannel12345&"

upload() {
  local local="$1" remote="$2"
  local code
  code=$(curl -s -T "$local" "ftp://$HOST/$remote" --user "$USER:$PASS" -o /dev/null -w "%{http_code}" 2>/dev/null)
  echo "$code $local -> /$remote"
}

upload "amberwood_articles/article-amberwood-gcb-enclave.html" "amberwood/articles/article-amberwood-gcb-enclave.html"
upload "amberwood_articles/article-d10-generational-wealth.html" "amberwood/articles/article-d10-generational-wealth.html"
upload "amberwood_articles/article-quiet-luxury-trend.html" "amberwood/articles/article-quiet-luxury-trend.html"
upload "hudsonplace_articles/article-absd-guide-2026.html" "hudsonplace/articles/article-absd-guide-2026.html"
upload "hudsonplace_articles/article-absd-timing-trap.html" "hudsonplace/articles/article-absd-timing-trap.html"
upload "hudsonplace_articles/article-top-new-launches-2026.html" "hudsonplace/articles/article-top-new-launches-2026.html"
upload "hougangcentral_articles/article-absd-guide-2026.html" "hougangcentral/articles/article-absd-guide-2026.html"
upload "hougangcentral_articles/article-top-new-launches-2026.html" "hougangcentral/articles/article-top-new-launches-2026.html"
upload "OneMarinaGardens_articles/article-omg-record-3290.html" "OneMarinaGardens/articles/article-omg-record-3290.html"
upload "unionsquare_articles/article-absd-guide-2026.html" "unionsquare/articles/article-absd-guide-2026.html"
upload "unionsquare_articles/article-top-new-launches-2026.html" "unionsquare/articles/article-top-new-launches-2026.html"
upload "generations-tannery_articles/article-absd-guide-2026.html" "generations-tannery/articles/article-absd-guide-2026.html"
upload "generations-tannery_articles/article-top-new-launches-2026.html" "generations-tannery/articles/article-top-new-launches-2026.html"
upload "thesen_articles/article-hdb-waitout-removed.html" "thesen/articles/article-hdb-waitout-removed.html"
