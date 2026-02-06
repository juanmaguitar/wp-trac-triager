// WordPress Trac Keyword Validation Rules
// Each rule includes its source documentation for transparency

var VALIDATION_RULES = {
  // Rule: Self-applied "needs-testing" by patch authors
  "self-applied-needs-testing": {
    enabled: true,
    severity: "high",
    type: "keyword-pattern",
    keyword: "needs-testing",
    condition: "self-applied-by-patch-author",
    message: "Patch author added 'needs-testing' after uploading patch",
    recommendation: "Remove 'needs-testing' and add 'needs-review' instead",
    source: {
      type: "training",
      title: "WordPress Test Team Training: Ticket Triaging",
      date: "2026-02-03",
      url: null,
      note: "Training showed 80% of self-applied 'needs-testing' are inadequate",
      confidence: "Based on team training data, not official policy"
    }
  },

  // Rule: Redundant keyword pairs
  "redundant-keywords": {
    enabled: true,
    severity: "low",
    type: "keyword-redundancy",
    pairs: {
      "2nd-opinion": "needs-review",
      "needs-test-info": "reporter-feedback"
    },
    message: "'{keyword}' is redundant with existing '{equivalent}'",
    recommendation: "Remove '{keyword}' as it serves the same purpose as '{equivalent}'",
    source: {
      type: "training",
      title: "WordPress Test Team Training: Keyword Equivalencies",
      date: "2026-02-03",
      url: null,
      note: "Keyword equivalencies documented in training session",
      confidence: "Based on team training, not official handbook"
    }
  },

  // Rule: Authority-restricted keywords (DISABLED by default)
  "authority-restricted-keywords": {
    enabled: false, // Disabled: No official documentation supports this
    severity: "medium",
    type: "authority-mismatch",
    keywords: {
      "dev-feedback": {
        minRole: "Component Maintainer",
        reason: "Requesting developer feedback"
      },
      "commit": {
        minRole: "Core Committer",
        reason: "Marking ticket ready to commit"
      }
    },
    message: "{role} added '{keyword}' - typically added by {minRole} or higher",
    recommendation: "{reason} is typically done by core team members",
    source: {
      type: "best-practice",
      title: "Observed team practices (not official policy)",
      url: null,
      note: "Based on observed patterns in ticket triage, not documented in WordPress.org handbook",
      confidence: "Observational - no official documentation"
    }
  },

  // Example: Future rule based on official docs
  "needs-patch-without-reproduction": {
    enabled: false, // Not implemented yet
    severity: "medium",
    type: "workflow-validation",
    message: "Ticket marked 'needs-patch' without confirmed reproduction",
    recommendation: "Confirm bug reproduction before requesting patches",
    source: {
      type: "official",
      title: "WordPress Core Handbook: Bug Reports",
      url: "https://make.wordpress.org/core/handbook/testing/reporting-bugs/",
      note: "Bugs should be reproducible before requesting patches",
      confidence: "Official WordPress.org documentation"
    }
  }
};

// Rule configuration metadata
var VALIDATION_RULE_SOURCES = {
  "official": {
    label: "Official Documentation",
    icon: "📘",
    color: "#2271b1",
    trustLevel: "high"
  },
  "training": {
    label: "Team Training",
    icon: "🎓",
    color: "#f0b849",
    trustLevel: "medium"
  },
  "best-practice": {
    label: "Best Practice",
    icon: "💡",
    color: "#999",
    trustLevel: "low"
  }
};

// Variables are shared between content scripts via execution order
// No need to expose to window in MV3
