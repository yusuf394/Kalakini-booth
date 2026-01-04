// Photo strip generator module
class PhotoStripManager {
    constructor() {
        this.stripCanvas = null;
        this.photos = [];
    }

    init(canvasId) {
        this.stripCanvas = document.getElementById(canvasId);
    }

    // Add photo to collection
    addPhoto(photoData) {
        this.photos.push(photoData);
    }

    // Clear photos
    clearPhotos() {
        this.photos = [];
    }

    // Generate 3-strip photo
    async generateStrip(filterType = 'none') {
        if (this.photos.length !== 3) {
            throw new Error('Harus ada tepat 3 foto untuk membuat strip');
        }

        const canvas = this.stripCanvas;
        const ctx = canvas.getContext('2d');
        
        // Strip dimensions (standard photobooth: 2" x 6" ratio)
        const stripWidth = 600;
        const stripHeight = 1800; // 3 photos x 600px each
        const photoHeight = stripHeight / 3;
        const borderWidth = 4;
        
        canvas.width = stripWidth;
        canvas.height = stripHeight;
        
        // White background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, stripWidth, stripHeight);
        
        // Process and draw each photo
        for (let i = 0; i < 3; i++) {
            const photoImg = new Image();
            
            await new Promise((resolve, reject) => {
                photoImg.onload = () => {
                    // Create temporary canvas for photo processing
                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = stripWidth;
                    tempCanvas.height = photoHeight;
                    const tempCtx = tempCanvas.getContext('2d');
                    
                    // Calculate scaling to fill width while maintaining aspect ratio
                    const scale = Math.max(
                        stripWidth / photoImg.width,
                        photoHeight / photoImg.height
                    );
                    const scaledWidth = photoImg.width * scale;
                    const scaledHeight = photoImg.height * scale;
                    const offsetX = (stripWidth - scaledWidth) / 2;
                    const offsetY = (photoHeight - scaledHeight) / 2;
                    
                    // Draw photo
                    tempCtx.fillStyle = '#000000';
                    tempCtx.fillRect(0, 0, stripWidth, photoHeight);
                    tempCtx.drawImage(photoImg, offsetX, offsetY, scaledWidth, scaledHeight);
                    
                    // Apply beauty filter if needed
                    if (!filterManager.isAnimationFilter(filterType) && filterType !== 'none') {
                        const filtered = filterManager.applyFilter(tempCanvas, filterType);
                        tempCtx.clearRect(0, 0, stripWidth, photoHeight);
                        tempCtx.drawImage(filtered, 0, 0);
                    }
                    
                    // Draw to main strip canvas
                    const yPos = i * photoHeight;
                    ctx.drawImage(tempCanvas, 0, yPos);
                    
                    // Draw border between photos (except after last)
                    if (i < 2) {
                        ctx.fillStyle = '#FFD93D';
                        ctx.fillRect(0, yPos + photoHeight - borderWidth, stripWidth, borderWidth * 2);
                    }
                    
                    resolve();
                };
                photoImg.onerror = reject;
                photoImg.src = this.photos[i];
            });
        }
        
        // Add decorative borders
        ctx.strokeStyle = '#FF6B6B';
        ctx.lineWidth = 8;
        ctx.strokeRect(4, 4, stripWidth - 8, stripHeight - 8);
        
        // Add branding text at bottom
        ctx.fillStyle = '#FF6B6B';
        ctx.font = 'bold 24px Nunito';
        ctx.textAlign = 'center';
        ctx.fillText('✨ KalaKini Booth ✨', stripWidth / 2, stripHeight - 20);
        
        return canvas.toDataURL('image/png');
    }

    // Download strip as image
    downloadStrip(filename = null) {
        if (!this.stripCanvas) {
            throw new Error('Strip canvas tidak diinisialisasi');
        }
        
        const dataURL = this.stripCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = filename || `kalakini-booth-${this.getTimestamp()}.png`;
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Get timestamp for filename
    getTimestamp() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        return `${year}${month}${day}-${hours}${minutes}${seconds}`;
    }
}

// Export for use in other modules
const photoStripManager = new PhotoStripManager();

