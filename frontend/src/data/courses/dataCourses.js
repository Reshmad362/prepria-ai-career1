import { generateDomainModules } from './curriculumFactory';
import { generateFinalAssessmentQuestions } from './courseBuilder';

const createDataCourse = ({
  id,
  title,
  subcategory,
  level = "Intermediate",
  duration = "6 Weeks",
  estimatedHours = "18 Hours",
  priority = "STANDARD",
  description,
  skillsGained,
  careerRoles,
  whyRecommended,
  careerImpact
}) => ({
  id,
  title,
  category: "Data & Analytics",
  subcategory,
  level,
  duration,
  estimatedHours,
  priority,
  description,
  skillsGained,
  careerRoles,
  whyRecommended,
  careerImpact: careerImpact || { readinessBoost: "+11%", skillCoverageBoost: "+15%" },
  passingScore: 70,
  modules: generateDomainModules(id, title, "Data & Analytics", subcategory),
  finalAssessment: {
    id: `${id}-final`,
    title: `${title} — Final Comprehensive Exam`,
    type: "FINAL_ASSESSMENT",
    duration: "30 min",
    passingScore: 70,
    description: `Demonstrate complete conceptual, analytical, and technical mastery of ${title}.`,
    questions: generateFinalAssessmentQuestions(id, title, "Data & Analytics")
  },
  capstoneProject: {
    id: `${id}-proj`,
    title: `${title} — Production Analytics Capstone`,
    description: `Design, clean, model, and publish an interactive business intelligence suite applying all principles mastered in ${title}.`,
    requirements: [
      "Author modular analytical SQL/Python data transformation pipelines with automated cleaning",
      "Construct Star Schema data models with complex measure calculations",
      "Design an executive storytelling dashboard communicating strategic recommendations"
    ],
    timeHours: "14 Hours",
    status: "Not Started"
  }
});

