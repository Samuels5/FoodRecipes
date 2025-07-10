// Helper utility for image upload handling
export function useImageUpload() {
  
  // Convert file to base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      // Check file size - limit to 5MB to prevent issues
      const maxSizeInMB = 5;
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
      if (file.size > maxSizeInBytes) {
        reject(new Error(`File size exceeds ${maxSizeInMB}MB. Please select a smaller image.`));
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        reject(new Error('Only image files are allowed.'));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(new Error('Failed to read file: ' + error.message));
      reader.readAsDataURL(file);
    });
  };

  // Compress image to reduce size
  const compressImage = (file, maxWidth = 1200, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      // Create an image object
      const img = new Image();
      img.src = URL.createObjectURL(file);
      
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error("Failed to load image"));
      };
      
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        
        // Create a canvas and get its context
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions
        if (width > maxWidth) {
          height = Math.floor(height * maxWidth / width);
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 data URL
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to compress image"));
              return;
            }
            resolve(URL.createObjectURL(blob));
          },
          file.type,
          quality
        );
      };
    });
  };

  // Process image file - compress and convert to base64
  const processImageFile = async (file, options = {}) => {
    try {
      const { maxWidth = 1200, quality = 0.8 } = options;
      
      // For small images, skip compression
      if (file.size < 500 * 1024) { // Less than 500KB
        return await convertToBase64(file);
      }
      
      // For larger images, compress first
      const compressedImage = await compressImage(file, maxWidth, quality);
      
      // Fetch the compressed image as a blob
      const response = await fetch(compressedImage);
      const blob = await response.blob();
      
      // Convert compressed blob to base64
      return await convertToBase64(blob);
    } catch (error) {
      console.error("Image processing error:", error);
      throw error;
    }
  };

  return {
    convertToBase64,
    compressImage,
    processImageFile
  };
}
