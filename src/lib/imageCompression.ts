import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
    maxSizeMB?: number;
    maxWidthOrHeight?: number;
    useWebWorker?: boolean;
}

const defaultOptions: CompressionOptions = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
};

export async function compressImage(
    file: File,
    options: CompressionOptions = {}
): Promise<File> {
    try {
        const mergedOptions = { ...defaultOptions, ...options };
        const compressedFile = await imageCompression(file, mergedOptions);

        return new File([compressedFile], file.name, {
            type: compressedFile.type,
            lastModified: Date.now(),
        });
    } catch (error) {
        console.error('Image compression failed:', error);
        return file;
    }
}

export async function compressImages(
    files: File[],
    options: CompressionOptions = {}
): Promise<File[]> {
    return Promise.all(files.map(file => compressImage(file, options)));
}
