// src/data/quiz/quizRegistry.js
import quiz1 from './quiz1';
import quiz2 from './quiz2';
import quiz3 from './quiz3';
import quiz4 from './quiz4';

export const quizRegistry = {
  1: quiz1,
  2: quiz2,
  3: quiz3,
  4: quiz4
};

// Helper function to get quiz by ID
export const getQuizById = (quizId) => {
  return quizRegistry[quizId] || null;
};