# Test 5: Closed-Loop Repair (Sửa lỗi vòng kín)

**Mục tiêu**: Đảm bảo vòng lặp `Review -> Diagnose -> Repair -> Re-review` diễn ra suôn sẻ, hệ thống không tự ý dừng (dưới 3 vòng) nếu chất lượng chưa đạt yêu cầu.

## Kịch bản (Scenario)
**Input**: Một Mock Test có câu hỏi trắc nghiệm tiếng Anh nhưng bị sai đáp án (Academic Error) và một câu hỏi Toán quá khó (Age Error).

**Expected Behavior (Kết quả mong đợi)**:
- **Vòng 1**: Reviewer phát hiện 2 lỗi Critical. Trả về trạng thái `Incomplete`. Gọi Repair Agent.
- **Repair 1**: Sửa đáp án tiếng Anh, nhưng câu hỏi Toán chỉ được sửa thành một câu khó tương đương.
- **Vòng 2**: Reviewer pass tiếng Anh, nhưng đánh cờ lỗi Major/Critical cho câu Toán. Trả về `Incomplete`. Gọi Repair Agent.
- **Repair 2**: Thay thế hoàn toàn câu Toán bằng bài phù hợp.
- **Vòng 3**: Reviewer chấm điểm > 85, không còn lỗi Critical/Major. Cấp trạng thái `Completed` và chuyển qua Export.

## Cách chạy test
- Chạy Orchestrator Agent.
- Theo dõi log JSON từng step để đảm bảo Orchestrator kích hoạt tối đa vòng lặp như thiết kế trước khi pass tài liệu.
