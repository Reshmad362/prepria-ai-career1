import random
from typing import List, Dict

COMMON_HR_QUESTIONS = [
    {"type": "HR", "difficulty": "easy", "question": "Tell me about yourself."},
    {"type": "HR", "difficulty": "easy", "question": "Why do you want to work for our company?"},
    {"type": "HR", "difficulty": "medium", "question": "Where do you see yourself in 5 years?"},
    {"type": "behavioral", "difficulty": "medium", "question": "Describe a time you faced a conflict at work and how you resolved it."},
    {"type": "behavioral", "difficulty": "hard", "question": "Tell me about a time you failed and what you learned from it."},
    {"type": "situational", "difficulty": "medium", "question": "How do you prioritize your work when everything is urgent?"},
    {"type": "situational", "difficulty": "hard", "question": "If you strongly disagree with your manager's decision, how would you handle it?"}
]

ROLE_QUESTIONS = {
    "Full Stack Developer": [
        {"type": "technical", "difficulty": "easy", "question": "What is the DOM in web development?"},
        {"type": "technical", "difficulty": "easy", "question": "Explain the difference between GET and POST requests."},
        {"type": "technical", "difficulty": "medium", "question": "Explain the difference between SQL and NoSQL."},
        {"type": "technical", "difficulty": "medium", "question": "What is React Virtual DOM?"},
        {"type": "technical", "difficulty": "hard", "question": "How do you optimize a React application for performance?"},
        {"type": "situational", "difficulty": "medium", "question": "A production database query is slow. How do you troubleshoot?"},
        {"type": "technical", "difficulty": "hard", "question": "Explain Event Loop in Node.js."}
    ],
    "Data Scientist": [
        {"type": "technical", "difficulty": "easy", "question": "What is the difference between supervised and unsupervised learning?"},
        {"type": "technical", "difficulty": "medium", "question": "Explain cross-validation and why it's used."},
        {"type": "technical", "difficulty": "hard", "question": "How does gradient descent work mathematically?"},
        {"type": "situational", "difficulty": "medium", "question": "How do you handle missing values in a dataset?"},
        {"type": "situational", "difficulty": "hard", "question": "If your model is overfitting, what steps do you take?"}
    ],
    "AI Engineer": [
        {"type": "technical", "difficulty": "easy", "question": "What is the difference between AI, ML, and Deep Learning?"},
        {"type": "technical", "difficulty": "medium", "question": "Explain how an RNN differs from a CNN."},
        {"type": "technical", "difficulty": "hard", "question": "How do Transformers work and why are they effective?"},
        {"type": "situational", "difficulty": "medium", "question": "Your model has high bias. How do you fix it?"}
    ],
    "Data Analyst": [
        {"type": "technical", "difficulty": "easy", "question": "What are primary and foreign keys in SQL?"},
        {"type": "technical", "difficulty": "medium", "question": "How do you handle outliers in your data?"},
        {"type": "technical", "difficulty": "hard", "question": "Explain Window Functions in SQL with an example."}
    ],
    "HR Executive": [
        {"type": "technical", "difficulty": "easy", "question": "What is full-cycle recruiting?"},
        {"type": "technical", "difficulty": "medium", "question": "How do you measure employee engagement?"},
        {"type": "situational", "difficulty": "hard", "question": "How would you handle an employee who is consistently underperforming?"}
    ],
    "Marketing Executive": [
        {"type": "technical", "difficulty": "easy", "question": "What does SEO stand for and why is it important?"},
        {"type": "technical", "difficulty": "medium", "question": "Explain the concept of A/B testing in email marketing."},
        {"type": "situational", "difficulty": "medium", "question": "A recent campaign bombed. What metrics do you analyze?"}
    ],
    "UI/UX Designer": [
        {"type": "technical", "difficulty": "easy", "question": "What is the difference between UX and UI?"},
        {"type": "technical", "difficulty": "medium", "question": "Explain your process for creating wireframes."},
        {"type": "situational", "difficulty": "hard", "question": "A client hates your design but provides vague feedback. What do you do?"}
    ],
    "Civil Engineer": [
        {"type": "technical", "difficulty": "easy", "question": "What are the common types of foundations?"},
        {"type": "technical", "difficulty": "medium", "question": "How do you calculate the load bearing capacity of concrete?"},
        {"type": "situational", "difficulty": "hard", "question": "You discover a safety violation on-site. How do you handle it?"}
    ]
}

def generate_questions_for_role(role: str, difficulty: str, count: int) -> List[Dict]:
    # Fallback if specific role isn't completely mapped, just use general technical questions or HR
    role_pool = ROLE_QUESTIONS.get(role, COMMON_HR_QUESTIONS)

    # Filter primarily by difficulty for role specific questions
    filtered_role_pool = [q for q in role_pool if q["difficulty"] == difficulty]
    
    # If not enough exact difficulty, mix in other difficulties from that role
    if len(filtered_role_pool) < count:
        filtered_role_pool = role_pool
        
    # Get HR questions that match difficulty
    hr_filtered = [q for q in COMMON_HR_QUESTIONS if q["difficulty"] == difficulty]
    if not hr_filtered:
        hr_filtered = COMMON_HR_QUESTIONS
        
    # Create the pool prioritizing 70% technical/role specific and 30% HR/behavioral if possible
    # We will just merge them and shuffle, then limit
    combined = filtered_role_pool + hr_filtered
    
    unique_pool = []
    seen = set()
    for q in combined:
        if q["question"] not in seen:
            unique_pool.append(q)
            seen.add(q["question"])
            
    # Target ensuring at least 1 HR/behavioral question is selected if count > 2
    selected = []
    
    if count >= 3:
        # Guarantee 1 HR question
        hr_options = [q for q in unique_pool if q["type"] in ["HR", "behavioral"]]
        if hr_options:
            selected.append(random.choice(hr_options))
            
    # Then fill with mostly technical if available
    tech_options = [q for q in unique_pool if q not in selected]
    random.shuffle(tech_options)
    
    needed = count - len(selected)
    selected.extend(tech_options[:needed])
    
    # Ensure it exactly matches needed regardless
    if len(selected) < count:
        remainder_options = [q for q in unique_pool if q not in selected]
        random.shuffle(remainder_options)
        selected.extend(remainder_options[:(count - len(selected))])

    random.shuffle(selected)
    return selected[:count]
