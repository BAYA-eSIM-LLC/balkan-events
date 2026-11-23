#!/usr/bin/env bash
# BALKAN EVENTS Super Admin Gateway installer.
# Ubuntu 24.04 on a fresh Hetzner CPX22. Does not touch any other server.
# Idempotent where practical.
set -euo pipefail

if [[ $EUID -ne 0 ]]; then
  echo "Run as root" >&2
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get upgrade -y
apt-get install -y ca-certificates curl gnupg ufw fail2ban unattended-upgrades \
  wireguard nginx certbot python3-certbot-nginx

# Deploy user
id -u beadmin >/dev/null 2>&1 || useradd -m -s /bin/bash beadmin
install -d -m 700 -o beadmin -g beadmin /home/beadmin/.ssh
if [[ -f /root/.ssh/authorized_keys && ! -f /home/beadmin/.ssh/authorized_keys ]]; then
  cp /root/.ssh/authorized_keys /home/beadmin/.ssh/authorized_keys
  chown beadmin:beadmin /home/beadmin/.ssh/authorized_keys
  chmod 600 /home/beadmin/.ssh/authorized_keys
fi

# SSH hardening
sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config
systemctl reload ssh || systemctl reload sshd

# Firewall. WireGuard UDP included. No other ports.
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 51820/udp comment 'WireGuard'
ufw --force enable

# This host is a gateway only. Do not install Postgres or Redis here.
echo "Gateway base ready."
echo "Next: generate WireGuard keys, fill /etc/wireguard/wg0.conf, then nginx."
