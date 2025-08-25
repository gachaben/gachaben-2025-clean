const getTitleFromCpt = (cpt) => {
  if (cpt >= 250) return "逾・;
  if (cpt >= 200) return "讌ｵ";
  if (cpt >= 150) return "鮴・;
  if (cpt >= 100) return "邇・;
  if (cpt >= 50) return "蜆ｪ";
  return "蛻晏ｿ・・;
};

export default getTitleFromCpt;
