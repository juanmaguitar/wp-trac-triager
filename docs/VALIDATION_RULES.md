# Validation Rules System

**Version:** 1.3.0
**Created:** 2026-02-06

## Overview

The Keyword Validation Panel uses a **configurable, transparent rule system** that allows users to:
- ✅ See the source of each validation rule
- ✅ Enable/disable rules based on their preferences
- ✅ Understand whether rules are based on official docs or team practices

## Rule Configuration File

**Location:** `data/validation-rules.js`

Each rule includes:
- **Rule ID**: Unique identifier
- **Enabled**: Whether the rule is active
- **Severity**: high, medium, or low
- **Type**: Category of validation
- **Message**: What the issue is
- **Recommendation**: How to fix it
- **Source**: Where this rule comes from

## Source Types

### 📘 Official Documentation (High Trust)
Rules based on official WordPress.org handbook documentation
- **Color:** Blue (#2271b1)
- **Trust Level:** High
- **Example:** Official keyword guide, bug reporting guidelines

### 🎓 Team Training (Medium Trust)
Rules based on WordPress Test Team training sessions
- **Color:** Gold (#f0b849)
- **Trust Level:** Medium
- **Example:** "80% of self-applied needs-testing are inadequate"

### 💡 Best Practice (Low Trust)
Rules based on observed patterns, not documented policy
- **Color:** Gray (#999)
- **Trust Level:** Low
- **Example:** Authority-restricted keywords (disabled by default)

## Current Rules

### ✅ Rule 1: Self-Applied "needs-testing"
**Status:** Enabled by default
**Severity:** High
**Source:** Team Training (2026-02-03)

Detects when patch authors add "needs-testing" to their own patches.

**Why:** Training data showed 80% of self-applied "needs-testing" are inadequate.

**Recommendation:** Remove "needs-testing" and add "needs-review" instead.

---

### ✅ Rule 2: Redundant Keywords
**Status:** Enabled by default
**Severity:** Low
**Source:** Team Training (2026-02-03)

Detects redundant keyword pairs:
- `2nd-opinion` + `needs-review`
- `needs-test-info` + `reporter-feedback`

**Why:** These keywords serve the same purpose.

**Recommendation:** Remove one of the redundant keywords.

---

### ❌ Rule 3: Authority-Restricted Keywords
**Status:** DISABLED by default
**Severity:** Medium
**Source:** Best Practice (no official docs)

Would detect when regular users add keywords like:
- `dev-feedback` (typically added by Component Maintainers+)
- `commit` (typically added by Core Committers+)

**Why Disabled:** No official WordPress.org documentation supports this restriction. Based only on observed patterns.

**User Preference:** Can be enabled if teams want to enforce this practice.

---

## UI Display

Each validation warning shows:

```
🔴 HIGH PRIORITY
Patch author added 'needs-testing' after uploading patch

Added by: username (Regular User)

💡 Remove 'needs-testing' and add 'needs-review' instead

────────────────────────────────
🎓 Team Training
Training showed 80% of self-applied needs-testing are inadequate
```

## Future Rules (Not Implemented)

### Workflow Validation
- Check for "needs-patch" without confirmed reproduction
- **Source:** Official WordPress Core Handbook

### Milestone Consistency
- Warn when milestone doesn't match ticket priority
- **Source:** To be determined

### Component-Specific Rules
- Different validation rules per component
- **Source:** Component maintainer preferences

## Configuration (Future Feature)

In a future version, users will be able to:
- Enable/disable rules via Settings page
- Set custom severity levels
- Add custom team-specific rules
- Export/import rule configurations

## Adding New Rules

To add a new rule:

1. **Add to `data/validation-rules.js`:**
```javascript
"my-new-rule": {
  enabled: true,
  severity: "medium",
  type: "custom-type",
  message: "Description of the issue",
  recommendation: "How to fix it",
  source: {
    type: "official", // or "training" or "best-practice"
    title: "WordPress Core Handbook: Section Name",
    url: "https://make.wordpress.org/core/...",
    note: "Explanation of why this rule exists"
  }
}
```

2. **Add validation logic in `analyzeKeywordValidation()`:**
```javascript
const ruleX = VALIDATION_RULES['my-new-rule'];
if (ruleX && ruleX.enabled) {
  // Check condition
  if (conditionMet) {
    validationIssues.push({
      ruleId: 'my-new-rule',
      type: ruleX.type,
      severity: ruleX.severity,
      message: ruleX.message,
      recommendation: ruleX.recommendation,
      source: ruleX.source
    });
  }
}
```

3. **Test the new rule** on relevant Trac tickets

## Benefits

### For Users
- ✅ **Transparency**: See where rules come from
- ✅ **Control**: Enable/disable based on preference
- ✅ **Learning**: Understand WordPress triage practices
- ✅ **Trust**: Rules backed by sources

### For Maintainers
- ✅ **Easy updates**: Change rules without code changes
- ✅ **Documentation**: Each rule is self-documenting
- ✅ **Flexibility**: Different teams can use different rules
- ✅ **Community**: Rules can be contributed and discussed

## Official Documentation Links

- **Trac Keywords Guide:** https://make.wordpress.org/core/handbook/contribute/trac/keywords/
- **Bug Reporting:** https://make.wordpress.org/core/handbook/testing/reporting-bugs/
- **Ticket Workflow:** https://make.wordpress.org/core/handbook/contribute/trac/

---

**Last Updated:** 2026-02-06
**Feedback:** This system is designed to be transparent and configurable. If you have suggestions for new rules or improvements, please provide feedback!
