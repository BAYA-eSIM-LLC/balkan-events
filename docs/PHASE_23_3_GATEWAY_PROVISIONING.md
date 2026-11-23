# Phase 23.3 – Gateway VPS Provisioning Preparation

**Date:** 2026-11-23  
**Base:** 0b611c7  
**Target:** Hetzner CPX22, 2 vCPU, 4 GB, 80 GB, Helsinki, Ubuntu 24.04  
**Status:** Plan and scripts only. No purchase. No execution.

---

## 1. Purchase plan (you do this)

1. Hetzner Cloud → Add Server.
2. Location: Helsinki.
3. Image: Ubuntu 24.04.
4. Type: CPX22 (2 vCPU, 4 GB, 80 GB).
5. SSH key: paste the public key from step 2.
6. Name: `balkan-admin-gateway`.
7. Do not enable backups yet if you prefer the encrypted off-site path.
8. Note the public IP. Do not send it here.

Estimated cost: ~€9–12/mo plus ~€0.50 IPv4 if charged separately.

---

## 2. SSH key on iPhone

App: Termius or Blink Shell.

1. Keys → Generate → Ed25519 → name `balkan-admin-gateway`.
2. Copy the public key (starts with `ssh-ed25519`).
3. Paste it into the Hetzner order form.
4. Private key stays in the app. Never email it.

---

## 3. First login and install

1. Termius → New Host → IP, user `root`, key `balkan-admin-gateway`.
2. Connect.
3. Run:
   ```
   curl -fsSL https://raw.githubusercontent.com/BAYA-eSIM-LLC/balkan-events/super-admin-dashboard/deploy/gateway/install-gateway.sh | bash
   ```
4. Reconnect as `beadmin` for later steps if you prefer.

---

## 4. WireGuard

On the **gateway**:
```
wg genkey | tee /etc/wireguard/privatekey | wg pubkey > /etc/wireguard/publickey
chmod 600 /etc/wireguard/privatekey
cat /etc/wireguard/publickey
```
Copy the public key. Fill `/etc/wireguard/wg0.conf` from `deploy/gateway/wireguard-gateway.conf`:
- Address `10.10.0.2/24`
- PrivateKey from the file
- Peer = existing server public key and public IP

On the **existing server** (separate approval, do not do yet):
- Generate its key pair the same way.
- Add the peer from `deploy/gateway/wireguard-existing.conf`.
- Address `10.10.0.1/24`.

Start on gateway:
```
systemctl enable --now wg-quick@wg0
```

---

## 5. Nginx

Copy `deploy/gateway/nginx-gateway.conf` to `/etc/nginx/sites-available/admin`.
Replace `admin.example` and confirm upstream `10.10.0.1:8000`.
Enable the site, obtain a certificate only after DNS is approved:
```
certbot --nginx -d admin.<domain>
```
Do not change DNS until you approve it.

---

## 6. Firewall and Docker

- UFW: 22, 80, 443, 51820/udp. Applied by the installer.
- This host runs no Postgres, Redis or app containers.
- Do not publish any other port.
- Docker is not required on the gateway.

---

## 7. Monitoring and backup

Cron as root:
```
*/5 * * * * /home/beadmin/monitor.sh
```
Gateway config backup: copy `/etc/wireguard` and `/etc/nginx` to your password manager or encrypted off-site store. There is no database on this host.

---

## 8. Private link test

On the gateway, after WireGuard is up on both sides:
```
./test-private-link.sh 10.10.0.1
```
Expect ping success and an HTTP response from the API.  
**Do not apply the `/admin` allow-list on the existing server until this passes.**

---

## 9. Rollback

```
./rollback-gateway.sh
```
Stops WireGuard and Nginx on the gateway only. Existing web and API keep running. Destroy the VPS in the Hetzner console if you abandon it.

---

## 10. Order of operations

1. You approve this plan.
2. You order the CPX22 in Helsinki.
3. Run `install-gateway.sh`.
4. Exchange WireGuard public keys.
5. Bring up WireGuard on both hosts (existing host change needs its own approval).
6. Run `test-private-link.sh`.
7. Only then apply the `/admin` allow-list.
8. DNS and certificate after you approve the name.
9. MFA stays optional until `mfa-integration-test.sh` has passed on a Docker host.

---

## Constraints honored

- No automatic purchase
- Existing server not modified
- DNS not changed
- Admin allow-list not applied
- MFA not enforced
- No production deploy
- No merge to main
