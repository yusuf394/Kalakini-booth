// Filter management module
class FilterManager {
    constructor() {
        this.currentFilter = 'none';
    }

    // Apply filter to image data
    applyFilter(imageData, filterType) {
        this.currentFilter = filterType;
        
        switch(filterType) {
            case 'vintage':
                return this.applyVintage(imageData);
            case 'bright':
                return this.applyBright(imageData);
            case 'smooth':
                return this.applySmooth(imageData);
            case 'none':
            default:
                return imageData;
        }
    }

    // Vintage filter (sepia + contrast)
    applyVintage(imageData) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = imageData.width;
        canvas.height = imageData.height;
        
        ctx.drawImage(imageData, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Sepia effect
            const tr = 0.393 * r + 0.769 * g + 0.189 * b;
            const tg = 0.349 * r + 0.686 * g + 0.168 * b;
            const tb = 0.272 * r + 0.534 * g + 0.131 * b;
            
            data[i] = Math.min(255, tr);
            data[i + 1] = Math.min(255, tg);
            data[i + 2] = Math.min(255, tb);
            
            // Slight contrast boost
            data[i] = this.contrast(data[i], 1.1);
            data[i + 1] = this.contrast(data[i + 1], 1.1);
            data[i + 2] = this.contrast(data[i + 2], 1.1);
        }

        ctx.putImageData(imgData, 0, 0);
        return canvas;
    }

    // Bright filter (brightness + saturation)
    applyBright(imageData) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = imageData.width;
        canvas.height = imageData.height;
        
        ctx.drawImage(imageData, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
            // Increase brightness
            data[i] = Math.min(255, data[i] * 1.2);
            data[i + 1] = Math.min(255, data[i + 1] * 1.2);
            data[i + 2] = Math.min(255, data[i + 2] * 1.2);
            
            // Increase saturation
            const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            data[i] = Math.min(255, gray + (data[i] - gray) * 1.3);
            data[i + 1] = Math.min(255, gray + (data[i + 1] - gray) * 1.3);
            data[i + 2] = Math.min(255, gray + (data[i + 2] - gray) * 1.3);
        }

        ctx.putImageData(imgData, 0, 0);
        return canvas;
    }

    // Smooth filter (soft blur + brightness)
    applySmooth(imageData) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = imageData.width;
        canvas.height = imageData.height;
        
        // Apply slight blur using box blur approximation
        ctx.filter = 'blur(0.5px)';
        ctx.drawImage(imageData, 0, 0);
        
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        
        ctx.filter = 'none';

        // Soft brightness boost
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, data[i] * 1.05);
            data[i + 1] = Math.min(255, data[i + 1] * 1.05);
            data[i + 2] = Math.min(255, data[i + 2] * 1.05);
        }

        ctx.putImageData(imgData, 0, 0);
        return canvas;
    }

    // Helper function for contrast
    contrast(value, factor) {
        return Math.min(255, Math.max(0, (value - 128) * factor + 128));
    }

    // Get CSS class for animation filter
    getFilterClass(filterType) {
        const animationFilters = ['hearts', 'stars', 'sparkles', 'emoji'];
        if (animationFilters.includes(filterType)) {
            return `filter-${filterType}`;
        }
        return '';
    }

    // Check if filter is animation-based
    isAnimationFilter(filterType) {
        return ['hearts', 'stars', 'sparkles', 'emoji'].includes(filterType);
    }
}

// Export for use in other modules
const filterManager = new FilterManager();

