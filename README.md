# 🎯 Kannada Speech Assessment Tool

A full-stack web application for assessing speech development in Kannada-speaking children using SODA (Schedule of Developing Articulation) analysis.

## 🚀 Quick Deploy to Render.com (FREE)

### Prerequisites

- GitHub account
- MongoDB Atlas account (free tier)
- AWS S3 bucket (free tier)

### Deploy in 3 Steps:

#### 1. Clone and Setup

```bash
git clone https://github.com/YOUR_USERNAME/kannada-speech.git
cd kannada-speech
npm install
```

#### 2. Configure Environment Variables

Create `.env` file (never commit this!):

```
MONGODB_URI=your_mongodb_connection_string
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET=your_bucket_name
AWS_REGION=your_region
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
JWT_SECRET=your_generated_secret
NODE_ENV=production
PORT=3000
PYTHON_BACKEND_URL=http://localhost:5000
FFMPEG_PATH=/usr/bin/ffmpeg
ALLOWED_ORIGINS=https://your-app.onrender.com
```

**Generate JWT Secret:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

#### 3. Deploy to Render

1. Push your code to GitHub
2. Go to [Render.com](https://render.com) and sign up (free)
3. Click **New → Web Service**
4. Connect your GitHub repository
5. Configure:
   - **Runtime**: Docker
   - **Dockerfile**: `./Dockerfile.combined`
   - **Plan**: Free
6. Add all environment variables from `.env`
7. Click **Deploy**

Your app will be live at: `https://your-app.onrender.com`

## 🏗️ Architecture

- **Frontend**: HTML, CSS, JavaScript (Kannada UI)
- **Backend**: Node.js (Express) + Python (Flask)
- **Database**: MongoDB Atlas
- **Storage**: AWS S3
- **Deployment**: Docker on Render.com

## 📦 Features

- ✅ Admin dashboard for therapists
- ✅ Child profile management
- ✅ Audio recording and playback
- ✅ SODA analysis (Kannada phonemes)
- ✅ Progress tracking and reports
- ✅ Cloud storage for audio files
- ✅ Secure authentication (JWT)

## 🔧 Local Development

### Run with Docker:

```bash
docker-compose up -d --build
```

Visit: http://localhost:3000

### Run without Docker:

```bash
# Terminal 1 - Node.js
npm start

# Terminal 2 - Python
cd backend
pip install -r requirements.txt
python app.py
```

## 📊 Free Tier Limits

| Service       | Free Tier          |
| ------------- | ------------------ |
| Render.com    | 750 hours/month    |
| MongoDB Atlas | 512 MB storage     |
| AWS S3        | 5 GB for 12 months |

## 🔒 Security Notes

- **Never commit `.env`** - Contains sensitive credentials
- **Rotate AWS keys** if accidentally exposed
- **Use strong passwords** for admin accounts
- **Keep JWT secret secure**

## 🆘 Troubleshooting

### App not starting on Render?

- Check logs in Render dashboard
- Verify all environment variables are set
- Ensure MongoDB Atlas allows connections from `0.0.0.0/0`

### Build failed?

- Check `Dockerfile.combined` syntax
- Verify `package.json` and `requirements.txt`

### Can't upload audio?

- Verify AWS credentials are correct
- Check S3 bucket permissions
- Ensure bucket region matches `AWS_REGION`

## 📱 Keep App Awake (Optional)

Free tier apps sleep after 15 minutes of inactivity.

Use [UptimeRobot](https://uptimerobot.com) (free) to ping every 5 minutes:

1. Create account
2. Add HTTP monitor with your Render URL
3. Set interval to 5 minutes

## 📚 Tech Stack

- **Node.js 18+** - Backend API server
- **Python 3.11** - SODA analysis engine
- **MongoDB** - Data persistence
- **AWS S3** - Audio file storage
- **Docker** - Containerization
- **Express** - Web framework
- **Flask** - Python web framework
- **FFmpeg** - Audio processing

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is for educational and research purposes.

## 👥 Authors

Speech-Language Pathology Research Team

## 🙏 Acknowledgments

- SODA framework developers
- Kannada language resources
- MongoDB Atlas and AWS free tiers
- Render.com hosting platform

---

**Need help?** Open an issue on GitHub or check the documentation.

**Ready to deploy?** Follow the 3-step guide above! 🚀
