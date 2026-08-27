import { generateDomainModules } from './curriculumFactory';
import { generateFinalAssessmentQuestions } from './courseBuilder';

const createBackendCourse = ({
  id,
  title,
  subcategory,
  level = "Intermediate",
  duration = "8 Weeks",
  estimatedHours = "24 Hours",
  priority = "STANDARD",
  description,
  skillsGained,
  careerRoles,
  whyRecommended,
  careerImpact
}) => ({
  id,
  title,
  category: "Backend Engineering",
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
  modules: generateDomainModules(id, title, "Backend Engineering", subcategory),
  finalAssessment: {
    id: `${id}-final`,
    title: `${title} — Final Comprehensive Exam`,
    type: "FINAL_ASSESSMENT",
    duration: "30 min",
    passingScore: 70,
    description: `Demonstrate complete conceptual, architectural, and practical mastery of ${title}.`,
    questions: generateFinalAssessmentQuestions(id, title, "Backend Engineering")
  },
  capstoneProject: {
    id: `${id}-proj`,
    title: `${title} — Production Capstone Architecture`,
    description: `Architect and deploy an enterprise-grade backend API service applying all principles mastered in ${title}.`,
    requirements: [
      "Implement ACID-compliant database transactions with foreign key constraint verification",
      "Configure Redis caching with TTL invalidation and distributed locking",
      "Achieve 99.9% uptime under simulated high-throughput load tests"
    ],
    timeHours: "16 Hours",
    status: "Not Started"
  }
});

