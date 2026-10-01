import { createLesson, createModule } from './courseBuilder';
import { generateFinalAssessmentQuestions } from './courseBuilder';

const generateDevOpsCheckpointQuestions = (courseId, idx, mod) => {
  const qp = `q-${courseId}-m${idx + 1}`;
  const t = mod.title;
  return [
    { id: `${qp}-1`, question: `What is a foundational best practice when implementing ${t}?`, options: ["Always enforce automated validation, least privilege access, and idempotency.", "Bypass staging tests to deploy directly to production.", "Store secrets in unencrypted public source control.", "Disable all logging to save disk space."], correctIndex: 0, explanation: "Automated validation, least privilege access, and idempotency prevent unintended drift and security vulnerabilities." },
    { id: `${qp}-2`, question: `Why is continuous monitoring critical in ${t}?`, options: ["It automatically deletes old databases.", "It eliminates the need for software testing.", "It detects latency spikes, resource saturation, and failures before customer impact.", "It replaces cloud load balancers."], correctIndex: 2, explanation: "Proactive observability alerts engineering teams to performance bottlenecks and error rate spikes immediately." },
    { id: `${qp}-3`, question: `What is the most important security consideration for ${t}?`, options: ["Giving every team member root access for convenience.", "Implementing least-privilege access controls and encrypting sensitive data at rest and in transit.", "Storing credentials in plaintext environment variables in public repos.", "Disabling firewalls to improve network throughput."], correctIndex: 1, explanation: "Least-privilege access and encryption are fundamental security principles that protect against unauthorized access and data breaches." },
    { id: `${qp}-4`, question: `When scaling infrastructure related to ${t}, what should be prioritized?`, options: ["Using manual scripts that require SSH access to every server.", "Scaling only vertically by purchasing larger servers.", "Avoiding any form of auto-scaling to control costs.", "Automating scaling with infrastructure-as-code and load-based triggers."], correctIndex: 3, explanation: "Infrastructure-as-code with auto-scaling ensures consistent, repeatable, and responsive scaling based on actual demand." },
    { id: `${qp}-5`, question: `How should rollback strategies be handled in ${t}?`, options: ["Automated rollback should be triggered when health checks fail or error rates exceed thresholds.", "Manual rollback only, since automated systems are unreliable.", "Never roll back — always push forward with hotfixes.", "Rollback is unnecessary when using containers."], correctIndex: 0, explanation: "Automated rollback on health check failures minimizes user impact and Mean Time to Recovery (MTTR)." },
    { id: `${qp}-6`, question: `What role does testing play in the ${t} lifecycle?`, options: ["Testing is optional and slows down deployment velocity.", "Only manual testing by QA teams is sufficient.", "Testing should only happen after production deployment.", "Automated testing at every pipeline stage catches issues before they reach production."], correctIndex: 3, explanation: "Automated testing integrated into CI/CD pipelines catches defects early, reducing production incidents and remediation costs." },
    { id: `${qp}-7`, question: `What is the recommended approach to managing configuration across environments in ${t}?`, options: ["Hardcode all configurations directly in application source code.", "Use environment-specific configuration with encrypted secrets management (e.g., AWS Secrets Manager, HashiCorp Vault).", "Share the same configuration across dev, staging, and production.", "Store all configs in public S3 buckets for easy team access."], correctIndex: 1, explanation: "Environment-specific configuration with secrets management prevents credential leaks and environment-specific misconfigurations." }
  ];
};

/**
 * Helper to generate a full 7-to-10 module curriculum for DevOps courses
 */
const buildDevOpsCurriculum = (courseId, title, domainSpecificModules) => {
  return domainSpecificModules.map((mod, idx) => {
    return createModule({
      id: `${courseId}-mod-${idx + 1}`,
      order: idx + 1,
      title: mod.title,
      description: mod.description,
      lessons: mod.lessons.map((les, lIdx) => createLesson({
        id: `${courseId}-m${idx + 1}-l${lIdx + 1}`,
        title: les.title,
        type: les.type || "READING",
        duration: les.duration || "15 min",
        durationMinutes: parseInt(les.duration, 10) || 15,
        requiredDurationSeconds: 600,
        objective: les.objective,
        coreConcepts: les.coreConcepts,
        realWorldExample: les.realWorldExample,
        practicalExample: les.practicalExample,
        codeSnippet: les.codeSnippet,
        codeExplanation: les.codeExplanation,
        commonMistakes: les.commonMistakes,
        takeaways: les.takeaways,
        practicalTask: les.practicalTask
      })),
      checkpointQuiz: mod.quiz || {
        questions: generateDevOpsCheckpointQuestions(courseId, idx, mod)
      },
      externalResources: [
        { title: "Official Documentation & Reference", url: "https://docs.aws.amazon.com", provider: "Official Docs" },
        { title: "Enterprise Architecture Patterns", url: "https://coursera.org", provider: "Coursera Deep Dive" }
      ]
    });
  });
};

/**
 * DevOps & Cloud Courses (15 Comprehensive Pathway Courses with 7–10 Modules Each)
 */
