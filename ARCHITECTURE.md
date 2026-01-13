# Architecture: Flexible Data Structure Support

## Problem

The original UI was hardcoded for `exitticketnode` and `warmupquestionnode` formats which have:
```json
{
  "easy": {"question": "...", "answer": "..."},
  "medium": {"question": "...", "answer": "..."},
  "hard": {"question": "...", "answer": "..."}
}
```

But there are **many other node types** with completely different structures.

## Solution: Generic Recursive Renderer

The `OutputPanel` component now uses a **generic recursive JSON renderer** that can display **any** data structure.

### Supported Node Types

| Node Type | Output Structure | Example Fields |
|-----------|------------------|----------------|
| **exitticketnode** | Easy/medium/hard questions | `{easy, medium, hard}` each with `{question, answer}` |
| **warmupquestionnode** | Easy/medium/hard questions | Same as exitticket |
| **warmupwithcontextnode** | Easy/medium/hard questions | Same as exitticket |
| **activitynode** | Activity structure | `header, scenario, steps[], discussion[], differentiation` |
| **applicationnode** | Application examples | `title, example1Header, example1Body, example2Header, example2Body` |
| **misconceptionnode** | Misconception analysis | `question, misconception, incorrect_example, correct_concept, correct_example` |
| **thoughtsparkernode** | Thought-provoking question | `firstSentence, secondSentence, teacherTips[]` |
| **multiplechoicequestionnode** | Multiple choice | `difficulty, question, answerOptions[], answer` |
| **contemplativequestionnode** | Reflective question | `difficulty, question, teacherTips[], answer` |
| **scaffoldedquestionnode** | Scaffolded questions | Various scaffolding formats |

### How It Works

The renderer follows this logic:

```typescript
1. Check if null/undefined → show empty state
2. Check if array → render as numbered/bulleted list
3. Check if object:
   a. Does it have easy/medium/hard keys? → QuestionSetRenderer
   b. Does it have {question, answer}? → QuestionAnswerCard
   c. Otherwise → GenericObjectRenderer (key-value pairs)
4. Check if primitive (string/number/boolean) → render with LaTeX support
```

### Key Components

#### 1. `GenericOutputRenderer`
- Entry point
- Detects data type and routes to appropriate renderer

#### 2. `RenderField`
- Renders a single key-value pair
- Auto-formats field names (camelCase → Title Case)
- Detects special patterns (question-answer pairs)

#### 3. `RenderValue`
- Recursively renders any value type
- Handles nested objects and arrays
- Applies LaTeX rendering to all strings

#### 4. `QuestionAnswerCard`
- Special styled card for questions
- Supports: easy, medium, hard, extension
- Color-coded by difficulty

#### 5. `formatFieldName`
- Converts camelCase → Title Case
- Converts snake_case → Title Case
- Examples:
  - `firstName` → "First Name"
  - `class_year` → "Class Year"
  - `example1Header` → "Example 1 Header"

### Example Renders

#### ActivityNode
```json
{
  "header": "Discount Detectives",
  "scenario": "You're planning a sale...",
  "steps": ["Step 1", "Step 2", "Step 3"],
  "discussion": ["Question 1?", "Question 2?"]
}
```
**Renders as:**
- Header card
- Scenario card
- Steps as numbered list
- Discussion as bulleted list

#### MisconceptionNode
```json
{
  "question": "Evaluate 3^0",
  "misconception": "Students think 3^0 = 0",
  "correct_concept": "Any nonzero base raised to 0 equals 1"
}
```
**Renders as:**
- Question card
- Misconception card
- Correct Concept card

#### ExitTicketNode (Original)
```json
{
  "easy": {"question": "...", "answer": "..."},
  "medium": {"question": "...", "answer": "..."}
}
```
**Renders as:**
- Green card for easy question
- Yellow card for medium question

## Benefits

### ✅ No Hardcoding
- Works with **any** JSON structure
- No need to update code for new node types

### ✅ Automatic Field Formatting
- Field names are automatically prettified
- No manual mapping required

### ✅ LaTeX Everywhere
- All text fields are processed for LaTeX
- Math notation renders correctly

### ✅ Nested Data Support
- Handles deeply nested objects
- Arrays at any level
- Mixed types

### ✅ Visual Hierarchy
- Cards for top-level fields
- Indented borders for nested objects
- Numbered/bulleted lists for arrays

## Adding New Node Types

**No code changes needed!** The renderer automatically adapts.

If you want custom styling for a new difficulty level:

1. Add to `QuestionAnswerCard` styles:
```typescript
const styles: Record<string, any> = {
  // existing: easy, medium, hard, extension
  advanced: {
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    badgeBg: 'bg-blue-600',
    badgeText: 'text-white',
  },
};
```

That's it!

## Technical Details

### Type Safety

The `output` field in `EvalOutput` is defined as:
```typescript
interface EvalOutput {
  [key: string]: QuestionAnswer | string[] | string | undefined;
}
```

This allows any structure while maintaining TypeScript safety.

### Performance

- Recursive rendering is efficient for typical eval data sizes
- LaTeX rendering is memoized by KaTeX
- No unnecessary re-renders (React best practices)

### Extensibility

To add custom renderers for specific patterns:

```typescript
// In GenericOutputRenderer
if (detectSpecialPattern(output)) {
  return <SpecialPatternRenderer output={output} />;
}
```

## Future Enhancements

Potential improvements:

1. **Collapsible sections** for large outputs
2. **Search/filter** within output fields
3. **Copy to clipboard** for individual fields
4. **Side-by-side comparison** mode
5. **Export individual examples** as JSON/markdown

## Testing

The flexible renderer has been tested with:
- ✅ exitticketnode (easy/medium/hard)
- ✅ activitynode (complex nested structure)
- ✅ applicationnode (multiple examples)
- ✅ misconceptionnode (concept analysis)
- ✅ Empty outputs
- ✅ Mixed data types

Test files available in `/public/`:
- `sample.csv` - exitticket format
- `activity-sample.csv` - activity format
- `misconception-sample.csv` - misconception format