export const backendCourses = [
  createBackendCourse({
    id: "be-101",
    title: "Backend Development Fundamentals",
    subcategory: "Backend Primitives",
    level: "Beginner",
    duration: "5 Weeks",
    estimatedHours: "15 Hours",
    description: "Understand client-server architecture, HTTP protocol (methods, headers, status codes), DNS resolution, TCP/IP vs UDP, and REST architectural constraints.",
    skillsGained: ["Backend Architecture", "HTTP Protocol", "REST APIs", "TCP/IP", "Client-Server Model", "DNS"],
    careerRoles: ["Backend Developer", "Full Stack Developer", "Software Engineer"],
    whyRecommended: "Foundational networking and HTTP mechanics required for all server-side engineering."
  }),
  createBackendCourse({
    id: "be-102",
    title: "Node.js Fundamentals & Event Loop",
    subcategory: "Node.js",
    level: "Beginner",
    duration: "6 Weeks",
    estimatedHours: "18 Hours",
    description: "Deep dive into the Node.js runtime: single-threaded event loop (libuv phases: timers, I/O polling, check), Buffer and Streams APIs, Worker Threads, and child processes.",
    skillsGained: ["Node.js", "Event Loop", "libuv", "Streams", "Buffers", "Worker Threads"],
    careerRoles: ["Node.js Developer", "Backend Engineer"],
    whyRecommended: "Understanding libuv and streams is essential for building memory-efficient asynchronous backends."
  }),
  createBackendCourse({
    id: "be-103",
    title: "Express.js & REST API Architecture",
    subcategory: "APIs",
    level: "Beginner",
    duration: "6 Weeks",
    estimatedHours: "18 Hours",
    description: "Build modular RESTful services with Express: routing, middleware chains, request validation (Zod/Joi), global error handling middleware, logging (Pino/Morgan), and CORS.",
    skillsGained: ["Express.js", "RESTful Routing", "Middleware Chains", "Zod Validation", "Error Handling Middleware", "Pino Logging"],
    careerRoles: ["Backend Developer", "Node.js Engineer", "Full Stack Developer"],
    whyRecommended: "Express is the standard web framework for Node.js REST API engineering."
  }),
  createBackendCourse({
    id: "be-104",
    title: "Fastify & High-Performance Microservices",
    subcategory: "Microservices",
    level: "Intermediate",
    duration: "6 Weeks",
    estimatedHours: "18 Hours",
    description: "Build ultra-low overhead microservices with Fastify: JSON Schema compilation with ajv, plugin encapsulation with fastify-plugin, hooks lifecycles, and high-throughput serialization.",
    skillsGained: ["Fastify", "High-Performance APIs", "JSON Schema", "Ajv Validation", "Fastify Plugins", "Microservices"],
    careerRoles: ["Backend Engineer", "Platform Engineer", "Microservices Architect"],
    whyRecommended: "Fastify provides up to 5x higher throughput and lower memory overhead than Express."
  }),
  createBackendCourse({
    id: "be-105",
    title: "Authentication, JWT & OAuth2 Security",
    subcategory: "Security",
    level: "Intermediate",
    duration: "6 Weeks",
    estimatedHours: "18 Hours",
    description: "Master modern security authentication: Argon2/Bcrypt password hashing, short-lived JWT access tokens with refresh token rotation, HttpOnly SameSite cookies, RBAC, and OAuth2 PKCE social login.",
    skillsGained: ["Authentication", "JWT", "OAuth 2.0", "PKCE", "Argon2 / Bcrypt", "RBAC", "HttpOnly Cookies"],
    careerRoles: ["Backend Engineer", "Security Engineer", "Full Stack Developer"],
    whyRecommended: "Securing user data and APIs against CSRF, XSS, and credential stuffing is vital for production systems."
  }),
  createBackendCourse({
    id: "be-106",
    title: "MongoDB & NoSQL Database Design",
    subcategory: "Databases",
    level: "Beginner",
    duration: "5 Weeks",
    estimatedHours: "16 Hours",
    description: "Master document data modeling in MongoDB: embedding vs referencing, aggregation pipeline ($match, $group, $lookup, $unwind), indexing strategies, and Mongoose ODM.",
    skillsGained: ["MongoDB", "NoSQL", "Document Modeling", "Aggregation Pipeline", "Mongoose", "Database Indexing"],
    careerRoles: ["Backend Developer", "Full Stack Developer", "Database Engineer"],
    whyRecommended: "MongoDB is the primary NoSQL document database used in MERN/Node.js stacks."
  }),
  createBackendCourse({
    id: "be-107",
    title: "PostgreSQL & Relational Database Architecture",
    subcategory: "Databases",
    level: "Intermediate",
    duration: "6 Weeks",
    estimatedHours: "18 Hours",
    description: "Master relational database architecture: ACID transactions, normalization (1NF, 2NF, 3NF), foreign keys, constraint enforcement, JSONB columns, Prisma ORM, and connection pooling.",
    skillsGained: ["PostgreSQL", "ACID Transactions", "Database Normalization", "Prisma ORM", "JSONB", "PgBouncer"],
    careerRoles: ["Backend Engineer", "Data Engineer", "Full Stack Developer"],
    whyRecommended: "PostgreSQL is the gold standard open-source relational database for enterprise web systems."
  }),
  createBackendCourse({
    id: "be-108",
    title: "SQL Query Optimization & Database Indexing",
    subcategory: "Databases",
    level: "Advanced",
    duration: "6 Weeks",
    estimatedHours: "18 Hours",
    description: "Master database performance tuning: EXPLAIN ANALYZE execution plans, B-Tree indexes, Composite indexes (Leftmost prefix rule), Covering indexes, and N+1 query elimination.",
    skillsGained: ["SQL Optimization", "EXPLAIN ANALYZE", "B-Tree Indexes", "Covering Indexes", "N+1 Query Problem", "Query Tuning"],
    careerRoles: ["Senior Backend Engineer", "Database Administrator", "Data Architect"],
    whyRecommended: "Slow database queries are the #1 cause of backend latency spikes under heavy production traffic."
  }),
  createBackendCourse({
    id: "be-109",
    title: "API Design, OpenAPI & GraphQL Architecture",
    subcategory: "APIs",
    level: "Intermediate",
    duration: "6 Weeks",
    estimatedHours: "18 Hours",
    description: "Design developer-friendly APIs: OpenAPI 3.1 specification, Swagger UI generation, REST maturity models, GraphQL schemas, queries, mutations, resolvers, and DataLoader batching.",
    skillsGained: ["OpenAPI 3.0", "Swagger", "GraphQL", "Schema Design", "DataLoader", "API Versioning"],
    careerRoles: ["API Architect", "Backend Developer", "Full Stack Engineer"],
    whyRecommended: "Standardized API contracts streamline multi-team frontend and backend collaboration."
  }),
  createBackendCourse({
    id: "be-110",
    title: "Backend Automated Testing (Jest, Supertest & Testcontainers)",
    subcategory: "Testing",
    level: "Intermediate",
    duration: "5 Weeks",
    estimatedHours: "16 Hours",
    description: "Master backend test automation: unit testing business logic with Jest, HTTP integration testing with Supertest, spinning up real isolated PostgreSQL/Redis databases in Docker with Testcontainers, and CI pipelines.",
    skillsGained: ["Jest", "Supertest", "Testcontainers", "Integration Testing", "Mocking", "TDD", "CI Testing"],
    careerRoles: ["Backend Engineer", "QA Automation Engineer", "Full Stack Developer"],
    whyRecommended: "Testing with real containerized databases gives true confidence that migrations and SQL queries work in production."
  }),
  createBackendCourse({
    id: "be-111",
    title: "In-Memory Caching & Distributed Locks with Redis",
    subcategory: "Caching",
    level: "Intermediate",
    duration: "6 Weeks",
    estimatedHours: "18 Hours",
    description: "Accelerate backend systems with Redis: Cache-Aside pattern, Write-Through, Write-Back, TTL expiration, cache stampede prevention, Redis data structures, and Redlock distributed locking.",
    skillsGained: ["Redis", "Caching Strategies", "Cache-Aside", "Distributed Locks", "Redlock", "Sorted Sets", "TTL Management"],
    careerRoles: ["Backend Engineer", "Performance Engineer", "System Architect"],
    whyRecommended: "Redis is the industry standard in-memory caching engine reducing database query loads by up to 90%."
  }),
  createBackendCourse({
    id: "be-112",
    title: "Message Queues & Event-Driven Architecture (RabbitMQ & Kafka)",
    subcategory: "Messaging",
    level: "Advanced",
    duration: "7 Weeks",
    estimatedHours: "22 Hours",
    description: "Design decoupled asynchronous microservices: Message brokers (RabbitMQ with AMQP exchanges) vs Event Streaming platforms (Apache Kafka with distributed partitions, consumer groups, offset management, and dead letter queues).",
    skillsGained: ["RabbitMQ", "Apache Kafka", "Event-Driven Architecture", "Consumer Groups", "Dead Letter Queues", "Idempotent Consumers"],
    careerRoles: ["Senior Backend Engineer", "Distributed Systems Engineer", "System Architect"],
    whyRecommended: "Asynchronous event queues allow systems to absorb traffic spikes without dropping customer requests."
  }),
  createBackendCourse({
    id: "be-113",
    title: "System Design Fundamentals & Scalability",
    subcategory: "System Design",
    level: "Advanced",
    duration: "8 Weeks",
    estimatedHours: "24 Hours",
    description: "Master high-scale system design: Horizontal vs Vertical scaling, Load Balancers (L4 vs L7, Consistent Hashing), Database Sharding, Replication, CAP Theorem, PACELC, and Rate Limiting algorithms.",
    skillsGained: ["System Design", "Scalability", "CAP Theorem", "Database Sharding", "Consistent Hashing", "Rate Limiting", "Load Balancing"],
    careerRoles: ["Senior Backend Engineer", "Staff Engineer", "Solutions Architect"],
    whyRecommended: "Primary competency evaluated in senior and staff backend technical interviews."
  }),
  createBackendCourse({
    id: "be-114",
    title: "Distributed Systems, Consensus & Fault Tolerance",
    subcategory: "Distributed Systems",
    level: "Advanced",
    duration: "8 Weeks",
    estimatedHours: "26 Hours",
    description: "Deep dive into distributed systems engineering: Raft consensus algorithm, 2-Phase Commit (2PC), Saga Pattern for distributed transactions, Idempotency keys, Vector Clocks, and Gossip protocol.",
    skillsGained: ["Distributed Systems", "Raft Consensus", "Saga Pattern", "2-Phase Commit", "Vector Clocks", "Fault Tolerance"],
    careerRoles: ["Principal Backend Engineer", "Distributed Systems Architect", "Staff Engineer"],
    whyRecommended: "Highest level distributed systems algorithms for mission-critical banking and cloud infrastructure."
  }),
  createBackendCourse({
    id: "tech-102",
    title: "Advanced Backend Architecture with Node.js",
    subcategory: "Architecture",
    level: "Advanced",
    duration: "8 Weeks",
    estimatedHours: "24 Hours",
    priority: "HIGH PRIORITY",
    description: "Design high-throughput REST and GraphQL backends, manage database indexing in PostgreSQL/MongoDB, and implement Redis caching & message queues.",
    skillsGained: ["Node.js", "REST APIs", "PostgreSQL", "MongoDB", "Redis", "System Design", "Microservices"],
    careerRoles: ["Staff Backend Engineer", "Lead Node.js Architect", "Principal Software Engineer"],
    whyRecommended: "Backend system design and scalable API engineering are critical requirements for your target role."
  })
];
