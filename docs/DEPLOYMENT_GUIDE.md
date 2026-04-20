# Deployment Guide - CartFlow API

## 🚀 Deploying to Render

### Prerequisites
- GitHub account with repository pushed
- Render account (create at render.com)
- MongoDB Atlas account (cloud database)
- Paystack account (for payments)

### Step 1: Setup MongoDB Atlas

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Create a database user with username and password
4. Get connection string from MongoDB Atlas
5. Whitelist your Render/Railway IP in MongoDB Atlas IP Whitelist

### Step 2: Prepare Code for Deployment

1. Ensure `package.json` has correct start script:
```json
{
  "scripts": {
    "start": "node src/index.js"
  }
}
```

2. Make sure `.env` exists locally but is in `.gitignore`
3. Push code to GitHub

### Step 3: Deploy on Render

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Fill in details:
   - **Name**: cartflow-api
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

5. Add Environment Variables (from your `.`.env` file):
```
MONGODB_URI=<your_mongodb_atlas_uri>
JWT_SECRET=<your_secret_key>
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=<your_refresh_secret>
PAYSTACK_SECRET_KEY=<your_paystack_live_key>
PAYSTACK_PUBLIC_KEY=<your_paystack_public_key>
EMAIL_USER=<your_email>
EMAIL_PASSWORD=<your_app_password>
CORS_ORIGIN=https://yourdomain.com
NODE_ENV=production
```

6. Click "Deploy Web Service"
7. Wait for deployment to complete

### Step 4: Verify Deployment

```bash
curl https://cartflow-api.onrender.com/health
```

Expected response:
```json
{
  "success": true,
  "message": "API is running"
}
```

---

## 🚀 Deploying to Railway

### Step 1: Create Railway Account

1. Go to https://railway.app
2. Sign up with GitHub
3. Create new project

### Step 2: Connect MongoDB

1. In Railway dashboard, click "Add Database"
2. Select "MongoDB"
3. Railway creates a MongoDB instance
4. Copy the connection string from configs

### Step 3: Deploy Application

1. In Railway, click "New Service" → "GitHub Repo"
2. Connect your cartflow-api repository
3. Select the repository
4. Railway auto-detects Node.js

### Step 4: Add Environment Variables

In Railway dashboard:
1. Go to your project
2. Click "Variables"
3. Add all environment variables:

```
MONGODB_URI=<your_mongodb_atlas_uri>
JWT_SECRET=<your_secret_key>
PAYSTACK_SECRET_KEY=<your_paystack_live_key>
PAYSTACK_PUBLIC_KEY=<your_paystack_public_key>
EMAIL_USER=<your_email>
EMAIL_PASSWORD=<your_app_password>
CORS_ORIGIN=https://yourdomain.com
NODE_ENV=production
```

4. Save and Railway auto-redeploys

### Step 5: Get Your API URL

In Railway:
1. Click on your service
2. Find "Domains" section
3. Your API URL: `https://cartflow-api-xxxxx.railway.app`

---

## 📊 Monitoring & Logging

### Render Logs
- Dashboard → Select Service → Logs tab
- View real-time logs and errors

### Railway Logs
- Dashboard → Your Service → Logs tab
- Filter by service

### Key Things to Monitor
- Database connection errors
- Payment gateway failures
- Email sending issues
- Rate limiting violations
- Error rates and response times

---

## 🔒 Production Security Checklist

- [ ] Use HTTPS only (automatic on Render/Railway)
- [ ] Set strong JWT_SECRET (random, 32+ characters)
- [ ] Enable MongoDB IP whitelisting for production
- [ ] Use production Paystack keys (not test keys)
- [ ] Set CORS_ORIGIN to your actual domain
- [ ] Enable rate limiting in production
- [ ] Use Helmet.js headers (already included)
- [ ] Validate all user inputs (already included)
- [ ] Hash passwords with bcrypt (already included)
- [ ] Keep dependencies updated regularly
- [ ] Use environment-specific configurations
- [ ] Setup error logging/monitoring service
- [ ] Backup MongoDB regularly

---

## 🌍 Custom Domain Setup

### On Render

1. Go to your Web Service
2. Click "Settings"
3. Under "Custom Domains", add your domain
4. Follow DNS configuration instructions
5. Wait for SSL certificate (usually 5-10 minutes)

### On Railway

1. Go to your Service
2. Click "Settings"
3. Add custom domain
4. Update DNS records with provided CNAME
5. SSL is automatic

---

## 🔧 Scaling Considerations

### Database
- MongoDB Atlas auto-scales
- Monitor storage and operations
- Consider sharding for high traffic

### API Server
- Render/Railway can scale horizontally
- Set up load balancing
- Increase dyno/instance size for better performance

### Caching
- Implement Redis for frequently accessed data
- Cache product listings (30 mins)
- Cache analytics (1 hour)

### CDN
- Consider Cloudflare for static assets
- Speeds up globally distributed requests

---

## 🐛 Common Issues & Fixes

### Issue: MongoDB Connection Failed
**Fix**: 
- Check connection string is correct
- Verify IP is whitelisted in Atlas
- Ensure database user has correct permissions
- Check network connectivity

### Issue: Paystack Payments Not Working
**Fix**:
- Verify using correct keys (test vs live)
- Check Paystack IP whitelist settings
- Verify webhook URL is accessible
- Check payment amounts are valid

### Issue: Emails Not Sending
**Fix**:
- Verify email credentials are correct
- Check if email service is active
- Enable "Less secure apps" for Gmail
- Use app-specific passwords instead

### Issue: High Memory Usage
**Fix**:
- Check for memory leaks in code
- Implement Redis caching
- Optimize database queries
- Increase server capacity

---

## 📈 Performance Optimization

### Database
```javascript
// Create indexes on frequently queried fields
db.users.createIndex({ email: 1 });
db.orders.createIndex({ user: 1, createdAt: -1 });
db.products.createIndex({ category: 1, price: 1 });
```

### Caching
```javascript
// Cache expensive queries
const products = await cacheGet('products:bestsellers');
if (!products) {
  products = await Product.find({}).sort({ sales: -1 }).limit(10);
  await cacheSet('products:bestsellers', products, 3600);
}
```

### API Optimization
- Enable gzip compression
- Minimize JSON response sizes
- Use pagination
- Implement field selection

---

## 🔄 CI/CD Pipeline

### Automated Deployment with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Render
        run: |
          curl -X POST ${{ secrets.RENDER_WEBHOOK }}
```

---

## 📞 Support & Troubleshooting

1. Check service logs first
2. Verify environment variables
3. Test database connection
4. Check firewall/network settings
5. Review error messages carefully
6. Check Render/Railway status page for outages

---

## 🚀 Next Steps After Deployment

1. Test all API endpoints
2. Verify email notifications
3. Test payment flow with test cards
4. Set up monitoring/alerting
5. Configure CDN if needed
6. Plan backup strategy
7. Document deployment process
8. Set up team access control

---

**Deployed and ready for production!** 🎉
