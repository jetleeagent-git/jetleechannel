#!/bin/bash
# ============================================================
# CENTRAL DEPLOY SCRIPT — Update all Jetlee sites at once
# Usage: bash deploy.sh [site-name]    # single site
#        bash deploy.sh all            # all sites
#        bash deploy.sh scan           # root scan only
# ============================================================

set -e

FOOTER_FILE="/home/ubuntu/.openclaw/workspace/footer-template.html"
WORKSPACE="/home/ubuntu/.openclaw/workspace"
SITES_FILE="$WORKSPACE/.sites.json"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'

# ----- SITE DEFINITIONS (master source of truth) -----
# Format: "label|ftpuser|ftppass|root|cloudflare"
# root = FTP root directory (empty means "/")
SITE_MAIN="jetleechannel|u851958941.jetleechannel.sg|Jetleechannel12345&||"
SITE_HUDSON="hudsonplace|u851958941.hudsonplace.jetleechannel.sg|Hudsonplace87649315\$||hudsonplace.jetleechannel.sg"
SITE_THOMSON="thomsonreserve|u851958941.thomsonreserve.jetleechannel.sg|Thomson87649315\$||thomsonreserve.jetleechannel.sg"
SITE_LUCERNE="lucernegrand|u851958941.lucernegrand.jetleechannel.sg|Lucerngrand87649315\$||lucernegrand.jetleechannel.sg"
SITE_UNION="unionsquare|u851958941.unionsquare.jetleechannel.sg|Unionsquare87649315\$||unionsquare.jetleechannel.sg"
SITE_ELTA="elta|u851958941.jetleechannel.sg|Jetleechannel12345&|elta|jetleechannel.sg"
SITE_AMBER="amberwood|u851958941.amberwood.jetleechannel.sg|Amberwood123\$||amberwood.jetleechannel.sg"
SITE_LENTOR="lentorgardens|u851958941.lentorgardens.jetleechannel.sg|Lentorgardens87649315\$||lentorgardens.jetleechannel.sg"
SITE_DUNEARN="dunearnhouse|u851958941.jetleechannel.sg|Jetleechannel12345&|dunearnhouse|jetleechannel.sg"
SITE_SERRA="thesierra|u851958941.jetleechannel.sg|Jetleechannel12345&|TheSerra|jetleechannel.sg"
SITE_ORIE="theorie|u851958941.jetleechannel.sg|Jetleechannel12345&|TheOrie|jetleechannel.sg"
SITE_SOPHIA="sophiameadow|u851958941.jetleechannel.sg|Jetleechannel12345&|SophiaMeadow|jetleechannel.sg"
SITE_BAGNALL="bagnallhous|u851958941.jetleechannel.sg|Jetleechannel12345&|bagnallhous|jetleechannel.sg"

ALL_SITES=("$SITE_MAIN" "$SITE_HUDSON" "$SITE_THOMSON" "$SITE_LUCERNE" "$SITE_UNION" "$SITE_ELTA" "$SITE_AMBER" "$SITE_LENTOR" "$SITE_DUNEARN" "$SITE_SERRA" "$SITE_ORIE" "$SITE_SOPHIA" "$SITE_BAGNALL")

get_field() { echo "$1" | cut -d'|' -f"$2"; }

