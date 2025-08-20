# Video Optimization Guide for Lazy Loaders

## Current Implementation
- **Starter Video**: `/Assets/lazy loaders/Lazy Loader - starter 1.mp4` (shown on first visit)
- **Casual Video**: `/Assets/lazy loaders/lazy loader - casual.mp4` (shown during route transitions)

## Recommended Optimizations

### 1. Video Compression Settings
To optimize your lazy loader videos for faster loading:

```bash
# For starter video (longer, more detailed)
ffmpeg -i "Lazy Loader - starter 1.mp4" \
  -c:v libx264 -crf 28 -preset medium \
  -c:a aac -b:a 128k \
  -movflags +faststart \
  -vf "scale=1280:720" \
  "starter-optimized.mp4"

# For casual video (shorter, faster loading)
ffmpeg -i "lazy loader - casual.mp4" \
  -c:v libx264 -crf 30 -preset medium \
  -c:a aac -b:a 96k \
  -movflags +faststart \
  -vf "scale=960:540" \
  "casual-optimized.mp4"
```

### 2. Target File Sizes
- **Starter video**: Aim for 2-4MB (max 5MB)
- **Casual video**: Aim for 500KB-1MB (max 2MB)

### 3. Duration Recommendations
- **Starter video**: 3-5 seconds (loops seamlessly)
- **Casual video**: 1-2 seconds (quick transition)

### 4. Alternative Formats
Consider creating WebM versions for better compression:

```bash
# WebM version (better compression)
ffmpeg -i "input.mp4" \
  -c:v libvp9 -crf 35 -b:v 0 \
  -c:a libopus -b:a 96k \
  -vf "scale=1280:720" \
  "output.webm"
```

### 5. Progressive Enhancement
The component will:
1. Try to load WebM first (if available)
2. Fallback to MP4
3. Show loading spinner if video fails

### 6. Performance Tips
- Use `preload="none"` for casual loader
- Use `preload="metadata"` for starter loader
- Implement lazy loading for route transitions
- Cache videos in service worker for returning visitors

## Current Loading Behavior
- **First visit**: Shows starter video with branding
- **Subsequent sessions**: No loading screen (uses sessionStorage)
- **Route changes**: Shows casual loader for transitions

## File Structure
```
/Assets/lazy loaders/
├── Lazy Loader - starter 1.mp4
├── lazy loader - casual.mp4
├── starter-optimized.mp4 (recommended)
├── casual-optimized.mp4 (recommended)
├── starter-optimized.webm (optional)
└── casual-optimized.webm (optional)
```
