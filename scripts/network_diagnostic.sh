#!/bin/bash

echo "🌐 Diagnostic Réseau pour Chicha Store 🌐"

# Vérification de la résolution DNS
echo "📍 Résolution DNS :"
nslookup chicha-store.com

# Vérification de la connexion
echo -e "\n🔌 Test de Connectivité :"
ping -c 4 chicha-store.com

# Traceroute pour identifier les sauts réseau
echo -e "\n🛤️ Traceroute :"
traceroute chicha-store.com

# Informations sur la configuration réseau
echo -e "\n🖥️ Configuration Réseau :"
ifconfig | grep "inet " | grep -v 127.0.0.1

# Vérification des serveurs DNS
echo -e "\n🌐 Serveurs DNS :"
cat /etc/resolv.conf
