# TOOLS.md - Local Notes

## Site Summary (verified 2026-06-20)
- **All 8 sites footer standardized**: jetleechannel.sg + TikTok link ✅
- **Lentor Gardens FTP password unknown** — site is live & working, skip
- **Thomson Reserve** — redirects to thomson-reserve-direct-developer.com (intentional)
- **Server**: 191.101.228.66 (same Hostinger server for all below)
- **Deploy script**: `bash /home/ubuntu/.openclaw/workspace/deploy.sh`

## FTP Details (verified 2026-06-20)

| Site | User | Pass | Web Root |
|------|------|------|----------|
| jetleechannel.sg | u851958941.jetleechannel.sg | Jetleechannel87649315$ | `/` (root FTP dir, NOT public_html!) |
| hudsonplace | u851958941.hudsonplace.jetleechannel.sg | Hudsonplace87649315$ | `/` |
| thomsonreserve | u851958941.thomsonreserve.jetleechannel.sg | Thomson87649315$ | `/` (redirects to thomson-reserve-direct-developer.com) |
| lucernegrand | u851958941.lucernegrand.jetleechannel.sg | Lucerngrand87649315$ | `/` |
| unionsquare | u851958941.unionsquare.jetleechannel.sg | Unionsquare87649315$ | `/` |
| eltasingapore | u851958941.eltasingapore.jetleechannel.sg | Elta87649315$ | `/` (NOT public_html!) |
| amberwood | u851958941.amberwood.jetleechannel.sg | Amberwood123$ | `/` |
| lentorgardens | u851958941.lentorgardens.jetleechannel.sg | Password unknown — site working skip | — |

## Hostinger (Dunearn House)
- Site: dunearnhouse.jetleechannel.sg
- FTP: u851958941.dunearnhouse.jetleechannel.sg / Dunearnhouse87649315$
- Root: /public_html
- Footer already has jetleechannel.sg + TikTok ✅
- Deploy: bash deploy.sh dunearnhouse

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.

## Related

- [Agent workspace](/concepts/agent-workspace)
