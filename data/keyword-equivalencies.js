// WordPress Trac Keyword Equivalencies
// Based on WordPress Test Team Training (2026-02-03)
// Source: Training session on ticket triaging and keywords
//
// These keywords are considered redundant when used together.
// For example, '2nd-opinion' and 'needs-review' serve the same purpose.

var KEYWORD_EQUIVALENCIES = {
  '2nd-opinion': 'needs-review',
  'needs-test-info': 'reporter-feedback'
};

// Authority-restricted keywords
// These keywords should typically only be added by users with certain roles
var AUTHORITY_RESTRICTED_KEYWORDS = {
  'dev-feedback': {
    minRole: 'Component Maintainer',
    reason: 'Requesting developer feedback should be done by core team members'
  },
  'commit': {
    minRole: 'Core Committer',
    reason: 'Only committers should mark tickets as ready to commit'
  }
};

// Variables are shared between content scripts via execution order
// No need to expose to window in MV3
