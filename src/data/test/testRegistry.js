import toeicPlacementTest from './toeicTest1';

// For now, we'll use the same test structure for all tests
// You can create separate test files later
export const testRegistry = {
  "placement_toeic_001": toeicPlacementTest,
  "toeic_basic_001": toeicPlacementTest, // Temporarily use same structure
  "ielts_placement_001": toeicPlacementTest, // Temporarily use same structure
  "ielts_academic_001": toeicPlacementTest, // Temporarily use same structure
  "toefl_placement_001": toeicPlacementTest, // Temporarily use same structure
  "toefl_reading_001": toeicPlacementTest, // Temporarily use same structure
  "general_english_001": toeicPlacementTest, // Temporarily use same structure
  "general_grammar_001": toeicPlacementTest, // Temporarily use same structure
};

export const getTestById = (testId) => {
  return testRegistry[testId] || null;
};