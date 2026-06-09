import os
import re
import json
import uuid
import sys
import PyPDF2
from docx import Document

sys.stdout.reconfigure(encoding='utf-8')

def extract_text_from_pdf(pdf_path):
    text = ""
    try:
        with open(pdf_path, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
    except Exception as e:
        print(f"Error reading PDF {pdf_path}: {e}")
    return text

def extract_text_from_docx(docx_path):
    text = ""
    try:
        doc = Document(docx_path)
        for para in doc.paragraphs:
            text += para.text + "\n"
    except Exception as e:
        print(f"Error reading DOCX {docx_path}: {e}")
    return text

def extract_answers_in_order(text):
    # Find all isolated A, B, C, D that look like answers
    # This regex looks for patterns like "1. A", "1-A", "Câu 1: A", or just "A" in a list
    pattern = re.compile(r'(?:Câu|Question|\b)\s*\d*\s*[:\.\-]?\s*([ABCD])\b', re.IGNORECASE)
    matches = pattern.findall(text)
    return [m.upper() for m in matches]

def parse_questions(text, source_file, answer_list):
    questions = []
    
    # Regex to match questions and options
    pattern = re.compile(
        r'(?:Question|Câu)\s*(\d+)[:\.]?\s*(.*?)(?=\s*(?:A\.|A\)))'
        r'\s*(?:A\.|A\))\s*(.*?)(?=\s*(?:B\.|B\)))'
        r'\s*(?:B\.|B\))\s*(.*?)(?=\s*(?:C\.|C\)))'
        r'\s*(?:C\.|C\))\s*(.*?)(?=\s*(?:D\.|D\)))'
        r'\s*(?:D\.|D\))\s*(.*?)(?=\n(?:Question|Câu)\s*\d+[:\.]?|\Z)', 
        re.DOTALL | re.IGNORECASE
    )
    
    matches = pattern.findall(text)
    
    for i, match in enumerate(matches):
        q_num, content, a, b, c, d = match
        
        # Get answer from list in order, fallback to A if out of bounds
        ans = answer_list[i] if i < len(answer_list) else "A"
        
        q_item = {
            "id": f"DRAFT-{str(uuid.uuid4())[:8].upper()}",
            "source": source_file,
            "skill": "general_knowledge",
            "domain": "mixed",
            "difficulty": 2,
            "estimated_time_sec": 90,
            "question_type": "multiple_choice",
            "language": "en", # Hint language updated to English
            "content": content.strip().replace('\n', ' '),
            "options": {
                "A": a.strip().replace('\n', ' '),
                "B": b.strip().replace('\n', ' '),
                "C": c.strip().replace('\n', ' '),
                "D": d.strip().replace('\n', ' ')
            },
            "answer": ans,
            "hint_levels": [
                "Please read the question carefully and identify key terms.",
                "Review the core concepts related to this topic.",
                "Try to eliminate the most obvious incorrect options."
            ],
            "solution": "Detailed solution requires manual review.",
            "error_tags": ["needs_review"],
            "prerequisites": [],
            "zpd_level": "core"
        }
        questions.append(q_item)
        
    return questions

def main():
    # File mapping: Question File -> Answer File
    mapping = {
        "Lịch sử địa lý.pdf": "Đáp án LSĐL.pdf",
        "Sách Khoa học.pdf": "Đáp án Khoa học.pdf",
        "Tổng hợp đề full.pdf": "ĐÁP ÁN ĐỀ TRẮC NGIỆM TỔNG HỢP.docx",
        "Mock Test 1-10.docx": "Đáp án 20 Đề Mock Test.docx",
        "Mock Test 11-20.docx": "Đáp án 20 Đề Mock Test.docx"
    }
    
    # Pre-extract answers
    answers_cache = {}
    for q_file, a_file in mapping.items():
        if a_file not in answers_cache and os.path.exists(a_file):
            print(f"Extracting answers from {a_file}...")
            if a_file.endswith(".pdf"):
                a_text = extract_text_from_pdf(a_file)
            else:
                a_text = extract_text_from_docx(a_file)
            answers_cache[a_file] = extract_answers_in_order(a_text)
            print(f"-> Extracted {len(answers_cache[a_file])} answers.")

    # Parse questions
    directory = "."
    all_questions = []
    
    for filename in os.listdir(directory):
        if filename in mapping:
            print(f"Processing Questions from {filename}...")
            
            if filename.endswith(".docx"):
                text = extract_text_from_docx(filename)
            elif filename.endswith(".pdf"):
                text = extract_text_from_pdf(filename)
                
            ans_file = mapping[filename]
            ans_list = answers_cache.get(ans_file, [])
            
            qs = parse_questions(text, filename, ans_list)
            
            # If multiple tests share an answer key, consume the answers so the next test gets the next answers
            if ans_list:
                answers_cache[ans_file] = ans_list[len(qs):]
                
            all_questions.extend(qs)
            print(f"-> Found {len(qs)} questions in {filename}. Mapped answers successfully.")

    with open("draft_items_bank.json", "w", encoding="utf-8") as f:
        json.dump(all_questions, f, ensure_ascii=False, indent=2)
        
    print(f"\n=============================================")
    print(f"Total extracted questions: {len(all_questions)}.")
    print(f"Successfully mapped answers and saved to draft_items_bank.json")
    print(f"=============================================")

if __name__ == "__main__":
    main()
