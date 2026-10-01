"""
Audits all course questions defined across frontend data files
and calculates Before vs After correct answer position distributions.
"""

import os
import re
import json
import random

courses_dir = r"c:\Users\Reshma\OneDrive\Desktop\Prepria\prepria-ai-career\frontend\src\data\courses"

# Extract all question objects using regex from course files
q_pattern = re.compile(r'\{[^{}]*?"id":\s*["\']([^"\']+)["\'][^{}]*?"question":\s*["\']([^"\']+)["\'][^{}]*?"options":\s*\[(.*?)\][^{}]*?"correctIndex":\s*(\d+)[^{}]*?\}', re.DOTALL)

total_questions = 0
before_counts = {0: 0, 1: 0, 2: 0, 3: 0}
after_counts = {0: 0, 1: 0, 2: 0, 3: 0}

max_run_before = 0
max_run_after = 0

all_questions = []

for root, _, files in os.walk(courses_dir):
    for fname in files:
        if fname.endswith(".js"):
            fpath = os.path.join(root, fname)
            with open(fpath, "r", encoding="utf-8") as f:
                content = f.read()

            # Find questions
            for m in q_pattern.finditer(content):
                qid = m.group(1)
                qtext = m.group(2)
                opts_raw = m.group(3)
                c_idx = int(m.group(4))

                # parse options
                opts = [o.strip().strip('"\'') for o in re.findall(r'["\']([^"\']+)["\']', opts_raw)]
                if len(opts) >= 2:
                    all_questions.append({
                        "id": qid,
                        "question": qtext,
                        "options": opts,
                        "correctIndex": c_idx
                    })

total_questions = len(all_questions)

# Calculate Before
last_pos_before = None
current_run_before = 0

for q in all_questions:
    pos = q["correctIndex"]
    before_counts[pos] = before_counts.get(pos, 0) + 1
    if pos == last_pos_before:
        current_run_before += 1
    else:
        current_run_before = 1
        last_pos_before = pos
    if current_run_before > max_run_before:
        max_run_before = current_run_before

# Calculate After with safe Fisher-Yates + consecutive constraint
from test_phase22_quiz_distribution import randomize_quiz_questions

randomized_catalog = randomize_quiz_questions(all_questions, seed=2026)

last_pos_after = None
current_run_after = 0

for q in randomized_catalog:
    pos = q["correctIndex"]
    after_counts[pos] = after_counts.get(pos, 0) + 1
    if pos == last_pos_after:
        current_run_after += 1
    else:
        current_run_after = 1
        last_pos_after = pos
    if current_run_after > max_run_after:
        max_run_after = current_run_after

letter_map = {0: 'A', 1: 'B', 2: 'C', 3: 'D'}

report = {
    "total_questions": total_questions,
    "before": {
        "A": before_counts[0],
        "B": before_counts[1],
        "C": before_counts[2],
        "D": before_counts[3],
        "pct_A": round((before_counts[0] / total_questions) * 100, 1) if total_questions else 0,
        "pct_B": round((before_counts[1] / total_questions) * 100, 1) if total_questions else 0,
        "pct_C": round((before_counts[2] / total_questions) * 100, 1) if total_questions else 0,
        "pct_D": round((before_counts[3] / total_questions) * 100, 1) if total_questions else 0,
        "max_run": max_run_before
    },
    "after": {
        "A": after_counts[0],
        "B": after_counts[1],
        "C": after_counts[2],
        "D": after_counts[3],
        "pct_A": round((after_counts[0] / total_questions) * 100, 1) if total_questions else 0,
        "pct_B": round((after_counts[1] / total_questions) * 100, 1) if total_questions else 0,
        "pct_C": round((after_counts[2] / total_questions) * 100, 1) if total_questions else 0,
        "pct_D": round((after_counts[3] / total_questions) * 100, 1) if total_questions else 0,
        "max_run": max_run_after
    }
}

with open(r"c:\Users\Reshma\OneDrive\Desktop\Prepria\prepria-ai-career\scratch\catalog_stats.json", "w", encoding="utf-8") as f:
    json.dump(report, f, indent=2)

print(json.dumps(report, indent=2))
