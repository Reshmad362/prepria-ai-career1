/**
 * PREPRIA AI Learning Hub - Central Course Curriculum Database
 * Aggregates 90 modular career pathway courses across 6 major professional domains:
 * - DevOps & Cloud (15 courses)
 * - Frontend Engineering (15 courses)
 * - Backend Engineering (15 courses)
 * - Human Resources (15 courses)
 * - Marketing (15 courses)
 * - Data & Analytics (15 courses)
 */

import {
  coursesData,
  devopsCourses,
  frontendCourses,
  backendCourses,
  hrCourses,
  marketingCourses,
  dataCourses,
  categoryLearningPaths,
  CATEGORY_CONFIG,
  normalizeCategorySlug,
  getCoursesByCategorySlug
} from './courses/index';

export {
  coursesData,
  devopsCourses,
  frontendCourses,
  backendCourses,
  hrCourses,
  marketingCourses,
  dataCourses,
  categoryLearningPaths,
  CATEGORY_CONFIG,
  normalizeCategorySlug,
  getCoursesByCategorySlug
};

export default coursesData;
