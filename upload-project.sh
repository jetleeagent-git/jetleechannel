#!/bin/bash
# Upload a project subdirectory (index.html + images) to jetleechannel.sg FTP root
# Usage: bash upload-project.sh <local-dir> <ftp-subdir>
set -e
LOCAL_DIR="$1"
FTP_SUBDIR="$2"
FTP_USER="u851958941.jetleechannel.sg"
FTP_PASS="Jetleechannel12345&"
HOST="191.101.228.66"

echo "=== Uploading $LOCAL_DIR → /$FTP_SUBDIR/ ==="

# Ensure remote dir exists
curl -s --user "$FTP_USER:$FTP_PASS" "ftp://$HOST/$FTP_SUBDIR/" -Q "MKD $FTP_SUBDIR" 2>/dev/null || true
curl -s --user "$FTP_USER:$FTP_PASS" "ftp://$HOST/$FTP_SUBDIR/images/" -Q "MKD $FTP_SUBDIR/images" 2>/dev/null || true

# Upload index.html
curl -s -T "$LOCAL_DIR/index.html" "ftp://$HOST/$FTP_SUBDIR/index.html" --user "$FTP_USER:$FTP_PASS" -o /dev/null -w "index.html: %{http_code}\n" 2>/dev/null || echo "index.html failed"

# Upload images
for img in "$LOCAL_DIR"/images/*; do
  [ -f "$img" ] || continue
  name=$(basename "$img")
  curl -s -T "$img" "ftp://$HOST/$FTP_SUBDIR/images/$name" --user "$FTP_USER:$FTP_PASS" -o /dev/null -w "images/$name: %{http_code}\n" 2>/dev/null || echo "images/$name failed"
done
echo "=== Done: $FTP_SUBDIR ==="
