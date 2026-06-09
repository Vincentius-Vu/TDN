# Fully Autonomous Closed-Loop Multi-Agent System cho luyện thi Trần Đại Nghĩa

Hệ thống này chứa bộ kỹ năng (skills/prompts) cho hệ thống Đa tác tử (Multi-Agent) tự hành, được thiết kế chuyên biệt để nghiên cứu, phân tích, chẩn đoán, tổng hợp học liệu và xây dựng lộ trình học tập 12 tháng chuẩn bị cho kỳ thi tuyển sinh lớp 6 Trường THCS và THPT Trần Đại Nghĩa (TP.HCM).

## Cấu trúc thư mục

- `agents/`: Chứa các System Prompts (skill) định nghĩa vai trò, nhiệm vụ và luồng xử lý của 8 Agent lõi trong hệ thống.
- `templates/`: Các biểu mẫu đầu ra được định dạng sẵn (Markdown) để chuẩn hóa báo cáo của Agents.
- `tests/`: Kịch bản kiểm thử nhằm đánh giá khả năng vận hành tự chủ và tự sửa lỗi (Closed-loop) của hệ thống.
- `outputs/`: Nơi lưu trữ các kết quả sinh ra trong quá trình vận hành thực tế.
- `config.yaml`: Cấu hình mặc định của toàn hệ thống.

## Kiến trúc Closed-Loop
Hệ thống vận hành vòng kín theo chu trình:
1. **Plan & Generate**: Orchestrator, Diagnostic và Planner lên kế hoạch và tạo nội dung.
2. **Review**: Reviewer Agent đánh giá các khía cạnh (Học thuật, Lứa tuổi, Sư phạm).
3. **Diagnose & Repair**: Phát hiện lỗi và gọi Repair Agent khắc phục.
4. **Re-review & Integrate**: Đánh giá lại bản vá lỗi trước khi tích hợp vào báo cáo cuối.
5. **Validate & Export**: Kiểm định tổng thể và xuất tài liệu hoàn chỉnh.

## Cách sử dụng
Nạp các prompts trong thư mục `agents/` vào hệ thống AI đa tác tử của bạn, sử dụng `config.yaml` làm tham số mặc định và khởi chạy bằng `orchestrator_agent_skill.md`.
