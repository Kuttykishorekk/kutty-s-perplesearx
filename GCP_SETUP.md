# Google Cloud Platform (GCP) Setup Guide

## 🎓 GitHub Student Pack Benefits
- **$300 in credits** (valid for 90 days)
- Perfect for testing and deployment!

---

## Step 1: Claim GCP Credits

1. Go to https://education.github.com/pack
2. Find **"Google Cloud"** → Click **"Get Offer"**
3. Sign up with your GitHub account
4. Verify student status
5. Get **$300 credit** (valid 90 days)

---

## Step 2: Create GCP Project

1. Go to https://console.cloud.google.com
2. Click **"Select a project"** → **"New Project"**
3. **Project name:** `perplefina-deployment`
4. Click **"Create"**
5. Wait for project creation (30 seconds)

---

## Step 3: Enable Billing (Uses Credits)

1. Go to **Billing** in left menu
2. Click **"Link a billing account"**
3. Create new billing account (uses your $300 credits)
4. Link it to your project

**Note:** You won't be charged until credits run out!

---

## Step 4: Create VM Instance

### 4.1 Navigate to Compute Engine

1. Go to **Compute Engine** → **VM instances**
2. Click **"Create Instance"**

### 4.2 Configure Instance

**Basic Settings:**
- **Name:** `perplefina-server`
- **Region:** Choose closest to you (e.g., `us-central1`)
- **Zone:** Any (e.g., `us-central1-a`)

**Machine Configuration:**
- **Machine family:** General-purpose
- **Machine type:** **e2-micro** (Free tier eligible!)
  - 1 vCPU, 1GB RAM
  - **Cost:** ~$7/month (covered by $300 credit = ~42 months free!)

**Boot Disk:**
- **Operating System:** Ubuntu
- **Version:** Ubuntu 22.04 LTS
- **Boot disk type:** Standard persistent disk
- **Size:** 10GB (free tier) or 20GB (recommended)

**Firewall:**
- ✅ **Allow HTTP traffic**
- ✅ **Allow HTTPS traffic**

### 4.3 SSH Key Setup

**Option 1: Generate New Key (Recommended)**
```bash
# On your local machine
ssh-keygen -t rsa -f ~/.ssh/gcp_perplefina -C "perplefina"
cat ~/.ssh/gcp_perplefina.pub
```

**Option 2: Use Existing Key**
```bash
cat ~/.ssh/id_rsa.pub
```

Copy the public key output.

### 4.4 Add SSH Key to GCP

1. In GCP console, scroll down to **"SSH Keys"**
2. Click **"Add Item"**
3. Paste your public key
4. Click **"Create"**

---

## Step 5: Get Your VM IP Address

1. Wait for VM to start (1-2 minutes)
2. Note the **External IP** (e.g., `34.123.45.67`)
3. This is your server IP!

---

## Step 6: Test SSH Connection

```bash
# If you used the new key
ssh -i ~/.ssh/gcp_perplefina your-username@34.123.45.67

# Or if using default key
ssh your-username@34.123.45.67
```

**Username format:** Usually your GCP account email or `your-email_gmail_com`

---

## Step 7: Configure Firewall Rules

GCP needs explicit firewall rules for custom ports.

1. Go to **VPC Network** → **Firewall**
2. Click **"Create Firewall Rule"**
3. **Name:** `perplefina-ports`
4. **Direction:** Ingress
5. **Targets:** All instances in the network
6. **Source IP ranges:** `0.0.0.0/0`
7. **Protocols and ports:** 
   - ✅ TCP
   - **Ports:** `3000, 4000, 8080`
8. Click **"Create"**

---

## Step 8: Update Kamal Configuration

Edit `config/deploy.yml`:

```yaml
servers:
  web:
    - 34.123.45.67  # Your GCP VM External IP

proxy:
  host: perplefina.your-domain.com  # Or use IP if no domain
  ssl: true  # Set to false if no domain

# For GCP, you might need to specify SSH user
ssh:
  user: your-username  # Your GCP username
```

---

## Step 9: Deploy with Kamal

```bash
cd /home/kutty/Github/kutty-s-perplesearx
export PATH="$HOME/.local/share/gem/ruby/3.4.0/bin:$PATH"

# First time: Setup (installs Docker on VM)
kamal setup

# Deploy
kamal deploy
```

---

## 💰 Cost Breakdown

- **e2-micro:** ~$7/month
- **10GB disk:** ~$1.70/month
- **Network egress:** Free up to 1GB/month
- **Total:** ~$8.70/month
- **With $300 credit:** ~34 months free! 🎉

---

## 🔧 Useful GCP Commands (if using gcloud CLI)

```bash
# Install gcloud CLI (optional)
# https://cloud.google.com/sdk/docs/install

# View VM details
gcloud compute instances describe perplefina-server

# Start/Stop VM
gcloud compute instances start perplefina-server
gcloud compute instances stop perplefina-server

# View logs
gcloud compute instances get-serial-port-output perplefina-server
```

---

## ⚠️ Important Notes

1. **Free Tier:** e2-micro is free tier eligible (but still uses credits)
2. **Auto-shutdown:** VMs run 24/7 unless stopped
3. **IP Address:** External IP changes if VM is stopped (use static IP for production)
4. **Billing Alerts:** Set up billing alerts to avoid surprises

---

## 🎯 Quick Checklist

- [ ] Claim GCP credits from GitHub Student Pack
- [ ] Create GCP project
- [ ] Enable billing (uses credits)
- [ ] Create VM instance (e2-micro, Ubuntu 22.04)
- [ ] Add SSH key
- [ ] Get External IP
- [ ] Configure firewall rules (ports 3000, 4000, 8080)
- [ ] Test SSH connection
- [ ] Update `config/deploy.yml` with IP
- [ ] Run `kamal setup && kamal deploy`

Ready to deploy! 🚀
