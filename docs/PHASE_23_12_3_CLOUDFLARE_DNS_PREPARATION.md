# Phase 23.12.3 – Cloudflare DNS preparation

**Date:** 2026-11-23  
**Status:** Prepared. Not saved. Waiting for approval.

---

## Zone

- Domain: `balkanevents.org`
- Public resolvers return Cloudflare proxy addresses for the apex and `www`:
  - `104.21.79.143`
  - `172.67.146.69`
- Cloudflare API token is not available in this environment.
- Zone contents beyond public DNS were not read. No token was requested or printed.

---

## Existing `admin` record

Public lookup of `admin.balkanevents.org`: **no record**.

No conflict found in public DNS. Apex and `www` were not touched.

---

## Proposed record (not created)

| Field | Value |
|---|---|
| Type | A |
| Name | admin |
| IPv4 | 2.29.199.6 |
| Proxy | DNS only (grey cloud) |
| TTL | Auto |

Resulting name: `admin.balkanevents.org`

---

## Conflicts

None observed in public DNS.

---

## Not changed

- No DNS record created or edited
- MX, TXT, SPF, DKIM, DMARC not touched
- Apex and `www` not touched
- Cloudflare proxy not enabled
- SSL/TLS settings not changed
- No certificate issued
- Nginx not started
- Production server and API not modified
- No API token exposed

---

## Next

Approve creation of the single A record above. Nothing else will be changed.
