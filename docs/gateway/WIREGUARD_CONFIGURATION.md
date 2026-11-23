# WireGuard configuration (prepared, not applied)

**Status:** Not installed. Tunnel to production not activated.

## Gateway (2.29.199.6) – after access

```
apt-get install -y wireguard
wg genkey | tee /etc/wireguard/privatekey | wg pubkey > /etc/wireguard/publickey
chmod 600 /etc/wireguard/privatekey
```

`/etc/wireguard/wg0.conf`:

```
[Interface]
PrivateKey = <from privatekey file, never commit>
Address = 10.10.0.2/24
ListenPort = 51820

[Peer]
# Existing server — do not activate until approved
PublicKey = <existing server public key>
AllowedIPs = 10.10.0.1/32
Endpoint = <existing public IP>:51820
PersistentKeepalive = 25
```

Do not start `wg-quick@wg0` toward production until a separate approval.