export const dataCourses = [
  createDataCourse({
    id: "data-101",
    title: "Advanced SQL & Business Analytics Modeling",
    subcategory: "SQL & Analytics",
    level: "Intermediate",
    duration: "8 Weeks",
    estimatedHours: "24 Hours",
    priority: "HIGH PRIORITY",
    description: "Master complex SQL window functions, relational database modeling, business KPI calculations, and interactive Power BI dashboards.",
    skillsGained: ["SQL", "Data Analysis", "Window Functions", "Power BI", "Data Modeling", "Business Intelligence"],
    careerRoles: ["Data Analyst", "Business Analyst", "BI Analyst", "Product Analyst"],
    whyRecommended: "SQL is the foundational technical skill tested in 95%+ of data and analytics hiring screens."
  }),
  createDataCourse({
    id: "data-102",
    title: "Data Analytics Fundamentals & Data Literacy",
    subcategory: "Data Fundamentals",
    level: "Beginner",
    duration: "5 Weeks",
    estimatedHours: "15 Hours",
    description: "Understand the data lifecycle: data collection, descriptive vs diagnostic vs predictive vs prescriptive analytics, data types, and data governance.",
    skillsGained: ["Data Literacy", "Data Lifecycle", "Descriptive Analytics", "Diagnostic Analytics", "Data Governance"],
    careerRoles: ["Junior Data Analyst", "Business Analyst", "Operations Analyst"],
    whyRecommended: "Foundational conceptual framework for interpreting and questioning business data."
  }),
  createDataCourse({
    id: "data-103",
    title: "Microsoft Excel for Advanced Data Analysis",
    subcategory: "Spreadsheets",
    level: "Beginner",
    duration: "6 Weeks",
    estimatedHours: "18 Hours",
    description: "Master analytical Excel: XLOOKUP, INDEX/MATCH, Pivot Tables & Slicers, Power Query ETL, conditional formatting, What-If Analysis, and financial modeling.",
    skillsGained: ["Excel", "XLOOKUP", "Pivot Tables", "Power Query", "Data Modeling", "Goal Seek", "INDEX/MATCH"],
    careerRoles: ["Data Analyst", "Financial Analyst", "Business Analyst"],
    whyRecommended: "Excel is the ubiquitous analytical tool utilized in 100% of corporate business environments."
  }),
  createDataCourse({
    id: "data-104",
    title: "SQL Fundamentals & Relational Querying",
    subcategory: "SQL & Analytics",
    level: "Beginner",
    duration: "6 Weeks",
    estimatedHours: "18 Hours",
    description: "Learn relational database querying from scratch: SELECT, WHERE, GROUP BY, HAVING, ORDER BY, INNER/LEFT/RIGHT joins, aggregate functions, and subqueries.",
    skillsGained: ["SQL", "Relational Joins", "Aggregations", "Subqueries", "Data Filtering", "Group By"],
    careerRoles: ["Junior Data Analyst", "Business Analyst", "BI Developer"],
    whyRecommended: "Essential core skill required to query enterprise data warehouses and production databases."
  }),
  createDataCourse({
    id: "data-105",
    title: "Python for Data Analysis (NumPy & Pandas)",
    subcategory: "Python for Data",
    level: "Intermediate",
    duration: "7 Weeks",
    estimatedHours: "20 Hours",
    description: "Analyze datasets with Python: NumPy ndarrays, Pandas DataFrames and Series, vectorization, missing data handling, group operations, and merging.",
    skillsGained: ["Python", "Pandas", "NumPy", "DataFrames", "Vectorization", "Data Transformation"],
    careerRoles: ["Data Analyst", "Data Scientist", "Python Developer"],
    whyRecommended: "Pandas and NumPy are the industry standard libraries for programmatic data manipulation and statistical analysis."
  }),
  createDataCourse({
    id: "data-106",
    title: "Statistics & Probability for Data Analysts",
    subcategory: "Statistics",
    level: "Intermediate",
    duration: "6 Weeks",
    estimatedHours: "18 Hours",
    description: "Master descriptive and inferential statistics: Central Tendency, Standard Deviation, Normal Distribution, Central Limit Theorem, Hypothesis Testing, and Confidence Intervals.",
    skillsGained: ["Statistics", "Probability", "Hypothesis Testing", "p-values", "Normal Distribution", "A/B Testing Math", "Central Limit Theorem"],
    careerRoles: ["Data Analyst", "Quantitative Analyst", "Data Scientist"],
    whyRecommended: "Statistical rigor prevents drawing false business conclusions from random noise in data samples."
  }),
  createDataCourse({
    id: "data-107",
    title: "Data Cleaning, Wrangling & Preprocessing",
    subcategory: "Data Engineering",
    level: "Intermediate",
    duration: "6 Weeks",
    estimatedHours: "18 Hours",
    description: "Clean messy real-world datasets: missing value imputation strategies, outlier detection (Z-score, IQR method), handling duplicates, date-time parsing, and regex cleaning.",
    skillsGained: ["Data Cleaning", "Data Wrangling", "Outlier Detection (IQR)", "Missing Value Imputation", "Regex Cleaning", "Feature Scaling"],
    careerRoles: ["Data Analyst", "Data Engineer", "Analytics Engineer"],
    whyRecommended: "80% of a data analyst's time is spent preparing, cleaning, and validating messy data."
  }),
  createDataCourse({
    id: "data-108",
    title: "Data Visualization & Storytelling Fundamentals",
    subcategory: "Data Visualization",
    level: "Beginner",
    duration: "5 Weeks",
    estimatedHours: "15 Hours",
    description: "Communicate insights effectively: chart selection principles, visual hierarchy, Gestalt principles of perception, color psychology, and executive data storytelling.",
    skillsGained: ["Data Visualization", "Data Storytelling", "Chart Selection", "Gestalt Principles", "Visual Hierarchy", "Matplotlib / Seaborn"],
    careerRoles: ["Data Analyst", "BI Specialist", "Management Consultant"],
    whyRecommended: "Insights are useless unless stakeholders understand and act upon visual data presentations."
  }),
  createDataCourse({
    id: "data-109",
    title: "Power BI Fundamentals & DAX Formulas",
    subcategory: "Business Intelligence",
    level: "Intermediate",
    duration: "7 Weeks",
    estimatedHours: "20 Hours",
    description: "Build enterprise business intelligence dashboards in Power BI: Star Schema data modeling, Power Query transformations, DAX calculations, and interactive drill-downs.",
    skillsGained: ["Power BI", "DAX Formulas", "Star Schema", "CALCULATE", "Time Intelligence", "Data Modeling", "BI Dashboards"],
    careerRoles: ["Power BI Developer", "BI Analyst", "Data Analyst"],
    whyRecommended: "Power BI is the leading corporate business intelligence platform across enterprise organizations."
  }),
  createDataCourse({
    id: "data-110",
    title: "Tableau Desktop for Visual Analytics",
    subcategory: "Business Intelligence",
    level: "Intermediate",
    duration: "6 Weeks",
    estimatedHours: "18 Hours",
    description: "Master visual analytics in Tableau Desktop: Dimensions vs Measures, Discrete vs Continuous pills, Level of Detail (LOD) expressions, dual-axis charts, and dashboard actions.",
    skillsGained: ["Tableau", "LOD Expressions (FIXED)", "Dual-Axis Charts", "Calculated Fields", "Visual Analytics", "Dashboard Actions"],
    careerRoles: ["Tableau Developer", "Data Visualization Analyst", "BI Specialist"],
    whyRecommended: "Tableau is the premier exploratory data visualization and business intelligence platform."
  }),
  createDataCourse({
    id: "data-111",
    title: "Exploratory Data Analysis (EDA) Masterclass",
    subcategory: "EDA",
    level: "Intermediate",
    duration: "6 Weeks",
    estimatedHours: "18 Hours",
    description: "Systematic data exploration in Python: univariate analysis, bivariate analysis, multivariate pairplots, skewness transformations, and hypothesis generation.",
    skillsGained: ["Exploratory Data Analysis", "Seaborn", "Correlation Heatmaps", "Skewness Transformations", "Hypothesis Generation", "Pairplots"],
    careerRoles: ["Data Analyst", "Data Scientist", "Quantitative Researcher"],
    whyRecommended: "Rigorous EDA uncovers hidden patterns and guides feature engineering prior to modeling."
  }),
  createDataCourse({
    id: "data-112",
    title: "Business Analytics & Metric Tree Architecture",
    subcategory: "Business Analytics",
    level: "Intermediate",
    duration: "6 Weeks",
    estimatedHours: "18 Hours",
    description: "Bridge business strategy with quantitative data: constructing North Star Metric Trees, Unit Economics, cohort retention modeling, and diagnosing metric drop-offs.",
    skillsGained: ["Business Analytics", "Metric Trees", "North Star Metric", "Unit Economics", "LTV / CAC Ratio", "Cohort Retention"],
    careerRoles: ["Business Analyst", "Product Analyst", "Strategy & Operations Lead"],
    whyRecommended: "Connecting high-level business revenue goals with root-cause operational levers is the hallmark of top-tier analysts."
  }),
  createDataCourse({
    id: "data-113",
    title: "Predictive Analytics & Regression Modeling",
    subcategory: "Predictive Analytics",
    level: "Advanced",
    duration: "7 Weeks",
    estimatedHours: "22 Hours",
    description: "Build predictive models with scikit-learn: Simple & Multiple Linear Regression, Logistic Regression for binary classification, evaluating R-squared, RMSE, and ROC-AUC curves.",
    skillsGained: ["Predictive Analytics", "Linear Regression", "Logistic Regression", "scikit-learn", "ROC-AUC", "RMSE", "Model Evaluation"],
    careerRoles: ["Predictive Analyst", "Data Scientist", "Quantitative Analyst"],
    whyRecommended: "Move beyond retrospective descriptive reporting into forecasting future customer demand and churn."
  }),
  createDataCourse({
    id: "data-114",
    title: "Data Science Fundamentals & Machine Learning Workflows",
    subcategory: "Data Science",
    level: "Advanced",
    duration: "8 Weeks",
    estimatedHours: "24 Hours",
    description: "Master essential machine learning algorithms: Decision Trees, Random Forests, Gradient Boosting (XGBoost), K-Means clustering, PCA, and MLflow pipeline tracking.",
    skillsGained: ["Data Science", "Machine Learning", "Random Forest", "XGBoost", "K-Means Clustering", "PCA", "Hyperparameter Tuning"],
    careerRoles: ["Junior Data Scientist", "Machine Learning Analyst", "Quantitative Researcher"],
    whyRecommended: "Gradient Boosted Trees (XGBoost) are the top-performing algorithms for tabular business data."
  }),
  createDataCourse({
    id: "data-115",
    title: "Advanced Data Analytics & Enterprise Cloud Data Warehousing",
    subcategory: "Data Warehousing",
    level: "Advanced",
    duration: "8 Weeks",
    estimatedHours: "26 Hours",
    description: "Architect modern data stack infrastructure: Cloud Data Warehouses (Snowflake & Google BigQuery), dbt for SQL transformations, dimensional data modeling, and Reverse ETL.",
    skillsGained: ["Snowflake", "dbt (data build tool)", "BigQuery", "Kimball Methodology", "Data Warehousing", "ELT Pipelines"],
    careerRoles: ["Analytics Engineer", "Senior BI Architect", "Lead Data Analyst"],
    whyRecommended: "Analytics Engineering with dbt and Snowflake is the highest-paying modern data stack discipline."
  })
];
