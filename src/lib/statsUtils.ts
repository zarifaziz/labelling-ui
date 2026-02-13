import { EvalItem } from '@/types';

export interface OverviewStats {
  total: number;
  reviewed: number;
  completionPct: number;
  passRate: number;
  agreementRate: number;
}

export interface OutcomeDistribution {
  pass: number;
  fail: number;
  unlabeled: number;
}

export interface ConfusionMatrix {
  modelPassHumanPass: number;
  modelPassHumanFail: number;
  modelFailHumanPass: number;
  modelFailHumanFail: number;
  total: number;
}

export interface FieldGroupEntry {
  value: string;
  pass: number;
  fail: number;
  unlabeled: number;
  total: number;
}

export interface FieldGroupData {
  fieldKey: string;
  groups: FieldGroupEntry[];
}

export function computeOverviewStats(items: EvalItem[]): OverviewStats {
  const total = items.length;
  let reviewed = 0;
  let passed = 0;
  let agreed = 0;
  let bothOutcomes = 0;

  for (const item of items) {
    if (item.human_outcome === 'PASS' || item.human_outcome === 'FAIL') {
      reviewed++;
      if (item.human_outcome === 'PASS') passed++;
    }
    if (
      (item.model_outcome === 'PASS' || item.model_outcome === 'FAIL') &&
      (item.human_outcome === 'PASS' || item.human_outcome === 'FAIL')
    ) {
      bothOutcomes++;
      if (item.model_outcome === item.human_outcome) agreed++;
    }
  }

  return {
    total,
    reviewed,
    completionPct: total > 0 ? (reviewed / total) * 100 : 0,
    passRate: reviewed > 0 ? (passed / reviewed) * 100 : 0,
    agreementRate: bothOutcomes > 0 ? (agreed / bothOutcomes) * 100 : 0,
  };
}

export function computeOutcomeDistribution(items: EvalItem[]): OutcomeDistribution {
  let pass = 0;
  let fail = 0;
  let unlabeled = 0;

  for (const item of items) {
    if (item.human_outcome === 'PASS') pass++;
    else if (item.human_outcome === 'FAIL') fail++;
    else unlabeled++;
  }

  return { pass, fail, unlabeled };
}

export function computeConfusionMatrix(items: EvalItem[]): ConfusionMatrix {
  let modelPassHumanPass = 0;
  let modelPassHumanFail = 0;
  let modelFailHumanPass = 0;
  let modelFailHumanFail = 0;

  for (const item of items) {
    if (
      (item.model_outcome === 'PASS' || item.model_outcome === 'FAIL') &&
      (item.human_outcome === 'PASS' || item.human_outcome === 'FAIL')
    ) {
      if (item.model_outcome === 'PASS' && item.human_outcome === 'PASS') modelPassHumanPass++;
      else if (item.model_outcome === 'PASS' && item.human_outcome === 'FAIL') modelPassHumanFail++;
      else if (item.model_outcome === 'FAIL' && item.human_outcome === 'PASS') modelFailHumanPass++;
      else modelFailHumanFail++;
    }
  }

  const total = modelPassHumanPass + modelPassHumanFail + modelFailHumanPass + modelFailHumanFail;
  return { modelPassHumanPass, modelPassHumanFail, modelFailHumanPass, modelFailHumanFail, total };
}

export function discoverInputFields(items: EvalItem[]): string[] {
  const fieldCounts = new Map<string, number>();

  for (const item of items) {
    if (item.input && typeof item.input === 'object') {
      for (const key of Object.keys(item.input)) {
        fieldCounts.set(key, (fieldCounts.get(key) || 0) + 1);
      }
    }
  }

  // Filter out fields appearing in fewer than 2 items
  const minCount = Math.min(2, items.length);
  const fields: [string, number][] = [];
  for (const [key, count] of fieldCounts) {
    if (count >= minCount) {
      // Filter out likely identifier fields (>80% unique values)
      const uniqueValues = new Set(
        items.map((item) => String(item.input?.[key] ?? ''))
      );
      if (uniqueValues.size / items.length <= 0.8) {
        fields.push([key, count]);
      }
    }
  }

  // Sort by frequency descending
  fields.sort((a, b) => b[1] - a[1]);
  return fields.map(([key]) => key);
}

export function computeFieldGrouping(items: EvalItem[], fieldKey: string): FieldGroupData {
  const groupMap = new Map<string, { pass: number; fail: number; unlabeled: number }>();

  for (const item of items) {
    const rawValue = item.input?.[fieldKey];
    const value = rawValue != null ? String(rawValue) : '(empty)';
    if (!groupMap.has(value)) {
      groupMap.set(value, { pass: 0, fail: 0, unlabeled: 0 });
    }
    const group = groupMap.get(value)!;
    if (item.human_outcome === 'PASS') group.pass++;
    else if (item.human_outcome === 'FAIL') group.fail++;
    else group.unlabeled++;
  }

  // Convert to array, sort by total descending
  let groups: FieldGroupEntry[] = Array.from(groupMap.entries()).map(([value, counts]) => ({
    value,
    pass: counts.pass,
    fail: counts.fail,
    unlabeled: counts.unlabeled,
    total: counts.pass + counts.fail + counts.unlabeled,
  }));

  groups.sort((a, b) => b.total - a.total);

  // Cap at top 15 with "Other" bucket
  if (groups.length > 15) {
    const top = groups.slice(0, 15);
    const rest = groups.slice(15);
    const other: FieldGroupEntry = {
      value: 'Other',
      pass: 0,
      fail: 0,
      unlabeled: 0,
      total: 0,
    };
    for (const g of rest) {
      other.pass += g.pass;
      other.fail += g.fail;
      other.unlabeled += g.unlabeled;
      other.total += g.total;
    }
    groups = [...top, other];
  }

  return { fieldKey, groups };
}

export function formatFieldKey(key: string): string {
  // camelCase / PascalCase → Title Case with spaces
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase());
}
