import React from "react";

const QuestionComponent = ({ question, choices, onSelect }) => {
  return (
    <div className="p-4 bg-white rounded shadow text-center">
      <h2 className="text-lg font-bold mb-3">{question}</h2>
      <div className="flex flex-wrap justify-center gap-2">
        {choices.map((choice, index) => (
          <button
            key={index}
            onClick={() => onSelect(choice)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {choice}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuestionComponent;
