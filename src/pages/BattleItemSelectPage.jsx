// 例: src/pages/BattleItemSelectPage.jsx（抜粋）
import { useNavigate } from "react-router-dom";

export default function BattleItemSelectPage() {
  const nav = useNavigate();

  const pickEnemy = (myItem) => {
    // 敵決定ロジックがあればここで。なければ null でもOK
    return null;
  };

  const onSelect = (it) => {
    const enemy = pickEnemy(it);
    nav("/battle", {
      state: {
        selectedItem: it,
        enemyItem: enemy,
        round: 1,
        totalRounds: 3,
        // 任意：初期PWをバトルへ渡したい場合
        myPwLeft: 300,
        enemyPwLeft: 300,
      },
    });
  };

  // …アイテム一覧の中で <button onClick={() => onSelect(item)}>これで戦う</button>
  return null;
}
