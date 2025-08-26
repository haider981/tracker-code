exports.getProfile = (req, res) => {
  res.json({
    success: true,
    user: {
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      picture: req.user.picture,
    },
  });
};
