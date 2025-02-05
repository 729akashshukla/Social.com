export const createStatus = asyncHandler(async (req, res) => {
    const { content, mediaUrl } = req.body;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
    
    const status = await Status.create({
      user: req.user.id,
      content,
      mediaUrl,
      expiresAt
    });
  
    res.status(201).json(status);
  });
  
  export const getStatuses = asyncHandler(async (req, res) => {
    const statuses = await Status.find()
      .populate('user', 'username avatar')
      .sort('-createdAt');
    res.json(statuses);
  });