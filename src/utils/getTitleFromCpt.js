const getTitleFromCpt = (cpt) => {
  if (cpt >= 250) return "神";
  if (cpt >= 200) return "極";
  if (cpt >= 150) return "龍";
  if (cpt >= 100) return "王";
  if (cpt >= 50) return "優";
  return "初心者";
};

export default getTitleFromCpt;
