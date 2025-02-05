import sanitizeFilename from 'sanitize-filename';

export const validateFileType = (file) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error('Only JPEG, PNG, and WEBP files are allowed');
  }
};

export const sanitizeFileName = (filename) => {
  const sanitized = sanitizeFilename(filename)
    .replace(/[^a-z0-9\-_.]/gi, '')
    .toLowerCase();
  return `${Date.now()}-${sanitized}`;
};


export const verifyFileContentType = (filePath) => {
    return new Promise((resolve, reject) => {
      const fileStream = fs.createReadStream(filePath);
      fileStream.on('error', reject);
      
      fileStream.pipe(new FileType()).on('data', (result) => {
        if (!result || !['jpg', 'png', 'jpeg'].includes(result.ext)) {
          reject(new Error('File content does not match extension'));
        } else {
          resolve();
        }
      });
    });
  };