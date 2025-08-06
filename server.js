// server.js - The Bodyweight Gym Online Server
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for video streaming
  crossOriginEmbedderPolicy: false
}));

// Compression for better performance
app.use(compression());

// CORS for API access
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Video metadata - Based on actual video files in public/videos
const videoDatabase = [
  {
    id: 1,
    title: "Coach Corey - Full Body Workout",
    instructor: "Coach Corey",
    duration: "45 min",
    level: "Intermediate",
    category: "Strength",
    equipment: "None",
    description: "Complete full body workout focusing on strength and conditioning.",
    thumbnail: "/images/thumbnails/Coach Corey - Full Body Workout-1280x720-avc1-mp4a.jpg",
    filename: "Coach Corey - Full Body Workout-1280x720-avc1-mp4a.mp4",
    views: 15234,
    rating: 4.8
  },
  {
    id: 2,
    title: "Coach Corey - Handstand Development",
    instructor: "Coach Corey",
    duration: "50 min",
    level: "Advanced",
    category: "Skills",
    equipment: "Wall",
    description: "Master your handstand with progressive drills and techniques.",
    thumbnail: "/images/thumbnails/Coach Corey - Handstand Development-1280x720-avc1-mp4a.jpg",
    filename: "Coach Corey - Handstand Development-1280x720-avc1-mp4a.mp4",
    views: 8765,
    rating: 4.9
  },
  {
    id: 3,
    title: "Coach Maisie - Mobility & Flexibility",
    instructor: "Coach Maisie",
    duration: "30 min",
    level: "All Levels",
    category: "Mobility",
    equipment: "None",
    description: "Improve your mobility and flexibility with this comprehensive routine.",
    thumbnail: "/images/thumbnails/Coach Maisie - Mobility & Flexibility-1280x720-avc1-mp4a.jpg",
    filename: "Coach Maisie - Mobility & Flexibility-1280x720-avc1-mp4a.mp4",
    views: 23456,
    rating: 4.7
  },
  {
    id: 4,
    title: "Coach Kelvin - Strength & Conditioning",
    instructor: "Coach Kelvin",
    duration: "40 min",
    level: "Intermediate",
    category: "Strength",
    equipment: "None",
    description: "Build strength and endurance with this conditioning workout.",
    thumbnail: "/images/thumbnails/Coach Kelvin - Strength & Conditioning-1280x720-avc1-mp4a.jpg",
    filename: "Coach Kelvin - Strength & Conditioning-1280x720-avc1-mp4a.mp4",
    views: 19876,
    rating: 4.6
  },
  {
    id: 5,
    title: "Coach Oscar - Handstand Class",
    instructor: "Coach Oscar",
    duration: "45 min",
    level: "Advanced",
    category: "Skills",
    equipment: "Wall",
    description: "Advanced handstand techniques and progressions.",
    thumbnail: "/images/thumbnails/Coach Oscar - Handstand Class-1280x720-avc1-mp4a.jpg",
    filename: "Coach Oscar - Handstand Class-1280x720-avc1-mp4a.mp4",
    views: 12345,
    rating: 4.8
  },
  {
    id: 6,
    title: "Coach Maisie - Strength Class",
    instructor: "Coach Maisie",
    duration: "35 min",
    level: "Intermediate",
    category: "Strength",
    equipment: "None",
    description: "Build strength with bodyweight exercises and progressions.",
    thumbnail: "/images/thumbnails/Coach Maisie - Strength Class-1280x720-avc1-mp4a.jpg",
    filename: "Coach Maisie - Strength Class-1280x720-avc1-mp4a.mp4",
    views: 16789,
    rating: 4.7
  },
  {
    id: 7,
    title: "Coach Corey - Bodyweight Class",
    instructor: "Coach Corey",
    duration: "40 min",
    level: "All Levels",
    category: "Strength",
    equipment: "None",
    description: "Complete bodyweight workout for all fitness levels.",
    thumbnail: "/images/thumbnails/Coach Corey - Bodyweight Class-1280x720-avc1-mp4a.jpg",
    filename: "Coach Corey - Bodyweight Class-1280x720-avc1-mp4a.mp4",
    views: 21567,
    rating: 4.6
  },
  {
    id: 8,
    title: "Coach Kelvin - Full Body Workout",
    instructor: "Coach Kelvin",
    duration: "45 min",
    level: "Intermediate",
    category: "Strength",
    equipment: "None",
    description: "Comprehensive full body workout focusing on functional movements.",
    thumbnail: "/images/thumbnails/Coach Kelvin - Full Body Workout-1280x720-avc1-mp4a.jpg",
    filename: "Coach Kelvin - Full Body Workout-1280x720-avc1-mp4a.mp4",
    views: 18923,
    rating: 4.8
  },
  {
    id: 9,
    title: "Coach Maisie - Upper Body Strength",
    instructor: "Coach Maisie",
    duration: "30 min",
    level: "Intermediate",
    category: "Strength",
    equipment: "None",
    description: "Focus on upper body strength with push-ups and variations.",
    thumbnail: "/images/thumbnails/Coach Maisie - Upper body strength-1280x720-avc1-mp4a.jpg",
    filename: "Coach Maisie - Upper body strength-1280x720-avc1-mp4a.mp4",
    views: 14567,
    rating: 4.5
  },
  {
    id: 10,
    title: "Coach Ray - Strength and Conditioning",
    instructor: "Coach Ray",
    duration: "50 min",
    level: "Advanced",
    category: "Strength",
    equipment: "None",
    description: "High-intensity strength and conditioning workout.",
    thumbnail: "/images/thumbnails/Coach Ray - Strength and Conditioning-1280x720-avc1-mp4a.jpg",
    filename: "Coach Ray - Strength and Conditioning-1280x720-avc1-mp4a.mp4",
    views: 11234,
    rating: 4.7
  },
  {
    id: 11,
    title: "Coach Mikhail - Strength Development",
    instructor: "Coach Mikhail",
    duration: "55 min",
    level: "Advanced",
    category: "Strength",
    equipment: "None",
    description: "Advanced strength development with progressions and regressions.",
    thumbnail: "/images/thumbnails/Coach Mikhail (Mik) - Strength Development-1280x720-avc1-mp4a.jpg",
    filename: "Coach Mikhail (Mik) - Strength Development-1280x720-avc1-mp4a.mp4",
    views: 9876,
    rating: 4.9
  },
  {
    id: 12,
    title: "Coach Carla - Lockdown Nutrition",
    instructor: "Coach Carla",
    duration: "25 min",
    level: "All Levels",
    category: "Nutrition",
    equipment: "None",
    description: "Nutrition tips and advice for maintaining health during lockdown.",
    thumbnail: "/images/thumbnails/Coach Carla - Lockdown Nutrition-1280x720-avc1-mp4a.jpg",
    filename: "Coach Carla - Lockdown Nutrition-1280x720-avc1-mp4a.mp4",
    views: 20345,
    rating: 4.6
  },
  {
    id: 13,
    title: "Coach Corey - Flexibility & Mobility",
    instructor: "Coach Corey",
    duration: "35 min",
    level: "All Levels",
    category: "Mobility",
    equipment: "None",
    description: "Improve flexibility and mobility with stretching and movement.",
    thumbnail: "/images/thumbnails/Coach Corey - Flexibility, Mobility, Straight arm strength-1280x720-avc1-mp4a.jpg",
    filename: "Coach Corey - Flexibility, Mobility, Straight arm strength-1280x720-avc1-mp4a.mp4",
    views: 17890,
    rating: 4.7
  },
  {
    id: 14,
    title: "Coach Maisie - Mobility Class",
    instructor: "Coach Maisie",
    duration: "30 min",
    level: "All Levels",
    category: "Mobility",
    equipment: "None",
    description: "Comprehensive mobility routine for improved movement.",
    thumbnail: "/images/thumbnails/Coach Maisie - Mobility Class-1280x720-avc1-mp4a.jpg",
    filename: "Coach Maisie - Mobility Class-1280x720-avc1-mp4a.mp4",
    views: 15678,
    rating: 4.6
  },
  {
    id: 15,
    title: "Coach Oscar - Calisthenics",
    instructor: "Coach Oscar",
    duration: "40 min",
    level: "Intermediate",
    category: "Strength",
    equipment: "None",
    description: "Calisthenics workout focusing on bodyweight strength.",
    thumbnail: "/images/thumbnails/Coach Oscar - Calisthenics-1280x720-avc1-mp4a.jpg",
    filename: "Coach Oscar - Calisthenics-1280x720-avc1-mp4a.mp4",
    views: 13456,
    rating: 4.8
  },
  {
    id: 16,
    title: "Coach Maisie - Strength & Mobility",
    instructor: "Coach Maisie",
    duration: "45 min",
    level: "Intermediate",
    category: "Strength",
    equipment: "None",
    description: "Combined strength and mobility workout for overall fitness.",
    thumbnail: "/images/thumbnails/Maisie - Strength & Mobility-1280x720-avc1-mp4a.jpg",
    filename: "Maisie - Strength & Mobility-1280x720-avc1-mp4a.mp4",
    views: 16543,
    rating: 4.7
  },
  {
    id: 17,
    title: "Coach Maisie - Upper Body Strength",
    instructor: "Coach Maisie",
    duration: "35 min",
    level: "Intermediate",
    category: "Strength",
    equipment: "None",
    description: "Focus on upper body strength and development.",
    thumbnail: "/images/thumbnails/Maisie - Upper body strength-1280x720-avc1-mp4a.jpg",
    filename: "Maisie - Upper body strength-1280x720-avc1-mp4a.mp4",
    views: 14321,
    rating: 4.6
  },
  {
    id: 18,
    title: "Coach Corey - Strength and Movement",
    instructor: "Coach Corey",
    duration: "50 min",
    level: "Advanced",
    category: "Strength",
    equipment: "None",
    description: "Advanced strength training with movement patterns.",
    thumbnail: "/images/thumbnails/Coach Corey - Strength and Movement-1280x720-avc1-mp4a (1).jpg",
    filename: "Coach Corey - Strength and Movement-1280x720-avc1-mp4a (1).mp4",
    views: 9876,
    rating: 4.8
  },
  {
    id: 19,
    title: "Coach Maisie - Mobility Class",
    instructor: "Coach Maisie",
    duration: "40 min",
    level: "All Levels",
    category: "Mobility",
    equipment: "None",
    description: "Comprehensive mobility and flexibility session.",
    thumbnail: "/images/thumbnails/Coach Maisie - Mobility class-1280x720-avc1-mp4a (2).jpg",
    filename: "Coach Maisie - Mobility class-1280x720-avc1-mp4a (2).mp4",
    views: 18765,
    rating: 4.7
  },
  {
    id: 20,
    title: "Coach Maisie - Mobility Class",
    instructor: "Coach Maisie",
    duration: "35 min",
    level: "All Levels",
    category: "Mobility",
    equipment: "None",
    description: "Mobility and flexibility routine for all levels.",
    thumbnail: "/images/thumbnails/Coach Maisie - Mobility Class-1280x720-avc1-mp4a (1).jpg",
    filename: "Coach Maisie - Mobility Class-1280x720-avc1-mp4a (1).mp4",
    views: 16543,
    rating: 4.6
  },
  {
    id: 21,
    title: "Coach Oscar - Handstand Class",
    instructor: "Coach Oscar",
    duration: "45 min",
    level: "Advanced",
    category: "Skills",
    equipment: "Wall",
    description: "Advanced handstand techniques and progressions.",
    thumbnail: "/images/thumbnails/Coach Oscar - Handstand Class-1280x720-avc1-mp4a (1).jpg",
    filename: "Coach Oscar - Handstand Class-1280x720-avc1-mp4a (1).mp4",
    views: 11234,
    rating: 4.9
  },
  {
    id: 22,
    title: "Coach Kelvin - Strength and Conditioning",
    instructor: "Coach Kelvin",
    duration: "40 min",
    level: "Intermediate",
    category: "Strength",
    equipment: "None",
    description: "Strength and conditioning workout for intermediate levels.",
    thumbnail: "/images/thumbnails/Coach Kelvin - Strength and Conditioning-1280x720-avc1-mp4a.jpg",
    filename: "Coach Kelvin - Strength and Conditioning-1280x720-avc1-mp4a.mp4",
    views: 19876,
    rating: 4.7
  },
  {
    id: 23,
    title: "Coach Corey - Strength and Movement",
    instructor: "Coach Corey",
    duration: "50 min",
    level: "Advanced",
    category: "Strength",
    equipment: "None",
    description: "Advanced strength training with movement integration.",
    thumbnail: "/images/thumbnails/Coach Corey - Strength and Movement-1280x720-avc1-mp4a.jpg",
    filename: "Coach Corey - Strength and Movement-1280x720-avc1-mp4a.mp4",
    views: 8765,
    rating: 4.8
  },
  {
    id: 24,
    title: "Coach Maisie - Mobility",
    instructor: "Coach Maisie",
    duration: "35 min",
    level: "All Levels",
    category: "Mobility",
    equipment: "None",
    description: "Mobility and flexibility routine.",
    thumbnail: "/images/thumbnails/Coach Maisie - Mobility-1280x720-avc1-mp4a.jpg",
    filename: "Coach Maisie - Mobility-1280x720-avc1-mp4a.mp4",
    views: 23456,
    rating: 4.6
  },
  {
    id: 25,
    title: "Coach Ray - Strength and Conditioning",
    instructor: "Coach Ray",
    duration: "55 min",
    level: "Advanced",
    category: "Strength",
    equipment: "None",
    description: "High-intensity strength and conditioning session.",
    thumbnail: "/images/thumbnails/Coach Ray - Strength and Conditioning-1280x720-avc1-mp4a.jpg",
    filename: "Coach Ray - Strength and Conditioning-1280x720-avc1-mp4a.mp4",
    views: 9876,
    rating: 4.8
  },
  {
    id: 26,
    title: "Coach Maisie - Mobility and Flexibility Class",
    instructor: "Coach Maisie",
    duration: "40 min",
    level: "All Levels",
    category: "Mobility",
    equipment: "None",
    description: "Comprehensive mobility and flexibility training.",
    thumbnail: "/images/thumbnails/Coach Maisie - Mobility and Flexibility Class-1280x720-avc1-mp4a (1).jpg",
    filename: "Coach Maisie - Mobility and Flexibility Class-1280x720-avc1-mp4a (1).mp4",
    views: 18765,
    rating: 4.7
  },
  {
    id: 27,
    title: "Coach Maisie - Mobility and Flexibility Class",
    instructor: "Coach Maisie",
    duration: "40 min",
    level: "All Levels",
    category: "Mobility",
    equipment: "None",
    description: "Mobility and flexibility routine for improved range of motion.",
    thumbnail: "/images/thumbnails/Coach Maisie - Mobility and Flexibility Class-1280x720-avc1-mp4a.jpg",
    filename: "Coach Maisie - Mobility and Flexibility Class-1280x720-avc1-mp4a.mp4",
    views: 16543,
    rating: 4.6
  },
  {
    id: 28,
    title: "Coach Kelvin - Strength and Conditioning Class",
    instructor: "Coach Kelvin",
    duration: "35 min",
    level: "Intermediate",
    category: "Strength",
    equipment: "None",
    description: "Strength and conditioning workout for intermediate levels.",
    thumbnail: "/images/thumbnails/Coach Kelvin - Strength and conditioning class-1280x720-avc1-mp4a.jpg",
    filename: "Coach Kelvin - Strength and conditioning class-1280x720-avc1-mp4a.mp4",
    views: 14321,
    rating: 4.7
  },
  {
    id: 29,
    title: "Coach Maisie - Flexibility and Mobility",
    instructor: "Coach Maisie",
    duration: "35 min",
    level: "All Levels",
    category: "Mobility",
    equipment: "None",
    description: "Flexibility and mobility training session.",
    thumbnail: "/images/thumbnails/Coach Maisie - Flexibiltiy and Mobility-1280x720-avc1-mp4a.jpg",
    filename: "Coach Maisie - Flexibiltiy and Mobility-1280x720-avc1-mp4a.mp4",
    views: 18765,
    rating: 4.6
  },
  {
    id: 30,
    title: "Coach Maisie - Strength Class",
    instructor: "Coach Maisie",
    duration: "35 min",
    level: "Intermediate",
    category: "Strength",
    equipment: "None",
    description: "Strength training class focusing on bodyweight exercises.",
    thumbnail: "/images/thumbnails/Coach Maisie - Strength Class-1280x720-avc1-mp4a.jpg",
    filename: "Coach Maisie - Strength Class-1280x720-avc1-mp4a.mp4",
    views: 16543,
    rating: 4.7
  },
  {
    id: 31,
    title: "Coach Corey - Handstand Class",
    instructor: "Coach Corey",
    duration: "50 min",
    level: "Advanced",
    category: "Skills",
    equipment: "Wall",
    description: "Handstand training and development class.",
    thumbnail: "/images/thumbnails/Coach Corey - Handstand class-1280x720-avc1-mp4a (1).jpg",
    filename: "Coach Corey - Handstand class-1280x720-avc1-mp4a (1).mp4",
    views: 11234,
    rating: 4.9
  },
  {
    id: 32,
    title: "Coach Ray - Strength Endurance Class",
    instructor: "Coach Ray",
    duration: "30 min",
    level: "Advanced",
    category: "Strength",
    equipment: "None",
    description: "Strength endurance training session.",
    thumbnail: "/images/thumbnails/Coach Ray - Strength Endurance class-1280x720-avc1-mp4a.jpg",
    filename: "Coach Ray - Strength Endurance class-1280x720-avc1-mp4a.mp4",
    views: 8765,
    rating: 4.8
  },
  {
    id: 33,
    title: "Coach Maisie - Mobility and Strength",
    instructor: "Coach Maisie",
    duration: "40 min",
    level: "Intermediate",
    category: "Strength",
    equipment: "None",
    description: "Combined mobility and strength training.",
    thumbnail: "/images/thumbnails/Coach Maisie - Mobility and Strength-1280x720-avc1-mp4a.jpg",
    filename: "Coach Maisie - Mobility and Strength-1280x720-avc1-mp4a.mp4",
    views: 14321,
    rating: 4.7
  },
  {
    id: 34,
    title: "Coach Kelvin - Strength & Conditioning",
    instructor: "Coach Kelvin",
    duration: "35 min",
    level: "Intermediate",
    category: "Strength",
    equipment: "None",
    description: "Strength and conditioning workout.",
    thumbnail: "/images/thumbnails/Coach Kelvin - Strength & Conditioning-1280x720-avc1-mp4a.jpg",
    filename: "Coach Kelvin - Strength & Conditioning-1280x720-avc1-mp4a.mp4",
    views: 16543,
    rating: 4.6
  },
  {
    id: 35,
    title: "Coach Oscar - Calisthenics",
    instructor: "Coach Oscar",
    duration: "40 min",
    level: "Intermediate",
    category: "Strength",
    equipment: "None",
    description: "Calisthenics workout focusing on bodyweight strength.",
    thumbnail: "/images/thumbnails/Coach Oscar - Calisthenics-1280x720-avc1-mp4a.jpg",
    filename: "Coach Oscar - Calisthenics-1280x720-avc1-mp4a.mp4",
    views: 13456,
    rating: 4.8
  },
  {
    id: 36,
    title: "Coach Maisie - Flexibility and Mobility",
    instructor: "Coach Maisie",
    duration: "35 min",
    level: "All Levels",
    category: "Mobility",
    equipment: "None",
    description: "Flexibility and mobility class for all levels.",
    thumbnail: "/images/thumbnails/Coach Maisie - Flexibility and Mobility class-1280x720-avc1-mp4a.jpg",
    filename: "Coach Maisie - Flexibility and Mobility class-1280x720-avc1-mp4a.mp4",
    views: 18765,
    rating: 4.7
  },
  {
    id: 37,
    title: "Coach Maisie - Upper Body Strength",
    instructor: "Coach Maisie",
    duration: "35 min",
    level: "Intermediate",
    category: "Strength",
    equipment: "None",
    description: "Upper body strength training session.",
    thumbnail: "/images/thumbnails/Coach Maisie - Upper body strength-1280x720-avc1-mp4a.jpg",
    filename: "Coach Maisie - Upper body strength-1280x720-avc1-mp4a.mp4",
    views: 14321,
    rating: 4.6
  },
  {
    id: 38,
    title: "Coach Mikhail - Strength Development",
    instructor: "Coach Mikhail",
    duration: "60 min",
    level: "Advanced",
    category: "Strength",
    equipment: "None",
    description: "Advanced strength development with progressions and regressions.",
    thumbnail: "/images/thumbnails/Coach Mikhail (Mik) - Strength Development-1280x720-avc1-mp4a (1).jpg",
    filename: "Coach Mikhail (Mik) - Strength Development-1280x720-avc1-mp4a (1).mp4",
    views: 8765,
    rating: 4.9
  },
  {
    id: 39,
    title: "Coach Maisie - Strength",
    instructor: "Coach Maisie",
    duration: "35 min",
    level: "Intermediate",
    category: "Strength",
    equipment: "None",
    description: "Strength training session focusing on bodyweight exercises.",
    thumbnail: "/images/thumbnails/Coach Maisie - Strength-1280x720-avc1-mp4a.jpg",
    filename: "Coach Maisie - Strength-1280x720-avc1-mp4a.mp4",
    views: 16543,
    rating: 4.7
  },
  {
    id: 40,
    title: "Coach Carla - Lockdown Nutrition",
    instructor: "Coach Carla",
    duration: "25 min",
    level: "All Levels",
    category: "Nutrition",
    equipment: "None",
    description: "Nutrition advice and tips for maintaining health during lockdown.",
    thumbnail: "/images/thumbnails/Coach Carla - Lockdown Nutrition-1280x720-avc1-mp4a.jpg",
    filename: "Coach Carla - Lockdown Nutrition-1280x720-avc1-mp4a.mp4",
    views: 20345,
    rating: 4.6
  },
  {
    id: 41,
    title: "Coach Corey - Handstand Class",
    instructor: "Coach Corey",
    duration: "50 min",
    level: "Advanced",
    category: "Skills",
    equipment: "Wall",
    description: "Handstand training and development class.",
    thumbnail: "/images/thumbnails/Coach Corey - Handstand Class-1280x720-avc1-mp4a.jpg",
    filename: "Coach Corey - Handstand Class-1280x720-avc1-mp4a.mp4",
    views: 11234,
    rating: 4.9
  },
  {
    id: 42,
    title: "Super Coach Kelvin - Strength & Conditioning",
    instructor: "Coach Kelvin",
    duration: "45 min",
    level: "Advanced",
    category: "Strength",
    equipment: "None",
    description: "Advanced strength and conditioning workout with Coach Kelvin.",
    thumbnail: "/images/thumbnails/Super Coach Kelvin - Strength & conditioning-1280x720-avc1-mp4a.jpg",
    filename: "Super Coach Kelvin - Strength & conditioning-1280x720-avc1-mp4a.mp4",
    views: 9876,
    rating: 4.8
  },
  {
    id: 43,
    title: "Coach Mikhail - Strength Development",
    instructor: "Coach Mikhail",
    duration: "70 min",
    level: "Advanced",
    category: "Strength",
    equipment: "None",
    description: "Comprehensive strength development with advanced progressions.",
    thumbnail: "/images/thumbnails/Coach Mikhail (Mik) - Strength Development-1280x720-avc1-mp4a.jpg",
    filename: "Coach Mikhail (Mik) - Strength Development-1280x720-avc1-mp4a.mp4",
    views: 7654,
    rating: 4.9
  },
  {
    id: 44,
    title: "Coach Oscar - Calisthenics",
    instructor: "Coach Oscar",
    duration: "40 min",
    level: "Intermediate",
    category: "Strength",
    equipment: "None",
    description: "Calisthenics workout focusing on bodyweight strength and skills.",
    thumbnail: "/images/thumbnails/Coach Oscar - Calisthenics-1280x720-avc1-mp4a.jpg",
    filename: "Coach Oscar - Calisthenics-1280x720-avc1-mp4a.mp4",
    views: 13456,
    rating: 4.8
  },
  {
    id: 45,
    title: "Coach Maisie - Flexibility and Mobility",
    instructor: "Coach Maisie",
    duration: "35 min",
    level: "All Levels",
    category: "Mobility",
    equipment: "None",
    description: "Flexibility and mobility training session.",
    thumbnail: "/images/thumbnails/Coach Maisie - Flexibility and mobility-1280x720-avc1-mp4a (1).jpg",
    filename: "Coach Maisie - Flexibility and mobility-1280x720-avc1-mp4a (1).mp4",
    views: 18765,
    rating: 4.7
  },
  {
    id: 46,
    title: "Coach Maisie - Upper Body Strength",
    instructor: "Coach Maisie",
    duration: "35 min",
    level: "Intermediate",
    category: "Strength",
    equipment: "None",
    description: "Upper body strength training focusing on push-ups and variations.",
    thumbnail: "/images/thumbnails/Coach Maisie - Upper body strength-1280x720-avc1-mp4a.jpg",
    filename: "Coach Maisie - Upper body strength-1280x720-avc1-mp4a.mp4",
    views: 14321,
    rating: 4.6
  },
  {
    id: 47,
    title: "Coach Mikhail - Strength Development",
    instructor: "Coach Mikhail",
    duration: "75 min",
    level: "Advanced",
    category: "Strength",
    equipment: "None",
    description: "Advanced strength development with comprehensive progressions.",
    thumbnail: "/images/thumbnails/Coach Mikhail (Mik) - Strength Development-1280x720-avc1-mp4a.jpg",
    filename: "Coach Mikhail (Mik) - Strength Development-1280x720-avc1-mp4a.mp4",
    views: 6543,
    rating: 4.9
  },
  {
    id: 48,
    title: "Coach Maisie - Flexibility & Mobility",
    instructor: "Coach Maisie",
    duration: "30 min",
    level: "All Levels",
    category: "Mobility",
    equipment: "None",
    description: "Flexibility and mobility routine for improved range of motion.",
    thumbnail: "/images/thumbnails/Coach Maisie - Flexibility & Mobility-1280x720-avc1-mp4a (2).jpg",
    filename: "Coach Maisie - Flexibility & Mobility-1280x720-avc1-mp4a (2).mp4",
    views: 16543,
    rating: 4.7
  },
  {
    id: 49,
    title: "Coach Mikhail - Handstand Development",
    instructor: "Coach Mikhail",
    duration: "60 min",
    level: "Advanced",
    category: "Skills",
    equipment: "Wall",
    description: "Advanced handstand development live from Russia.",
    thumbnail: "/images/thumbnails/Coach Mikhail - Handstand Development (live from Russia)-1280x720-avc1-mp4a.jpg",
    filename: "Coach Mikhail - Handstand Development (live from Russia)-1280x720-avc1-mp4a.mp4",
    views: 8765,
    rating: 4.9
  },
  {
    id: 50,
    title: "Coach Corey - Handstand Development",
    instructor: "Coach Corey",
    duration: "50 min",
    level: "Advanced",
    category: "Skills",
    equipment: "Wall",
    description: "Handstand development and progression training.",
    thumbnail: "/images/thumbnails/corey-handstand.jpg",
    filename: "Coach Corey - Handstand Development-1280x720-avc1-mp4a.mp4",
    views: 11234,
    rating: 4.8
  },
  {
    id: 51,
    title: "Coach Maisie - Flexibility & Mobility",
    instructor: "Coach Maisie",
    duration: "30 min",
    level: "All Levels",
    category: "Mobility",
    equipment: "None",
    description: "Flexibility and mobility training session.",
    thumbnail: "/images/thumbnails/maisie-mobility.jpg",
    filename: "Coach Maisie - Flexibility & Mobility-1280x720-avc1-mp4a (1).mp4",
    views: 18765,
    rating: 4.7
  },
  {
    id: 52,
    title: "Coach Maisie - Flexibility and Mobility",
    instructor: "Coach Maisie",
    duration: "35 min",
    level: "All Levels",
    category: "Mobility",
    equipment: "None",
    description: "Comprehensive flexibility and mobility routine.",
    thumbnail: "/images/thumbnails/maisie-mobility.jpg",
    filename: "Coach Maisie - Flexibility  and Mobility-1280x720-avc1-mp4a.mp4",
    views: 16543,
    rating: 4.6
  },
  {
    id: 53,
    title: "Coach Corey - Handstand Conditioning",
    instructor: "Coach Corey",
    duration: "45 min",
    level: "Advanced",
    category: "Skills",
    equipment: "Wall",
    description: "Handstand conditioning and strength training.",
    thumbnail: "/images/thumbnails/corey-handstand.jpg",
    filename: "Coach Corey - Handstand Conditioning-1280x720-avc1-mp4a.mp4",
    views: 9876,
    rating: 4.8
  },
  {
    id: 54,
    title: "Coach Maisie - Flexibility & Mobility",
    instructor: "Coach Maisie",
    duration: "30 min",
    level: "All Levels",
    category: "Mobility",
    equipment: "None",
    description: "Flexibility and mobility training for all levels.",
    thumbnail: "/images/thumbnails/maisie-mobility.jpg",
    filename: "Coach Maisie - Flexibility & Mobility-1280x720-avc1-mp4a.mp4",
    views: 18765,
    rating: 4.7
  },
  {
    id: 55,
    title: "Coach Corey - Full Bodyweight Class",
    instructor: "Coach Corey",
    duration: "40 min",
    level: "All Levels",
    category: "Strength",
    equipment: "None",
    description: "Complete bodyweight workout for all fitness levels.",
    thumbnail: "/images/thumbnails/corey-bodyweight.jpg",
    filename: "Coach Corey - Full Bodyweight Class-1280x720-avc1-mp4a.mp4",
    views: 21567,
    rating: 4.6
  },
  {
    id: 56,
    title: "Coach Maisie - Mobility Class",
    instructor: "Coach Maisie",
    duration: "30 min",
    level: "All Levels",
    category: "Mobility",
    equipment: "None",
    description: "Mobility class focusing on movement and flexibility.",
    thumbnail: "/images/thumbnails/maisie-mobility-class.jpg",
    filename: "Coach Maisie - Mobility Class-1280x720-avc1-mp4a.mp4",
    views: 18765,
    rating: 4.7
  },
  {
    id: 57,
    title: "Coach Corey - Bodyweight Class",
    instructor: "Coach Corey",
    duration: "40 min",
    level: "All Levels",
    category: "Strength",
    equipment: "None",
    description: "Bodyweight training class for all levels.",
    thumbnail: "/images/thumbnails/corey-bodyweight.jpg",
    filename: "Coach Corey - Bodyweight Class-1280x720-avc1-mp4a.mp4",
    views: 21567,
    rating: 4.6
  },
  {
    id: 58,
    title: "Coach Maisie - Flexibility and Mobility",
    instructor: "Coach Maisie",
    duration: "35 min",
    level: "All Levels",
    category: "Mobility",
    equipment: "None",
    description: "Flexibility and mobility training session.",
    thumbnail: "/images/thumbnails/maisie-mobility.jpg",
    filename: "Coach Maisie - Flexibility and Mobility-1280x720-avc1-mp4a.mp4",
    views: 16543,
    rating: 4.7
  },
  {
    id: 59,
    title: "Coach Corey - Flexibility, Mobility, Straight Arm Strength",
    instructor: "Coach Corey",
    duration: "35 min",
    level: "All Levels",
    category: "Mobility",
    equipment: "None",
    description: "Comprehensive flexibility, mobility, and straight arm strength training.",
    thumbnail: "/images/thumbnails/corey-flexibility.jpg",
    filename: "Coach Corey - Flexibility, Mobility, Straight arm strength-1280x720-avc1-mp4a.mp4",
    views: 17890,
    rating: 4.7
  },
  {
    id: 60,
    title: "Coach Maisie - Mobility & Flexibility",
    instructor: "Coach Maisie",
    duration: "30 min",
    level: "All Levels",
    category: "Mobility",
    equipment: "None",
    description: "Mobility and flexibility training session.",
    thumbnail: "/images/thumbnails/maisie-mobility.jpg",
    filename: "Coach Maisie - Mobility & Flexibility-1280x720-avc1-mp4a (1).mp4",
    views: 18765,
    rating: 4.6
  },
  {
    id: 61,
    title: "Coach Corey - Mobility Class",
    instructor: "Coach Corey",
    duration: "35 min",
    level: "All Levels",
    category: "Mobility",
    equipment: "None",
    description: "Mobility training class for improved movement.",
    thumbnail: "/images/thumbnails/corey-flexibility.jpg",
    filename: "Coach Corey - Mobility class-1280x720-avc1-mp4a.mp4",
    views: 16543,
    rating: 4.7
  },
  {
    id: 62,
    title: "Coach Maisie - Mobility & Flexibility",
    instructor: "Coach Maisie",
    duration: "30 min",
    level: "All Levels",
    category: "Mobility",
    equipment: "None",
    description: "Mobility and flexibility routine for all levels.",
    thumbnail: "/images/thumbnails/maisie-mobility.jpg",
    filename: "Coach Maisie - Mobility & Flexibility-1280x720-avc1-mp4a.mp4",
    views: 18765,
    rating: 4.6
  },
  {
    id: 63,
    title: "Coach Corey - Strength Training (Legs, Knees, Shoulder Focus)",
    instructor: "Coach Corey",
    duration: "40 min",
    level: "Intermediate",
    category: "Strength",
    equipment: "None",
    description: "Strength training focusing on legs, knees, and shoulder development.",
    thumbnail: "/images/thumbnails/corey-bodyweight.jpg",
    filename: "Coach Corey - Strength training (legs, knees, shoulder focus)-1280x720-avc1-mp4a.mp4",
    views: 14321,
    rating: 4.7
  },
  {
    id: 64,
    title: "Coach Mikhail - Strength Training",
    instructor: "Coach Mikhail",
    duration: "60 min",
    level: "Advanced",
    category: "Strength",
    equipment: "None",
    description: "Advanced strength training session.",
    thumbnail: "/images/thumbnails/mikhail-strength.jpg",
    filename: "strength2_mikhail (720p).mp4",
    views: 8765,
    rating: 4.9
  },
  {
    id: 65,
    title: "Coach Corey - Strength Training",
    instructor: "Coach Corey",
    duration: "45 min",
    level: "Intermediate",
    category: "Strength",
    equipment: "None",
    description: "Strength training session with Coach Corey.",
    thumbnail: "/images/thumbnails/corey-bodyweight.jpg",
    filename: "strength3_corey (720p).mp4",
    views: 11234,
    rating: 4.8
  },
  {
    id: 66,
    title: "Coach Maisie - Upper Body Strength",
    instructor: "Coach Maisie",
    duration: "50 min",
    level: "Intermediate",
    category: "Strength",
    equipment: "None",
    description: "Upper body strength training session.",
    thumbnail: "/images/thumbnails/maisie-upper-body.jpg",
    filename: "upperbodystrength_maisie (720p).mp4",
    views: 14321,
    rating: 4.7
  },
  {
    id: 67,
    title: "Coach Kelvin - Full Body Workout",
    instructor: "Coach Kelvin",
    duration: "50 min",
    level: "Intermediate",
    category: "Strength",
    equipment: "None",
    description: "Full body workout with Coach Kelvin.",
    thumbnail: "/images/thumbnails/kelvin-full-body.jpg",
    filename: "coach_kelvin_-_full_body_workout_trim (720p).mp4",
    views: 16543,
    rating: 4.8
  },
  {
    id: 68,
    title: "Coach Oscar - Handstand Training",
    instructor: "Coach Oscar",
    duration: "50 min",
    level: "Advanced",
    category: "Skills",
    equipment: "Wall",
    description: "Advanced handstand training session.",
    thumbnail: "/images/thumbnails/oscar-handstand.jpg",
    filename: "handstand3_oscar (720p).mp4",
    views: 9876,
    rating: 4.9
  },
  {
    id: 69,
    title: "Coach Corey - Strength Training",
    instructor: "Coach Corey",
    duration: "55 min",
    level: "Intermediate",
    category: "Strength",
    equipment: "None",
    description: "Strength training session with Coach Corey.",
    thumbnail: "/images/thumbnails/corey-bodyweight.jpg",
    filename: "strength4_corey (720p).mp4",
    views: 11234,
    rating: 4.8
  },
  {
    id: 70,
    title: "Coach Ray - Conditioning",
    instructor: "Coach Ray",
    duration: "40 min",
    level: "Advanced",
    category: "Strength",
    equipment: "None",
    description: "Conditioning workout with Coach Ray.",
    thumbnail: "/images/thumbnails/ray-strength.jpg",
    filename: "conditioning2_ray (720p).mp4",
    views: 8765,
    rating: 4.7
  },
  {
    id: 71,
    title: "Coach Maisie - Mobility Training",
    instructor: "Coach Maisie",
    duration: "45 min",
    level: "All Levels",
    category: "Mobility",
    equipment: "None",
    description: "Mobility training session with Coach Maisie.",
    thumbnail: "/images/thumbnails/maisie-mobility.jpg",
    filename: "mobiliy6_maisie (720p).mp4",
    views: 18765,
    rating: 4.6
  },
  {
    id: 72,
    title: "Coach Corey - Handstand Training",
    instructor: "Coach Corey",
    duration: "45 min",
    level: "Advanced",
    category: "Skills",
    equipment: "Wall",
    description: "Handstand training session with Coach Corey.",
    thumbnail: "/images/thumbnails/corey-handstand.jpg",
    filename: "handstand2_corey (720p).mp4",
    views: 11234,
    rating: 4.8
  },
  {
    id: 73,
    title: "Coach Maisie - Strength Training",
    instructor: "Coach Maisie",
    duration: "40 min",
    level: "Intermediate",
    category: "Strength",
    equipment: "None",
    description: "Strength training session with Coach Maisie.",
    thumbnail: "/images/thumbnails/maisie-strength.jpg",
    filename: "strength6_maisie (720p).mp4",
    views: 14321,
    rating: 4.7
  },
  {
    id: 74,
    title: "Coach Ray - Conditioning",
    instructor: "Coach Ray",
    duration: "40 min",
    level: "Advanced",
    category: "Strength",
    equipment: "None",
    description: "Conditioning workout with Coach Ray.",
    thumbnail: "/images/thumbnails/ray-strength.jpg",
    filename: "conditioning3_ray (720p).mp4",
    views: 8765,
    rating: 4.7
  },
  {
    id: 75,
    title: "Coach Maisie - Mobility Training",
    instructor: "Coach Maisie",
    duration: "25 min",
    level: "All Levels",
    category: "Mobility",
    equipment: "None",
    description: "Mobility training session with Coach Maisie.",
    thumbnail: "/images/thumbnails/maisie-mobility.jpg",
    filename: "mobility4_maisie (360p).mp4",
    views: 18765,
    rating: 4.6
  },
  {
    id: 76,
    title: "Coach Corey - Strength Training",
    instructor: "Coach Corey",
    duration: "40 min",
    level: "Intermediate",
    category: "Strength",
    equipment: "None",
    description: "Strength training session with Coach Corey.",
    thumbnail: "/images/thumbnails/corey-bodyweight.jpg",
    filename: "strength7_corey (720p).mp4",
    views: 11234,
    rating: 4.8
  },
  {
    id: 77,
    title: "Coach Oscar - Strength Training",
    instructor: "Coach Oscar",
    duration: "40 min",
    level: "Intermediate",
    category: "Strength",
    equipment: "None",
    description: "Strength training session with Coach Oscar.",
    thumbnail: "/images/thumbnails/oscar-calisthenics.jpg",
    filename: "strength5_oscar (720p).mp4",
    views: 9876,
    rating: 4.8
  },
  {
    id: 78,
    title: "Coach Corey - Strength Training",
    instructor: "Coach Corey",
    duration: "45 min",
    level: "Intermediate",
    category: "Strength",
    equipment: "None",
    description: "Strength training session with Coach Corey.",
    thumbnail: "/images/thumbnails/corey-bodyweight.jpg",
    filename: "strength6_corey (720p).mp4",
    views: 11234,
    rating: 4.8
  },
  {
    id: 79,
    title: "Coach Maisie - Mobility Training",
    instructor: "Coach Maisie",
    duration: "35 min",
    level: "All Levels",
    category: "Mobility",
    equipment: "None",
    description: "Mobility training session with Coach Maisie.",
    thumbnail: "/images/thumbnails/maisie-mobility.jpg",
    filename: "mobility5_maisie (720p).mp4",
    views: 18765,
    rating: 4.6
  }
];

