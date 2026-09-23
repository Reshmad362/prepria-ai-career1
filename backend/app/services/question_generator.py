import random
from typing import List, Dict

COMMON_HR_QUESTIONS = [
    {"type": "HR", "topic": "Personal Introduction", "difficulty": "easy", "question": "Tell me about yourself."},
    {"type": "HR", "topic": "Company Culture & Fit", "difficulty": "easy", "question": "Why do you want to work for our company?"},
    {"type": "HR", "topic": "Career Trajectory", "difficulty": "medium", "question": "Where do you see yourself in 5 years?"},
    {"type": "behavioral", "topic": "Conflict Resolution", "difficulty": "medium", "question": "Describe a time you faced a conflict at work and how you resolved it."},
    {"type": "behavioral", "topic": "Resilience & Growth", "difficulty": "hard", "question": "Tell me about a time you failed and what you learned from it."},
    {"type": "situational", "topic": "Time Management", "difficulty": "medium", "question": "How do you prioritize your work when everything is urgent?"},
    {"type": "situational", "topic": "Communication & Alignment", "difficulty": "hard", "question": "If you strongly disagree with your manager's decision, how would you handle it?"}
]

ROLE_QUESTIONS = {
    "Full Stack Developer": [
        {"type": "technical", "topic": "Web Fundamentals", "difficulty": "easy", "question": "What is the DOM in web development?"},
        {"type": "technical", "topic": "HTTP Protocols", "difficulty": "easy", "question": "Explain the difference between GET and POST requests."},
        {"type": "technical", "topic": "Database Architecture", "difficulty": "medium", "question": "Explain the difference between SQL and NoSQL."},
        {"type": "technical", "topic": "React Architecture", "difficulty": "medium", "question": "What is React Virtual DOM?"},
        {"type": "technical", "topic": "Frontend Optimization", "difficulty": "hard", "question": "How do you optimize a React application for performance?"},
        {"type": "situational", "topic": "Database Performance & Indexing", "difficulty": "medium", "question": "A production database query is slow. How do you troubleshoot?"},
        {"type": "technical", "topic": "Node.js & Asynchronous I/O", "difficulty": "hard", "question": "Explain Event Loop in Node.js."},
        {"type": "technical", "topic": "SQL Indexing", "difficulty": "medium", "question": "Explain how database indexing works and when an index might degrade write performance."},
        {"type": "technical", "topic": "System Scalability", "difficulty": "hard", "question": "How do you architect a web application to scale horizontally under high concurrency?"}
    ],
    "Backend Developer": [
        {"type": "technical", "topic": "API Design", "difficulty": "easy", "question": "Explain the key principles of RESTful API design."},
        {"type": "technical", "topic": "SQL Indexing", "difficulty": "medium", "question": "Explain how database indexing works and when an index might degrade write performance."},
        {"type": "technical", "topic": "Databases", "difficulty": "medium", "question": "Explain ACID properties in relational databases and how transactions guarantee consistency."},
        {"type": "technical", "topic": "System Scalability", "difficulty": "hard", "question": "How do you architect a web application to scale horizontally under high concurrency?"},
        {"type": "technical", "topic": "Caching Strategies", "difficulty": "medium", "question": "Compare write-through and write-back caching strategies using Redis."},
        {"type": "technical", "topic": "Distributed Systems", "difficulty": "hard", "question": "Explain the CAP theorem and how partition tolerance affects consistency and availability."},
        {"type": "situational", "topic": "Database Performance & Indexing", "difficulty": "hard", "question": "A production database query is experiencing lock contention. How do you isolate and resolve it?"}
    ],
    "Frontend Developer": [
        {"type": "technical", "topic": "Web Fundamentals", "difficulty": "easy", "question": "What is the DOM in web development and how does browser rendering work?"},
        {"type": "technical", "topic": "JavaScript Core", "difficulty": "easy", "question": "Explain closures and lexical scoping in JavaScript."},
        {"type": "technical", "topic": "React Architecture", "difficulty": "medium", "question": "What is the React Virtual DOM and how does the reconciliation algorithm work?"},
        {"type": "technical", "topic": "State Management", "difficulty": "medium", "question": "Compare Redux, Context API, and Zustand for state management in large applications."},
        {"type": "technical", "topic": "Frontend Optimization", "difficulty": "hard", "question": "How do you optimize a React application for performance and reduce bundle size?"},
        {"type": "technical", "topic": "Web Security", "difficulty": "hard", "question": "How do you prevent XSS and CSRF attacks on the client side?"}
    ],
    "Python Engineer": [
        {"type": "technical", "topic": "Python Core", "difficulty": "easy", "question": "What is the difference between list and tuple in Python?"},
        {"type": "technical", "topic": "AsyncIO", "difficulty": "medium", "question": "How does the asyncio event loop work in Python and when should you avoid it?"},
        {"type": "technical", "topic": "Metaclasses", "difficulty": "hard", "question": "Explain Python metaclasses and describe a concrete use case for them."},
        {"type": "technical", "topic": "Memory Management", "difficulty": "hard", "question": "How does Python handle memory management and garbage collection with cyclic references?"}
    ],
    "Data Scientist": [
        {"type": "technical", "topic": "Machine Learning Fundamentals", "difficulty": "easy", "question": "What is the difference between supervised and unsupervised learning?"},
        {"type": "technical", "topic": "Model Validation", "difficulty": "medium", "question": "Explain cross-validation and why it's used."},
        {"type": "technical", "topic": "Optimization Algorithms", "difficulty": "hard", "question": "How does gradient descent work mathematically?"},
        {"type": "situational", "topic": "Data Preprocessing", "difficulty": "medium", "question": "How do you handle missing values and skewed features in a dataset?"},
        {"type": "situational", "topic": "Model Generalization", "difficulty": "hard", "question": "If your model is overfitting, what concrete regularization steps do you take?"}
    ],
    "AI Engineer": [
        {"type": "technical", "topic": "AI Fundamentals", "difficulty": "easy", "question": "What is the difference between AI, ML, and Deep Learning?"},
        {"type": "technical", "topic": "Neural Network Architectures", "difficulty": "medium", "question": "Explain how an RNN differs from a CNN and when to use each."},
        {"type": "technical", "topic": "Transformer Models", "difficulty": "hard", "question": "How does multi-head self-attention work in Transformers and why is it effective?"},
        {"type": "situational", "topic": "Model Debugging", "difficulty": "medium", "question": "Your neural network has high bias. How do you diagnose and fix it?"}
    ],
    "Data Analyst": [
        {"type": "technical", "topic": "SQL Fundamentals", "difficulty": "easy", "question": "What are primary and foreign keys in SQL?"},
        {"type": "technical", "topic": "Data Cleaning", "difficulty": "medium", "question": "How do you handle outliers and inconsistencies in your data?"},
        {"type": "technical", "topic": "SQL Advanced", "difficulty": "hard", "question": "Explain Window Functions in SQL with a practical partitioning example."}
    ],
    "HR Executive": [
        {"type": "technical", "topic": "Recruiting Lifecycle", "difficulty": "easy", "question": "What is full-cycle recruiting?"},
        {"type": "technical", "topic": "Talent Analytics", "difficulty": "medium", "question": "How do you measure employee engagement and retention metrics?"},
        {"type": "situational", "topic": "Performance Management", "difficulty": "hard", "question": "How would you handle an employee who is consistently underperforming?"}
    ],
    "Marketing Executive": [
        {"type": "technical", "topic": "SEO Strategies", "difficulty": "easy", "question": "What does SEO stand for and why is technical SEO important?"},
        {"type": "technical", "topic": "Conversion Rate Optimization", "difficulty": "medium", "question": "Explain the concept of A/B testing in email and landing page marketing."},
        {"type": "situational", "topic": "Campaign Post-Mortem", "difficulty": "medium", "question": "A recent campaign bombed. What metrics do you analyze to diagnose the failure?"}
    ],
    "UI/UX Designer": [
        {"type": "technical", "topic": "Design Theory", "difficulty": "easy", "question": "What is the difference between UX and UI?"},
        {"type": "technical", "topic": "Wireframing & Prototyping", "difficulty": "medium", "question": "Explain your step-by-step process for creating wireframes and user testing prototypes."},
        {"type": "situational", "topic": "Stakeholder Management", "difficulty": "hard", "question": "A client hates your design but provides vague feedback. How do you handle it?"}
    ],
    "Civil Engineer": [
        {"type": "technical", "topic": "Structural Foundations", "difficulty": "easy", "question": "What are the common types of foundations and when is a deep foundation required?"},
        {"type": "technical", "topic": "Material Mechanics", "difficulty": "medium", "question": "How do you calculate the load bearing capacity of reinforced concrete?"},
        {"type": "situational", "topic": "Site Safety Compliance", "difficulty": "hard", "question": "You discover a safety violation on-site. How do you address and escalate it?"}
    ]
}

