export const generateUniqueFilename = (originalname) => {
    const sanitized = originalname
      .replace(/[^a-zA-Z0-9\-_.]/g, '')
      .toLowerCase();
    return `${Date.now()}-${sanitized}`;
  };gi