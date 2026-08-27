import { devopsCourses } from './devopsCourses';
import { frontendCourses } from './frontendCourses';
import { backendCourses } from './backendCourses';
import { hrCourses } from './hrCourses';
import { marketingCourses } from './marketingCourses';
import { dataCourses } from './dataCourses';
import { categoryLearningPaths } from './categoryPaths';

export {
  devopsCourses,
  frontendCourses,
  backendCourses,
  hrCourses,
  marketingCourses,
  dataCourses,
  categoryLearningPaths
};

/**
 * Master aggregated course database across all 6 core career domains (90 courses total)
 */
export const coursesData = [
  ...devopsCourses,
  ...frontendCourses,
  ...backendCourses,
  ...hrCourses,
  ...marketingCourses,
  ...dataCourses
];

/**
 * Standardized Category Mapping & Slugs
 */
export const CATEGORY_CONFIG = {
  'all': {
    id: 'all',
    label: 'All Domains',
    domain: 'all'
  },
  'devops-cloud': {
    id: 'devops-cloud',
    label: 'DevOps & Cloud',
    domain: 'tech',
    matches: ['devops', 'cloud', 'devops & cloud', 'devops and cloud']
  },
  'frontend-engineering': {
    id: 'frontend-engineering',
    label: 'Frontend Engineering',
    domain: 'tech',
    matches: ['frontend', 'frontend engineering', 'web development', 'ui']
  },
  'backend-engineering': {
    id: 'backend-engineering',
    label: 'Backend Engineering',
    domain: 'tech',
    matches: ['backend', 'backend engineering', 'node', 'system design']
  },
  'human-resources': {
    id: 'human-resources',
    label: 'Human Resources',
    domain: 'business',
    matches: ['human resources', 'hr', 'people operations', 'talent acquisition']
  },
  'marketing': {
    id: 'marketing',
    label: 'Marketing',
    domain: 'business',
    matches: ['marketing', 'growth marketing', 'digital marketing', 'brand']
  },
  'data-analytics': {
    id: 'data-analytics',
    label: 'Data & Analytics',
    domain: 'data',
    matches: ['data & analytics', 'data analytics', 'data', 'analytics', 'business intelligence']
  }
};

/**
 * Helper to normalize category strings to standardized category slugs
 */
export const normalizeCategorySlug = (categoryStr) => {
  if (!categoryStr) return 'all';
  const clean = categoryStr.toLowerCase().trim();
  for (const [slug, conf] of Object.entries(CATEGORY_CONFIG)) {
    if (slug === clean || conf.label.toLowerCase() === clean) return slug;
    if (conf.matches && conf.matches.some(m => clean.includes(m))) return slug;
  }
  return 'all';
};

/**
 * Get courses filtered by category slug
 */
export const getCoursesByCategorySlug = (slug) => {
  if (!slug || slug === 'all') return coursesData;
  const conf = CATEGORY_CONFIG[slug];
  if (!conf) return coursesData;
  return coursesData.filter(c => c.category === conf.label);
};

export default coursesData;
