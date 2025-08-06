// EvolutionGame.jsx
import React, { useState, useEffect } from 'react';
import './EvolutionGame.css';
import { db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';

const MAX_ATTEMPTS = 10;
const evolutionImages = [
  '/images/premium2.png', // ID 1 - Super Premium
  '/images/premium1.png', // ID 2 - Super Premium
  '/images/item3.png',
  '/images/item4.png',
  '/images/item5.png',
  '/images/item6.png',
  '/images/item7.png',
  '/images/item8.png',
  '/images/item9.png',
  '/images/item10.png',
];

const EvolutionGame = ({ userId }) => {
  const [step, setStep] = useState('start');
  const [attempts, setAttempts] = useState(0);
  const [availableIndices, setAvailableIndices] = useState([...Array(10).keys()]);
  const [evolvedImage, setEvolvedImage] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleEvolve = async () => {
    if (attempts >= MAX_ATTEMPTS || saving) return;
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);

    const remaining = [...availableIndices];
    const randomIndex = Math.floor(Math.random() * remaining.length);
    const chosenIndex = remaining[randomIndex];

    const nextAvailable = remaining.filter((i) => i !== chosenIndex);
    setAvailableIndices(nextAvailable);

    const chosenImage = evolutionImages[chosenIndex];
    setEvolvedImage(chosenImage);
    setStep('evolved');

    // Save to Firestore
    setSaving(true);
    const itemId = `item${chosenIndex + 1}`;
    try {
      await setDoc(doc(db, 'userEvolutions', `${userId}_${itemId}`), {
        userId,
        itemId,
        image: chosenImage,
        timestamp: new Date(),
      });
    } catch (e) {
      console.error('Firestore save failed', e);
    }
    setSaving(false);
  };

  return (
    <div className="evolution-container">
      {step === 'start' && (
        <button className="evolve-button" onClick={handleEvolve} disabled={saving}>
          しんかする！
        </button>
      )}
      {step === 'evolved' && evolvedImage && (
        <div className="result">
          <img src={evolvedImage} alt="進化アイテム" className="evolved-image" />
          <p>しんかしたよ！</p>
          {attempts < MAX_ATTEMPTS && (
            <button className="evolve-button" onClick={() => setStep('start')}>
              つぎの しんかへ
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EvolutionGame;