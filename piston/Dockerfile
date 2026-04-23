FROM ghcr.io/engineer-man/piston:latest

# Note: Render does not support privileged mode. 
# Piston might struggle with nsjail/sandboxing on Render.
# We set PISTON_RUN_TIMEOUT to prevent long running processes from hanging.
ENV PISTON_RUN_TIMEOUT=3000

# Pre-install common languages (highly recommended for Render Free tier)
COPY install_packages.sh /tmp/install_packages.sh
RUN chmod +x /tmp/install_packages.sh && /tmp/install_packages.sh

EXPOSE 2000
