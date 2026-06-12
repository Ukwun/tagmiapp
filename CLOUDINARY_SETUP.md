# Cloudinary Setup Guide

## Overview
This application uses Cloudinary for media storage (images, videos, audio files). Cloudinary provides:
- Cloud-based storage
- Automatic optimization
- Video transcoding
- Thumbnail generation
- CDN delivery

## Setup Instructions

### 1. Create a Free Cloudinary Account
1. Go to [cloudinary.com](https://cloudinary.com)
2. Click "Sign Up for Free"
3. Complete the registration

### 2. Get Your Credentials
After logging in:
1. Go to your Dashboard
2. Copy the following credentials:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### 3. Configure Environment Variables
Update your `.env` file with your Cloudinary credentials:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

### 4. Test the Integration
1. Start your API server: `npm run start:dev`
2. Try uploading content through the `/content` endpoint
3. Files will be automatically uploaded to Cloudinary

## Features

### Automatic Processing
- **Images**: Auto-optimized, converted to WebP when supported
- **Videos**:
  - Transcoded to multiple formats
  - Automatic thumbnail generation
  - Eager transformations for quick loading
- **Audio**: Stored and delivered via CDN

### File Structure
Files are organized in Cloudinary folders:
- `hashtag/` - General uploads
- `hashtag/videos/` - Video uploads

### Size Limits
- Maximum file size: 100MB
- Supported formats:
  - Images: JPEG, PNG, WebP, GIF
  - Videos: MP4, WebM, QuickTime
  - Audio: MP3, WAV

## Development Mode (Optional)

If you want to test without Cloudinary during development:
1. Comment out the Cloudinary service in `content.module.ts`
2. Uncomment the local disk storage configuration
3. Files will be saved to `./uploads` directory

## Production Considerations

### Free Tier Limits
- 25 GB storage
- 25 GB bandwidth/month
- 25,000 transformations/month

### Upgrade Options
If you exceed free tier limits, consider upgrading to a paid plan on Cloudinary.

## Troubleshooting

### "Invalid credentials" error
- Double-check your API credentials in `.env`
- Ensure no extra spaces in the credentials

### Upload fails
- Check file size (max 100MB)
- Verify file type is supported
- Check Cloudinary dashboard for quota limits

### Slow uploads
- Large video files may take time to process
- Cloudinary processes videos asynchronously
- Thumbnails are generated in the background

## API Endpoints

### Upload Content
```
POST /content
Headers: Authorization: Bearer <token>
Body: multipart/form-data
Fields:
  - file: (required) The media file
  - description: (optional) Caption/description
  - tags: (optional) Array of hashtags
```

Response includes:
- `mediaUrl`: Direct URL to the uploaded file
- `thumbnailUrl`: Thumbnail URL (for videos)
- All content metadata

## Support
For Cloudinary-specific issues, visit [cloudinary.com/documentation](https://cloudinary.com/documentation)