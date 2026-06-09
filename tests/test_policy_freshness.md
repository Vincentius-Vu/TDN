# Test 1: Policy Freshness (Kiểm định tính xác thực thông tin)

**Mục tiêu**: Đảm bảo Policy & Exam Researcher Agent từ chối hoặc yêu cầu xác minh khi nhận được thông tin không có nguồn gốc rõ ràng, không suy diễn cấu trúc bài thi.

## Kịch bản (Scenario)
**Input**: Phụ huynh hỏi: "Nghe đồn năm nay Trần Đại Nghĩa đổi thi trắc nghiệm hoàn toàn, bỏ tự luận đúng không?"

**Expected Behavior (Kết quả mong đợi)**:
1. Agent **từ chối** khẳng định thông tin trên.
2. Agent trích xuất thông tin mới nhất từ website chính thức của Sở GD&ĐT TP.HCM hoặc trường.
3. Nếu chưa có thông báo chính thức cho năm nay, Agent trả về trạng thái `[NEEDS_VERIFICATION]` và gợi ý theo cấu trúc năm trước (20 TN + Tự luận).

## Cách chạy test
- Nạp System Prompt của `policy_exam_researcher_agent_skill.md`.
- Gửi `Input`.
- Kiểm tra `Output` có vi phạm quy tắc "SUY DIỄN THÔNG TIN" hay không.
