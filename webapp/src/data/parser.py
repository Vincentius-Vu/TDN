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

def parse_questions(text, source_file):
    questions = []
    
    # Regex to match "Question 1:" or "Câu 1:" followed by text and A, B, C, D options
    pattern = re.compile(
        r'(?:Question|Câu)\s*\d+[:\.]?\s*(.*?)(?=\s*(?:A\.|A\)))'
        r'\s*(?:A\.|A\))\s*(.*?)(?=\s*(?:B\.|B\)))'
        r'\s*(?:B\.|B\))\s*(.*?)(?=\s*(?:C\.|C\)))'
        r'\s*(?:C\.|C\))\s*(.*?)(?=\s*(?:D\.|D\)))'
        r'\s*(?:D\.|D\))\s*(.*?)(?=\n(?:Question|Câu)\s*\d+[:\.]?|\Z)', 
        re.DOTALL | re.IGNORECASE
    )
    
    matches = pattern.findall(text)
    
    for match in matches:
        content, a, b, c, d = match
        q_item = {
            "id": f"DRAFT-{str(uuid.uuid4())[:8].upper()}",
            "source": source_file,
            "skill": "general_knowledge",
            "domain": "mixed",
            "difficulty": 2,
            "estimated_time_sec": 90,
            "question_type": "multiple_choice",
            "language": "mixed",
            "content": content.strip().replace('\n', ' '),
            "options": {
                "A": a.strip().replace('\n', ' '),
                "B": b.strip().replace('\n', ' '),
                "C": c.strip().replace('\n', ' '),
                "D": d.strip().replace('\n', ' ')
            },
            "answer": "A", # Placeholder, manual mapping or separate answer key parsing needed
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
    directory = "."
    all_questions = []
    
    for filename in os.listdir(directory):
        if filename.endswith(".docx") and not filename.startswith("~"):
            print(f"Processing {filename}...")
            text = extract_text_from_docx(filename)
            qs = parse_questions(text, filename)
            all_questions.extend(qs)
            print(f"Found {len(qs)} questions in {filename}.")
            
        elif filename.endswith(".pdf"):
            print(f"Processing {filename}...")
            text = extract_text_from_pdf(filename)
            qs = parse_questions(text, filename)
            all_questions.extend(qs)
            print(f"Found {len(qs)} questions in {filename}.")

    with open("draft_items_bank.json", "w", encoding="utf-8") as f:
        json.dump(all_questions, f, ensure_ascii=False, indent=2)
        
    print(f"\n=============================================")
    print(f"Total extracted questions: {len(all_questions)}.")
    print(f"Successfully saved to draft_items_bank.json")
    print(f"=============================================")

if __name__ == "__main__":
    main()