// In-memory storage for user favorites (in production, use a database)
const userFavorites = {};

// API Routes

// Get all videos with optional filtering
app.get('/api/videos', (req, res) => {
  let filteredVideos = [...videoDatabase];
  
  const { category, level, instructor, equipment } = req.query;
  
  if (category) {
    filteredVideos = filteredVideos.filter(v => v.category === category);
  }
  if (level) {
    filteredVideos = filteredVideos.filter(v => v.level === level);
  }
  if (instructor) {
    filteredVideos = filteredVideos.filter(v => v.instructor === instructor);
  }
  if (equipment) {
    filteredVideos = filteredVideos.filter(v => v.equipment === equipment);
  }
  
  res.json(filteredVideos);
});

// Get single video details
app.get('/api/videos/:id', (req, res) => {
  const video = videoDatabase.find(v => v.id === parseInt(req.params.id));
  if (video) {
    res.json(video);
  } else {
    res.status(404).json({ error: 'Video not found' });
  }
});

// Get categories
app.get('/api/categories', (req, res) => {
  const categories = [...new Set(videoDatabase.map(v => v.category))];
  res.json(categories);
});

// Get instructors
app.get('/api/instructors', (req, res) => {
  const instructors = [...new Set(videoDatabase.map(v => v.instructor))];
  res.json(instructors);
});

