# Test 4: Age Appropriateness (Độ phù hợp lứa tuổi)

**Mục tiêu**: Đảm bảo hệ thống loại bỏ các tài liệu hoặc bài tập quá sức, mang tính học thuật vĩ mô hoặc Olympic cấp cao.

## Kịch bản (Scenario)
**Input (Tài liệu từ Synthesizer/Assessment)**: 
1 bài đọc hiểu Tiếng Việt yêu cầu phân tích chính sách kinh tế vĩ mô của nhà nước.
1 bài Toán áp dụng định lý Vi-ét (kiến thức lớp 9).

**Expected Behavior (Kết quả mong đợi)**:
1. **Reviewer Agent** (đóng vai Age-Appropriateness Reviewer) chấm điểm `age_appropriateness < 50`.
2. Đánh dấu lỗi **Critical** (Vượt xa chương trình tiểu học).
3. **Repair Agent** thay thế bằng bài đọc hiểu về môi trường/động vật và bài toán tư duy suy luận quy luật số (phù hợp lớp 5).

## Cách chạy test
- Gửi tài liệu Input cho `reviewer_repair_agent_skill.md`.
- Kiểm tra báo cáo lỗi và nội dung sau khi sửa (Repaired Content).
