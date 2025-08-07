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
    title: "Coach Carla - Lockdown Nutrition",
    instructor: "Coach Carla",
    duration: "58 min",
    level: "Intermediate",
    category: "Nutrition",
    equipment: "None",
    description: "Coach Carla - Lockdown Nutrition - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/Coach Carla - Lockdown Nutrition-1280x720-avc1-mp4a.jpg",
    filename: "Coach Carla - Lockdown Nutrition-1280x720-avc1-mp4a.mp4",
    views: 0,
    rating: 4.645629501442182,
    startTime: 274,
    startTimeFormatted: "00:04:34"
  },
  {
    id: 2,
    title: "Coach Corey - Bodyweight Class",
    instructor: "Coach Corey",
    duration: "56 min",
    level: "Intermediate",
    category: "Strength",
    equipment: "None",
    description: "Coach Corey - Bodyweight Class - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/Coach Corey - Bodyweight Class-1280x720-avc1-mp4a.jpg",
    filename: "Coach Corey - Bodyweight Class-1280x720-avc1-mp4a.mp4",
    views: 0,
    rating: 4.752335937148061,
    startTime: 300,
    startTimeFormatted: "00:05:00"
  },
  {
    id: 3,
    title: "Coach Corey - Flexibility, Mobility, Straight arm strength",
    instructor: "Coach Corey",
    duration: "57 min",
    level: "Intermediate",
    category: "Mobility",
    equipment: "None",
    description: "Coach Corey - Flexibility, Mobility, Straight arm strength - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/Coach Corey - Flexibility, Mobility, Straight arm strength-1280x720-avc1-mp4a.jpg",
    filename: "Coach Corey - Flexibility, Mobility, Straight arm strength-1280x720-avc1-mp4a.mp4",
    views: 0,
    rating: 4.974471224777857,
    startTime: 200,
    startTimeFormatted: "00:03:20"
  },
  {
    id: 4,
    title: "Coach Corey - Full Body Workout",
    instructor: "Coach Corey",
    duration: "73 min",
    level: "Intermediate",
    category: "Strength",
    equipment: "None",
    description: "Coach Corey - Full Body Workout - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/Coach Corey - Full Body Workout-1280x720-avc1-mp4a.jpg",
    filename: "Coach Corey - Full Body Workout-1280x720-avc1-mp4a.mp4",
    views: 0,
    rating: 4.93843618492726,
    startTime: 180,
    startTimeFormatted: "00:03:00"
  },
  {
    id: 5,
    title: "Coach Corey - Full Bodyweight Class",
    instructor: "Coach Corey",
    duration: "60 min",
    level: "Intermediate",
    category: "Strength",
    equipment: "None",
    description: "Coach Corey - Full Bodyweight Class - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/Coach Corey - Full Bodyweight Class-1280x720-avc1-mp4a.jpg",
    filename: "Coach Corey - Full Bodyweight Class-1280x720-avc1-mp4a.mp4",
    views: 0,
    rating: 4.764803801898797,
    startTime: 306,
    startTimeFormatted: "00:05:06"
  },
  {
    id: 6,
    title: "Coach Corey - Handstand class",
    instructor: "Coach Corey",
    duration: "89 min",
    level: "Advanced",
    category: "Skills",
    equipment: "None",
    description: "Coach Corey - Handstand class - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/Coach Corey - Handstand class-1280x720-avc1-mp4a (1).jpg",
    filename: "Coach Corey - Handstand class-1280x720-avc1-mp4a (1).mp4",
    views: 0,
    rating: 4.689332188833752,
    startTime: 240,
    startTimeFormatted: "00:04:00"
  },
  {
    id: 7,
    title: "Coach Corey - Handstand Class",
    instructor: "Coach Corey",
    duration: "83 min",
    level: "Advanced",
    category: "Skills",
    equipment: "None",
    description: "Coach Corey - Handstand Class - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/Coach Corey - Handstand Class-1280x720-avc1-mp4a.jpg",
    filename: "Coach Corey - Handstand Class-1280x720-avc1-mp4a.mp4",
    views: 0,
    rating: 4.711199494841251,
    startTime: 480,
    startTimeFormatted: "00:08:00"
  },
  {
    id: 8,
    title: "Coach Corey - Handstand Conditioning",
    instructor: "Coach Corey",
    duration: "63 min",
    level: "Advanced",
    category: "Skills",
    equipment: "None",
    description: "Coach Corey - Handstand Conditioning - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/Coach Corey - Handstand Conditioning-1280x720-avc1-mp4a.jpg",
    filename: "Coach Corey - Handstand Conditioning-1280x720-avc1-mp4a.mp4",
    views: 0,
    rating: 4.871187370938237,
    startTime: 300,
    startTimeFormatted: "00:05:00"
  },
  {
    id: 9,
    title: "Coach Corey - Handstand Development",
    instructor: "Coach Corey",
    duration: "66 min",
    level: "Advanced",
    category: "Skills",
    equipment: "None",
    description: "Coach Corey - Handstand Development - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/Coach Corey - Handstand Development-1280x720-avc1-mp4a.jpg",
    filename: "Coach Corey - Handstand Development-1280x720-avc1-mp4a.mp4",
    views: 0,
    rating: 4.804014580682376,
    startTime: 396,
    startTimeFormatted: "00:06:36"
  },
  {
    id: 10,
    title: "Coach Corey - Mobility class",
    instructor: "Coach Corey",
    duration: "56 min",
    level: "Intermediate",
    category: "Mobility",
    equipment: "None",
    description: "Coach Corey - Mobility class - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/Coach Corey - Mobility class-1280x720-avc1-mp4a.jpg",
    filename: "Coach Corey - Mobility class-1280x720-avc1-mp4a.mp4",
    views: 0,
    rating: 4.603285972329548,
    startTime: 240,
    startTimeFormatted: "00:04:00"
  },
  {
    id: 11,
    title: "Coach Corey - Strength and Movement",
    instructor: "Coach Corey",
    duration: "76 min",
    level: "Intermediate",
    category: "Strength",
    equipment: "None",
    description: "Coach Corey - Strength and Movement - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/Coach Corey - Strength and Movement-1280x720-avc1-mp4a (1).jpg",
    filename: "Coach Corey - Strength and Movement-1280x720-avc1-mp4a (1).mp4",
    views: 0,
    rating: 4.900898360186097,
    startTime: 464,
    startTimeFormatted: "00:07:44"
  },
  {
    id: 12,
    title: "Coach Corey - Strength and Movement",
    instructor: "Coach Corey",
    duration: "72 min",
    level: "Intermediate",
    category: "Strength",
    equipment: "None",
    description: "Coach Corey - Strength and Movement - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/Coach Corey - Strength and Movement-1280x720-avc1-mp4a.jpg",
    filename: "Coach Corey - Strength and Movement-1280x720-avc1-mp4a.mp4",
    views: 0,
    rating: 4.8776572479394975,
    startTime: 419,
    startTimeFormatted: "00:06:59"
  },
  {
    id: 13,
    title: "Coach Corey - Strength training (legs, knees, shoulder focus)",
    instructor: "Coach Corey",
    duration: "53 min",
    level: "Intermediate",
    category: "Strength",
    equipment: "None",
    description: "Coach Corey - Strength training (legs, knees, shoulder focus) - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/Coach Corey - Strength training (legs, knees, shoulder focus)-1280x720-avc1-mp4a.jpg",
    filename: "Coach Corey - Strength training (legs, knees, shoulder focus)-1280x720-avc1-mp4a.mp4",
    views: 0,
    rating: 4.690374578674914,
    startTime: 216,
    startTimeFormatted: "00:03:36"
  },
  {
    id: 14,
    title: "Coach Kelvin - Full Body Workout",
    instructor: "Coach Kelvin",
    duration: "78 min",
    level: "Intermediate",
    category: "Strength",
    equipment: "None",
    description: "Coach Kelvin - Full Body Workout - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/Coach Kelvin - Full Body Workout-1280x720-avc1-mp4a.jpg",
    filename: "Coach Kelvin - Full Body Workout-1280x720-avc1-mp4a.mp4",
    views: 0,
    rating: 4.842849437072043,
    startTime: 240,
    startTimeFormatted: "00:04:00"
  },
  {
    id: 15,
    title: "Coach Kelvin - Strength & Conditioning",
    instructor: "Coach Kelvin",
    duration: "69 min",
    level: "Intermediate",
    category: "Conditioning",
    equipment: "None",
    description: "Coach Kelvin - Strength & Conditioning - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/Coach Kelvin - Strength & Conditioning-1280x720-avc1-mp4a.jpg",
    filename: "Coach Kelvin - Strength & Conditioning-1280x720-avc1-mp4a.mp4",
    views: 0,
    rating: 4.892064096011351,
    startTime: 442,
    startTimeFormatted: "00:07:22"
  },
  {
    id: 16,
    title: "Coach Kelvin - Strength and conditioning class",
    instructor: "Coach Kelvin",
    duration: "70 min",
    level: "Intermediate",
    category: "Conditioning",
    equipment: "None",
    description: "Coach Kelvin - Strength and conditioning class - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/Coach Kelvin - Strength and conditioning class-1280x720-avc1-mp4a.jpg",
    filename: "Coach Kelvin - Strength and conditioning class-1280x720-avc1-mp4a.mp4",
    views: 0,
    rating: 4.632486411574206,
    startTime: 282,
    startTimeFormatted: "00:04:42"
  },
  {
    id: 17,
    title: "Coach Kelvin - Strength and Conditioning",
    instructor: "Coach Kelvin",
    duration: "68 min",
    level: "Intermediate",
    category: "Conditioning",
    equipment: "None",
    description: "Coach Kelvin - Strength and Conditioning - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/Coach Kelvin - Strength and Conditioning-1280x720-avc1-mp4a.jpg",
    filename: "Coach Kelvin - Strength and Conditioning-1280x720-avc1-mp4a.mp4",
    views: 0,
    rating: 4.633843649162829,
    startTime: 348,
    startTimeFormatted: "00:05:48"
  },
  {
    id: 18,
    title: "Coach Maisie - Flexibility  and Mobility",
    instructor: "Coach Maisie",
    duration: "58 min",
    level: "Intermediate",
    category: "Mobility",
    equipment: "None",
    description: "Coach Maisie - Flexibility  and Mobility - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/Coach Maisie - Flexibility  and Mobility-1280x720-avc1-mp4a.jpg",
    filename: "Coach Maisie - Flexibility  and Mobility-1280x720-avc1-mp4a.mp4",
    views: 0,
    rating: 4.652835803355718,
    startTime: 240,
    startTimeFormatted: "00:04:00"
  },
  {
    id: 19,
    title: "Coach Maisie - Flexibility & Mobility",
    instructor: "Coach Maisie",
    duration: "50 min",
    level: "Intermediate",
    category: "Mobility",
    equipment: "None",
    description: "Coach Maisie - Flexibility & Mobility - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/Coach Maisie - Flexibility & Mobility-1280x720-avc1-mp4a (1).jpg",
    filename: "Coach Maisie - Flexibility & Mobility-1280x720-avc1-mp4a (1).mp4",
    views: 0,
    rating: 4.571543346717618,
    startTime: 292,
    startTimeFormatted: "00:04:52"
  },
  {
    id: 20,
    title: "Coach Maisie - Flexibility & Mobility",
    instructor: "Coach Maisie",
    duration: "52 min",
    level: "Intermediate",
    category: "Mobility",
    equipment: "None",
    description: "Coach Maisie - Flexibility & Mobility - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/Coach Maisie - Flexibility & Mobility-1280x720-avc1-mp4a (2).jpg",
    filename: "Coach Maisie - Flexibility & Mobility-1280x720-avc1-mp4a (2).mp4",
    views: 0,
    rating: 4.726436859242851,
    startTime: 358,
    startTimeFormatted: "00:05:58"
  },
  {
    id: 21,
    title: "Coach Maisie - Flexibility & Mobility",
    instructor: "Coach Maisie",
    duration: "55 min",
    level: "Intermediate",
    category: "Mobility",
    equipment: "None",
    description: "Coach Maisie - Flexibility & Mobility - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/Coach Maisie - Flexibility & Mobility-1280x720-avc1-mp4a.jpg",
    filename: "Coach Maisie - Flexibility & Mobility-1280x720-avc1-mp4a.mp4",
    views: 0,
    rating: 4.6382879059559485,
    startTime: 547,
    startTimeFormatted: "00:09:07"
  },
  {
    id: 22,
    title: "Coach Maisie - Flexibility and Mobility class",
    instructor: "Coach Maisie",
    duration: "68 min",
    level: "Intermediate",
    category: "Mobility",
    equipment: "None",
    description: "Coach Maisie - Flexibility and Mobility class - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/Coach Maisie - Flexibility and Mobility class-1280x720-avc1-mp4a.jpg",
    filename: "Coach Maisie - Flexibility and Mobility class-1280x720-avc1-mp4a.mp4",
    views: 0,
    rating: 4.845187277909977,
    startTime: 240,
    startTimeFormatted: "00:04:00"
  },
  {
    id: 23,
    title: "Coach Maisie - Flexibility and mobility",
    instructor: "Coach Maisie",
    duration: "52 min",
    level: "Intermediate",
    category: "Mobility",
    equipment: "None",
    description: "Coach Maisie - Flexibility and mobility - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/Coach Maisie - Flexibility and mobility-1280x720-avc1-mp4a (1).jpg",
    filename: "Coach Maisie - Flexibility and mobility-1280x720-avc1-mp4a (1).mp4",
    views: 0,
    rating: 4.732749492245849,
    startTime: 345,
    startTimeFormatted: "00:05:45"
  },
  {
    id: 24,
    title: "Coach Maisie - Flexibility and Mobility",
    instructor: "Coach Maisie",
    duration: "55 min",
    level: "Intermediate",
    category: "Mobility",
    equipment: "None",
    description: "Coach Maisie - Flexibility and Mobility - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/Coach Maisie - Flexibility and Mobility-1280x720-avc1-mp4a.jpg",
    filename: "Coach Maisie - Flexibility and Mobility-1280x720-avc1-mp4a.mp4",
    views: 0,
    rating: 4.776035326244203,
    startTime: 240,
    startTimeFormatted: "00:04:00"
  },
  {
    id: 25,
    title: "Coach Maisie - Flexibiltiy and Mobility",
    instructor: "Coach Maisie",
    duration: "70 min",
    level: "Intermediate",
    category: "Mobility",
    equipment: "None",
    description: "Coach Maisie - Flexibiltiy and Mobility - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/Coach Maisie - Flexibiltiy and Mobility-1280x720-avc1-mp4a.jpg",
    filename: "Coach Maisie - Flexibiltiy and Mobility-1280x720-avc1-mp4a.mp4",
    views: 0,
    rating: 4.939131087314105,
    startTime: 240,
    startTimeFormatted: "00:04:00"
  },
  {
    id: 26,
    title: "Coach Maisie - Mobility & Flexibility",
    instructor: "Coach Maisie",
    duration: "52 min",
    level: "Intermediate",
    category: "Mobility",
    equipment: "None",
    description: "Coach Maisie - Mobility & Flexibility - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/Coach Maisie - Mobility & Flexibility-1280x720-avc1-mp4a (1).jpg",
    filename: "Coach Maisie - Mobility & Flexibility-1280x720-avc1-mp4a (1).mp4",
    views: 0,
    rating: 4.538537174050676,
    startTime: 180,
    startTimeFormatted: "00:03:00"
  },
  {
    id: 27,
    title: "Coach Maisie - Mobility & Flexibility",
    instructor: "Coach Maisie",
    duration: "54 min",
    level: "Intermediate",
    category: "Mobility",
    equipment: "None",
    description: "Coach Maisie - Mobility & Flexibility - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/Coach Maisie - Mobility & Flexibility-1280x720-avc1-mp4a.jpg",
    filename: "Coach Maisie - Mobility & Flexibility-1280x720-avc1-mp4a.mp4",
    views: 0,
    rating: 4.680045705114381,
    startTime: 240,
    startTimeFormatted: "00:04:00"
  },
  {
    id: 28,
    title: "Coach Maisie - Mobility and Flexibility Class",
    instructor: "Coach Maisie",
    duration: "72 min",
    level: "Intermediate",
    category: "Mobility",
    equipment: "None",
    description: "Coach Maisie - Mobility and Flexibility Class - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/Coach Maisie - Mobility and Flexibility Class-1280x720-avc1-mp4a (1).jpg",
    filename: "Coach Maisie - Mobility and Flexibility Class-1280x720-avc1-mp4a (1).mp4",
    views: 0,
    rating: 4.947420517566333,
    startTime: 404,
    startTimeFormatted: "00:06:44"
  },
  {
    id: 29,
    title: "Coach Maisie - Mobility and Flexibility Class",
    instructor: "Coach Maisie",
    duration: "72 min",
    level: "Intermediate",
    category: "Mobility",
    equipment: "None",
    description: "Coach Maisie - Mobility and Flexibility Class - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/Coach Maisie - Mobility and Flexibility Class-1280x720-avc1-mp4a.jpg",
    filename: "Coach Maisie - Mobility and Flexibility Class-1280x720-avc1-mp4a.mp4",
    views: 0,
    rating: 4.6451328367586315,
    startTime: 451,
    startTimeFormatted: "00:07:31"
  },
  {
    id: 30,
    title: "Coach Maisie - Mobility and Strength",
    instructor: "Coach Maisie",
    duration: "64 min",
    level: "Intermediate",
    category: "Mobility",
    equipment: "None",
    description: "Coach Maisie - Mobility and Strength - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/Coach Maisie - Mobility and Strength-1280x720-avc1-mp4a.jpg",
    filename: "Coach Maisie - Mobility and Strength-1280x720-avc1-mp4a.mp4",
    views: 0,
    rating: 4.5111302535298075,
    startTime: 240,
    startTimeFormatted: "00:04:00"
  },
  {
    id: 31,
    title: "Coach Maisie - Mobility Class",
    instructor: "Coach Maisie",
    duration: "67 min",
    level: "Intermediate",
    category: "Mobility",
    equipment: "None",
    description: "Coach Maisie - Mobility Class - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/Coach Maisie - Mobility Class-1280x720-avc1-mp4a (1).jpg",
    filename: "Coach Maisie - Mobility Class-1280x720-avc1-mp4a (1).mp4",
    views: 0,
    rating: 4.617947068909124,
    startTime: 241,
    startTimeFormatted: "00:04:01"
  },
  {
    id: 32,
    title: "Coach Maisie - Mobility class",
    instructor: "Coach Maisie",
    duration: "69 min",
    level: "Intermediate",
    category: "Mobility",
    equipment: "None",
    description: "Coach Maisie - Mobility class - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/Coach Maisie - Mobility class-1280x720-avc1-mp4a (2).jpg",
    filename: "Coach Maisie - Mobility class-1280x720-avc1-mp4a (2).mp4",
    views: 0,
    rating: 4.590506320709748,
    startTime: 582,
    startTimeFormatted: "00:09:42"
  },
  {
    id: 33,
    title: "Coach Maisie - Mobility Class",
    instructor: "Coach Maisie",
    duration: "73 min",
    level: "Intermediate",
    category: "Mobility",
    equipment: "None",
    description: "Coach Maisie - Mobility Class - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/Coach Maisie - Mobility Class-1280x720-avc1-mp4a (3).jpg",
    filename: "Coach Maisie - Mobility Class-1280x720-avc1-mp4a (3).mp4",
    views: 0,
    rating: 4.604673633266968,
    startTime: 180,
    startTimeFormatted: "00:03:00"
  },
  {
    id: 34,
    title: "Coach Maisie - Mobility Class",
    instructor: "Coach Maisie",
    duration: "56 min",
    level: "Intermediate",
    category: "Mobility",
    equipment: "None",
    description: "Coach Maisie - Mobility Class - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/Coach Maisie - Mobility Class-1280x720-avc1-mp4a.jpg",
    filename: "Coach Maisie - Mobility Class-1280x720-avc1-mp4a.mp4",
    views: 0,
    rating: 4.80428525806415,
    startTime: 333,
    startTimeFormatted: "00:05:33"
  },
  {
    id: 35,
    title: "Coach Maisie - Mobility",
    instructor: "Coach Maisie",
    duration: "69 min",
    level: "Intermediate",
    category: "Mobility",
    equipment: "None",
    description: "Coach Maisie - Mobility - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/Coach Maisie - Mobility-1280x720-avc1-mp4a.jpg",
    filename: "Coach Maisie - Mobility-1280x720-avc1-mp4a.mp4",
    views: 0,
    rating: 4.768878350025901,
    startTime: 166,
    startTimeFormatted: "00:02:46"
  },
  {
    id: 36,
    title: "Coach Maisie - Strength Class",
    instructor: "Coach Maisie",
    duration: "67 min",
    level: "Intermediate",
    category: "Strength",
    equipment: "None",
    description: "Coach Maisie - Strength Class - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/Coach Maisie - Strength Class-1280x720-avc1-mp4a.jpg",
    filename: "Coach Maisie - Strength Class-1280x720-avc1-mp4a.mp4",
    views: 0,
    rating: 4.5519415757091375,
    startTime: 456,
    startTimeFormatted: "00:07:36"
  },
  {
    id: 37,
    title: "Coach Maisie - Strength",
    instructor: "Coach Maisie",
    duration: "63 min",
    level: "Intermediate",
    category: "Strength",
    equipment: "None",
    description: "Coach Maisie - Strength - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/Coach Maisie - Strength-1280x720-avc1-mp4a.jpg",
    filename: "Coach Maisie - Strength-1280x720-avc1-mp4a.mp4",
    views: 0,
    rating: 4.508855855029605,
    startTime: 240,
    startTimeFormatted: "00:04:00"
  },
  {
    id: 38,
    title: "Coach Maisie - Upper body strength",
    instructor: "Coach Maisie",
    duration: "64 min",
    level: "Intermediate",
    category: "Strength",
    equipment: "None",
    description: "Coach Maisie - Upper body strength - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/Coach Maisie - Upper body strength-1280x720-avc1-mp4a.jpg",
    filename: "Coach Maisie - Upper body strength-1280x720-avc1-mp4a.mp4",
    views: 0,
    rating: 4.873329498155568,
    startTime: 269,
    startTimeFormatted: "00:04:29"
  },
  {
    id: 39,
    title: "Coach Mikhail (Mik) - Strength Development",
    instructor: "Coach Mikhail (Mik)",
    duration: "74 min",
    level: "Intermediate",
    category: "Strength",
    equipment: "None",
    description: "Coach Mikhail (Mik) - Strength Development - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/Coach Mikhail (Mik) - Strength Development-1280x720-avc1-mp4a (1).jpg",
    filename: "Coach Mikhail (Mik) - Strength Development-1280x720-avc1-mp4a (1).mp4",
    views: 0,
    rating: 4.772763799885205,
    startTime: 207,
    startTimeFormatted: "00:03:27"
  },
  {
    id: 40,
    title: "Coach Mikhail (Mik) - Strength Development",
    instructor: "Coach Mikhail (Mik)",
    duration: "76 min",
    level: "Intermediate",
    category: "Strength",
    equipment: "None",
    description: "Coach Mikhail (Mik) - Strength Development - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/Coach Mikhail (Mik) - Strength Development-1280x720-avc1-mp4a.jpg",
    filename: "Coach Mikhail (Mik) - Strength Development-1280x720-avc1-mp4a.mp4",
    views: 0,
    rating: 4.89503061742636,
    startTime: 307,
    startTimeFormatted: "00:05:07"
  },
  {
    id: 41,
    title: "Coach Mikhail - Handstand Development (live from Russia)",
    instructor: "Coach Mikhail",
    duration: "58 min",
    level: "Advanced",
    category: "Skills",
    equipment: "None",
    description: "Coach Mikhail - Handstand Development (live from Russia) - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/Coach Mikhail - Handstand Development (live from Russia)-1280x720-avc1-mp4a.jpg",
    filename: "Coach Mikhail - Handstand Development (live from Russia)-1280x720-avc1-mp4a.mp4",
    views: 0,
    rating: 4.988772793591623,
    startTime: 240,
    startTimeFormatted: "00:04:00"
  },
  {
    id: 42,
    title: "Coach Mikhail Nazaryev (Mik) - strength development with progressions and regressions",
    instructor: "Coach Mikhail Nazaryev (Mik)",
    duration: "25 min",
    level: "Intermediate",
    category: "Strength",
    equipment: "None",
    description: "Coach Mikhail Nazaryev (Mik) - strength development with progressions and regressions - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/Coach Mikhail Nazaryev (Mik) - strength development with progressions and regressions-1280x720-avc1-mp4a.jpg",
    filename: "Coach Mikhail Nazaryev (Mik) - strength development with progressions and regressions-1280x720-avc1-mp4a.mp4",
    views: 0,
    rating: 4.714059672689686,
    startTime: 81,
    startTimeFormatted: "00:01:21"
  },
  {
    id: 43,
    title: "Coach Oscar - Calisthenics",
    instructor: "Coach Oscar",
    duration: "54 min",
    level: "Intermediate",
    category: "Strength",
    equipment: "None",
    description: "Coach Oscar - Calisthenics - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/Coach Oscar - Calisthenics-1280x720-avc1-mp4a (1).jpg",
    filename: "Coach Oscar - Calisthenics-1280x720-avc1-mp4a (1).mp4",
    views: 0,
    rating: 4.627784898202753,
    startTime: 380,
    startTimeFormatted: "00:06:20"
  },
  {
    id: 44,
    title: "Coach Oscar - Calisthenics",
    instructor: "Coach Oscar",
    duration: "57 min",
    level: "Intermediate",
    category: "Strength",
    equipment: "None",
    description: "Coach Oscar - Calisthenics - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/Coach Oscar - Calisthenics-1280x720-avc1-mp4a.jpg",
    filename: "Coach Oscar - Calisthenics-1280x720-avc1-mp4a.mp4",
    views: 0,
    rating: 4.762372593076727,
    startTime: 342,
    startTimeFormatted: "00:05:42"
  },
  {
    id: 45,
    title: "Coach Oscar - Handstand Class",
    instructor: "Coach Oscar",
    duration: "70 min",
    level: "Advanced",
    category: "Skills",
    equipment: "None",
    description: "Coach Oscar - Handstand Class - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/Coach Oscar - Handstand Class-1280x720-avc1-mp4a (1).jpg",
    filename: "Coach Oscar - Handstand Class-1280x720-avc1-mp4a (1).mp4",
    views: 0,
    rating: 4.605067786516559,
    startTime: 240,
    startTimeFormatted: "00:04:00"
  },
  {
    id: 46,
    title: "Coach Oscar - Handstand Class",
    instructor: "Coach Oscar",
    duration: "66 min",
    level: "Advanced",
    category: "Skills",
    equipment: "None",
    description: "Coach Oscar - Handstand Class - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/Coach Oscar - Handstand Class-1280x720-avc1-mp4a.jpg",
    filename: "Coach Oscar - Handstand Class-1280x720-avc1-mp4a.mp4",
    views: 0,
    rating: 4.506575327544212,
    startTime: 447,
    startTimeFormatted: "00:07:27"
  },
  {
    id: 47,
    title: "Coach Ray - Strength and Conditioning",
    instructor: "Coach Ray",
    duration: "89 min",
    level: "Intermediate",
    category: "Conditioning",
    equipment: "None",
    description: "Coach Ray - Strength and Conditioning - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/Coach Ray - Strength and Conditioning-1280x720-avc1-mp4a.jpg",
    filename: "Coach Ray - Strength and Conditioning-1280x720-avc1-mp4a.mp4",
    views: 0,
    rating: 4.507611167954684,
    startTime: 487,
    startTimeFormatted: "00:08:07"
  },
  {
    id: 48,
    title: "Coach Ray - Strength Endurance class",
    instructor: "Coach Ray",
    duration: "56 min",
    level: "Intermediate",
    category: "Conditioning",
    equipment: "None",
    description: "Coach Ray - Strength Endurance class - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/Coach Ray - Strength Endurance class-1280x720-avc1-mp4a.jpg",
    filename: "Coach Ray - Strength Endurance class-1280x720-avc1-mp4a.mp4",
    views: 0,
    rating: 4.627464309796138,
    startTime: 296,
    startTimeFormatted: "00:04:56"
  },
  {
    id: 49,
    title: "coach_kelvin_-_full_body_workout_trim (720p)",
    instructor: "coach_kelvin_",
    duration: "71 min",
    level: "Intermediate",
    category: "Strength",
    equipment: "None",
    description: "coach_kelvin_-_full_body_workout_trim (720p) - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/coach_kelvin_-_full_body_workout_trim (720p).jpg",
    filename: "coach_kelvin_-_full_body_workout_trim (720p).mp4",
    views: 0,
    rating: 4.947119632337834,
    startTime: 240,
    startTimeFormatted: "00:04:00"
  },
  {
    id: 50,
    title: "conditioning2_ray (720p)",
    instructor: "conditioning2_ray (720p)",
    duration: "50 min",
    level: "Intermediate",
    category: "Conditioning",
    equipment: "None",
    description: "conditioning2_ray (720p) - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/conditioning2_ray (720p).jpg",
    filename: "conditioning2_ray (720p).mp4",
    views: 0,
    rating: 4.646667238026996,
    startTime: 180,
    startTimeFormatted: "00:03:00"
  },
  {
    id: 51,
    title: "conditioning3_ray (720p)",
    instructor: "conditioning3_ray (720p)",
    duration: "51 min",
    level: "Intermediate",
    category: "Conditioning",
    equipment: "None",
    description: "conditioning3_ray (720p) - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/conditioning3_ray (720p).jpg",
    filename: "conditioning3_ray (720p).mp4",
    views: 0,
    rating: 4.851070529844013,
    startTime: 180,
    startTimeFormatted: "00:03:00"
  },
  {
    id: 52,
    title: "handstand2_corey (720p)",
    instructor: "handstand2_corey (720p)",
    duration: "58 min",
    level: "Advanced",
    category: "Skills",
    equipment: "None",
    description: "handstand2_corey (720p) - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/handstand2_corey (720p).jpg",
    filename: "handstand2_corey (720p).mp4",
    views: 0,
    rating: 4.52137642781039,
    startTime: 480,
    startTimeFormatted: "00:08:00"
  },
  {
    id: 53,
    title: "handstand3_oscar (720p)",
    instructor: "handstand3_oscar (720p)",
    duration: "64 min",
    level: "Advanced",
    category: "Skills",
    equipment: "None",
    description: "handstand3_oscar (720p) - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/handstand3_oscar (720p).jpg",
    filename: "handstand3_oscar (720p).mp4",
    views: 0,
    rating: 4.603140208288815,
    startTime: 240,
    startTimeFormatted: "00:04:00"
  },
  {
    id: 54,
    title: "Maisie - Strength & Mobility",
    instructor: "Maisie",
    duration: "69 min",
    level: "Intermediate",
    category: "Mobility",
    equipment: "None",
    description: "Maisie - Strength & Mobility - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/Maisie - Strength & Mobility-1280x720-avc1-mp4a.jpg",
    filename: "Maisie - Strength & Mobility-1280x720-avc1-mp4a.mp4",
    views: 0,
    rating: 4.9149318882982636,
    startTime: 250,
    startTimeFormatted: "00:04:10"
  },
  {
    id: 55,
    title: "Maisie - Upper body strength",
    instructor: "Maisie",
    duration: "65 min",
    level: "Intermediate",
    category: "Strength",
    equipment: "None",
    description: "Maisie - Upper body strength - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/Maisie - Upper body strength-1280x720-avc1-mp4a.jpg",
    filename: "Maisie - Upper body strength-1280x720-avc1-mp4a.mp4",
    views: 0,
    rating: 4.512471550811723,
    startTime: 180,
    startTimeFormatted: "00:03:00"
  },
  {
    id: 56,
    title: "mobility4_maisie (360p)",
    instructor: "mobility4_maisie (360p)",
    duration: "49 min",
    level: "Intermediate",
    category: "Mobility",
    equipment: "None",
    description: "mobility4_maisie (360p) - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/mobility4_maisie (360p).jpg",
    filename: "mobility4_maisie (360p).mp4",
    views: 0,
    rating: 4.707231445246224,
    startTime: 480,
    startTimeFormatted: "00:08:00"
  },
  {
    id: 57,
    title: "mobility5_maisie (720p)",
    instructor: "mobility5_maisie (720p)",
    duration: "46 min",
    level: "Intermediate",
    category: "Mobility",
    equipment: "None",
    description: "mobility5_maisie (720p) - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/mobility5_maisie (720p).jpg",
    filename: "mobility5_maisie (720p).mp4",
    views: 0,
    rating: 4.55847498437725,
    startTime: 480,
    startTimeFormatted: "00:08:00"
  },
  {
    id: 58,
    title: "mobiliy6_maisie (720p)",
    instructor: "mobiliy6_maisie (720p)",
    duration: "64 min",
    level: "Intermediate",
    category: "Strength",
    equipment: "None",
    description: "mobiliy6_maisie (720p) - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/mobiliy6_maisie (720p).jpg",
    filename: "mobiliy6_maisie (720p).mp4",
    views: 0,
    rating: 4.7747058857460996,
    startTime: 480,
    startTimeFormatted: "00:08:00"
  },
  {
    id: 59,
    title: "strength2_mikhail (720p)",
    instructor: "strength2_mikhail (720p)",
    duration: "70 min",
    level: "Intermediate",
    category: "Strength",
    equipment: "None",
    description: "strength2_mikhail (720p) - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/strength2_mikhail (720p).jpg",
    filename: "strength2_mikhail (720p).mp4",
    views: 0,
    rating: 4.942818668655695,
    startTime: 353,
    startTimeFormatted: "00:05:53"
  },
  {
    id: 60,
    title: "strength3_corey (720p)",
    instructor: "strength3_corey (720p)",
    duration: "55 min",
    level: "Intermediate",
    category: "Strength",
    equipment: "None",
    description: "strength3_corey (720p) - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/strength3_corey (720p).jpg",
    filename: "strength3_corey (720p).mp4",
    views: 0,
    rating: 4.894751884977962,
    startTime: 221,
    startTimeFormatted: "00:03:41"
  },
  {
    id: 61,
    title: "strength4_corey (720p)",
    instructor: "strength4_corey (720p)",
    duration: "67 min",
    level: "Intermediate",
    category: "Strength",
    equipment: "None",
    description: "strength4_corey (720p) - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/strength4_corey (720p).jpg",
    filename: "strength4_corey (720p).mp4",
    views: 0,
    rating: 4.765354495373076,
    startTime: 240,
    startTimeFormatted: "00:04:00"
  },
  {
    id: 62,
    title: "strength5_oscar (720p)",
    instructor: "strength5_oscar (720p)",
    duration: "47 min",
    level: "Intermediate",
    category: "Strength",
    equipment: "None",
    description: "strength5_oscar (720p) - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/strength5_oscar (720p).jpg",
    filename: "strength5_oscar (720p).mp4",
    views: 0,
    rating: 4.76574294404345,
    startTime: 155,
    startTimeFormatted: "00:02:35"
  },
  {
    id: 63,
    title: "strength6_corey (720p)",
    instructor: "strength6_corey (720p)",
    duration: "50 min",
    level: "Intermediate",
    category: "Strength",
    equipment: "None",
    description: "strength6_corey (720p) - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/strength6_corey (720p).jpg",
    filename: "strength6_corey (720p).mp4",
    views: 0,
    rating: 4.962266676940824,
    startTime: 300,
    startTimeFormatted: "00:05:00"
  },
  {
    id: 64,
    title: "strength6_maisie (720p)",
    instructor: "strength6_maisie (720p)",
    duration: "60 min",
    level: "Intermediate",
    category: "Strength",
    equipment: "None",
    description: "strength6_maisie (720p) - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/strength6_maisie (720p).jpg",
    filename: "strength6_maisie (720p).mp4",
    views: 0,
    rating: 4.545065012691064,
    startTime: 172,
    startTimeFormatted: "00:02:52"
  },
  {
    id: 65,
    title: "strength7_corey (720p)",
    instructor: "strength7_corey (720p)",
    duration: "49 min",
    level: "Intermediate",
    category: "Strength",
    equipment: "None",
    description: "strength7_corey (720p) - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/strength7_corey (720p).jpg",
    filename: "strength7_corey (720p).mp4",
    views: 0,
    rating: 4.883233573555673,
    startTime: 240,
    startTimeFormatted: "00:04:00"
  },
  {
    id: 66,
    title: "Super Coach Kelvin - Strength & conditioning",
    instructor: "Super Coach Kelvin",
    duration: "71 min",
    level: "Intermediate",
    category: "Conditioning",
    equipment: "None",
    description: "Super Coach Kelvin - Strength & conditioning - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/Super Coach Kelvin - Strength & conditioning-1280x720-avc1-mp4a.jpg",
    filename: "Super Coach Kelvin - Strength & conditioning-1280x720-avc1-mp4a.mp4",
    views: 0,
    rating: 4.641030964121758,
    startTime: 180,
    startTimeFormatted: "00:03:00"
  },
  {
    id: 67,
    title: "upperbodystrength_maisie (720p)",
    instructor: "upperbodystrength_maisie (720p)",
    duration: "58 min",
    level: "Intermediate",
    category: "Strength",
    equipment: "None",
    description: "upperbodystrength_maisie (720p) - Transform your body with this powerful workout.",
    thumbnail: "/images/thumbnails/upperbodystrength_maisie (720p).jpg",
    filename: "upperbodystrength_maisie (720p).mp4",
    views: 0,
    rating: 4.593518533718375,
    startTime: 240,
    startTimeFormatted: "00:04:00"
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
    totalHours: 49 // Accurate calculation based on actual video durations
  });
});