// User favorites
app.post('/api/favorites/:userId/:videoId', (req, res) => {
  const { userId, videoId } = req.params;
  if (!userFavorites[userId]) {
    userFavorites[userId] = [];
  }
  if (!userFavorites[userId].includes(parseInt(videoId))) {
    userFavorites[userId].push(parseInt(videoId));
  }
  res.json({ success: true });
});

app.delete('/api/favorites/:userId/:videoId', (req, res) => {
  const { userId, videoId } = req.params;
  if (userFavorites[userId]) {
    userFavorites[userId] = userFavorites[userId].filter(id => id !== parseInt(videoId));
  }
  res.json({ success: true });
});

app.get('/api/favorites/:userId', (req, res) => {
  const { userId } = req.params;
  const favorites = userFavorites[userId] || [];
  const favoriteVideos = videoDatabase.filter(v => favorites.includes(v.id));
  res.json(favoriteVideos);
});

// Video streaming endpoint
app.get('/api/stream/:videoId', (req, res) => {
  const video = videoDatabase.find(v => v.id === parseInt(req.params.videoId));
  if (!video) {
    return res.status(404).send('Video not found');
  }
  
  // Videos are stored in the public/videos directory
  const videoPath = path.join(__dirname, 'public', 'videos', video.filename);
  
  // Check if video file exists
  if (!fs.existsSync(videoPath)) {
    return res.status(404).send('Video file not found');
  }
  
  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;
  
  if (range) {
    // Support for video seeking
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(videoPath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    };
    res.writeHead(200, head);
    fs.createReadStream(videoPath).pipe(res);
  }
});

