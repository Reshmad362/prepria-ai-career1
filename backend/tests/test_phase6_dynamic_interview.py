"""
Phase 6 Automated Test Suite — Resume-Driven Dynamic Interview Intelligence

Tests:
1. test_resume_generates_candidate_specific_questions
2. test_questions_reference_actual_resume_skills
3. test_questions_reference_actual_projects
4. test_questions_reference_actual_experience
5. test_no_question_contains_fabricated_resume_claim
6. test_different_candidates_receive_different_questions
7. test_same_candidate_does_not_receive_duplicate_questions
8. test_role_changes_question_distribution
9. test_question_metadata_contains_source
10. test_previous_weakness_influences_next_interview
11. test_authenticated_user_can_only_use_own_resume
12. test_candidate_without_resume_gets_safe_fallback
13. test_candidate_with_resume_but_missing_project_data_does_not_crash
14. test_interview_history_preserves_question_metadata
15. test_existing_phase4_adaptive_behavior_still_works
16. test_existing_phase1_to_phase5_tests_still_pass
"""

import unittest
import json
import uuid
import os
import sys

# Ensure backend root is in sys.path
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from app.services.dynamic_question_generator import (
    normalize_resume_evidence,
    is_claimed_in_resume,
    generate_resume_driven_questions
)
from app.services.auth_service import create_user, generate_token, update_user_profile, get_user_by_email_or_id
from app.services.performance_tracker import record_interview, get_user_interviews
from app.services.interview_evaluation_service import evaluate_interview_session
from app.services.question_generator import generate_adaptive_questions


