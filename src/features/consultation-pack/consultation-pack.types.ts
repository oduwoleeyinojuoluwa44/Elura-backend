export interface ConsultationPackRequest {
  eventType: string;
  skinType: string;
  desiredFinish: string;
  timeConstraint?: string;
  notes?: string;
}

export interface ConsultationPackResponse {
  questionnaire: string[];
  prepMessage: string;
  kitChecklist: string[];
  timeline: string[];
  artistTips: string[];
}