// Increment view count
app.post('/api/videos/:id/view', (req, res) => {
  const video = videoDatabase.find(v => v.id === parseInt(req.params.id));
  if (video) {
    video.views++;
    res.json({ views: video.views });
  } else {
    res.status(404).json({ error: 'Video not found' });
  }
});

// Search endpoint
app.get('/api/search', (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.json([]);
  }
  
  const searchTerm = q.toLowerCase();
  const results = videoDatabase.filter(v => 
    v.title.toLowerCase().includes(searchTerm) ||
    v.description.toLowerCase().includes(searchTerm) ||
    v.instructor.toLowerCase().includes(searchTerm) ||
    v.category.toLowerCase().includes(searchTerm)
  );
  
  res.json(results);
});

// Stats endpoint
app.get('/api/stats', (req, res) => {
  const totalVideos = videoDatabase.length;
  const totalViews = videoDatabase.reduce((sum, v) => sum + v.views, 0);
  const categories = [...new Set(videoDatabase.map(v => v.category))].length;
  const instructors = [...new Set(videoDatabase.map(v => v.instructor))].length;
  
  res.json({
    totalVideos,
    totalViews,
    categories,
    instructors,
    totalHours: Math.round(totalVideos * 0.6) // Estimate based on average 36 min per video
  });
});

// Video player route
app.get('/video', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'video.html'));
});

// Serve the main app for all other routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🏋️ The Bodyweight Gym Online server running on port ${PORT}`);
  console.log(`📺 Ready to stream 30 hours of workout videos!`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  app.close(() => {
    console.log('HTTP server closed');
  });
});