export const devopsCourses = [
  {
    id: "devops-113",
    title: "AWS DevOps Engineering & CodePipeline",
    category: "DevOps & Cloud",
    subcategory: "AWS DevOps",
    level: "Advanced",
    duration: "10 Weeks",
    estimatedHours: "30 Hours",
    priority: "HIGH PRIORITY",
    description: "Build enterprise continuous delivery pipelines on AWS using CodePipeline, CodeBuild, CodeDeploy, ECS Fargate, ECR, CloudFormation/CDK, and automated canary deployments.",
    skillsGained: ["AWS DevOps", "AWS CodePipeline", "CodeBuild", "ECS Fargate", "AWS CDK", "Blue-Green Deployment", "CloudWatch", "DevSecOps"],
    careerRoles: ["AWS DevOps Engineer", "Cloud Infrastructure Engineer", "Site Reliability Engineer"],
    whyRecommended: "Prepares candidates for AWS Certified DevOps Engineer Professional competencies and enterprise cloud automation.",
    careerImpact: { readinessBoost: "+14%", skillCoverageBoost: "+18%" },
    passingScore: 70,
    modules: buildDevOpsCurriculum("devops-113", "AWS DevOps Engineering", [
      {
        title: "DevOps on AWS Foundations & IAM Security",
        description: "AWS cloud development lifecycle, service roles, least-privilege KMS encryption, and multi-account architectures.",
        lessons: [
          {
            title: "AWS DevOps Lifecycle & Well-Architected Framework",
            type: "READING",
            objective: "Understand the 6 pillars of the AWS Well-Architected Framework applied to continuous delivery pipelines.",
            coreConcepts: "AWS continuous delivery shifts manual operational tasks into automated, repeatable code infrastructure. The DevOps model integrates development and operations teams across source, build, test, staging, and production stages.",
            realWorldExample: "Netflix and Amazon deploy thousands of microservice updates daily by using standardized CI/CD account boundaries.",
            takeaways: ["Isolate staging and production inside separate AWS accounts", "Use AWS IAM Roles with STS temporary tokens rather than static IAM users"]
          },
          {
            title: "Configuring IAM Service Roles for CodePipeline & CodeBuild",
            type: "READING",
            objective: "Author least-privilege IAM trust policies for automated build runners and deployment agents.",
            coreConcepts: "CodePipeline and CodeBuild require dedicated IAM service roles. A service role allows AWS services to assume permissions to pull from S3, push container images to ECR, and create CloudWatch log streams.",
            codeSnippet: "{\n  \"Version\": \"2012-10-17\",\n  \"Statement\": [{\n    \"Effect\": \"Allow\",\n    \"Action\": [\"ecr:GetAuthorizationToken\", \"ecr:BatchCheckLayerAvailability\", \"ecr:PutImage\"],\n    \"Resource\": \"*\"\n  }]\n}",
            codeExplanation: "Grants CodeBuild permission to authenticate with Amazon ECR and publish Docker image layers.",
            takeaways: ["Never grant AdministratorAccess to CI/CD service roles", "Scope S3 artifact bucket permissions to the pipeline ARN only"]
          },
          {
            title: "Hands-on Exercise: IAM Service Role Hardening",
            type: "PRACTICAL",
            objective: "Audit an over-privileged pipeline IAM policy and restrict permissions to specific ECR repositories and S3 buckets.",
            practicalTask: {
              scenario: "An existing AWS CodeBuild project uses a wildcard Resource: * for all S3 and ECR actions.",
              instructions: [
                "Review the provided IAM policy JSON",
                "Replace wildcard resource strings with specific ARN patterns (arn:aws:s3:::my-artifact-bucket/*)",
                "Attach an explicit Deny policy for unencrypted uploads (s3:x-amz-server-side-encryption)"
              ],
              expectedResult: "A secure, least-privilege IAM policy passed by AWS IAM Access Analyzer."
            }
          }
        ]
      },
      {
        title: "Source Control & AWS CodeCommit Integration",
        description: "Branch protection triggers, AWS CodeCommit repositories, GitHub Webhooks, and EventBridge automation.",
        lessons: [
          {
            title: "Connecting GitHub & CodeCommit to AWS EventBridge",
            type: "READING",
            objective: "Trigger automated pipelines instantaneously on git push events using Amazon EventBridge rules.",
            coreConcepts: "Modern AWS pipelines use Amazon EventBridge (formerly CloudWatch Events) to detect GitHub pull request merges and CodeCommit commit events in sub-second latency.",
            realWorldExample: "Fintech systems trigger security vulnerability scans automatically whenever a pull request is opened against the main branch.",
            takeaways: ["EventBridge rules eliminate slow 5-minute polling schedules", "Branch filtering ensures staging pipelines only execute on feature branch merges"]
          },
          {
            title: "Trunk-Based Development & Semantic Versioning",
            type: "READING",
            objective: "Implement trunk-based branch workflows with conventional commit tagging for automated changelog generation.",
            coreConcepts: "Trunk-based development encourages frequent commits directly to main with short-lived feature branches (< 1 day), enabling continuous deployment without painful merge conflicts.",
            takeaways: ["Keep feature branches short-lived", "Tag releases with Semantic Versioning (vMAJOR.MINOR.PATCH)"]
          },
          {
            title: "Practical Exercise: Webhook & EventBridge Pipeline Trigger",
            type: "PRACTICAL",
            objective: "Configure a GitHub App connection and EventBridge rule triggering CodePipeline on release tags.",
            practicalTask: {
              scenario: "Your deployment pipeline must only trigger when a git tag matching v* is pushed.",
              instructions: [
                "Create an AWS CodeStar connection to GitHub",
                "Define an EventBridge event pattern filtering for tag_push events",
                "Test the trigger by pushing a simulated git tag"
              ],
              expectedResult: "CodePipeline starts execution within 2 seconds of the tag push event."
            }
          }
        ]
      },
      {
        title: "Continuous Integration with AWS CodeBuild",
        description: "Authoring buildspec.yml, multi-stage Docker builds, caching dependencies in S3, and unit test reporting.",
        lessons: [
          {
            title: "Deep Dive into buildspec.yml Lifecycle Phases",
            type: "READING",
            objective: "Structure install, pre_build, build, and post_build phases with environment variable injection.",
            coreConcepts: "CodeBuild uses buildspec.yml files to run commands in isolated ephemeral containers. The pre_build phase logs into ECR, the build phase compiles code and builds Docker images, and post_build runs vulnerability scans and outputs artifacts.",
            codeSnippet: "version: 0.2\nphases:\n  pre_build:\n    commands:\n      - echo Logging in to Amazon ECR...\n      - aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $REPOSITORY_URI\n  build:\n    commands:\n      - docker build -t $REPOSITORY_URI:latest .\n  post_build:\n    commands:\n      - docker push $REPOSITORY_URI:latest\nartifacts:\n  files:\n    - imagedefinitions.json",
            codeExplanation: "Standard production buildspec.yml building, tagging, and publishing a Docker image to ECR.",
            takeaways: ["Use S3 caching for node_modules/pip packages to cut build times by 70%", "Fail the build if unit test coverage drops below 80%"]
          },
          {
            title: "Multi-Arch Container Builds with Docker Buildx on CodeBuild",
            type: "READING",
            objective: "Build ARM64 (Graviton) and AMD64 container images simultaneously for 40% cloud cost savings.",
            coreConcepts: "AWS Graviton processors offer up to 40% better price-performance than x86. CodeBuild ARM runners compile container images natively for AWS Graviton ECS tasks.",
            takeaways: ["Graviton2/3 processors cut EC2 and Fargate compute bills", "Docker Buildx compiles multi-platform manifests"]
          },
          {
            title: "Practical Exercise: Authoring a Production buildspec.yml",
            type: "PRACTICAL",
            objective: "Write a complete buildspec.yml that runs Jest tests, builds a Docker image, and generates imagedefinitions.json.",
            practicalTask: {
              scenario: "Your team needs automated test execution and Docker publishing to Amazon ECR.",
              instructions: [
                "Define buildspec.yml with all 4 standard phases",
                "Add test report generation storing JUnit XML in CodeBuild Test Reports",
                "Output imagedefinitions.json formatted for Amazon ECS deployments"
              ],
              expectedResult: "Build passes all tests, generates coverage reports, and outputs valid deployment artifacts."
            }
          }
        ]
      },
      {
        title: "Continuous Delivery with AWS CodePipeline",
        description: "Multi-stage pipelines (Source, Build, Test, Staging, Approval, Production), artifact passing, and cross-account releases.",
        lessons: [
          {
            title: "Architecting Multi-Stage Pipelines with Manual Approval Gates",
            type: "READING",
            objective: "Design automated release stages with SNS notifications and manual promotion gates for production deployments.",
            coreConcepts: "CodePipeline coordinates pipeline actions sequentially or in parallel. Artifacts are passed between stages encrypted in an S3 bucket with KMS keys. Manual approval stages pause execution and notify on-call leads via SNS/Slack.",
            takeaways: ["KMS customer-managed keys are required for cross-account artifact sharing", "Parallel test stages reduce overall pipeline cycle time"]
          },
          {
            title: "Automated Integration Testing & Synthetic Canary Gates",
            type: "READING",
            objective: "Execute end-to-end synthetic API tests against staging before promoting builds to production.",
            coreConcepts: "Before approving production release, CodePipeline invokes an AWS Lambda action that executes synthetic API transactions against the staging environment, validating database migrations and auth endpoints.",
            takeaways: ["Lambda actions enable custom verification logic inside pipelines", "Automated rollbacks trigger if staging smoke tests fail"]
          },
          {
            title: "Practical Exercise: Multi-Stage CodePipeline with Manual Approval",
            type: "PRACTICAL",
            objective: "Construct a 4-stage pipeline with Source, Build, Staging Deploy, Manual Approval, and Production Deploy.",
            practicalTask: {
              scenario: "Production releases require explicit approval from the Lead Architect via Slack SNS notification.",
              instructions: [
                "Configure CodePipeline stages with input/output artifact bindings",
                "Add a Manual Approval action with custom SNS topic",
                "Simulate approval and verify promotion to production stage"
              ],
              expectedResult: "Pipeline halts at approval gate and resumes immediately upon authorization."
            }
          }
        ]
      },
      {
        title: "Zero-Downtime Deployments with AWS CodeDeploy & ECS Fargate",
        description: "Blue-Green deployment mechanics, Application Load Balancers, CodeDeploy AppSpec files, and traffic shifting algorithms.",
        lessons: [
          {
            title: "Blue-Green Deployments on ECS with Application Load Balancers",
            type: "READING",
            objective: "Shift production traffic gradually between replacement ECS task sets without dropping active user connections.",
            coreConcepts: "CodeDeploy manages ECS blue-green deployments by provisioning a replacement green task set, running test traffic on a secondary test port, and shifting production traffic via ALB target groups (Linear10PercentEvery1Minute or Canary10Percent5Minutes).",
            takeaways: ["Blue-Green deployments eliminate downtime completely", "CloudWatch alarms trigger automated rollback if HTTP 5xx errors spike"]
          },
          {
            title: "Configuring appspec.yaml for Amazon ECS",
            type: "READING",
            objective: "Define task definition replacements and target group port mappings in appspec.yaml.",
            coreConcepts: "The appspec.yaml file tells CodeDeploy which TaskDefinition to deploy and which ContainerName and ContainerPort to route through the Application Load Balancer.",
            codeSnippet: "version: 0.0\nResources:\n  - TargetService:\n      Type: AWS::ECS::Service\n      Properties:\n        TaskDefinition: <TASK_DEFINITION>\n        LoadBalancerInfo:\n          ContainerName: \"web-app\"\n          ContainerPort: 8080",
            codeExplanation: "AppSpec configuration binding the replacement ECS task set to the ALB target group.",
            takeaways: ["Specify test listener ports for pre-traffic verification", "Configure 10-minute wait before terminating old blue task sets"]
          },
          {
            title: "Practical Exercise: Blue-Green Canary Traffic Shifting",
            type: "PRACTICAL",
            objective: "Configure an ECS Blue-Green deployment with CodeDeploy Linear10PercentEvery1Minute traffic shifting.",
            practicalTask: {
              scenario: "Deploy a new version of a payment API while shifting 10% of traffic every minute.",
              instructions: [
                "Author appspec.yaml with primary and secondary target groups",
                "Configure CloudWatch alarm on HTTP 500 error count",
                "Trigger deployment and observe zero-downtime traffic shift in ALB metrics"
              ],
              expectedResult: "Traffic successfully transitions from Blue to Green with 0 dropped requests."
            }
          }
        ]
      },
      {
        title: "Infrastructure as Code with AWS CDK & CloudFormation",
        description: "Defining pipeline infrastructure in TypeScript using AWS CDK, synthesized CloudFormation stacks, and drift detection.",
        lessons: [
          {
            title: "AWS Cloud Development Kit (CDK) Pipelines",
            type: "READING",
            objective: "Define self-mutating CI/CD pipelines using object-oriented TypeScript code.",
            coreConcepts: "AWS CDK allows defining infrastructure using TypeScript. CDK Pipelines (Pipelines module) creates a self-mutating CodePipeline that automatically updates its own stages when infrastructure code changes.",
            takeaways: ["CDK compiles into standard AWS CloudFormation templates", "Self-mutating pipelines update their own stage definitions automatically"]
          },
          {
            title: "Drift Detection & Immutable CloudFormation Stacks",
            type: "READING",
            objective: "Detect and remediate manual cloud configuration changes using CloudFormation drift detection.",
            coreConcepts: "Configuration drift occurs when engineers make manual changes in the AWS Console. CloudFormation drift detection compares real-world resource properties against stack templates, surfacing unauthorized alterations.",
            takeaways: ["Never make manual changes in the AWS Console for production resources", "Use CloudFormation Stack Policies to protect stateful databases from deletion"]
          },
          {
            title: "Practical Exercise: CDK Pipeline in TypeScript",
            type: "PRACTICAL",
            objective: "Author a CDK TypeScript stack provisioning a VPC, ECS cluster, and CodePipeline.",
            practicalTask: {
              scenario: "Define entire infrastructure as code in TypeScript with type safety.",
              instructions: [
                "Initialize a CDK TypeScript project (cdk init app --language typescript)",
                "Define ECS Fargate service construct with ALB",
                "Synthesize and validate CloudFormation template with cdk synth"
              ],
              expectedResult: "Synthesized CloudFormation template with zero validation errors."
            }
          }
        ]
      },
      {
        title: "CloudWatch, X-Ray & Observability in CI/CD",
        description: "CloudWatch Synthetics canaries, centralized logging, AWS X-Ray distributed tracing, and automated pipeline rollbacks.",
        lessons: [
          {
            title: "CloudWatch Alarms & Automated Deployment Rollbacks",
            type: "READING",
            objective: "Configure CodeDeploy to automatically abort deployments when CloudWatch error alarms trigger.",
            coreConcepts: "Automated rollbacks monitor CloudWatch metric alarms (e.g. 5XX error rate > 1% or latency > 500ms). If an alarm triggers during traffic shifting, CodeDeploy immediately routes 100% of traffic back to the original blue task set.",
            takeaways: ["Automated rollbacks reduce Mean Time to Recovery (MTTR) from hours to seconds", "Use CloudWatch Metric Math to calculate error percentages"]
          },
          {
            title: "Distributed Tracing with AWS X-Ray in Containerized Services",
            type: "READING",
            objective: "Trace request latency bottlenecks across microservices and AWS managed databases.",
            coreConcepts: "AWS X-Ray instruments application code to track requests as they travel across API Gateway, ECS containers, Lambda functions, and DynamoDB tables, generating a live Service Map.",
            takeaways: ["X-Ray identifies slow downstream database queries", "Enable X-Ray daemon sidecars in ECS task definitions"]
          },
          {
            title: "Practical Exercise: CloudWatch Rollback Alarm Setup",
            type: "PRACTICAL",
            objective: "Create a CloudWatch Metric Alarm on ALB 5XX errors and link it to CodeDeploy rollback triggers.",
            practicalTask: {
              scenario: "Simulate a broken deployment returning HTTP 500s and verify automated rollback.",
              instructions: [
                "Create CloudWatch alarm triggering when 5xx errors exceed 5 in a 1-minute window",
                "Attach alarm to CodeDeploy deployment group auto-rollback configuration",
                "Deploy faulty image and observe automated traffic rollback"
              ],
              expectedResult: "CodeDeploy detects alarm trigger and restores Blue fleet within 30 seconds."
            }
          }
        ]
      },
      {
        title: "DevSecOps & Automated Security Gates",
        description: "Trivy container image scanning in CodeBuild, AWS Secrets Manager rotation, and AWS IAM Access Analyzer validation.",
        lessons: [
          {
            title: "Shifting Security Left with Container Vulnerability Scanning",
            type: "READING",
            objective: "Integrate Trivy and Snyk into CodeBuild pipelines to break builds on Critical and High CVEs.",
            coreConcepts: "DevSecOps enforces security gates before deployment. Trivy scans OS packages and application dependencies inside CodeBuild. If CVEs exceeding security thresholds are discovered, the build terminates with a non-zero exit code.",
            takeaways: ["Block container deployments containing Critical CVEs", "Use AWS Secrets Manager for dynamic database credentials rotation"]
          },
          {
            title: "AWS Secrets Manager & Parameter Store Dynamic Injection",
            type: "READING",
            objective: "Inject encrypted environment variables into ECS containers at boot time without baking secrets into Docker images.",
            coreConcepts: "Never hardcode API keys or passwords in Dockerfiles or git repositories. AWS Secrets Manager securely stores secrets and injects them directly into ECS container environment variables at task launch via task execution roles.",
            takeaways: ["Use AWS Secrets Manager with automatic Lambda rotation", "AWS Systems Manager Parameter Store provides free tier configuration storage"]
          },
          {
            title: "Practical Exercise: Trivy Security Gate in CodeBuild",
            type: "PRACTICAL",
            objective: "Add an automated vulnerability scan step to buildspec.yml that halts pipelines on High/Critical vulnerabilities.",
            practicalTask: {
              scenario: "Ensure no container image with known critical CVEs can reach Amazon ECR.",
              instructions: [
                "Add Trivy installation and scan commands to buildspec.yml",
                "Configure severity threshold to --severity HIGH,CRITICAL --exit-code 1",
                "Test build failure with a vulnerable base image"
              ],
              expectedResult: "CodeBuild halts and outputs a detailed vulnerability CVE audit report."
            }
          }
        ]
      },
      {
        title: "Production Capstone: Full AWS CI/CD Enterprise Engine",
        description: "Deploy an end-to-end production pipeline featuring GitHub triggers, CodeBuild multi-arch container compilation, Trivy security scanning, ECS Fargate Blue-Green deployment with ALB traffic shifting, and CloudWatch automated rollback alarms.",
        lessons: [
          {
            title: "Capstone Architecture Blueprint & Requirements",
            type: "READING",
            objective: "Review the production enterprise architecture specification for the final capstone project.",
            coreConcepts: "The capstone project combines every discipline mastered in this course: automated source triggers, Docker container builds, automated unit testing, container vulnerability scanning, multi-stage pipeline promotion, zero-downtime Blue-Green traffic shifting, and automated CloudWatch rollbacks.",
            takeaways: ["Full integration of GitHub, CodePipeline, CodeBuild, ECR, ECS Fargate, ALB, and CloudWatch", "Achieve 100% automated deployment lifecycle with zero manual console intervention"]
          },
          {
            title: "Capstone Implementation & Verification Workflow",
            type: "PRACTICAL",
            objective: "Deploy and execute the complete enterprise CI/CD pipeline end-to-end.",
            practicalTask: {
              scenario: "Execute an end-to-end automated deployment of a multi-container application on AWS ECS Fargate.",
              instructions: [
                "Configure GitHub repository with buildspec.yml and appspec.yaml",
                "Provision CodePipeline with Source, Build (Trivy + ECR push), and Deploy stages",
                "Trigger automated Blue-Green release and verify zero-downtime traffic cutover with curl loop"
              ],
              expectedResult: "Live production application deployed on AWS ECS with zero downtime and automated canary traffic shifting."
            }
          }
        ]
      }
    ]),
    finalAssessment: {
      id: "devops-113-final",
      title: "AWS DevOps Professional Certification Exam",
      type: "FINAL_ASSESSMENT",
      duration: "30 min",
      passingScore: 70,
      description: "Demonstrate complete mastery of AWS CodePipeline, CodeBuild, CodeDeploy, ECS Blue-Green deployments, CloudFormation/CDK, and DevSecOps.",
      questions: generateFinalAssessmentQuestions("devops-113", "AWS DevOps Engineering & CodePipeline", "DevOps & Cloud")
    },
    capstoneProject: {
      id: "devops-113-proj",
      title: "Enterprise AWS Native CI/CD Pipeline & ECS Fargate Production Engine",
      description: "Construct a complete AWS native pipeline using AWS CDK TypeScript, CodePipeline, CodeBuild with ECR and Trivy, and ECS Fargate Blue-Green deployments with automated CloudWatch rollbacks.",
      requirements: [
        "Author complete infrastructure using AWS CDK TypeScript",
        "Implement CodePipeline with automated Trivy container vulnerability scanning in CodeBuild",
        "Configure Blue-Green canary deployment with automated CloudWatch alarm rollbacks"
      ],
      timeHours: "16 Hours",
      status: "Not Started"
    }
  },
  // We can construct other courses with our academic curriculum builder
  {
    id: "tech-103",
    title: "Docker Fundamentals & Containerization",
    category: "DevOps & Cloud",
    subcategory: "Containerization",
    level: "Intermediate",
    duration: "8 Weeks",
    estimatedHours: "24 Hours",
    priority: "HIGH PRIORITY",
    description: "Master Linux containerization, multi-stage Dockerfiles, Docker Compose, bridge networking, volume persistence, and non-root container security.",
    skillsGained: ["Docker", "Containerization", "Docker Compose", "Multi-stage Builds", "Volume Persistence", "Container Security"],
    careerRoles: ["DevOps Engineer", "Backend Developer", "Cloud Engineer"],
    whyRecommended: "Containerization is standard across modern microservice and cloud deployments.",
    careerImpact: { readinessBoost: "+10%", skillCoverageBoost: "+14%" },
    passingScore: 70,
    modules: buildDevOpsCurriculum("tech-103", "Docker Mastery", [
      {
        title: "Containerization Fundamentals & Linux Namespaces",
        description: "Namespaces (PID, NET, MNT, IPC, UTS), cgroups resource limits, and OverlayFS layer caching.",
        lessons: [
          {
            title: "Containers vs Virtual Machines: Under the Hood",
            type: "READING",
            objective: "Understand how container runtimes leverage host kernel isolation mechanisms.",
            coreConcepts: "Containers run isolated user-space processes on top of the shared host kernel using Linux namespaces and cgroups, achieving sub-second boot times and near-zero virtualization overhead.",
            takeaways: ["Containers share the host OS kernel", "Namespaces isolate resources; cgroups limit CPU/RAM consumption"]
          },
          {
            title: "Linux cgroups & Memory Limit Enforcement",
            type: "READING",
            objective: "Configure container memory limits to prevent out-of-memory kernel panics.",
            coreConcepts: "Control groups (cgroups) regulate process resource consumption. Without memory limits, a container memory leak can cause the Linux OOM Killer to terminate critical host system processes.",
            takeaways: ["Always specify --memory and --cpus limits", "Use docker stats to monitor real-time resource utilization"]
          },
          {
            title: "Practical Exercise: Inspecting Linux Namespaces",
            type: "PRACTICAL",
            objective: "Run isolated container processes and inspect namespace isolation with lsns and ps.",
            practicalTask: {
              scenario: "Inspect how PID namespaces isolate container processes from the host operating system.",
              instructions: [
                "Run a detached Alpine container running top",
                "Inspect the container PID using docker top",
                "Compare the container PID (PID 1) with the actual host process PID (PID 12480)"
              ],
              expectedResult: "Demonstrated understanding that container PID 1 is mapped to a distinct host PID."
            }
          }
        ]
      },
      {
        title: "Docker Images & Multi-Stage Dockerfile Optimization",
        description: "OverlayFS layer caching, minimizing image layers, and Google Distroless minimal runtime images.",
        lessons: [
          {
            title: "Docker Layer Caching & Instruction Ordering",
            type: "READING",
            objective: "Order Dockerfile commands to maximize layer cache hits during CI/CD builds.",
            coreConcepts: "Docker evaluates Dockerfile instructions top-to-bottom. Placing package.json and npm install before copying application source code ensures expensive dependency installations are cached unless dependencies change.",
            codeSnippet: "FROM node:20-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nCMD [\"node\", \"server.js\"]",
            codeExplanation: "Caches npm ci layer, reducing build times from 3 minutes to 4 seconds on source code edits.",
            takeaways: ["Place least-frequently changed commands at the top", "Combine RUN commands with && to minimize layer count"]
          },
          {
            title: "Multi-Stage Builds & Distroless Runtime Images",
            type: "READING",
            objective: "Decouple compilers and package managers from lean production runtime containers.",
            coreConcepts: "Multi-stage builds compile code in a heavy build stage and copy only compiled binaries to a minimal Distroless image with no shell or package manager, reducing image size from 1.2GB to 85MB.",
            takeaways: ["Distroless images drastically reduce CVE attack surfaces", "Eliminate compilers, package managers, and debug tools in production"]
          },
          {
            title: "Practical Exercise: Multi-Stage Dockerfile Optimization",
            type: "PRACTICAL",
            objective: "Refactor a heavy 1.4GB Node.js Dockerfile into an optimized 90MB Distroless container image.",
            practicalTask: {
              scenario: "Optimize a bloated development Docker image for production deployment.",
              instructions: [
                "Create a multi-stage Dockerfile with AS builder stage",
                "Copy compiled dist/ to gcr.io/distroless/nodejs20-debian12",
                "Verify final image size with docker images"
              ],
              expectedResult: "Production container image size under 100MB with zero security CVEs."
            }
          }
        ]
      },
      {
        title: "Docker Storage, Volumes & Data Persistence",
        description: "Bind mounts vs Named Volumes vs tmpfs mounts, volume backup workflows, and permissions.",
        lessons: [
          {
            title: "Named Volumes vs Bind Mounts vs tmpfs",
            type: "READING",
            objective: "Persist database data independently of container lifecycles using named Docker volumes.",
            coreConcepts: "Container writable layers are ephemeral; destroying a container deletes its writable layer. Named volumes store data directly in /var/lib/docker/volumes on the host, ensuring persistent database storage across container upgrades.",
            takeaways: ["Use Named Volumes for databases (PostgreSQL, MongoDB)", "Use Bind Mounts for local development live-reloading"]
          },
          {
            title: "Automated Volume Backup & Restoration Procedures",
            type: "READING",
            objective: "Backup Docker volume data to compressed tar archives using ephemeral helper containers.",
            coreConcepts: "To backup a named volume, attach an ephemeral container mounting the volume and an output directory, executing tar -czvf to archive data safely.",
            takeaways: ["Automate nightly volume tar snapshots", "Test database restoration procedures regularly"]
          },
          {
            title: "Practical Exercise: PostgreSQL Named Volume Mount",
            type: "PRACTICAL",
            objective: "Deploy a PostgreSQL container with a persistent named volume, insert data, destroy the container, and verify data persists upon reboot.",
            practicalTask: {
              scenario: "Verify data persistence across container recreation.",
              instructions: [
                "Create a named volume: docker volume create pg_data",
                "Run Postgres with -v pg_data:/var/lib/postgresql/data",
                "Insert sample records, docker rm -f the container, start a new container, and verify records"
              ],
              expectedResult: "All database records persist intact in the newly spawned container."
            }
          }
        ]
      },
      {
        title: "Docker Networking & Service Discovery",
        description: "Bridge networks, Host networking, Overlay networks, and embedded DNS resolution.",
        lessons: [
          {
            title: "Custom User-Defined Bridge Networks & Embedded DNS",
            type: "READING",
            objective: "Connect multiple microservice containers using automatic DNS name resolution.",
            coreConcepts: "Default bridge networks do not support automatic container DNS resolution. Custom user-defined bridge networks provide automatic service discovery: containers connect to each other by container name (e.g. http://api-service:8080).",
            takeaways: ["Never link containers using deprecated --link", "User-defined bridge networks isolate microservice traffic"]
          },
          {
            title: "Port Mapping, EXPOSE vs -p / -P Flags",
            type: "READING",
            objective: "Map host ports to container ports and understand the distinction between EXPOSE metadata and real port binding.",
            coreConcepts: "The EXPOSE instruction is purely documentation. The -p host_port:container_port flag instructs iptables to forward traffic from host network interfaces to the container bridge interface.",
            takeaways: ["-p 8080:80 maps host port 8080 to container port 80", "127.0.0.1:8080:80 restricts binding to localhost only"]
          },
          {
            title: "Practical Exercise: Multi-Container Network Isolation",
            type: "PRACTICAL",
            objective: "Create an isolated bridge network and verify HTTP communication between a React frontend and Node API.",
            practicalTask: {
              scenario: "Create a private backend network inaccessible to external internet traffic.",
              instructions: [
                "Create bridge network: docker network create app_net",
                "Run API and DB containers attached to app_net",
                "Test internal DNS resolution with curl http://api:3000"
              ],
              expectedResult: "Containers communicate seamlessly over internal Docker DNS."
            }
          }
        ]
      },
      {
        title: "Multi-Container Orchestration with Docker Compose",
        description: "compose.yaml syntax, health checks, environment files, depends_on conditions, and volumes.",
        lessons: [
          {
            title: "Mastering Docker Compose Architecture",
            type: "READING",
            objective: "Orchestrate multi-container applications (frontend, backend, database, cache) with a single command.",
            coreConcepts: "Docker Compose defines multi-container stacks in declarative YAML. Compose creates a default shared network, mounts volumes, configures environment variables, and manages startup dependencies with condition: service_healthy.",
            codeSnippet: "services:\n  web:\n    build: ./web\n    ports:\n      - \"3000:3000\"\n    depends_on:\n      api:\n        condition: service_healthy\n  api:\n    build: ./api\n    healthcheck:\n      test: [\"CMD\", \"curl\", \"-f\", \"http://localhost:8000/health\"]\n      interval: 10s\n      retries: 3",
            codeExplanation: "Ensures the web frontend only starts after the API health check reports healthy.",
            takeaways: ["Use depends_on with condition: service_healthy to prevent race conditions on startup", "Store secrets in .env files ignored by git"]
          },
          {
            title: "Docker Compose Profiles & Overrides for Dev/Prod",
            type: "READING",
            objective: "Manage environment-specific configurations using docker-compose.override.yml.",
            coreConcepts: "Compose automatically merges docker-compose.yml with docker-compose.override.yml, allowing local volume bind mounts for development while keeping production configurations clean.",
            takeaways: ["Use compose profiles to enable optional services (e.g. adminer, pgadmin)", "Override files keep production compose files clean"]
          },
          {
            title: "Practical Exercise: Full-Stack Docker Compose Stack",
            type: "PRACTICAL",
            objective: "Author a complete docker-compose.yml file managing React frontend, Node backend, PostgreSQL database, and Redis cache.",
            practicalTask: {
              scenario: "Orchestrate an entire 4-service stack with automated database health checks.",
              instructions: [
                "Author compose.yaml with health checks and named volumes",
                "Run docker compose up -d and verify all services boot in correct order",
                "Inspect running container health status with docker compose ps"
              ],
              expectedResult: "All 4 containers running healthy and communicating across the shared Compose network."
            }
          }
        ]
      },
      {
        title: "Container Security & Non-Root Execution",
        description: "Dropping Linux capabilities, running as non-root (USER 1001), read-only root filesystems, and image signing.",
        lessons: [
          {
            title: "The Danger of Running Containers as Root",
            type: "READING",
            objective: "Enforce non-root user execution inside Dockerfiles to prevent container breakout privilege escalation.",
            coreConcepts: "By default, containers execute as root (UID 0). If a vulnerability allows an attacker to break out of the container, they gain root access to the underlying host server. Always create a dedicated non-root user (USER 1001) in production Dockerfiles.",
            codeSnippet: "FROM node:20-alpine\nWORKDIR /app\nCOPY --chown=node:node . .\nUSER node\nCMD [\"node\", \"server.js\"]",
            codeExplanation: "Switches execution context to the unprivileged 'node' user (UID 1000).",
            takeaways: ["Always declare USER <non-root-uid> before CMD", "Drop unnecessary Linux kernel capabilities with --cap-drop=ALL"]
          },
          {
            title: "Read-Only Root Filesystems & Secret Protection",
            type: "READING",
            objective: "Lock down container filesystems using --read-only flags with temporary tmpfs mounts.",
            coreConcepts: "Running containers with a read-only root filesystem prevents attackers from downloading malicious binaries or modifying source code files in memory during runtime exploits.",
            takeaways: ["Mount temporary write paths (e.g. /tmp) with tmpfs", "Scan images in CI using Trivy before deploying"]
          },
          {
            title: "Practical Exercise: Hardening a Container Image",
            type: "PRACTICAL",
            objective: "Take an insecure root Dockerfile and harden it with non-root user execution and dropped capabilities.",
            practicalTask: {
              scenario: "Eliminate all High/Critical vulnerabilities and root privileges from a web container.",
              instructions: [
                "Add useradd -u 1001 appuser and chown directives",
                "Set USER 1001",
                "Run container with --read-only and verify security compliance with docker inspect"
              ],
              expectedResult: "Container runs successfully as non-root user UID 1001 with read-only root filesystem."
            }
          }
        ]
      },
      {
        title: "Production Docker Capstone Project",
        description: "Build an enterprise multi-tier production container architecture with multi-stage builds, non-root security, health checks, and Docker Compose orchestration.",
        lessons: [
          {
            title: "Production Architecture Blueprint & Security Standards",
            type: "READING",
            objective: "Review production requirements for the full-stack containerization capstone.",
            coreConcepts: "The capstone project requires building multi-stage, non-root Dockerfiles for a microservice application, authoring an automated Compose orchestrator with health checks, and achieving zero security vulnerabilities.",
            takeaways: ["Multi-stage builds under 100MB", "Strict non-root user execution and persistent volume persistence"]
          },
          {
            title: "Capstone Implementation & Benchmark Verification",
            type: "PRACTICAL",
            objective: "Deploy the complete multi-container stack and benchmark throughput and resilience.",
            practicalTask: {
              scenario: "Deploy and verify a 4-tier microservice container system under simulated load.",
              instructions: [
                "Author optimized multi-stage Dockerfiles with Distroless runtime",
                "Orchestrate with Docker Compose, health checks, and volume mounts",
                "Benchmark and verify sub-10ms response times with Apache Bench"
              ],
              expectedResult: "High-performance production container stack running with zero security vulnerabilities."
            }
          }
        ]
      }
    ]),
    finalAssessment: {
      id: "tech-103-final",
      title: "Docker Certified Associate Practice Exam",
      type: "FINAL_ASSESSMENT",
      duration: "30 min",
      passingScore: 70,
      description: "Demonstrate mastery over container internals, multi-stage builds, networking, storage, Compose, and security.",
      questions: generateFinalAssessmentQuestions("tech-103", "Docker & Container Orchestration", "DevOps & Cloud")
    },
    capstoneProject: {
      id: "tech-103-proj",
      title: "Enterprise Multi-Service Containerization & Orchestration Engine",
      description: "Build an optimized multi-tier microservice application with React frontend, Node.js API, PostgreSQL database, and Redis cache, featuring multi-stage Distroless Dockerfiles and Compose orchestration.",
      requirements: [
        "Author multi-stage Distroless Dockerfiles with non-root security",
        "Configure Docker Compose with container health checks and volume persistence",
        "Pass automated security vulnerability audit with 0 High/Critical CVEs"
      ],
      timeHours: "14 Hours",
      status: "Not Started"
    }
  }
];
