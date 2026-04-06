import { sendRequest } from "@tbe/utils";

export interface DSAQuestionFetchParams {
  domain?: string;
  difficulty?: string;
  companyType?: string;
}

export interface DSAQuestionRaw {
  _id: string;
  title: string;
  answer: string;
  domain: string[];
  difficulty: string;
  companyTypes: string[];
  topics: string[];
  isRealWorldProblem?: boolean;
  resources?: any;
  examples?: {
    _id?: string;
    inputText: string;
    outputText: string;
    explanation?: string;
    image?: string;
  }[];
  constraints?: string[];
  sections?: any;
}

export interface DSATopicGroup {
  topic: string;
  questions: DSAQuestionRaw[];
  count: number;
}

export interface DSAYatraResponse {
  domain: string;
  filters: {
    difficulty?: string;
    companyType?: string;
  };
  topics: DSATopicGroup[];
  totalQuestions: number;
}

export const dsaYatraService = {
  async getDSAQuestions(
    params?: DSAQuestionFetchParams,
  ): Promise<DSAYatraResponse | null> {
    try {
      const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

      // Build query params
      const queryParams = new URLSearchParams();
      queryParams.append("roadmap", "DSA");

      if (params?.domain) queryParams.append("domain", params.domain);
      if (params?.difficulty)
        queryParams.append("difficulty", params.difficulty);
      if (params?.companyType)
        queryParams.append("companyType", params.companyType);

      const url = `/interview-prep?${queryParams.toString()}`;

      const response = await sendRequest({
        method: "GET",
        url,
        baseURL: base,
      });

      if (response.status && response.data) {
        return response.data as DSAYatraResponse;
      }

      return null;
    } catch (error) {
      console.error("Error fetching DSA questions:", error);
      return null;
    }
  },
};