def generate_questions_for_role(role: str, difficulty: str, count: int) -> List[Dict]:
    """
    Standard balanced question generator for initial baseline interviews.
    """
    role_pool = ROLE_QUESTIONS.get(role, ROLE_QUESTIONS.get("Full Stack Developer", COMMON_HR_QUESTIONS))

    # Filter primarily by difficulty for role specific questions
    filtered_role_pool = [q for q in role_pool if q.get("difficulty") == difficulty]
    
    if len(filtered_role_pool) < count:
        filtered_role_pool = role_pool
        
    hr_filtered = [q for q in COMMON_HR_QUESTIONS if q.get("difficulty") == difficulty]
    if not hr_filtered:
        hr_filtered = COMMON_HR_QUESTIONS
        
    combined = filtered_role_pool + hr_filtered
    
    unique_pool = []
    seen = set()
    for q in combined:
        if q["question"] not in seen:
            unique_pool.append(dict(q))
            seen.add(q["question"])
            
    selected = []
    
    if count >= 3:
        hr_options = [q for q in unique_pool if q.get("type") in ["HR", "behavioral"]]
        if hr_options:
            hr_choice = random.choice(hr_options)
            selected.append(dict(hr_choice))
            
    tech_options = [q for q in unique_pool if q["question"] not in [s["question"] for s in selected]]
    random.shuffle(tech_options)
    
    needed = count - len(selected)
    selected.extend([dict(t) for t in tech_options[:needed]])
    
    if len(selected) < count:
        remainder_options = [q for q in unique_pool if q["question"] not in [s["question"] for s in selected]]
        random.shuffle(remainder_options)
        selected.extend([dict(r) for r in remainder_options[:(count - len(selected))]])

    random.shuffle(selected)
    
    # Ensure default metadata
    for q in selected:
        q.setdefault("isTargetedRemediation", False)
        q.setdefault("targetedWeakness", None)
        
    return selected[:count]


