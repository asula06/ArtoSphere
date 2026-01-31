# 🚀 ArtoSphere Deployment Guide

## Where to Host Your Project Online

Your ArtoSphere project has three components that need hosting:
1. **Backend API** (ASP.NET Core)
2. **Database** (MySQL)
3. **Frontend** (HTML/CSS/JavaScript)

---

## 🌟 RECOMMENDED OPTIONS (Free/Student Tiers)

### Option 1: Azure (Best for .NET Projects) ⭐ RECOMMENDED

**Why Azure?**
- Made by Microsoft specifically for .NET applications
- Free tier available for students (Azure for Students)
- Integrated with Visual Studio/VS Code
- $200 free credit for students

**What to Deploy:**
- **Backend**: Azure App Service (Free/Basic tier)
- **Database**: Azure Database for MySQL (Free tier available)
- **Frontend**: Azure Static Web Apps (Free)

**Steps:**
1. Sign up for [Azure for Students](https://azure.microsoft.com/en-us/free/students/)
2. Install Azure CLI: `curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash`
3. Deploy Backend:
   ```bash
   # Login to Azure
   az login
   
   # Create resource group
   az group create --name ArtoSphere --location eastus
   
   # Create App Service plan
   az appservice plan create --name ArtoSpherePlan --resource-group ArtoSphere --sku F1 --is-linux
   
   # Create web app
   az webapp create --name artosphere-api --resource-group ArtoSphere --plan ArtoSpherePlan --runtime "DOTNET|8.0"
   
   # Deploy your API
   cd ArtoSphere.API
   dotnet publish -c Release
   cd bin/Release/net8.0/publish
   zip -r publish.zip .
   az webapp deployment source config-zip --resource-group ArtoSphere --name artosphere-api --src publish.zip
   ```

4. Create MySQL Database:
   ```bash
   az mysql flexible-server create --resource-group ArtoSphere --name artosphere-db --admin-user artoadmin --admin-password YourSecurePassword123! --sku-name Standard_B1ms
   ```

5. Deploy Frontend to Azure Static Web Apps:
   ```bash
   # Install Static Web Apps CLI
   npm install -g @azure/static-web-apps-cli
   
   # Deploy (will prompt for GitHub connection)
   swa deploy --app-location . --output-location . --resource-group ArtoSphere
   ```

**Cost**: FREE for students, ~$5-10/month after credits expire

---

### Option 2: Railway (Easiest Deployment) ⚡

**Why Railway?**
- Very simple deployment
- Free $5/month credit
- Automatic HTTPS
- No credit card required initially

**Steps:**
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Connect your ArtoSphere repository
5. Railway will auto-detect .NET and deploy

**Frontend**: Deploy to Vercel or Netlify (see below)

**Cost**: $5/month free credit, then $5-10/month

---

### Option 3: Heroku (Popular Choice)

**Why Heroku?**
- Very popular platform
- Easy to use
- Free tier available (with credit card)

**Steps:**
1. Install Heroku CLI: `curl https://cli-assets.heroku.com/install.sh | sh`
2. Login: `heroku login`
3. Deploy Backend:
   ```bash
   cd ArtoSphere.API
   heroku create artosphere-api
   
   # Add buildpack for .NET
   heroku buildpacks:set https://github.com/jincod/dotnetcore-buildpack
   
   # Deploy
   git push heroku main
   ```

4. Add MySQL: `heroku addons:create jawsdb:kitefin` (MySQL addon)

**Cost**: Free tier available, then $7/month

---

### Option 4: Render (Modern Alternative)

**Why Render?**
- Free tier for web services
- Automatic SSL
- Easy GitHub integration

**Steps:**
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. New Web Service → Connect ArtoSphere.API repository
4. Set build command: `dotnet publish -c Release -o out`
5. Set start command: `dotnet out/ArtoSphere.API.dll`

**Database**: Use Render's PostgreSQL (free) or external MySQL

**Cost**: FREE for basic tier

---

## 🎨 FRONTEND HOSTING OPTIONS

Your frontend is just static files (HTML/CSS/JavaScript), so it's very easy and cheap to host!

### Option 1: Vercel (Recommended for Frontend) ⭐

**Steps:**
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Import your ArtoSphere repository
4. Set root directory to `/` (or leave default)
5. Deploy!

**Features:**
- Automatic HTTPS
- Global CDN
- Automatic deployments on git push
- Custom domains

**Cost**: FREE (unlimited bandwidth)

---

### Option 2: Netlify

**Steps:**
1. Go to [netlify.com](https://netlify.com)
2. Drag and drop your project folder
3. OR connect GitHub repository

**Cost**: FREE

---

### Option 3: GitHub Pages (100% Free)

**Steps:**
```bash
# In your ArtoSphere directory
git checkout -b gh-pages
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages
```

Then enable GitHub Pages in repository Settings → Pages → Source: gh-pages branch

**URL**: `https://yourusername.github.io/ArtoSphere`

**Cost**: FREE (but must be public repository)

---

### Option 4: Cloudflare Pages

**Steps:**
1. Go to [pages.cloudflare.com](https://pages.cloudflare.com)
2. Connect GitHub
3. Select ArtoSphere repository
4. Deploy

**Cost**: FREE (unlimited requests)

---

## 💡 COMPLETE DEPLOYMENT SETUPS

### Setup A: All Azure (Best for Learning/Resume)
- Backend: Azure App Service
- Database: Azure Database for MySQL
- Frontend: Azure Static Web Apps
- **Cost**: FREE with student account
- **Pros**: Professional setup, looks great on resume, integrated tools

### Setup B: Split Hosting (Best Free Option)
- Backend: Railway or Render
- Database: PlanetScale (free MySQL) or Railway
- Frontend: Vercel or Netlify
- **Cost**: FREE
- **Pros**: Best performance, easiest to maintain

### Setup C: Budget-Friendly
- Backend: Railway
- Database: Railway (PostgreSQL instead of MySQL)
- Frontend: Vercel
- **Cost**: ~$5/month
- **Pros**: Simple, reliable, single platform for backend+database

### Setup D: 100% Free Forever
- Backend: Render (free tier)
- Database: PlanetScale (free tier - 5GB)
- Frontend: GitHub Pages or Netlify
- **Cost**: $0
- **Cons**: Backend sleeps after inactivity (30 sec startup time)

---

## 🗄️ DATABASE-ONLY HOSTING

If you want to keep your database separate:

### PlanetScale (Recommended)
- Free 5GB MySQL database
- Serverless (scales to zero)
- Fast and reliable
- Sign up at [planetscale.com](https://planetscale.com)

### Railway
- $5/month credit includes database
- PostgreSQL or MySQL
- Easy setup

### Azure Database for MySQL
- Free tier available
- Part of Azure ecosystem

### JawsDB (Heroku Add-on)
- Free tier: 5MB
- Paid: $10/month for 1GB

---

## 📝 BEFORE DEPLOYING - CHECKLIST

### 1. Update Configuration for Production

Edit `appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Use environment variable: ${DB_CONNECTION_STRING}"
  },
  "AllowedOrigins": [
    "https://your-frontend-domain.vercel.app"
  ]
}
```

### 2. Environment Variables

Set these on your hosting platform:
- `DB_CONNECTION_STRING`: Your MySQL connection string
- `JWT_KEY`: Random secure string (generate with `openssl rand -base64 32`)
- `ASPNETCORE_ENVIRONMENT`: "Production"

### 3. Update CORS in Program.cs

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
            "https://your-frontend-domain.vercel.app",
            "https://your-custom-domain.com"
        )
        .AllowAnyMethod()
        .AllowAnyHeader();
    });
});
```

### 4. Update Frontend API URL

In `scripts/api-service.js`:
```javascript
const API_BASE_URL = window.location.hostname === 'localhost' ? 
    "http://localhost:5000/api" : 
    "https://your-api-domain.azurewebsites.net/api";
