export interface UserQuery {
  text: string;
  image?: string; // data URL for preview
}

export interface Source {
  uri: string;
  title: string;
}

export interface ModelResponse {
  subject: string;
  answer: string;
  sources: Source[];
}

export interface Interaction {
  id: number;
  userQuery: UserQuery;
  modelResponse: ModelResponse;
  isLoading: boolean;
  error?: string;
}
