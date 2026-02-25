# The Bodyweight Gym - Online 🏋️

A free, award-winning virtual gym platform featuring 30+ hours of professional bodyweight workout videos. Built with Node.js, Express, and modern web technologies.

## 🚀 Features

- **30+ Hours of Content**: Professional follow-along workout videos
- **No Equipment Required**: All workouts use bodyweight only
- **Smart Filtering**: Filter by category, level, instructor, or equipment
- **Progress Tracking**: Save favorites and track your workout history
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Community Focused**: Built to promote health and movement for everyone
- **Video Streaming**: Optimized video delivery with adaptive streaming
- **Modern UI/UX**: Award-winning design inspired by leading fitness platforms

## 📋 Prerequisites

- Node.js (v14.0.0 or higher)
- npm or yarn
- 30+ hours of workout videos (MP4 format)

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/the-bodyweight-gym-online.git
cd the-bodyweight-gym-online
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
PORT=3000
NODE_ENV=production
```

4. Create necessary directories:
```bash
mkdir -p public/images/thumbnails
mkdir -p public/videos
mkdir -p videos
```

5. Add your video files:
   - Place your workout videos in the `videos` directory
   - Name them as `video-1.mp4`, `video-2.mp4`, etc.
   - Add thumbnail images in `public/images/thumbnails`

## 🏃 Running the Application

### Development Mode:
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

The server will start on `http://localhost:3000`

## 📁 Project Structure

```
the-bodyweight-gym-online/
├── server.js              # Express server and API routes
├── package.json           # Project dependencies
├── public/               # Static files
│   ├── index.html        # Main application
│   ├── images/           # Images and thumbnails
│   └── videos/           # Public video assets
├── videos/               # Video files (30+ hours)
└── README.md            # This file
```

## 🎥 Video Setup

The application expects videos in the following format:

1. **File Naming**: `video-{id}.mp4` where `{id}` matches the video ID in the database
2. **Thumbnails**: Place thumbnail images in `public/images/thumbnails/`
3. **Video Metadata**: Update the `videoDatabase` array in `server.js` with your video information

Example video metadata:
```javascript
{
  id: 1,
  title: "Full Body Strength - Beginner",
  instructor: "Mat Harvey",
  duration: "30 min",
  level: "Beginner",
  category: "Strength",
  equipment: "None",
  description: "A complete full-body workout...",
  thumbnail: "/images/thumbnails/full-body-beginner.jpg",
  videoPath: "/videos/full-body-beginner.mp4",
  views: 15234,
  rating: 4.8
}
```

## 🔧 API Endpoints

- `GET /api/videos` - Get all videos with optional filtering
- `GET /api/videos/:id` - Get single video details
- `GET /api/categories` - Get all categories
- `GET /api/instructors` - Get all instructors
- `POST /api/favorites/:userId/:videoId` - Add to favorites
- `DELETE /api/favorites/:userId/:videoId` - Remove from favorites
- `GET /api/favorites/:userId` - Get user's favorites
- `GET /api/stream/:videoId` - Stream video content
- `POST /api/videos/:id/view` - Increment view count
- `GET /api/search?q=query` - Search videos
- `GET /api/stats` - Get platform statistics

## 🎨 Customization

### Colors
The color scheme can be customized in the CSS variables:
```css
:root {
  --primary-color: #0088CC;
  --primary-dark: #006699;
  --secondary-color: #00C4FF;
  --accent-color: #FF6B35;
}
```

### Categories
Add new workout categories by updating the `videoDatabase` in `server.js`

### Instructors
Add new instructors by including them in the video metadata

## 🚀 Deployment

### Using PM2 (Recommended)
```bash
npm install -g pm2
pm2 start server.js --name "bodyweight-gym"
pm2 save
pm2 startup
```

### Using Docker
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

### Environment Variables
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)

## 🔐 Security

The application includes:
- Helmet.js for security headers
- Rate limiting to prevent abuse
- CORS configuration
- Input validation
- XSS protection

## 📈 Performance

- Video streaming with byte-range support
- Compression middleware
- Client-side caching
- Lazy loading for images
- Optimized animations

## 🤝 Contributing

We welcome contributions! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

This project is licensed under the MIT License - promoting free access to fitness for everyone.

## 🙏 Acknowledgments

- Created during the 2020 COVID-19 pandemic
- Inspired by the need for accessible fitness during lockdowns
- Special thanks to all instructors: Mat Harvey, Jamie Sinclair, Andrew Kelleher, Mark Wilson

## 📞 Support

For support, questions, or feedback:
- Join our Facebook Community Group
- Email: support@thebodyweightgym.net
- GitHub Issues: [Create an issue](https://github.com/yourusername/the-bodyweight-gym-online/issues)

---

**Remember**: "The process is easy, it's the long-term application that challenges us" 💪

Built with ❤️ for the fitness community