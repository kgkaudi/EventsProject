export const validateEventDTO = (data) => {
  const errors = [];
  if (!data.title || typeof data.title !== "string") errors.push("Invalid title");
  if (!data.date || isNaN(Date.parse(data.date))) errors.push("Invalid date");
  if (!data.location || typeof data.location !== "string") errors.push("Invalid location");
  return errors;
};
