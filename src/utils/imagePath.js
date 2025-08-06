// src/utils/imagePath.js

export const getImagePath = (imageName, stage) => {
  if (!imageName || !stage) return "/images/placeholder.png";

  const filename = imageName.endsWith(".png") ? imageName : `${imageName}.png`;
  return `/images/kontyu/stage${stage}/${filename}`;
};
