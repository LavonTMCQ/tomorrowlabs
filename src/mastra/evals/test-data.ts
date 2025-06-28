// Test data for evaluating Tomorrow Travel Agent recommendations

export interface TravelTestCase {
  input: {
    query: string;
    userPreferences?: {
      budget?: string;
      activities?: string[];
      travelStyle?: string;
    };
    location: string;
  };
  expected: {
    destinationRelevance: number; // 0-1 score
    weatherAlignment: number; // 0-1 score
    budgetAppropriate: boolean;
    activitiesIncluded: string[];
    safetyConsidered: boolean;
  };
}

export const TRAVEL_TEST_CASES: TravelTestCase[] = [
  {
    input: {
      query: "I want to visit a warm beach destination for outdoor activities",
      userPreferences: {
        budget: "$2000",
        activities: ["swimming", "snorkeling", "hiking"],
        travelStyle: "adventure"
      },
      location: "Miami"
    },
    expected: {
      destinationRelevance: 0.9,
      weatherAlignment: 0.8,
      budgetAppropriate: true,
      activitiesIncluded: ["swimming", "snorkeling"],
      safetyConsidered: true
    }
  },
  {
    input: {
      query: "Looking for a budget-friendly winter destination with indoor activities",
      userPreferences: {
        budget: "$800",
        activities: ["museums", "shopping", "cafes"],
        travelStyle: "cultural"
      },
      location: "Prague"
    },
    expected: {
      destinationRelevance: 0.8,
      weatherAlignment: 0.9,
      budgetAppropriate: true,
      activitiesIncluded: ["museums", "shopping"],
      safetyConsidered: true
    }
  },
  {
    input: {
      query: "I need travel advice for a luxury tropical vacation",
      userPreferences: {
        budget: "$5000",
        activities: ["spa", "fine dining", "beach"],
        travelStyle: "luxury"
      },
      location: "Maldives"
    },
    expected: {
      destinationRelevance: 0.95,
      weatherAlignment: 0.9,
      budgetAppropriate: true,
      activitiesIncluded: ["spa", "fine dining", "beach"],
      safetyConsidered: true
    }
  },
  {
    input: {
      query: "Family-friendly destination with kids activities",
      userPreferences: {
        budget: "$3000",
        activities: ["theme parks", "beaches", "family restaurants"],
        travelStyle: "family"
      },
      location: "Orlando"
    },
    expected: {
      destinationRelevance: 0.9,
      weatherAlignment: 0.8,
      budgetAppropriate: true,
      activitiesIncluded: ["theme parks", "family restaurants"],
      safetyConsidered: true
    }
  }
];
