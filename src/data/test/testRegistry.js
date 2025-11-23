import toeicPlacementTest from './toeicTest1';

export const testRegistry = {
  "placement_toeic_001": toeicPlacementTest,
};

export const getTestById = (testId) => {
  return testRegistry[testId] || null;
};