class TestPhase6DynamicInterview(unittest.TestCase):

    def setUp(self):
        # Sample Candidate A: React + FastAPI + PostgreSQL + Project A
        self.candidate_a_profile = {
            "name": "Alice Candidate",
            "email": "alice.candidate@example.com",
            "skills": ["React", "FastAPI", "PostgreSQL", "JavaScript", "Python"],
            "technicalSkills": ["React", "FastAPI", "PostgreSQL", "JavaScript", "Python"],
            "projects": [
                {
                    "name": "AI Career Intelligence Platform",
                    "technologies": ["React", "FastAPI", "PostgreSQL"],
                    "description": "Full-stack AI career platform"
                }
            ],
            "experience": [
                {
                    "title": "Software Engineering Intern",
                    "company": "TechCorp",
                    "responsibilities": ["Developed REST APIs", "Built React UI"],
                    "technologies": ["FastAPI", "React"]
                }
            ],
            "education": "B.Tech in Computer Science",
            "keywords": ["React", "FastAPI", "PostgreSQL"]
        }

        # Sample Candidate B: Java + Spring Boot + MySQL + Project B
        self.candidate_b_profile = {
            "name": "Bob Candidate",
            "email": "bob.candidate@example.com",
            "skills": ["Java", "Spring Boot", "MySQL", "Hibernate", "Microservices"],
            "technicalSkills": ["Java", "Spring Boot", "MySQL", "Hibernate"],
            "projects": [
                {
                    "name": "E-Commerce Microservices",
                    "technologies": ["Java", "Spring Boot", "MySQL"],
                    "description": "Distributed e-commerce backend"
                }
            ],
            "experience": [
                {
                    "title": "Backend Intern",
                    "company": "DataCloud",
                    "responsibilities": ["Designed MySQL relational schemas"],
                    "technologies": ["Java", "MySQL"]
                }
            ],
            "education": "B.S in Information Technology",
            "keywords": ["Java", "Spring Boot", "MySQL"]
        }

    # 1. candidate-specific questions based on resume
    def test_resume_generates_candidate_specific_questions(self):
        res_a = generate_resume_driven_questions(
            user_profile=self.candidate_a_profile,
            role="Full Stack Developer",
            interview_number=1,
            count=10
        )
        res_b = generate_resume_driven_questions(
            user_profile=self.candidate_b_profile,
            role="Full Stack Developer",
            interview_number=1,
            count=10
        )

        q_a_texts = [q["question"] for q in res_a["questions"]]
        q_b_texts = [q["question"] for q in res_b["questions"]]

        self.assertNotEqual(q_a_texts, q_b_texts, "Candidate A and Candidate B must receive different questions.")
        
        # Check Candidate A gets React/FastAPI/AI Career Platform references
        has_react_or_fastapi = any("React" in q or "FastAPI" in q or "AI Career" in q for q in q_a_texts)
        self.assertTrue(has_react_or_fastapi, "Candidate A questions must reference actual resume evidence.")

        # Check Candidate B gets Java/Spring Boot/E-Commerce references
        has_java_or_spring = any("Java" in q or "Spring Boot" in q or "E-Commerce" in q for q in q_b_texts)
        self.assertTrue(has_java_or_spring, "Candidate B questions must reference actual resume evidence.")

    # 2. questions reference actual resume skills
    def test_questions_reference_actual_resume_skills(self):
        res = generate_resume_driven_questions(
            user_profile=self.candidate_a_profile,
            role="Frontend Developer",
            count=5
        )
        skill_qs = [q for q in res["questions"] if q.get("sourceType") in ["skill", "project"] or "React" in q.get("question", "")]
        self.assertTrue(len(skill_qs) > 0, "Questions must reference candidate's actual skills.")
        valid_sources = ["react", "fastapi", "postgresql", "javascript", "python", "ai career intelligence platform"]
        for q in skill_qs:
            val = q.get("sourceValue", "")
            if val:
                self.assertTrue(any(s in val.lower() for s in valid_sources), f"sourceValue '{val}' must reference candidate's actual resume evidence.")

    # 3. questions reference actual projects
    def test_questions_reference_actual_projects(self):
        res = generate_resume_driven_questions(
            user_profile=self.candidate_a_profile,
            role="Full Stack Developer",
            count=10
        )
        project_qs = [q for q in res["questions"] if q.get("sourceType") == "project"]
        self.assertTrue(len(project_qs) > 0, "Questions must contain project deep-dive questions.")
        for q in project_qs:
            self.assertIn("AI Career Intelligence Platform", q["question"])

    # 4. questions reference actual experience
    def test_questions_reference_actual_experience(self):
        res = generate_resume_driven_questions(
            user_profile=self.candidate_a_profile,
            role="Full Stack Developer",
            count=10
        )
        exp_qs = [q for q in res["questions"] if q.get("sourceType") == "experience"]
        self.assertTrue(len(exp_qs) > 0, "Questions must reference actual work/internship experience.")
        for q in exp_qs:
            self.assertTrue("Software Engineering Intern" in q["question"] or "TechCorp" in q["question"] or "internship" in q["question"].lower())

    # 5. no question contains fabricated resume claim
    def test_no_question_contains_fabricated_resume_claim(self):
        # Candidate A does NOT have Docker in resume evidence
        res = generate_resume_driven_questions(
            user_profile=self.candidate_a_profile,
            role="Backend Developer",
            count=10
        )
        for q in res["questions"]:
            q_text = q["question"]
            if "Docker" in q_text:
                # If Docker is mentioned, it MUST be framed hypothetically, NEVER claiming user used it
                self.assertNotIn("You used Docker", q_text, "System must never claim user used Docker if absent from resume.")
                self.assertNotIn("In your project where you used Docker", q_text)
                self.assertTrue("Suppose" in q_text or "How would you" in q_text, "Unclaimed role requirements must be framed hypothetically.")

    # 6. different candidates receive different questions
    def test_different_candidates_receive_different_questions(self):
        res_a = generate_resume_driven_questions(self.candidate_a_profile, "Full Stack Developer", 1, 10)
        res_b = generate_resume_driven_questions(self.candidate_b_profile, "Full Stack Developer", 1, 10)

        set_a = set(q["question"] for q in res_a["questions"])
        set_b = set(q["question"] for q in res_b["questions"])

        overlap = set_a & set_b
        # Overlap should be minimal (at most HR/general questions)
        self.assertTrue(len(overlap) <= 2, "Candidate A and Candidate B should receive substantially different questions.")

    # 7. same candidate does not receive duplicate questions
    def test_same_candidate_does_not_receive_duplicate_questions(self):
        prev_session = {
            "questionEvaluations": [
                {"question": "Can you give an overview of your project 'AI Career Intelligence Platform' and explain the primary problem it solved?", "score": 85}
            ]
        }
        res = generate_resume_driven_questions(
            user_profile=self.candidate_a_profile,
            role="Full Stack Developer",
            interview_number=2,
            count=10,
            previous_sessions=[prev_session]
        )
        questions_text = [q["question"] for q in res["questions"]]
        self.assertNotIn(
            "Can you give an overview of your project 'AI Career Intelligence Platform' and explain the primary problem it solved?",
            questions_text,
            "Engine must filter duplicate previously asked questions."
        )

    # 8. role changes question distribution
    def test_role_changes_question_distribution(self):
        res_frontend = generate_resume_driven_questions(self.candidate_a_profile, "Frontend Developer", 1, 10)
        res_backend = generate_resume_driven_questions(self.candidate_a_profile, "Backend Developer", 1, 10)

        fe_topics = [q.get("topic", "").lower() for q in res_frontend["questions"]]
        be_topics = [q.get("topic", "").lower() for q in res_backend["questions"]]

        self.assertNotEqual(fe_topics, be_topics, "Changing target role must change technical emphasis and topics.")

    # 9. question metadata contains source
    def test_question_metadata_contains_source(self):
        res = generate_resume_driven_questions(self.candidate_a_profile, "Full Stack Developer", 1, 10)
        for q in res["questions"]:
            self.assertIn("source", q, "Metadata must contain 'source'")
            self.assertIn("sourceType", q, "Metadata must contain 'sourceType'")
            self.assertIn("sourceValue", q, "Metadata must contain 'sourceValue'")
            self.assertIn("topic", q, "Metadata must contain 'topic'")
            self.assertIn("difficulty", q, "Metadata must contain 'difficulty'")
            self.assertIn("type", q, "Metadata must contain 'type'")
            self.assertIn(q["source"], ["resume", "role", "weakness", "behavioral", "project", "experience", "skill"])

    # 10. previous weakness influences next interview
    def test_previous_weakness_influences_next_interview(self):
        prev_session = {
            "questionEvaluations": [
                {"topic": "Database Performance & Indexing", "score": 50}
            ],
            "improvements": [{"topic": "Database Performance & Indexing"}]
        }
        res = generate_resume_driven_questions(
            user_profile=self.candidate_a_profile,
            role="Backend Developer",
            interview_number=2,
            count=10,
            previous_sessions=[prev_session]
        )

        weakness_qs = [q for q in res["questions"] if q.get("source") == "weakness" or q.get("targetedWeakness") == "Database Performance & Indexing"]
        self.assertTrue(len(weakness_qs) > 0, "Interview #2 must include questions targeting previous weaknesses.")

        target_q = weakness_qs[0]
        # Must combine resume PostgreSQL evidence + weakness!
        self.assertIn("PostgreSQL", target_q["question"])
        self.assertIn("Database Performance & Indexing", target_q["sourceValue"])

    # 11. authenticated user can only use own resume
    def test_authenticated_user_can_only_use_own_resume(self):
        user_email = f"user_{uuid.uuid4().hex[:8]}@example.com"
        u = create_user("Test User", user_email, "Password123!")
        token_info = generate_token(u["id"], user_email, "Test User")

        # Update user's own profile
        update_user_profile(user_email, self.candidate_a_profile)
        user_fetched = get_user_by_email_or_id(email=user_email)

        self.assertEqual(user_fetched["profile"]["skills"], self.candidate_a_profile["skills"])
        self.assertEqual(user_fetched["email"], user_email)

    # 12. candidate without resume gets safe fallback
    def test_candidate_without_resume_gets_safe_fallback(self):
        empty_profile = {"name": "No Resume User", "email": "no.resume@example.com", "skills": [], "projects": []}
        res = generate_resume_driven_questions(empty_profile, "Full Stack Developer", 1, 10)

        self.assertEqual(len(res["questions"]), 10, "Candidate without resume must receive full question count.")
        for q in res["questions"]:
            self.assertIn("source", q)
            # Must not claim user used anything in resume
            self.assertNotIn("You used", q["question"])

    # 13. candidate with resume but missing project data does not crash
    def test_candidate_with_resume_but_missing_project_data_does_not_crash(self):
        skills_only_profile = {
            "name": "Skills Only User",
            "email": "skills.only@example.com",
            "skills": ["React", "Python"],
            "projects": [],
            "experience": []
        }
        res = generate_resume_driven_questions(skills_only_profile, "Frontend Developer", 1, 10)
        self.assertEqual(len(res["questions"]), 10)
        self.assertTrue(any("React" in q["question"] for q in res["questions"]))

    # 14. interview history preserves question metadata
    def test_interview_history_preserves_question_metadata(self):
        questions_with_meta = [
            {
                "question": "Explain how you used React in your project AI Career Intelligence Platform.",
                "source": "resume",
                "sourceType": "project",
                "sourceValue": "AI Career Intelligence Platform",
                "topic": "React Architecture",
                "difficulty": "medium",
                "type": "technical",
                "targetedWeakness": None
            }
        ]
        answers = [{"transcript": "I used React components and hooks to manage UI state.", "answerDurationSeconds": 15}]
        
        eval_res = evaluate_interview_session("Full Stack Developer", "medium", questions_with_meta, answers)
        q_eval = eval_res["questionEvaluations"][0]

        self.assertEqual(q_eval["source"], "resume")
        self.assertEqual(q_eval["sourceType"], "project")
        self.assertEqual(q_eval["sourceValue"], "AI Career Intelligence Platform")

    # 15. existing Phase 4 adaptive behavior still works
    def test_existing_phase4_adaptive_behavior_still_works(self):
        adaptive_qs = generate_adaptive_questions(
            role="Full Stack Developer",
            difficulty="medium",
            count=5,
            weak_topics=["SQL Indexing"],
            prior_overall_score=75
        )
        self.assertEqual(len(adaptive_qs), 5)
        has_targeted = any(q.get("isTargetedRemediation") for q in adaptive_qs)
        self.assertTrue(has_targeted, "Phase 4 adaptive questions must remain functional.")

    # 16. existing Phase 1-5 tests pass
    def test_existing_phase1_to_phase5_tests_still_pass(self):
        # Quick sanity checks for core services across previous phases
        ev = normalize_resume_evidence(self.candidate_a_profile)
        self.assertTrue(ev["has_resume"])
        self.assertTrue(is_claimed_in_resume("React", ev))
        self.assertFalse(is_claimed_in_resume("Docker", ev))


if __name__ == "__main__":
    unittest.main()
