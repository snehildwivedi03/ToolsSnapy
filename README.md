# ToolSnapy

**Your privacy, guaranteed.** A collection of fast, free, privacy-first online tools that run entirely in your browser. No tracking, no cloud uploads, no data collection  ever.

<p align="center">
  <img src="frontend/public/favicon.png" alt="ToolSnapy Logo" width="80" height="80">
</p>

## Mission

ToolSnapy was built with a simple philosophy: **tools should work for you, not collect data about you.**

In an era where every online service tracks, stores, and monetizes user data, ToolSnapy takes a different approach. All file processing happens locally in your browser using modern Web APIs. Your files never leave your device, your data is never logged, and your privacy is never compromised.

**You upload. You work. You leave. Until next time.**

## Features

### Image Tools
- **Resize to Target Size**  Compress images to an exact file size (e.g., 200 KB)
- **Background Remover**  AI-powered background removal, runs entirely in-browser
- **Image Resizer**  Resize to exact pixel dimensions with aspect ratio lock
- **Image Converter**  Convert between PNG, JPG, WebP, AVIF, and SVG
- **Image to Text (OCR)**  Extract text from images using optical character recognition

### PDF Tools
- **Merge PDF**  Combine multiple PDFs into one document
- **Split & Extract PDF**  Pull specific pages from a PDF
- **Images to PDF**  Convert images into a single PDF document
- **PDF to Images**  Export PDF pages as PNG or JPG images

### Instant Share
- **Share Text**  Share text snippets with a 6-character code
- **Share Files**  Upload and share files (up to 500 MB)
- **Share Images**  Share images instantly
- **Share PDFs**  Share PDF documents
- **Receive Content**  Retrieve shared content using a code

*All shared content auto-deletes after 15 minutes.*

### Calculators
- Age & Date Calculator
- Percentage Calculator
- Scientific Calculator
- BMI Calculator
- Calorie Calculator
- EMI Calculator
- SIP Calculator
- Tip & Bill Splitter
- Discount Calculator

### Text Tools
- Word Counter
- Text Case Converter
- Text Encoder/Decoder
- Lorem Ipsum Generator
- Find & Replace
- Text Diff Checker

### Utilities & Dev Tools
- QR Code Generator
- Barcode Generator
- Password Generator
- UUID Generator
- JSON Formatter
- Color Converter
- Unit Converter
- Unix Timestamp Converter
- Hash Generator
- Base64 Encoder/Decoder
- URL Encoder/Decoder
- Live Clock
- Pomodoro Timer

## Privacy & Security

ToolSnapy is built with security and privacy as core principles:

| Feature | Description |
|---------|-------------|
| **No Tracking** | Zero analytics, cookies, or fingerprinting |
| **No Cloud Processing** | All file operations run locally in your browser |
| **No Data Storage** | Files are never uploaded or stored on servers |
| **No History** | Your inputs and files are never logged |
| **Security Headers** | Helmet.js with CSP, HSTS, X-Frame-Options |
| **Rate Limiting** | Protection against API abuse |
| **Auto-Cleanup** | Shared content auto-deletes after 15 minutes |

## Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for blazing-fast development
- **React Router** for navigation
- **CSS Modules** for scoped styling
- **pdf-lib** & **pdfjs-dist** for PDF processing
- **@imgly/background-removal** for AI background removal
- **tesseract.js** for OCR text extraction

### Backend
- **Express 5** with TypeScript
- **Helmet** for security headers
- **Rate limiting** for API protection
- **Compression** for response optimization
- **Multer** for file uploads

## Installation

### Prerequisites
- Node.js 18+ 
- npm 9+

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/toolsnapy.git
   cd toolsnapy
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   
   # Frontend
   cp frontend/.env.example frontend/.env
   ```

4. **Start development servers**
   ```bash
   # Terminal 1 - Backend (from backend folder)
   npm run dev
   
   # Terminal 2 - Frontend (from frontend folder)
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5173
   ```

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `CLIENT_ORIGIN` | CORS origin | `*` |
| `RATE_LIMIT_MAX` | Max requests/window | `100` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` |
| `MAX_FILE_SIZE` | Max upload size (bytes) | `52428800` |
| `UPLOADS_DIR` | Uploads directory | `uploads` |
| `SHARE_EXPIRY_MS` | Share expiry time | `900000` |
| `CLEANUP_INTERVAL_MS` | Cleanup interval | `300000` |

### Frontend (`frontend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | *(empty = use proxy)* |
| `VITE_ENABLE_ADS` | Enable ad slots | `false` |
| `VITE_GA_MEASUREMENT_ID` | Google Analytics ID | *(empty)* |
| `VITE_APP_NAME` | App name | `ToolSnapy` |
| `VITE_CONTACT_EMAIL` | Contact email | `support@toolsnapy.com` |

## Project Structure

```
toolsnapy/
├── backend/
│   ├── src/
│   │   ├── app.ts           # Express app setup
│   │   ├── server.ts        # Server entry point
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── middleware/      # Express middleware
│   ├── uploads/             # Temporary file storage
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components by category
│   │   ├── routes/          # Route definitions
│   │   ├── services/        # API clients
│   │   ├── styles/          # Global styles
│   │   └── data/            # Static data & registries
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md
```

## Deployment

### Production Build

```bash
# Build frontend
cd frontend
npm run build

# Build backend (if using TypeScript compilation)
cd ../backend
npm run build
```

### Environment Configuration for Production

1. Set `NODE_ENV=production` in backend
2. Set `CLIENT_ORIGIN` to your frontend domain
3. Set `VITE_API_URL` to your backend URL
4. Configure proper rate limiting values

### Recommended Production Setup
- Use a reverse proxy (nginx, Caddy)
- Enable HTTPS
- Set up proper CORS origins
- Configure a process manager (PM2)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

---

<p align="center">
  <strong>Built for speed, built for privacy.</strong>
  <br>
  <br>
  No tracking · No history · No saves.
  <br>
  <em>You exit, we exit.</em>
</p>
