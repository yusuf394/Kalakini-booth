// Main application controller
class App {
    constructor() {
        this.state = {
            photos: [],
            photoCount: 0,
            currentFilter: 'none',
            isCapturing: false
        };
        
        this.init();
    }

    init() {
        // Initialize modules
        cameraManager.init('videoElement', 'previewCanvas');
        photoStripManager.init('stripCanvas');
        
        // Get DOM elements
        this.elements = {
            startCameraBtn: document.getElementById('startCameraBtn'),
            captureBtn: document.getElementById('captureBtn'),
            switchCameraBtn: document.getElementById('switchCameraBtn'),
            applyFilterBtn: document.getElementById('applyFilterBtn'),
            downloadBtn: document.getElementById('downloadBtn'),
            newPhotoBtn: document.getElementById('newPhotoBtn'),
            photoCount: document.getElementById('photoCount'),
            cameraSection: document.getElementById('cameraSection'),
            filterSection: document.getElementById('filterSection'),
            stripSection: document.getElementById('stripSection'),
            filterOverlay: document.getElementById('filterOverlay'),
            errorMessage: document.getElementById('errorMessage'),
            countdown: document.getElementById('countdown')
        };
        
        // Setup event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Start camera button
        this.elements.startCameraBtn.addEventListener('click', () => this.startCamera());
        
        // Capture button
        this.elements.captureBtn.addEventListener('click', () => this.capturePhoto());
        
        // Switch camera button
        this.elements.switchCameraBtn.addEventListener('click', () => this.switchCamera());
        
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.state.currentFilter = e.target.dataset.filter;
            });
        });
        
        // Apply filter button
        this.elements.applyFilterBtn.addEventListener('click', () => this.applyFilters());
        
        // Download button
        this.elements.downloadBtn.addEventListener('click', () => this.downloadStrip());
        
        // New photo button
        this.elements.newPhotoBtn.addEventListener('click', () => this.reset());
    }

    async startCamera() {
        try {
            this.hideError();
            await cameraManager.startCamera();
            this.elements.startCameraBtn.disabled = true;
            this.elements.captureBtn.disabled = false;
            this.elements.switchCameraBtn.disabled = false;
        } catch (error) {
            this.showError(error.message);
        }
    }

    async switchCamera() {
        try {
            this.hideError();
            await cameraManager.switchCamera();
        } catch (error) {
            this.showError('Tidak dapat mengganti kamera: ' + error.message);
        }
    }

    async capturePhoto() {
        if (this.state.photoCount >= 3) {
            this.showError('Sudah mengambil 3 foto!');
            return;
        }

        if (this.state.isCapturing) return;
        this.state.isCapturing = true;
        this.elements.captureBtn.disabled = true;

        try {
            // Show countdown
            await this.showCountdown();
            
            // Capture photo
            const photoData = cameraManager.capturePhoto();
            this.state.photos.push(photoData);
            photoStripManager.addPhoto(photoData);
            this.state.photoCount++;
            this.elements.photoCount.textContent = this.state.photoCount;
            
            // If 3 photos taken, proceed to filter selection
            if (this.state.photoCount >= 3) {
                this.elements.captureBtn.disabled = true;
                setTimeout(() => {
                    this.showFilterSection();
                }, 500);
            } else {
                this.elements.captureBtn.disabled = false;
            }
        } catch (error) {
            this.showError('Error mengambil foto: ' + error.message);
            this.elements.captureBtn.disabled = false;
        } finally {
            this.state.isCapturing = false;
        }
    }

    showCountdown() {
        return new Promise((resolve) => {
            const countdown = this.elements.countdown;
            countdown.style.display = 'block';
            
            let count = 3;
            countdown.textContent = count;
            
            const interval = setInterval(() => {
                count--;
                if (count > 0) {
                    countdown.textContent = count;
                } else {
                    countdown.textContent = '📸';
                    setTimeout(() => {
                        countdown.style.display = 'none';
                        clearInterval(interval);
                        resolve();
                    }, 300);
                }
            }, 1000);
        });
    }

    showFilterSection() {
        this.elements.cameraSection.style.display = 'none';
        this.elements.filterSection.style.display = 'block';
    }

    async applyFilters() {
        try {
            this.hideError();
            const filterType = this.state.currentFilter;
            
            // Apply animation filter class to overlay
            const filterClass = filterManager.getFilterClass(filterType);
            this.elements.filterOverlay.className = 'filter-overlay ' + filterClass;
            
            // Generate strip with filter
            this.elements.filterSection.style.display = 'none';
            this.elements.stripSection.style.display = 'block';
            
            // Small delay to ensure DOM update
            await new Promise(resolve => setTimeout(resolve, 100));
            
            await photoStripManager.generateStrip(filterType);
        } catch (error) {
            this.showError('Error menerapkan filter: ' + error.message);
        }
    }

    downloadStrip() {
        try {
            photoStripManager.downloadStrip();
        } catch (error) {
            this.showError('Error mengunduh foto: ' + error.message);
        }
    }

    reset() {
        // Reset state
        this.state.photos = [];
        this.state.photoCount = 0;
        this.state.currentFilter = 'none';
        this.state.isCapturing = false;
        
        // Reset UI
        this.elements.photoCount.textContent = '0';
        this.elements.stripSection.style.display = 'none';
        this.elements.filterSection.style.display = 'none';
        this.elements.cameraSection.style.display = 'block';
        this.elements.filterOverlay.className = 'filter-overlay';
        
        // Reset filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector('.filter-btn[data-filter="none"]').classList.add('active');
        
        // Clear photo strip
        photoStripManager.clearPhotos();
        
        // Restart camera if needed
        if (!cameraManager.isCameraActive()) {
            this.elements.startCameraBtn.disabled = false;
            this.elements.captureBtn.disabled = true;
            this.elements.switchCameraBtn.disabled = true;
        } else {
            this.elements.captureBtn.disabled = false;
        }
    }

    showError(message) {
        this.elements.errorMessage.textContent = message;
        this.elements.errorMessage.style.display = 'block';
    }

    hideError() {
        this.elements.errorMessage.style.display = 'none';
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new App();
});

