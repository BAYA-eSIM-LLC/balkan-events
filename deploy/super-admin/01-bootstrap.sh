#!/usr/bin/env bash
# Ubuntu 24.04 bootstrap for BALKAN EVENTS Super Admin VPS.
# Run as root on a fresh Hetzner CPX22. Does not touch any other server.
set -euo pipefail

if [[ $EUID -ne 0 ]]; then
  echo "Run as root" >&2
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get upgrade -y
apt-get install -y ca-certificates curl gnupg ufw fail2ban unattended-upgrades

# Docker
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Firewall: SSH, HTTP, HTTPS only
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# SSH hardening
sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config
systemctl reload ssh || systemctl reload sshd

# Deploy user
id -u beadmin >/dev/null 2>&1 || useradd -m -s /bin/bash beadmin
usermod -aG docker beadmin
install -d -m 700 -o beadmin -g beadmin /home/beadmin/.ssh
if [[ -f /root/.ssh/authorized_keys ]]; then
  cp /root/.ssh/authorized_keys /home/beadmin/.ssh/authorized_keys
  chown beadmin:beadmin /home/beadmin/.ssh/authorized_keys
  chmod 600 /home/beadmin/.ssh/authorized_keys
fi

echo "Bootstrap done. Log in as beadmin and continue with 02-deploy.sh"
