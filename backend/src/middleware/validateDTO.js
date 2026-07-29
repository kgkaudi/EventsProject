export const validateDTO = (validatorFn) => {
  return (req, res, next) => {
    const errors = validatorFn(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        message: "Validation failed",
        errors,
      });
    }

    next();
  };
};