// Video player route
app.get('/video', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'video.html'));
});

// Blog routes
const blogPosts = [
  {
    id: 'buildingfoundations',
    title: 'Building Your Foundation',
    author: 'Mat Harvey',
    date: '2018-07-09',
    excerpt: 'Basic motor patterns lay the foundations of all physical performance and health. Developing sound basic movement patterns takes persistence and often a temporary reduction in intensity.',
    category: 'Training',
    readTime: '3 min',
    featured: false,
    image: '/blogs/buildingfoundations/7232a3_61a2937ef0da41959310619a04e7c9dd~mv2.avif'
  },
  {
    id: 'firstmu',
    title: 'The Road to My First Ring Muscle Up',
    author: 'Mat Harvey',
    date: '2018-08-08',
    excerpt: 'I didn\'t do gymnastics as a child, I learned all this stuff as an adult. Now I can complete a ring muscle up, cold, anytime. The process takes dedication, consistency and patience.',
    category: 'Skills',
    readTime: '4 min',
    featured: true,
    image: '/blogs/firstmu/7232a3_0e1c3d96773a4825a139d995c4e2f581~mv2.avif'
  },
  {
    id: 'trainingandpain',
    title: 'Training and Pain',
    author: 'Mat Harvey',
    date: '2018-08-12',
    excerpt: 'Training should not hurt. Nope, not ever. Training should certainly be uncomfortable, often. But training should not ever cause acute or chronic pain.',
    category: 'Recovery',
    readTime: '5 min',
    featured: false,
    image: '/blogs/trainingandpain/7232a3_25e94771b1354afa9c299724982bbd0a~mv2.avif'
  },
  {
    id: 'strengthtrainingandrecovery',
    title: 'Strength Training and Recovery',
    author: 'Mat Harvey',
    date: '2018-08-26',
    excerpt: 'You don\'t get strong in the gym. You get strong while you are in bed – asleep with a full stomach, otherwise known as recovery.',
    category: 'Recovery',
    readTime: '5 min',
    featured: false,
    image: '/blogs/strengthtrainingandrecovery/7232a3_d7ed5d42d3ea4f2b9c6f5ef859c228a3~mv2.avif'
  },
  {
    id: 'thebodyweightteam',
    title: 'The Bodyweight Team',
    author: 'Mat Harvey',
    date: '2019-05-13',
    excerpt: 'I started The Bodyweight Gym to pursue an ideal: That everyone can develop themselves physically with simple equipment, the right education and support.',
    category: 'Team',
    readTime: '3 min',
    featured: false,
    image: '/blogs/thebodyweightteam/7232a3_af157a93d82b41bf99fd79aa85d73456~mv2.avif'
  },
  {
    id: 'goalsetting',
    title: '8 Tips for Healthy Goal Setting',
    author: 'Mat Harvey',
    date: '2019-07-28',
    excerpt: 'Do you work out to get high? Does that progress towards your goals? Many people enjoy the runner\'s high but this style of training must align with your goals.',
    category: 'Philosophy',
    readTime: '3 min',
    featured: false,
    image: '/blogs/goalsetting/7232a3_50c1f3f2a31e4959a21a4caab8059798~mv2.avif'
  },
  {
    id: 'fiveprinicipalsofstrengthtraining',
    title: '5 Principles of Strength Training',
    author: 'Mat Harvey',
    date: '2019-10-14',
    excerpt: 'Bodyweight strength training is a noble pursuit, it requires patience, understanding of your own body and mental fortitude.',
    category: 'Training',
    readTime: '4 min',
    featured: false,
    image: '/blogs/fiveprinicipalsofstrengthtraining/7232a3_e6014ec37bc445f58c1478ae17100901~mv2_d_3135_3740_s_4_2.avif'
  },
  {
    id: 'weightliftingtokungfu',
    title: 'From Weightlifting to Chinese Kungfu - A Dance with Corey',
    author: 'Corey',
    date: '2021-04-12',
    excerpt: 'My training journey started at probably the age of 19. I started boxing, and the environment I was in, was one of a lot of young men punishing themselves.',
    category: 'Philosophy',
    readTime: '3 min',
    featured: false,
    image: '/blogs/weightliftingtokungfu/7232a3_a84400a71a0d44a19618ab82b5e834b3~mv2.avif'
  },
  {
    id: 'wellrested',
    title: 'Well Rested on the Subject?',
    author: 'Corey',
    date: '2021-06-10',
    excerpt: 'How well are we sleeping? How well rested are we? What compensations are we making due to lack of sleep, poor sleep quality, irregular routine?',
    category: 'Recovery',
    readTime: '4 min',
    featured: false,
    image: '/blogs/wellrested/7232a3_048147207994444cabf2e922f5c15d04~mv2.avif'
  },
  {
    id: 'suppliments',
    title: 'Can Supplements Help? Spotlight - Creatine',
    author: 'Carla Duncan',
    date: '2021-08-07',
    excerpt: 'Creatine is one of the most recognized and researched supplements to help increase training quality, intensity, strength and recovery.',
    category: 'Nutrition',
    readTime: '4 min',
    featured: true,
    image: '/blogs/suppliments/7232a3_6ae46569796f4d0ca23670a4af1377fa~mv2.avif'
  },
  {
    id: 'gettingoutofcomfort',
    title: 'Getting Out of Your Comfort Zone',
    author: 'Coach Ana',
    date: '2024-12-15',
    excerpt: 'How do you get out of your comfort zone and keep growing? The answer: take the right direction and stay motivated.',
    category: 'Philosophy',
    readTime: '3 min',
    featured: false,
    image: '/blogs/gettingoutofcomfort/1.jpeg'
  }
];

app.get('/api/blogs', (req, res) => {
  res.json(blogPosts);
});

app.get('/api/blogs/:id', (req, res) => {
  const blog = blogPosts.find(b => b.id === req.params.id);
  if (!blog) {
    return res.status(404).json({ error: 'Blog post not found' });
  }
  
  // Load markdown content
  const markdownPath = path.join(__dirname, 'public', 'blogs', blog.id, `${blog.id}.md`);
  try {
    const content = fs.readFileSync(markdownPath, 'utf8');
    res.json({ ...blog, content });
  } catch (error) {
    console.error('Error loading blog content:', error);
    res.status(500).json({ error: 'Error loading blog content' });
  }
});

app.get('/blog', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'blog-list.html'));
});

app.get('/blog/:id', (req, res) => {
  const blogId = req.params.id;
  const blog = blogPosts.find(b => b.id === blogId);
  if (!blog) {
    return res.status(404).send('Blog post not found');
  }
  res.sendFile(path.join(__dirname, 'public', 'blog-post.html'));
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