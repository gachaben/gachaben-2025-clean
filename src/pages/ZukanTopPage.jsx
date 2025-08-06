import React from "react";
import { Link } from "react-router-dom";

const ZukanTopPage = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">シリーズを選ぼう</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold">昆虫シリーズ</h2>
        <ul className="list-disc ml-6 space-y-1">
          <li>
            <Link
              to="/zukan/kontyu/S"
              className="text-blue-600 hover:underline"
            >
              Sランクをみる
            </Link>
          </li>
          <li>
            <Link
              to="/zukan/kontyu/A"
              className="text-blue-600 hover:underline"
            >
              Aランクをみる
            </Link>
          </li>
          <li>
            <Link
              to="/zukan/kontyu/B"
              className="text-blue-600 hover:underline"
            >
              Bランクをみる
            </Link>
          </li>
        </ul>
      </div>

      {/* 他のシリーズもあれば同様に追加 */}
    </div>
  );
};

export default ZukanTopPage;
