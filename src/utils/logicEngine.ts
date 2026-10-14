import { FormQuestion, LogicRule, FormSection } from '../types';

/**
 * Checks a single condition against current answers
 */
export function evaluateCondition(
  fieldId: string,
  operator: string,
  targetValue: any,
  answers: Record<string, any>
): boolean {
  const actualValue = answers[fieldId];

  switch (operator) {
    case 'isAnswered':
      if (actualValue === undefined || actualValue === null || actualValue === '') return false;
      if (Array.isArray(actualValue)) return actualValue.length > 0;
      return true;

    case 'isNotAnswered':
      if (actualValue === undefined || actualValue === null || actualValue === '') return true;
      if (Array.isArray(actualValue)) return actualValue.length === 0;
      return false;

    case 'equals':
      if (Array.isArray(actualValue)) {
        return actualValue.includes(targetValue);
      }
      return String(actualValue ?? '').trim().toLowerCase() === String(targetValue ?? '').trim().toLowerCase();

    case 'notEquals':
      if (Array.isArray(actualValue)) {
        return !actualValue.includes(targetValue);
      }
      return String(actualValue ?? '').trim().toLowerCase() !== String(targetValue ?? '').trim().toLowerCase();

    case 'contains':
      if (Array.isArray(actualValue)) {
        return actualValue.some(v => String(v).toLowerCase().includes(String(targetValue).toLowerCase()));
      }
      return String(actualValue ?? '').toLowerCase().includes(String(targetValue ?? '').toLowerCase());

    case 'greaterThan': {
      const numA = Number(actualValue);
      const numB = Number(targetValue);
      return !isNaN(numA) && !isNaN(numB) && numA > numB;
    }

    case 'lessThan': {
      const numA = Number(actualValue);
      const numB = Number(targetValue);
      return !isNaN(numA) && !isNaN(numB) && numA < numB;
    }

    default:
      return true;
  }
}

/**
 * Checks if a logic rule is satisfied given the current answers
 */
export function isRuleSatisfied(rule: LogicRule, answers: Record<string, any>): boolean {
  if (!rule.conditions || rule.conditions.length === 0) return false;

  if (rule.combinator === 'OR') {
    return rule.conditions.some(c => evaluateCondition(c.fieldId, c.operator, c.value, answers));
  } else {
    // Default to AND
    return rule.conditions.every(c => evaluateCondition(c.fieldId, c.operator, c.value, answers));
  }
}

/**
 * Returns set of question IDs that should be hidden based on rules
 */
export function getHiddenQuestionIds(questions: FormQuestion[], rules: LogicRule[], answers: Record<string, any>): Set<string> {
  const hidden = new Set<string>();

  rules.forEach(rule => {
    const satisfied = isRuleSatisfied(rule, answers);

    if (rule.action === 'hideQuestion') {
      if (satisfied) {
        hidden.add(rule.targetId);
      }
    } else if (rule.action === 'showQuestion') {
      // If rule is "showQuestion", hide it when NOT satisfied
      if (!satisfied) {
        hidden.add(rule.targetId);
      }
    }
  });

  return hidden;
}

/**
 * Finds next active section ID taking into account branching rules
 */
export function getNextSectionId(
  currentSectionId: string,
  sections: FormSection[],
  rules: LogicRule[],
  answers: Record<string, any>
): { nextSectionId?: string; isEnded?: boolean } {
  const currentIndex = sections.findIndex(s => s.id === currentSectionId);
  if (currentIndex === -1) return { isEnded: true };

  // Check rules triggered by current answers that affect section routing
  for (const rule of rules) {
    if (isRuleSatisfied(rule, answers)) {
      if (rule.action === 'endRegistration') {
        return { isEnded: true };
      }
      if (rule.action === 'goToSection') {
        const targetExists = sections.some(s => s.id === rule.targetId);
        if (targetExists) {
          return { nextSectionId: rule.targetId };
        }
      }
      if (rule.action === 'skipSection') {
        // Find index of skipped section and go to next
        const skipIndex = sections.findIndex(s => s.id === rule.targetId);
        if (skipIndex !== -1 && skipIndex + 1 < sections.length) {
          return { nextSectionId: sections[skipIndex + 1].id };
        }
      }
    }
  }

  // Default: proceed to sequential next section
  if (currentIndex + 1 < sections.length) {
    return { nextSectionId: sections[currentIndex + 1].id };
  }

  return { isEnded: true };
}
