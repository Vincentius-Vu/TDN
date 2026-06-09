import rawItemsBank from '../data/items_bank.json';

// Lấy ngẫu nhiên n phần tử từ một mảng
function getRandomItems(arr, n) {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
}

export const getNormalizedItemsBank = () => {
    // Chỉ lấy 1 lượng data vừa đủ cho từng skill để app không bị lag nếu data quá to (VD 12,000 dòng).
    // Ta có thể filter và chuẩn hoá tại runtime.
    
    // Tạo 1 bản sao chuẩn hoá
    let normalized = rawItemsBank.map(item => {
        let nItem = { ...item };
        
        // Sửa các item PDF "mixed" -> "general_knowledge"
        if (!nItem.domain) nItem.domain = "mixed";
        if (!nItem.skill) nItem.skill = "general_knowledge";
        if (!nItem.difficulty) nItem.difficulty = 1;
        if (!nItem.hints || nItem.hints.length === 0) {
            nItem.hint_levels = nItem.hint_levels || [
                "Hãy đọc kỹ lại đề bài một lần nữa.",
                "Thử loại trừ các đáp án hoàn toàn vô lý xem sao.",
                "Nhớ lại kiến thức nền tảng liên quan đến dạng bài này."
            ];
        }
        if (!nItem.error_tags) nItem.error_tags = ["needs_review"];
        if (!nItem.prerequisites) nItem.prerequisites = [];
        
        return nItem;
    });

    return normalized;
};

// Lấy danh sách câu hỏi cho 1 skill cụ thể, giới hạn số lượng (vd: lấy 10 câu random)
export const getQuestionsForSkill = (skillId, limit = 10) => {
    const all = getNormalizedItemsBank();
    const filtered = all.filter(q => q.skill === skillId);
    
    // Nếu skill chưa có câu hỏi nào (VD English), trả về rỗng để hiển thị Empty State
    if (filtered.length === 0) return [];
    
    return getRandomItems(filtered, Math.min(limit, filtered.length));
};
