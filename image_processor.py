#!/usr/bin/env python3
"""
KalaKini Booth - Python Image Processor
Optional offline photo processing using Pillow
"""

from PIL import Image, ImageFilter, ImageEnhance
import sys
import os

def apply_vintage(image_path, output_path):
    """Apply vintage/sepia filter to image"""
    try:
        img = Image.open(image_path)
        
        # Convert to RGB if necessary
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Apply sepia-like effect
        width, height = img.size
        pixels = img.load()
        
        for y in range(height):
            for x in range(width):
                r, g, b = pixels[x, y]
                
                # Sepia transformation
                tr = int(0.393 * r + 0.769 * g + 0.189 * b)
                tg = int(0.349 * r + 0.686 * g + 0.168 * b)
                tb = int(0.272 * r + 0.534 * g + 0.131 * b)
                
                pixels[x, y] = (min(255, tr), min(255, tg), min(255, tb))
        
        # Enhance contrast slightly
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(1.1)
        
        img.save(output_path)
        print(f"Vintage filter applied: {output_path}")
        return True
    except Exception as e:
        print(f"Error applying vintage filter: {e}")
        return False

def apply_bright(image_path, output_path):
    """Apply bright filter to image"""
    try:
        img = Image.open(image_path)
        
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Increase brightness
        enhancer = ImageEnhance.Brightness(img)
        img = enhancer.enhance(1.2)
        
        # Increase saturation
        enhancer = ImageEnhance.Color(img)
        img = enhancer.enhance(1.3)
        
        img.save(output_path)
        print(f"Bright filter applied: {output_path}")
        return True
    except Exception as e:
        print(f"Error applying bright filter: {e}")
        return False

def apply_smooth(image_path, output_path):
    """Apply smooth/beauty filter to image"""
    try:
        img = Image.open(image_path)
        
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Apply slight blur for smooth skin effect
        img = img.filter(ImageFilter.GaussianBlur(radius=0.5))
        
        # Slight brightness boost
        enhancer = ImageEnhance.Brightness(img)
        img = enhancer.enhance(1.05)
        
        img.save(output_path)
        print(f"Smooth filter applied: {output_path}")
        return True
    except Exception as e:
        print(f"Error applying smooth filter: {e}")
        return False

def generate_strip(photo1_path, photo2_path, photo3_path, output_path, filter_type='none'):
    """Generate 3-strip photobooth image"""
    try:
        # Load images
        img1 = Image.open(photo1_path)
        img2 = Image.open(photo2_path)
        img3 = Image.open(photo3_path)
        
        # Convert to RGB if necessary
        for img in [img1, img2, img3]:
            if img.mode != 'RGB':
                img = img.convert('RGB')
        
        # Apply filters if specified
        if filter_type == 'vintage':
            img1 = apply_filter_to_pil(img1, 'vintage')
            img2 = apply_filter_to_pil(img2, 'vintage')
            img3 = apply_filter_to_pil(img3, 'vintage')
        elif filter_type == 'bright':
            img1 = apply_filter_to_pil(img1, 'bright')
            img2 = apply_filter_to_pil(img2, 'bright')
            img3 = apply_filter_to_pil(img3, 'bright')
        elif filter_type == 'smooth':
            img1 = apply_filter_to_pil(img1, 'smooth')
            img2 = apply_filter_to_pil(img2, 'smooth')
            img3 = apply_filter_to_pil(img3, 'smooth')
        
        # Strip dimensions (2" x 6" ratio)
        strip_width = 600
        strip_height = 1800  # 3 photos x 600px each
        photo_height = strip_height // 3
        border_width = 4
        
        # Resize images to fit
        def resize_to_fit(img, target_width, target_height):
            img.thumbnail((target_width, target_height), Image.Resampling.LANCZOS)
            new_img = Image.new('RGB', (target_width, target_height), (0, 0, 0))
            paste_x = (target_width - img.width) // 2
            paste_y = (target_height - img.height) // 2
            new_img.paste(img, (paste_x, paste_y))
            return new_img
        
        img1 = resize_to_fit(img1, strip_width, photo_height)
        img2 = resize_to_fit(img2, strip_width, photo_height)
        img3 = resize_to_fit(img3, strip_width, photo_height)
        
        # Create strip
        strip = Image.new('RGB', (strip_width, strip_height), (255, 255, 255))
        strip.paste(img1, (0, 0))
        strip.paste(img2, (0, photo_height))
        strip.paste(img3, (0, photo_height * 2))
        
        # Add border between photos
        from PIL import ImageDraw
        draw = ImageDraw.Draw(strip)
        draw.rectangle([0, photo_height - border_width, strip_width, photo_height + border_width], 
                      fill=(255, 217, 61))  # Yellow border
        draw.rectangle([0, photo_height * 2 - border_width, strip_width, photo_height * 2 + border_width], 
                      fill=(255, 217, 61))
        
        # Add outer border
        draw.rectangle([0, 0, strip_width - 1, strip_height - 1], outline=(255, 107, 107), width=8)
        
        strip.save(output_path)
        print(f"Photo strip generated: {output_path}")
        return True
    except Exception as e:
        print(f"Error generating strip: {e}")
        return False

def apply_filter_to_pil(img, filter_type):
    """Apply filter to PIL Image object"""
    if filter_type == 'vintage':
        # Simplified vintage for PIL (would need pixel manipulation for full effect)
        enhancer = ImageEnhance.Color(img)
        img = enhancer.enhance(0.8)
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(1.1)
    elif filter_type == 'bright':
        enhancer = ImageEnhance.Brightness(img)
        img = enhancer.enhance(1.2)
        enhancer = ImageEnhance.Color(img)
        img = enhancer.enhance(1.3)
    elif filter_type == 'smooth':
        img = img.filter(ImageFilter.GaussianBlur(radius=0.5))
        enhancer = ImageEnhance.Brightness(img)
        img = enhancer.enhance(1.05)
    return img

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage:")
        print("  python image_processor.py vintage <input> <output>")
        print("  python image_processor.py bright <input> <output>")
        print("  python image_processor.py smooth <input> <output>")
        print("  python image_processor.py strip <photo1> <photo2> <photo3> <output> [filter_type]")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == 'vintage':
        apply_vintage(sys.argv[2], sys.argv[3])
    elif command == 'bright':
        apply_bright(sys.argv[2], sys.argv[3])
    elif command == 'smooth':
        apply_smooth(sys.argv[2], sys.argv[3])
    elif command == 'strip':
        filter_type = sys.argv[6] if len(sys.argv) > 6 else 'none'
        generate_strip(sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5], filter_type)
    else:
        print(f"Unknown command: {command}")

