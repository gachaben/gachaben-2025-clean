// src/utils/getSpeedComboLabel.js

const getSpeedComboLabel = (combo) => {
  if (combo >= 19) return "ç¥é€Ÿã‚®ã‚¬ã‚¹ãƒˆãEãƒ EE¼E¼ğŸ‘‘âš¡ğŸ”¥";
  if (combo >= 17) return "ã‚¢ãƒ«ãƒE‚£ãƒ¡ãƒEƒˆãƒ–ãƒ¬ã‚¤ã‚¯EE¼E¼ğŸ’¥";
  if (combo >= 15) return "è¶E‚®ã‚¬ã‚¯ãƒ©ãƒE‚·ãƒ¥EE¼E¼âš¡ğŸ”¥";
  if (combo >= 13) return "ã‚®ã‚¬ã‚¹ãƒ”ãƒ³EE¼E¼ğŸ’«";
  if (combo >= 11) return "ãƒãƒƒãƒã‚¤ãƒ³ãƒ‘ã‚¯ãƒˆï¼E¼âœ¨";
  if (combo >= 9) return "éŸ³é€Ÿãƒ–ãƒ¬ã‚¤ã‚¯EE¼ğŸ’¥";
  if (combo >= 7) return "é«˜é€Ÿãƒ‰ãƒ©ã‚¤ãƒ–ï¼E¼âš¡EE;
  if (combo >= 5) return "ã‚¿ãƒ¼ãƒœãƒ–ãƒ¼ã‚¹ãƒˆï¼E¼ğŸ”¥";
  if (combo >= 3) return "ãƒ•ãƒ«ã‚¹ãƒ­ãƒEƒˆãƒ«EE¼ğŸš€";
  if (combo >= 1) return "ã‚®ã‚¢ãƒã‚§ãƒ³ã‚¸Eâš™EE;
  return "";
};

export default getSpeedComboLabel;
