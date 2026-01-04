// Camera management module
class CameraManager {
    constructor() {
        this.videoElement = null;
        this.previewCanvas = null;
        this.stream = null;
        this.facingMode = 'user'; // 'user' for front camera, 'environment' for back
    }

    init(videoId, canvasId) {
        this.videoElement = document.getElementById(videoId);
        this.previewCanvas = document.getElementById(canvasId);
    }

    async startCamera() {
        try {
            // Stop existing stream if any
            this.stopCamera();

            const constraints = {
                video: {
                    facingMode: this.facingMode,
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            };

            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.videoElement.srcObject = this.stream;
            
            return true;
        } catch (error) {
            console.error('Error accessing camera:', error);
            throw new Error('Tidak dapat mengakses kamera. Pastikan kamera diizinkan dan tidak sedang digunakan aplikasi lain.');
        }
    }

    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        if (this.videoElement) {
            this.videoElement.srcObject = null;
        }
    }

    async switchCamera() {
        this.facingMode = this.facingMode === 'user' ? 'environment' : 'user';
        await this.startCamera();
    }

    capturePhoto() {
        if (!this.videoElement || !this.previewCanvas) {
            throw new Error('Camera atau canvas tidak diinisialisasi');
        }

        const video = this.videoElement;
        const canvas = this.previewCanvas;
        
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        
        // Flip horizontally for mirror effect (since video is already flipped)
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Reset transform
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        
        // Convert canvas to image data
        return canvas.toDataURL('image/png');
    }

    isCameraActive() {
        return this.stream !== null && this.stream.active;
    }
}

// Export for use in other modules
const cameraManager = new CameraManager();

