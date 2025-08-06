import React from 'react';

const ItemCard = ({ item, owned, pwMode, onClick }) => {
  // ✅ 安全装置：itemが未定義なら何も表示しない
  if (!item) return null;

  console.log("🧩 ItemCard 受け取り：", item); // ✅ 正しい場所に移動済み！

  const { itemId, imageName, name, pw = 0, cpt = 0, bpt = 0, stage, seriesId } = item;

  const isSRank = imageName.includes('_S_');
  const isARank = imageName.includes('_A_');
  const isBRank = imageName.includes('_B_');

  let sparkVideo = null;
  if (isSRank) sparkVideo = 'S_spark.mp4';
  else if (isARank) sparkVideo = 'A_spark.mp4';
  else if (isBRank) sparkVideo = 'B_spark.mp4';

  const getRankStyle = () => {
    if (isSRank) return 'text-yellow-300';
    if (isARank) return 'text-purple-300';
    if (isBRank) return 'text-gray-300';
    return 'text-white';
  };

  const getCptLevel = (cpt) => {
    if (cpt >= 250) return 5;
    if (cpt >= 200) return 4;
    if (cpt >= 150) return 3;
    if (cpt >= 100) return 2;
    if (cpt >= 50) return 1;
    return 0;
  };
  const getBptLevel = (bpt) => {
    if (bpt >= 250) return 5;
    if (bpt >= 200) return 4;
    if (bpt >= 150) return 3;
    if (bpt >= 100) return 2;
    if (bpt >= 50) return 1;
    return 0;
  };

  const cptLevel = getCptLevel(cpt);
  const bptLevel = getBptLevel(bpt);
  const imagePath = `/images/${seriesId}/stage${stage}/${imageName}.png`;

  const getRankLetter = () => {
    if (isSRank) return 'S';
    if (isARank) return 'A';
    if (isBRank) return 'B';
    return '';
  };

  const displayName = name === 'ヘラクレスオオカブト'
    ? 'ヘラクレス\nオオカブト'
    : name;

  return (
    <div
      onClick={pwMode ? onClick : undefined}
      className={`relative w-[150px] h-[220px] m-2 border rounded-xl overflow-hidden shadow-md bg-white transition-transform duration-300 transform hover:scale-105 hover:shadow-xl ${owned ? '' : 'opacity-60 grayscale'}`}
    >
      <div className={`absolute top-1 right-2 z-30 text-4xl font-bold drop-shadow-md font-serif ${getRankStyle()}`}>
        {getRankLetter()}
      </div>

      {sparkVideo && (
        <video
          src={`/images/effects/${sparkVideo}`}
          autoPlay
          loop
          muted
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
        />
      )}

      <div className="relative z-10 flex flex-col items-center justify-between h-full p-2 text-white">
        <div className="text-sm font-bold text-center break-words h-[38px] overflow-hidden leading-tight mt-3 whitespace-pre-line">
          {displayName}
        </div>

        <img
          src={imagePath}
          alt={name}
          className="w-full h-[90px] object-contain mt-1"
        />

        <div className="text-xs mt-1">{pw} PW</div>

        <div className="text-[11px] leading-none mt-1">
          攻撃力：
          {Array(cptLevel).fill('🥊').map((icon, i) => <span key={i}>{icon}</span>)}
        </div>

        <div className="text-[11px] leading-none">
          防御力：
          {Array(bptLevel).fill('💪').map((icon, i) => <span key={i}>{icon}</span>)}
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