```

### 5. Add .gitignore (if not exists)
```
bin/
obj/
*.log
*.user
appsettings.Development.json
.vs/
.vscode/
node_modules/
```

---

## 🎓 MY RECOMMENDATION FOR STUDENTS

**Best Setup for School Project:**

1. **Backend + Database**: Azure (with student account)
   - Professional
   - Free with $200 credit
   - Looks impressive on resume
   - Easy to explain in presentation

2. **Frontend**: Vercel
   - Super fast
   - Automatic deployments
   - Professional URLs
   - Free forever

**Alternative if no Azure student account:**
1. Backend: Railway
2. Database: PlanetScale
3. Frontend: Vercel
All FREE!

---

## 🚀 QUICK START: Deploy to Azure (Recommended)

```bash
# 1. Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# 2. Login
az login

# 3. Create everything
az group create --name ArtoSphere --location eastus
az appservice plan create --name ArtoSpherePlan --resource-group ArtoSphere --sku F1
az webapp create --name artosphere-api-yourname --resource-group ArtoSphere --plan ArtoSpherePlan --runtime "DOTNET|8.0"
az mysql flexible-server create --resource-group ArtoSphere --name artosphere-db-yourname --admin-user artoadmin --admin-password YourSecure123!

# 4. Deploy
cd ArtoSphere.API
dotnet publish -c Release -o ./publish
cd publish
zip -r ../publish.zip .
cd ..
az webapp deployment source config-zip --resource-group ArtoSphere --name artosphere-api-yourname --src publish.zip

# 5. Update connection string (get from Azure Portal)
az webapp config connection-string set --resource-group ArtoSphere --name artosphere-api-yourname --settings DefaultConnection='your-mysql-connection-string' --connection-string-type MySql
```

Then deploy frontend to Vercel using their GitHub integration.

---

## 📱 Custom Domain (Optional)

Most platforms allow free custom domains:
1. Buy domain from Namecheap (~$10/year for .com)
2. Add CNAME records pointing to your hosting
3. Enable SSL (automatic on Vercel, Netlify, Azure)

Example: `artosphere-yourname.com` → Much more professional!

---

## 💡 TIPS FOR PRESENTATION

- Use custom domain for professional appearance
- Enable HTTPS (automatic on most platforms)
- Test all features before presentation
- Have backup plan (show localhost version if online fails)
- Prepare to explain your deployment architecture

---

## 🆘 NEED HELP?

Common issues:
1. **CORS errors**: Update AllowedOrigins in appsettings.json
2. **Database connection fails**: Check connection string and firewall rules
3. **API not found**: Update API_BASE_URL in frontend
4. **Migrations not applied**: Run `dotnet ef database update` on production

---

**Good luck with your deployment! 🚀**