def generate_adaptive_questions(
    role: str,
    difficulty: str,
    count: int,
    weak_topics: List[str] = None,
    prior_overall_score: Optional[int] = None
) -> List[Dict]:
    """
    Generates targeted questions adaptively based on the candidate's authentic prior weaknesses.
    - Demonstrably targets questions matching identified weak topics.
    - Modulates difficulty based on authentic prior overall score.
    - Preserves breadth by including core role and behavioral questions.
    - Annotates targeted questions with isTargetedRemediation=True and targetedWeakness=<topic>.
    """
    weak_topics = [w.strip() for w in (weak_topics or []) if w and w.strip()]
    role_pool = ROLE_QUESTIONS.get(role, ROLE_QUESTIONS.get("Full Stack Developer", COMMON_HR_QUESTIONS))
    
    # If no weak topics exist (e.g. perfect score or none detected), standard generation with difficulty modulation
    if not weak_topics:
        target_diff = difficulty
        if prior_overall_score is not None:
            if prior_overall_score >= 85:
                target_diff = "hard"
            elif prior_overall_score < 60:
                target_diff = "easy"
        return generate_questions_for_role(role, target_diff, count)

    # 1. Identify questions from the legitimate question bank matching candidate's weak topics
    targeted_questions = []
    seen_questions = set()

    for weak_t in weak_topics:
        weak_lower = weak_t.lower()
        # 1. First priority: Exact or substring topic match in current role pool
        topic_matches = []
        for q in role_pool:
            q_topic = q.get("topic", "").lower()
            if weak_lower in q_topic or q_topic in weak_lower:
                topic_matches.append(q)
                
        # 2. If no direct topic match in current role, check other role pools for technical topic match
        if not topic_matches:
            for other_role, other_pool in ROLE_QUESTIONS.items():
                for q in other_pool:
                    q_topic = q.get("topic", "").lower()
                    if weak_lower in q_topic or q_topic in weak_lower:
                        topic_matches.append(q)

        # 3. Fallback: question text match only if no topic match exists anywhere
        text_matches = []
        if not topic_matches:
            for q in role_pool:
                q_text = q.get("question", "").lower()
                if weak_lower in q_text or all(w in q_text for w in weak_lower.split() if len(w) > 3):
                    text_matches.append(q)

        matches = topic_matches if topic_matches else text_matches

        # Modulate difficulty for targeted remediation if authentic score is known
        for match in matches:
            if match["question"] not in seen_questions:
                q_copy = dict(match)
                q_copy["isTargetedRemediation"] = True
                q_copy["targetedWeakness"] = weak_t
                
                # Apply score-based difficulty modulation to remediation
                if prior_overall_score is not None:
                    if prior_overall_score < 60:
                        q_copy["remediationFocus"] = "Foundational reinforcement & diagnostic drill"
                    elif prior_overall_score > 80:
                        q_copy["remediationFocus"] = "Advanced optimization & architectural edge-cases"
                    else:
                        q_copy["remediationFocus"] = "Applied problem solving & troubleshooting"
                        
                targeted_questions.append(q_copy)
                seen_questions.add(match["question"])

    # 2. Select targeted questions up to 60% of question count (minimum 1 if matches exist)
    max_targeted = max(1, int(round(count * 0.6)))
    selected_targeted = targeted_questions[:max_targeted]

    # 3. Add 1 Behavioral / Situational question
    selected_behavioral = []
    if count >= 3:
        hr_pool = [q for q in COMMON_HR_QUESTIONS if q["question"] not in seen_questions]
        if hr_pool:
            hr_choice = dict(random.choice(hr_pool))
            hr_choice["isTargetedRemediation"] = False
            hr_choice["targetedWeakness"] = None
            selected_behavioral.append(hr_choice)
            seen_questions.add(hr_choice["question"])

    # 4. Fill remaining questions with general role questions to maintain curriculum coverage
    remaining_needed = count - len(selected_targeted) - len(selected_behavioral)
    general_options = [q for q in role_pool if q["question"] not in seen_questions]
    random.shuffle(general_options)

    selected_general = []
    for g in general_options[:remaining_needed]:
        g_copy = dict(g)
        g_copy["isTargetedRemediation"] = False
        g_copy["targetedWeakness"] = None
        selected_general.append(g_copy)
        seen_questions.add(g["question"])

    final_pool = selected_targeted + selected_behavioral + selected_general

    # If still need more to meet exact count, pull from HR or remaining
    if len(final_pool) < count:
        all_remainder = [q for q in (role_pool + COMMON_HR_QUESTIONS) if q["question"] not in seen_questions]
        for r in all_remainder[:(count - len(final_pool))]:
            r_copy = dict(r)
            r_copy.setdefault("isTargetedRemediation", False)
            r_copy.setdefault("targetedWeakness", None)
            final_pool.append(r_copy)
            seen_questions.add(r["question"])

    random.shuffle(final_pool)
    return final_pool[:count]

