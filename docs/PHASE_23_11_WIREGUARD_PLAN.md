# Phase 23.11 – WireGuard private link plan

**Date:** 2026-11-23  
**Status:** Plan only. No production contact. No peer added.

---

## Current gateway state

| Item | Value |
|---|---|
| Host | 2.29.199.6 |
| Interface | wg0, enabled and active |
| Address | 10.10.0.2/24 |
| Listen | 51820/udp |
| Public key | GZYpjMV/HrodW/61/T2SnQpAYjI2UQu3GI2eYEZGOVY= |
| Peer | none |
| UFW | 22, 80, 443, 51820/udp |
| Nginx | inactive |

Production 2.29.195.181 was not contacted.

---

## Target

```
Gateway 10.10.0.2  ←→  Production API 10.10.0.1
```

Gateway proxies `/admin` and `/auth` to `10.10.0.1:8000`.  
Public web and API on 2.29.195.181 stay reachable as they are today until the allow-list is approved separately.

---

## Changes required on production (not applied)

1. Install `wireguard` package.
2. Generate a key pair. Private key stays on that host.
3. Create `/etc/wireguard/wg0.conf`:

```
[Interface]
PrivateKey = <generated on production, never commit>
Address = 10.10.0.1/24
ListenPort = 51820

[Peer]
PublicKey = GZYpjMV/HrodW/61/T2SnQpAYjI2UQu3GI2eYEZGOVY=
AllowedIPs = 10.10.0.2/32
Endpoint = 2.29.199.6:51820
PersistentKeepalive = 25
```

4. Allow `51820/udp` in the production firewall. Do not change other rules.
5. `systemctl enable --now wg-quick@wg0`
6. Confirm the API process can be reached on `10.10.0.1:8000` from the gateway only.

Do not apply the `/admin` allow-list in this step.

---

## Changes on the gateway (after production peer exists)

Add a peer to `/etc/wireguard/wg0.conf`:

```
[Peer]
PublicKey = <production public key>
AllowedIPs = 10.10.0.1/32
Endpoint = 2.29.195.181:51820
PersistentKeepalive = 25
```

Then `wg syncconf wg0 <(wg-quick strip wg0)`. Do not restart unrelated services.

---

## Protecting the public API

- Public routes (`/events`, customer `/auth/login`, etc.) stay open.
- `/admin` allow-list is a later, separate approval.
- Until that approval, `/admin` remains reachable on the public API as it is today.
- Gateway does not get a database connection. It only proxies HTTP.

---

## Private link test

On the gateway, after both peers are up:

```
ping -c 3 10.10.0.1
curl -fsS -o /dev/null -w "%{http_code}\n" http://10.10.0.1:8000/health
```

Expect ping success and HTTP 200.  
Do not start gateway Nginx. Do not change DNS.

---

## Rollback

Gateway:

```
wg set wg0 peer <production-public-key> remove
```

Production:

```
systemctl stop wg-quick@wg0
```

Public web and API keep running because they do not depend on the tunnel.  
If production SSH is at risk, use the Hetzner console. Do not change SSH port.

---

## Risks

| Risk | Mitigation |
|---|---|
| Production firewall locks SSH | Add 51820 only; do not touch 22 |
| API not bound to the tunnel IP | Test `/health` before any allow-list |
| Premature `/admin` lockdown | Allow-list is a separate approval |
| Key leak | Private keys never leave the host |

---

## Order of operations (after separate approval)

1. You approve production changes.
2. Install WireGuard on 2.29.195.181.
3. Exchange public keys.
4. Bring up production `wg0`.
5. Add peer on the gateway.
6. Run the ping and `/health` test.
7. Stop. Do not start Nginx, DNS, TLS, or the allow-list.

---

## Constraints honored

No production connection, no install, no firewall change, no peer, no Nginx, no DNS, no TLS, no allow-list, no database change, no merge to main.
