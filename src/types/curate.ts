export interface CurateItem {
  example_id: string;
  example_output_json: Record<string, unknown>;
  skills: string[];
  skill_ids: string[];
  subtopics: string[];
  subtopic_ids: string[];
  topic: string;
  topic_id: string;
  context: string;
  class_year: string;
  country: string;
  period_number: string;
  node_type: string;
  difficulty: string;
  _deleted: boolean;
  _modified: boolean;
}

/** The raw column names from the SQLite table, in order */
export const CURATE_COLUMNS = [
  'example_id',
  'example_output_json',
  'skills',
  'skill_ids',
  'subtopics',
  'subtopic_ids',
  'topic',
  'topic_id',
  'context',
  'class_year',
  'country',
  'period_number',
  'node_type',
  'difficulty',
] as const;

/** Metadata fields shown in the input panel (everything except id and output JSON) */
export const CURATE_METADATA_FIELDS = [
  'topic',
  'skills',
  'subtopics',
  'node_type',
  'difficulty',
  'class_year',
  'country',
  'context',
  'period_number',
  'topic_id',
  'skill_ids',
  'subtopic_ids',
] as const;

/** Fields useful for filtering/grouping in the sidebar */
export const CURATE_GROUPABLE_FIELDS = [
  'node_type',
  'topic',
  'difficulty',
  'class_year',
  'country',
] as const;
