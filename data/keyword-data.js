// WordPress Trac Keyword Definitions
// Based on: Complete WordPress Trac Keyword Guide
// Source: https://make.wordpress.org/core/handbook/contribute/trac/keywords/

var KEYWORD_DATA = {
  // Patch-Related Keywords
  'has-patch': {
    category: 'patch',
    label: 'Has Patch',
    description: 'A patch file has been attached to the ticket',
    usage: 'After uploading a patch to fix the issue. Add a comment with [attachment:filename] to link to your patch.',
    color: '#4CAF50'
  },
  'needs-patch': {
    category: 'patch',
    label: 'Needs Patch',
    description: 'The ticket has been confirmed as a bug/issue and requires a patch to fix it',
    usage: 'When a reproducible bug needs someone to write code to fix it (and unit tests, if applicable)',
    color: '#4CAF50',
    critical: true
  },
  'needs-refresh': {
    category: 'patch',
    label: 'Needs Refresh',
    description: "The existing patch doesn't apply cleanly against the current codebase",
    usage: 'When testing a patch and it fails to apply due to conflicts with recent code changes.',
    color: '#4CAF50'
  },
  'changes-requested': {
    category: 'patch',
    label: 'Changes Requested',
    description: 'Feedback has been provided and the attached patch needs to be updated',
    usage: 'When reviewers have provided specific feedback that requires modifications to the existing patch',
    color: '#4CAF50'
  },

  // Testing Keywords
  'needs-testing': {
    category: 'testing',
    label: 'Needs Testing',
    description: 'The patch requires testing by the community to ensure it works and doesn\'t introduce bugs',
    usage: 'When a patch is ready but needs community verification before it can be committed',
    color: '#2196F3',
    critical: true
  },
  'has-test-info': {
    category: 'testing',
    label: 'Has Test Info',
    description: 'The ticket contains adequate testing instructions or step-by-step information',
    usage: 'Manually added during triage when step-by-step instructions (written, video, or GIF) are present',
    color: '#2196F3'
  },
  'needs-test-info': {
    category: 'testing',
    label: 'Needs Test Info',
    description: 'The ticket lacks sufficient testing instructions or information needed to properly test the issue/patch',
    usage: 'When the ticket needs more detailed steps to reproduce or test the issue',
    color: '#2196F3'
  },
  'has-unit-tests': {
    category: 'testing',
    label: 'Has Unit Tests',
    description: 'Unit tests have been provided for the ticket',
    usage: 'After unit tests are written and attached to verify the patch',
    color: '#2196F3'
  },
  'needs-unit-tests': {
    category: 'testing',
    label: 'Needs Unit Tests',
    description: 'Unit tests are needed to verify and test the patch',
    usage: 'When tests are particularly needed for a ticket to proceed, especially for core functionality changes',
    color: '#2196F3'
  },

  // Feedback Keywords
  'reporter-feedback': {
    category: 'feedback',
    label: 'Reporter Feedback',
    description: 'A response is needed from the original ticket reporter',
    usage: "When you can't reproduce the issue and need more information from the person experiencing the problem",
    color: '#FF9800'
  },
  'dev-feedback': {
    category: 'feedback',
    label: 'Dev Feedback',
    description: 'A response is needed from a core developer or trusted member of the development community',
    usage: 'When you need technical input from experienced developers, or when double sign-off is required',
    color: '#FF9800',
    critical: true
  },
  '2nd-opinion': {
    category: 'feedback',
    label: '2nd Opinion',
    description: 'A second opinion is needed from other contributors before taking action',
    usage: "When you're uncertain about the approach or resolution and want additional input from the community",
    color: '#FF9800'
  },

  // Design Keywords
  'needs-design': {
    category: 'design',
    label: 'Needs Design',
    description: 'A designer should create a prototype/mockup of how changes should look/behave BEFORE code is written',
    usage: 'When requesting new design work or prototypes before implementation begins',
    color: '#9C27B0'
  },
  'needs-design-feedback': {
    category: 'design',
    label: 'Needs Design Feedback',
    description: 'A designer should review and give feedback on the PROPOSED changes',
    usage: 'When design already exists or is proposed, and you need a designer\'s review or opinion',
    color: '#9C27B0'
  },

  // Documentation Keywords
  'needs-docs': {
    category: 'docs',
    label: 'Needs Docs',
    description: 'Inline code documentation (PHPDoc/DocBlocks) is needed for developer reference',
    usage: 'For placeholder tickets for individual files, or patches with new functions that need documenting',
    color: '#607D8B'
  },
  'needs-user-docs': {
    category: 'docs',
    label: 'Needs User Docs',
    description: 'End-user documentation in the Codex/HelpHub needs updating or expanding',
    usage: 'When changes affect how users interact with WordPress and need documentation updates',
    color: '#607D8B',
    aliases: ['needs-codex']
  },
  'needs-codex': {
    category: 'docs',
    label: 'Needs Codex',
    description: 'End-user documentation in the Codex/HelpHub needs updating or expanding',
    usage: 'When changes affect how users interact with WordPress and need documentation updates',
    color: '#607D8B',
    aliases: ['needs-user-docs']
  },
  'needs-dev-note': {
    category: 'docs',
    label: 'Needs Dev Note',
    description: 'A developer note should be written for the make/core blog',
    usage: 'For significant changes including new functionality, large refactors, or breaking changes',
    color: '#607D8B'
  },
  'has-dev-note': {
    category: 'docs',
    label: 'Has Dev Note',
    description: 'A developer note has been published for this ticket',
    usage: 'Replaces needs-dev-note once the note is published; include a link to the note',
    color: '#607D8B'
  },
  'add-to-field-guide': {
    category: 'docs',
    label: 'Add to Field Guide',
    description: 'This change should be mentioned in the WordPress version Field Guide',
    usage: 'For changes that don\'t warrant a full dev note but should be included in "But Wait, There Is More!"',
    color: '#607D8B'
  },

  // Privacy & Copy Keywords
  'needs-privacy-review': {
    category: 'review',
    label: 'Needs Privacy Review',
    description: 'The Privacy team needs to review the privacy implications of the suggested changes',
    usage: 'When changes involve user data collection, storage, or processing that may have privacy implications',
    color: '#795548'
  },
  'has-privacy-review': {
    category: 'review',
    label: 'Has Privacy Review',
    description: 'The Privacy team has reviewed and provided input on the privacy implications',
    usage: 'After the core privacy team has completed their review',
    color: '#795548'
  },
  'needs-copy-review': {
    category: 'review',
    label: 'Needs Copy Review',
    description: 'Input is needed from a copywriter regarding the suggested verbiage/text changes',
    usage: 'When the ticket involves user-facing text that should be reviewed for clarity, tone, or accuracy',
    color: '#795548'
  },
  'has-copy-review': {
    category: 'review',
    label: 'Has Copy Review',
    description: 'A copywriter has reviewed and approved the text changes',
    usage: 'After copy review is complete and any necessary changes have been made',
    color: '#795548'
  },

  // Screenshot Keywords
  'needs-screenshots': {
    category: 'screenshots',
    label: 'Needs Screenshots',
    description: 'Screenshots are needed to document UI changes',
    usage: 'For patches and commits that change the user interface. Provide screenshots for desktop and mobile.',
    color: '#00BCD4'
  },
  'has-screenshots': {
    category: 'screenshots',
    label: 'Has Screenshots',
    description: 'Screenshots have been provided for the UI changes',
    usage: 'After uploading adequate screenshots showing the changes',
    color: '#00BCD4'
  },

  // Status Keywords
  'close': {
    category: 'status',
    label: 'Close',
    description: 'The ticket is a candidate for closure with a disposition other than "fixed"',
    usage: 'When you believe the ticket should be closed but want community agreement first',
    color: '#F44336'
  },

  // Additional Keywords
  'needs-review': {
    category: 'feedback',
    label: 'Needs Review',
    description: 'The patch needs review from experienced contributors',
    usage: 'When a patch is ready for technical review',
    color: '#FF9800'
  },
  'commit': {
    category: 'status',
    label: 'Commit',
    description: 'The patch is ready to be committed to core',
    usage: 'After all reviews and tests have passed',
    color: '#4CAF50'
  }
};

// Category styling
var CATEGORY_CONFIG = {
  'patch': { icon: '🔧', name: 'Patch-Related' },
  'testing': { icon: '🧪', name: 'Testing' },
  'feedback': { icon: '💬', name: 'Feedback' },
  'design': { icon: '🎨', name: 'Design' },
  'docs': { icon: '📝', name: 'Documentation' },
  'review': { icon: '👁️', name: 'Review' },
  'screenshots': { icon: '📸', name: 'Screenshots' },
  'status': { icon: '📊', name: 'Status' }
};

// Variables are shared between content scripts via execution order
// No need to expose to window in MV3
