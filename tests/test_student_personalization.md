# Test 2: Student Personalization (Cá nhân hóa lộ trình)

**Mục tiêu**: Đảm bảo Planner Agent điều chỉnh lộ trình (không dùng template cứng nhắc) dựa trên profile thực tế của học sinh.

## Kịch bản (Scenario)
**Input (Student Profile)**: 
Học sinh lớp 5, mục tiêu thi Trần Đại Nghĩa. Điểm kiểm tra chẩn đoán cho thấy học sinh có tư duy Toán học xuất sắc (95/100) nhưng kỹ năng đọc hiểu Tiếng Anh và ngữ pháp Tiếng Việt rất yếu (40/100). Tốc độ làm bài chậm.

**Expected Behavior (Kết quả mong đợi)**:
1. **Planner Agent** phát hiện các cờ `[WEAK_IN_ENGLISH]`, `[WEAK_IN_VIETNAMESE_WRITING]`, `[SLOW_TEST_TAKER]`.
2. Lộ trình **Giai đoạn 1 & 2** được điều chỉnh: Giảm bớt bài tập Toán (chỉ giữ bài tập duy trì tư duy), tăng cường thời lượng học từ vựng Tiếng Anh và luyện viết câu Tiếng Việt.
3. Không giao ngay Mock Test quá sớm do tốc độ chậm.

## Cách chạy test
- Nạp `planner_agent_skill.md`.
- Đưa Input Profile.
- Kiểm tra lịch học Giai đoạn 2 xem tỷ trọng môn Tiếng Anh và Tiếng Việt có cao hơn Toán không.