deploy_site() {
    local entry="$1"
    local name=$(get_field "$entry" 1)
    local ftp_user=$(get_field "$entry" 2)
    local ftp_pass=$(get_field "$entry" 3)
    local ftp_root=$(get_field "$entry" 4)
    local domain=$(get_field "$entry" 5)
    local html_file=""

    echo -e "${CYAN}━━━ $name ($domain) ━━━${NC}"

    # Find the HTML file for this site (prefer site- then exact match)
    html_file=$(find "$WORKSPACE" -maxdepth 1 -name "site-$name.html" 2>/dev/null | head -1)
    if [ -z "$html_file" ]; then
        html_file=$(find "$WORKSPACE" -maxdepth 1 -name "site-$name*.html" ! -name "*-tofix*" ! -name "*-old*" 2>/dev/null | head -1)
    fi
    if [ -z "$html_file" ]; then
        html_file=$(find "$WORKSPACE" -maxdepth 1 -name "*-$name*.html" ! -name "footer-*" ! -name "*-tofix*" ! -name "*-old*" 2>/dev/null | head -1)
    fi

    # If no specific file found, check for index.html in project folder
    if [ -z "$html_file" ]; then
        html_file=$(find "$WORKSPACE/projects" -name "site-$name*.html" 2>/dev/null | head -1)
    fi

    if [ -z "$html_file" ]; then
        echo -e "${YELLOW}  ⚠ No HTML file found for $name. Skipping.${NC}"
        return
    fi

    echo "  Source: $html_file"

    # Determine FTP target path (ftp_root is subdirectory for main-HQ sites)
    local ftp_path=""
    if [ -n "$ftp_root" ]; then
        ftp_path="${ftp_root}/"
    fi
    ftp_path="${ftp_path}index.html"

    # Upload
    local result
    result=$(curl -s -T "$html_file" "ftp://191.101.228.66/$ftp_path" \
        --user "$ftp_user:$ftp_pass" -o /dev/null -w "%{http_code}" 2>/dev/null)

    if [ "$result" = "226" ]; then
        echo -e "${GREEN}  ✅ Uploaded to /$ftp_path${NC}"
    else
        echo -e "${RED}  ❌ FTP upload failed (code: $result)${NC}"
        return
    fi

    # Verify live site shows the update
    sleep 1
    local live_check
    live_check=$(curl -s "https://$domain" | grep -c 'tiktok' 2>/dev/null || echo "0")
    if [ "$live_check" -gt 0 ]; then
        echo -e "${GREEN}  ✅ Live site verified (TikTok link found)${NC}"
    else
        echo -e "${YELLOW}  ⚠ Live site may still be cached.${NC}"
    fi
    echo ""
}

scan_site() {
    local entry="$1"
    local name=$(get_field "$entry" 1)
    local ftp_user=$(get_field "$entry" 2)
    local ftp_pass=$(get_field "$entry" 3)
    local domain=$(get_field "$entry" 5)

    echo -e "${CYAN}━━━ $name ($domain) ━━━${NC}"
    
    # FTP root listing
    local ftp_list
    ftp_list=$(curl -sL ftp://191.101.228.66/ --user "$ftp_user:$ftp_pass" 2>/dev/null)
    echo "$ftp_list" | grep -v '^d' | head -10
    
    # Live check
    local live
    live=$(curl -s "https://$domain" | head -1 | grep -oP '<title>[^<]+</title>' 2>/dev/null || echo "unreachable")
    echo "  Title: $live"
    
    # Check footer status
    local footer
    footer=$(curl -s "https://$domain" | grep -oP 'jetleechannel\.sg|tiktok|jetlee413' 2>/dev/null | sort | uniq -c | tr '\n' ' ')
    echo "  Footer: $footer"
    echo ""
}

# ---- MAIN ----
MODE="${1:-all}"

case "$MODE" in
    scan)
        echo -e "${YELLOW}=== SCANNING ALL SITES ===${NC}"
        for site in "${ALL_SITES[@]}"; do scan_site "$site"; done
        echo -e "${GREEN}=== SCAN COMPLETE ===${NC}"
        ;;
    all)
        echo -e "${YELLOW}=== DEPLOYING TO ALL SITES ===${NC}"
        for site in "${ALL_SITES[@]}"; do deploy_site "$site"; done
        echo -e "${GREEN}=== ALL DEPLOYMENTS COMPLETE ===${NC}"
        ;;
    *)
        # Single site — match by partial name
        found=0
        for site in "${ALL_SITES[@]}"; do
            name=$(get_field "$site" 1)
            if [[ "$name" == *"$MODE"* ]]; then
                deploy_site "$site"
                found=1
                break
            fi
        done
        if [ "$found" -eq 0 ]; then
            echo -e "${RED}No site matching '$MODE'${NC}"
            echo "Available: jetleechannel hudsonplace thomsonreserve lucernegrand unionsquare elta amberwood lentorgardens dunearnhouse"
            exit 1
        fi
        ;;
esac
