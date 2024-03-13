const { imagemin } = require('imagemin')
const { imageminJpegtran } = require('imagemin-jpegtran');
const { imageminPngquant } = require('imagemin-pngquant');

// Function to optimize images using imagemin
async function optimizeImages() {
    try {
        const files = await imagemin(['images/*.{jpg,png}'], {
            sourcePath: 'storage/upload/image/product',
            destination: 'storage/upload/image/product',
            plugins: [
                imageminJpegtran(),
                imageminPngquant({
                    quality: [0.6, 0.8]
                })
            ]
        });
        console.log('Optimized files:', files);
    } catch (error) {
        console.error('Error optimizing images:', error);
    }
}

// Call the function to optimize images
optimizeImages();
