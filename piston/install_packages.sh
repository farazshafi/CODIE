#!/bin/bash
# Script to pre-install common Piston packages during Docker build

# Create packages directory
mkdir -p /piston/packages

# Function to install a package
install_pkg() {
    local lang=$1
    local version=$2
    echo "Installing $lang ($version)..."
    mkdir -p "/piston/packages/$lang/$version"
    curl -L "https://github.com/engineer-man/piston/releases/download/pkgs/${lang}-${version}.tar.gz" | tar -xzC "/piston/packages/$lang/$version"
}

# Install common languages
install_pkg "python" "3.10.0"
install_pkg "node" "18.15.0"
install_pkg "java" "15.0.2"
install_pkg "c" "10.2.0"
install_pkg "cpp" "10.2.0"

echo "Package installation complete."
