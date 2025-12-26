export default {
  sections: [
    {
      sectionId: 1,
      title: "Listening Comprehension",
      description: "Listen to audio clips and answer questions",
      mediaUrl: "https://example.com/audio/placement_listening.mp3",
      duration: 20,
      questions: [
        {
          questionId: 1,
          type: "multiple-choice",
          question: "Where does this conversation most likely take place?",
          audioTimestamp: "0:00-0:30",
          options: [
            "At a restaurant",
            "At a hotel reception",
            "At an airport",
            "At a bank"
          ],
          correctAnswer: 1,
          points: 2
        },
        {
          questionId: 2,
          type: "multiple-choice",
          question: "What is the woman's problem?",
          audioTimestamp: "0:30-1:00",
          options: [
            "She lost her reservation",
            "Her room is not ready",
            "She can't find her luggage",
            "Her credit card was declined"
          ],
          correctAnswer: 1,
          points: 2
        },
        {
          questionId: 3,
          type: "multiple-choice",
          question: "What time does the man suggest meeting?",
          audioTimestamp: "1:00-1:30",
          options: [
            "9:00 AM",
            "10:30 AM",
            "2:00 PM",
            "4:00 PM"
          ],
          correctAnswer: 2,
          points: 2
        },
        {
          questionId: 4,
          type: "multiple-choice",
          question: "What is being advertised?",
          audioTimestamp: "1:30-2:00",
          options: [
            "A new smartphone",
            "A fitness center membership",
            "A travel package",
            "A restaurant opening"
          ],
          correctAnswer: 1,
          points: 2
        },
        {
          questionId: 5,
          type: "multiple-choice",
          question: "Why is the meeting being postponed?",
          audioTimestamp: "2:00-2:30",
          options: [
            "The manager is sick",
            "The room is unavailable",
            "Important documents are missing",
            "Weather conditions"
          ],
          correctAnswer: 2,
          points: 2
        }
      ]
    },

    {
      sectionId: 2,
      title: "Reading Comprehension",
      description: "Read passages and answer questions",
      duration: 25,
      questions: [
        {
          questionId: 6,
          type: "multiple-choice",
          passage: "Attention all employees: Due to maintenance work, the parking lot on the east side will be closed from Monday, June 15, through Friday, June 19. Alternative parking is available in the west parking structure. We apologize for any inconvenience.",
          question: "What is the main purpose of this notice?",
          options: [
            "To announce new parking rates",
            "To inform about parking lot closure",
            "To promote carpooling",
            "To introduce a new parking system"
          ],
          correctAnswer: 1,
          points: 2
        },
        {
          questionId: 7,
          type: "multiple-choice",
          passage: "Attention all employees: Due to maintenance work, the parking lot on the east side will be closed from Monday, June 15, through Friday, June 19. Alternative parking is available in the west parking structure. We apologize for any inconvenience.",
          question: "How long will the parking lot be closed?",
          options: [
            "3 days",
            "5 days",
            "1 week",
            "2 weeks"
          ],
          correctAnswer: 1,
          points: 2
        },
        {
          questionId: 8,
          type: "multiple-choice",
          passage: "Thompson Electronics is pleased to announce the launch of our new customer service hotline. Starting next month, customers can call 1-800-TECH-HELP (1-800-832-4357) 24 hours a day, 7 days a week for technical support. Our trained specialists will assist you with product installation, troubleshooting, and warranty claims.",
          question: "What is Thompson Electronics announcing?",
          options: [
            "A new product line",
            "Extended business hours",
            "A customer service hotline",
            "A special promotion"
          ],
          correctAnswer: 2,
          points: 2
        },
        {
          questionId: 9,
          type: "multiple-choice",
          passage: "Thompson Electronics is pleased to announce the launch of our new customer service hotline. Starting next month, customers can call 1-800-TECH-HELP (1-800-832-4357) 24 hours a day, 7 days a week for technical support. Our trained specialists will assist you with product installation, troubleshooting, and warranty claims.",
          question: "When will the service become available?",
          options: [
            "Immediately",
            "Next week",
            "Next month",
            "Next year"
          ],
          correctAnswer: 2,
          points: 2
        },
        {
          questionId: 10,
          type: "multiple-choice",
          passage: "Dear valued customers, We regret to inform you that due to unexpected supply chain issues, orders placed after March 1st may experience delays of up to two weeks. We are working diligently to resolve this matter and appreciate your patience and understanding during this time.",
          question: "What is causing the delays?",
          options: [
            "Staff shortage",
            "Weather problems",
            "Supply chain issues",
            "Equipment failure"
          ],
          correctAnswer: 2,
          points: 2
        }
      ]
    },

    {
      sectionId: 3,
      title: "Vocabulary",
      description: "Choose the word that best completes each sentence",
      duration: 15,
      questions: [
        {
          questionId: 11,
          type: "multiple-choice",
          question: "The company will _____ a new product line next quarter.",
          options: [
            "launch",
            "lunch",
            "lounge",
            "latch"
          ],
          correctAnswer: 0,
          points: 2
        },
        {
          questionId: 12,
          type: "multiple-choice",
          question: "Please _____ the meeting minutes to all department heads.",
          options: [
            "distribute",
            "contribute",
            "attribute",
            "tribute"
          ],
          correctAnswer: 0,
          points: 2
        },
        {
          questionId: 13,
          type: "multiple-choice",
          question: "The project deadline has been _____ until next month.",
          options: [
            "extended",
            "expanded",
            "expelled",
            "expected"
          ],
          correctAnswer: 0,
          points: 2
        },
        {
          questionId: 14,
          type: "multiple-choice",
          question: "We need to _____ a solution to this problem immediately.",
          options: [
            "implement",
            "compliment",
            "supplement",
            "complement"
          ],
          correctAnswer: 0,
          points: 2
        },
        {
          questionId: 15,
          type: "multiple-choice",
          question: "The manager will _____ the team's performance at the end of the quarter.",
          options: [
            "evaluate",
            "evacuate",
            "evaporate",
            "elaborate"
          ],
          correctAnswer: 0,
          points: 2
        },
        {
          questionId: 16,
          type: "multiple-choice",
          question: "All employees must _____ with company safety regulations.",
          options: [
            "comply",
            "reply",
            "apply",
            "imply"
          ],
          correctAnswer: 0,
          points: 2
        },
        {
          questionId: 17,
          type: "multiple-choice",
          question: "The conference was _____ due to unforeseen circumstances.",
          options: [
            "postponed",
            "proposed",
            "disposed",
            "composed"
          ],
          correctAnswer: 0,
          points: 2
        },
        {
          questionId: 18,
          type: "multiple-choice",
          question: "We should _____ professional advice before making this investment.",
          options: [
            "seek",
            "speak",
            "sneak",
            "sleek"
          ],
          correctAnswer: 0,
          points: 2
        },
        {
          questionId: 19,
          type: "multiple-choice",
          question: "The company experienced _____ growth in the last fiscal year.",
          options: [
            "significant",
            "insignificant",
            "magnificent",
            "signify"
          ],
          correctAnswer: 0,
          points: 2
        },
        {
          questionId: 20,
          type: "multiple-choice",
          question: "Please _____ your expenses with the accounting department.",
          options: [
            "submit",
            "admit",
            "commit",
            "permit"
          ],
          correctAnswer: 0,
          points: 2
        }
      ]
    },

    {
      sectionId: 4,
      title: "Grammar",
      description: "Choose the grammatically correct option",
      duration: 15,
      questions: [
        {
          questionId: 21,
          type: "multiple-choice",
          question: "The report _____ by the team leader yesterday.",
          options: [
            "was submitted",
            "is submitted",
            "has submitted",
            "submitting"
          ],
          correctAnswer: 0,
          points: 2
        },
        {
          questionId: 22,
          type: "multiple-choice",
          question: "If I _____ more time, I would finish the project today.",
          options: [
            "had",
            "have",
            "will have",
            "would have"
          ],
          correctAnswer: 0,
          points: 2
        },
        {
          questionId: 23,
          type: "multiple-choice",
          question: "She has been working here _____ 2015.",
          options: [
            "since",
            "for",
            "from",
            "at"
          ],
          correctAnswer: 0,
          points: 2
        },
        {
          questionId: 24,
          type: "multiple-choice",
          question: "The meeting _____ at 9 AM tomorrow.",
          options: [
            "will start",
            "starts",
            "is starting",
            "All of the above"
          ],
          correctAnswer: 3,
          points: 2
        },
        {
          questionId: 25,
          type: "multiple-choice",
          question: "Neither the manager nor the employees _____ satisfied with the new policy.",
          options: [
            "are",
            "is",
            "was",
            "been"
          ],
          correctAnswer: 0,
          points: 2
        },
        {
          questionId: 26,
          type: "multiple-choice",
          question: "By the time you arrive, I _____ the presentation.",
          options: [
            "will have finished",
            "will finish",
            "have finished",
            "finished"
          ],
          correctAnswer: 0,
          points: 2
        },
        {
          questionId: 27,
          type: "multiple-choice",
          question: "The document needs _____ before the deadline.",
          options: [
            "to be reviewed",
            "reviewing",
            "review",
            "reviewed"
          ],
          correctAnswer: 0,
          points: 2
        },
        {
          questionId: 28,
          type: "multiple-choice",
          question: "She speaks English _____ than her colleagues.",
          options: [
            "more fluently",
            "most fluently",
            "fluently",
            "more fluent"
          ],
          correctAnswer: 0,
          points: 2
        },
        {
          questionId: 29,
          type: "multiple-choice",
          question: "I would appreciate _____ if you could respond by Friday.",
          options: [
            "it",
            "that",
            "this",
            "what"
          ],
          correctAnswer: 0,
          points: 2
        },
        {
          questionId: 30,
          type: "multiple-choice",
          question: "The company, _____ headquarters is in Tokyo, has branches worldwide.",
          options: [
            "whose",
            "which",
            "that",
            "who"
          ],
          correctAnswer: 0,
          points: 2
        }
      ]
    },

    {
      sectionId: 5,
      title: "Writing",
      description: "Complete writing tasks based on given prompts",
      duration: 15,
      questions: [
        {
          questionId: 31,
          type: "essay",
          question: "Write a brief email (50-75 words) to your supervisor requesting a day off next week. Include:\n- The date you need off\n- The reason for your request\n- How you will handle your work responsibilities",
          minWords: 50,
          maxWords: 75,
          points: 10,
          rubric: {
            organization: 3,
            clarity: 3,
            grammar: 2,
            vocabulary: 2
          }
        },
        {
          questionId: 32,
          type: "sentence-completion",
          question: "Complete the sentence with appropriate business vocabulary:\nDue to the _____ in sales figures, the company decided to _____ its marketing strategy and _____ additional staff.",
          expectedWords: 3,
          points: 3,
          sampleAnswer: "decline, revise, hire"
        },
        {
          questionId: 33,
          type: "error-correction",
          question: "Identify and correct the errors in this sentence:\n'The team have completed their project yesterday and has submitted it to the manager.'",
          points: 2,
          correctAnswer: "The team completed their project yesterday and has submitted it to the manager. OR The team has completed their project and submitted it to the manager yesterday."
        },
        {
          questionId: 34,
          type: "short-response",
          question: "In 2-3 sentences, describe the most important skills for working in a professional office environment.",
          minWords: 30,
          maxWords: 60,
          points: 5,
          rubric: {
            relevance: 2,
            clarity: 2,
            grammar: 1
          }
        }
      ]
    }
  ],

  // Scoring guidelines
  scoring: {
    total: 100,
    breakdown: {
      listening: 10,
      reading: 10,
      vocabulary: 20,
      grammar: 20,
      writing: 40
    },
    levels: [
      { min: 0, max: 39, level: "Beginner", recommendation: "Basic English courses" },
      { min: 40, max: 59, level: "Elementary", recommendation: "Elementary TOEIC preparation" },
      { min: 60, max: 74, level: "Intermediate", recommendation: "Intermediate TOEIC courses" },
      { min: 75, max: 89, level: "Upper-Intermediate", recommendation: "Advanced TOEIC preparation" },
      { min: 90, max: 100, level: "Advanced", recommendation: "TOEIC exam ready / Business English" }
    ]
  }
};
