// WordPress Contributor Authority Hierarchy
// Based on WordPress Test Team Training (2026-02-03)
//
// Lower numbers = higher authority
// Project Lead > Lead Developer > Core Committer > Component Maintainer > Regular User

var ROLE_HIERARCHY = {
  'Project Lead': 1,
  'Lead Developer': 2,
  'Core Committer': 3,
  'Emeritus Committer': 3,  // Same level as Core Committer
  'Component Maintainer': 4,
  'Lead Tester': 4,  // Same level as Component Maintainer
  'Themes Committer': 4,  // Same level as Component Maintainer
  'Regular User': 5  // Default for users not in wpTracContributorLabels
};

// Role colors for consistent visual styling
var ROLE_COLORS = {
  'Project Lead': '#e91e63',
  'Lead Developer': '#9c27b0',
  'Core Committer': '#3f51b5',
  'Emeritus Committer': '#ff9800',
  'Component Maintainer': '#009688',
  'Lead Tester': '#e91e63',
  'Themes Committer': '#00bcd4',
  'Regular User': '#757575'
};

// Variables are shared between content scripts via execution order
// No need to expose to window in MV3
