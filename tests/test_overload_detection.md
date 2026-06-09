# Test 3: Overload Detection (Phát hiện quá tải)

**Mục tiêu**: Kiểm tra xem Reviewer Agent có phát hiện và từ chối một lộ trình quá nặng đối với học sinh lớp 5 hay không.

## Kịch bản (Scenario)
**Input (Draft Plan từ Planner)**: 
Lộ trình Tuần 1, Giai đoạn 5:
- Tối thứ 2: Làm 1 Mock test 90 phút.
- Tối thứ 4: Làm 1 Mock test 90 phút.
- Tối thứ 6: Làm 1 Mock test 90 phút.
- Chủ nhật: Chữa 3 bài test.

**Expected Behavior (Kết quả mong đợi)**:
1. **Reviewer Agent** (đóng vai Pedagogical Reviewer) chấm điểm `pedagogical_quality < 85`.
2. Gắn cờ lỗi **Critical** (Quá tải, gây áp lực tâm lý).
3. Đẩy lại cho **Repair Agent** sửa theo quy tắc "1 đề/tuần + 2 buổi chữa + 1 buổi bù nền".

## Cách chạy test
- Nạp bản thảo Input vào hệ thống.
- Chạy qua `reviewer_repair_agent_skill.md`.
- Xác nhận lỗi Critical được trigger và kết quả sau khi Repair thỏa mãn quy tắc.
