#!/bin/bash
# GCP SSH Key Setup Script

echo "🔑 GCP SSH Key Setup"
echo "==================="
echo ""

# Check if key already exists
if [ -f ~/.ssh/gcp_perplefina ]; then
    echo "⚠️  SSH key already exists at ~/.ssh/gcp_perplefina"
    read -p "Generate new key? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Using existing key..."
        cat ~/.ssh/gcp_perplefina.pub
        exit 0
    fi
fi

# Generate SSH key
echo "Generating SSH key..."
ssh-keygen -t rsa -f ~/.ssh/gcp_perplefina -C "perplefina-gcp" -N ""

echo ""
echo "✅ SSH key generated!"
echo ""
echo "📋 Your public key (copy this to GCP):"
echo "======================================"
cat ~/.ssh/gcp_perplefina.pub
echo ""
echo "======================================"
echo ""
echo "📝 Next steps:"
echo "1. Copy the public key above"
echo "2. Go to GCP Console → Create VM → SSH Keys section"
echo "3. Paste the key"
echo "4. Save the key to ~/.ssh/config for easy access"
echo ""
echo "💡 To add to SSH config, run:"
echo "   echo 'Host gcp-perplefina' >> ~/.ssh/config"
echo "   echo '    HostName YOUR_VM_IP' >> ~/.ssh/config"
echo "   echo '    User YOUR_USERNAME' >> ~/.ssh/config"
echo "   echo '    IdentityFile ~/.ssh/gcp_perplefina' >> ~/.ssh/config"
