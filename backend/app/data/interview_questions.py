# Structured Dataset for AI Interview Engine

INTERVIEW_DATASET = [
    # FRONTEND
    {
        "skill": "React",
        "difficulty": "easy",
        "question": "Can you explain the difference between state and props in React?",
        "follow_ups": ["How do you pass data from a child component to a parent component?", "What happens if you try to mutate state directly without using setState?"],
        "category": "Frontend"
    },
    {
        "skill": "React",
        "difficulty": "medium",
        "question": "Explain how the Virtual DOM works and why it makes React fast.",
        "follow_ups": ["What is the reconciliation process?", "When would you use useMemo or useCallback to optimize performance?"],
        "category": "Frontend"
    },
    {
        "skill": "React",
        "difficulty": "hard",
        "question": "How do you handle complex state management in a large-scale React application?",
        "follow_ups": ["What are the pros and cons of using Redux vs Context API?", "How do you test components connected to global state?"],
        "category": "Frontend"
    },
    {
        "skill": "JavaScript",
        "difficulty": "medium",
        "question": "Can you explain closures in JavaScript and provide a practical use case?",
        "follow_ups": ["How do closures affect memory management?", "What is lexical scoping?"],
        "category": "Frontend"
    },
    {
        "skill": "JavaScript",
        "difficulty": "hard",
        "question": "Explain the JavaScript event loop, microtasks, and macrotasks.",
        "follow_ups": ["What happens if a promise chain is infinite?", "How does async/await fit into the event loop?"],
        "category": "Frontend"
    },
    {
        "skill": "CSS",
        "difficulty": "medium",
        "question": "What is the difference between CSS Grid and Flexbox, and when would you use each?",
        "follow_ups": ["How do you handle responsiveness in a Grid layout without media queries?", "Explain the concept of z-index and stacking contexts."],
        "category": "Frontend"
    },

    # BACKEND
    {
        "skill": "Node.js",
        "difficulty": "medium",
        "question": "How does Node.js handle asynchronous operations despite being single-threaded?",
        "follow_ups": ["Can you explain the role of libuv?", "What are the common pitfalls that can block the event loop?"],
        "category": "Backend"
    },
    {
        "skill": "FastAPI",
        "difficulty": "medium",
        "question": "Why would you choose FastAPI over Flask or Django for a new project?",
        "follow_ups": ["How does FastAPI utilize Pydantic?", "Explain how dependency injection works in FastAPI."],
        "category": "Backend"
    },
    {
        "skill": "Python",
        "difficulty": "medium",
        "question": "Explain the difference between deep copy and shallow copy in Python.",
        "follow_ups": ["How does Python handle memory allocation for variables?", "What are decorators and how are they useful?"],
        "category": "Backend"
    },
    {
        "skill": "SQL",
        "difficulty": "medium",
        "question": "What are database indexes, and how do they improve query performance?",
        "follow_ups": ["When should you NOT use an index?", "Can you explain the difference between a clustered and non-clustered index?"],
        "category": "Backend"
    },
    {
        "skill": "Microservices",
        "difficulty": "hard",
        "question": "How do you handle data consistency across distributed microservices?",
        "follow_ups": ["Can you explain the Saga pattern?", "How do you handle failures or retries in a distributed transaction?"],
        "category": "Backend"
    },

    # CLOUD & DEVOPS
    {
        "skill": "AWS",
        "difficulty": "medium",
        "question": "Can you describe the differences between EC2, ECS, and Lambda?",
        "follow_ups": ["When would you choose a serverless architecture over containers?", "How do you manage secrets in AWS?"],
        "category": "Cloud"
    },
    {
        "skill": "Docker",
        "difficulty": "medium",
        "question": "How do Docker containers differ from traditional virtual machines?",
        "follow_ups": ["What are Docker layers and how do they impact caching?", "How do you reduce the size of a Docker image?"],
        "category": "DevOps"
    },
    {
        "skill": "CI/CD",
        "difficulty": "hard",
        "question": "Walk me through setting up a zero-downtime deployment pipeline.",
        "follow_ups": ["What is a blue-green deployment vs a canary release?", "How do you handle database migrations during a zero-downtime deployment?"],
        "category": "DevOps"
    },

    # AI / ML / DATA
    {
        "skill": "Machine Learning",
        "difficulty": "medium",
        "question": "How do you handle imbalanced datasets in classification problems?",
        "follow_ups": ["When would you use SMOTE versus under-sampling?", "Why is accuracy a poor metric for imbalanced classes?"],
        "category": "AI/ML"
    },
    {
        "skill": "Machine Learning",
        "difficulty": "hard",
        "question": "Explain how you detect and prevent overfitting in a complex neural network.",
        "follow_ups": ["Can you explain dropout and L1/L2 regularization?", "How do you determine if a model has high bias or high variance?"],
        "category": "AI/ML"
    },
    {
        "skill": "NLP",
        "difficulty": "hard",
        "question": "Explain the architecture of a Transformer model and the attention mechanism.",
        "follow_ups": ["What is positional encoding and why is it necessary?", "How does multi-head attention improve upon standard attention?"],
        "category": "AI/ML"
    },

    # GENERIC / HR / BEHAVIORAL
    {
        "skill": "Generic",
        "difficulty": "easy",
        "question": "Can you walk me through your resume and highlight your most relevant experience?",
        "follow_ups": ["What motivated you to transition between those roles?", "What was your biggest takeaway from your recent project?"],
        "category": "Behavioral"
    },
    {
        "skill": "Generic",
        "difficulty": "medium",
        "question": "Tell me about a time you had a technical disagreement with a team member. How did you resolve it?",
        "follow_ups": ["What would you do differently in hindsight?", "How do you balance advocating for your idea versus compromising?"],
        "category": "Behavioral"
    },
    {
        "skill": "Generic",
        "difficulty": "medium",
        "question": "Describe a project where you had to work under a very tight deadline. How did you manage it?",
        "follow_ups": ["Did you have to cut any corners or reduce scope?", "How did you communicate delays to stakeholders?"],
        "category": "Behavioral"
    },
    {
        "skill": "Leadership",
        "difficulty": "hard",
        "question": "Tell me about a time you had to lead a project that was failing. How did you turn it around?",
        "follow_ups": ["How did you keep the team motivated?", "What metrics did you use to track the turnaround progress?"],
        "category": "Behavioral"
    }
]

def get_questions_by_category(category: str):
    return [q for q in INTERVIEW_DATASET if q["category"].lower() == category.lower()]

def get_questions_by_skill(skill: str):
    return [q for q in INTERVIEW_DATASET if q["skill"].lower() == skill.lower()]

def get_questions_by_difficulty(difficulty: str):
    return [q for q in INTERVIEW_DATASET if q["difficulty"].lower() == difficulty.lower()]
