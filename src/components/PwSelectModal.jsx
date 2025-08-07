import React from "react";

const PwSelectModal = ({ onSelect }) => {
  const options = [100, 200, 300, 400, 500];

  return (
    <div className="mt-4 text-center">
      <h3 className="mb-2 font-semibold">かけるPWを選んでね！</h3>
      <div className="space-x-2">
        {options.map((pw) => (
          <button
            key={pw}
            onClick={() => onSelect(pw)}
            className="bg-white border px-3 py-1 rounded shadow"
          >
            {pw} PW
          </button>
        ))}
      </div>
    </div>
  );
};

export default PwSelectModal;
