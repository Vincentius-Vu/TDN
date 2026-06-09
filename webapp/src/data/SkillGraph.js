export const SKILL_GRAPH = {
  math_logic: [
    {
      id: "fraction_basic",
      name: { vi: "Phân số cơ bản", en: "Basic Fractions" },
      prerequisites: [],
      zpdLevel: 1,
      introText: {
        vi: "Phân số biểu diễn một phần của tổng thể. Ví dụ: 1/2 cái bánh là một nửa cái bánh.",
        en: "Fractions represent parts of a whole. Example: 1/2 of a pizza is a half."
      }
    },
    {
      id: "fraction_comparison",
      name: { vi: "So sánh phân số", en: "Fraction Comparison" },
      prerequisites: ["fraction_basic"],
      zpdLevel: 2,
      introText: {
        vi: "Muốn so sánh 2 phân số, ta có thể quy đồng mẫu số. Phân số nào có tử số lớn hơn thì lớn hơn.",
        en: "To compare fractions, find a common denominator. The one with larger numerator is larger."
      }
    },
    {
      id: "fraction_addition",
      name: { vi: "Cộng trừ phân số", en: "Fraction Addition/Subtraction" },
      prerequisites: ["fraction_basic"],
      zpdLevel: 2,
      introText: {
        vi: "Khi cộng trừ phân số khác mẫu, con phải quy đồng mẫu số trước nhé.",
        en: "When adding/subtracting fractions with different denominators, find a common denominator first."
      }
    },
    {
      id: "fraction_word_problem",
      name: { vi: "Toán đố Phân số", en: "Fraction Word Problems" },
      prerequisites: ["fraction_comparison", "fraction_addition"],
      zpdLevel: 3,
      introText: {
        vi: "Đọc kỹ đề bài để biết cần dùng phép toán nào nhé. Ví dụ: 'còn lại' thường là phép trừ.",
        en: "Read carefully to know which operation to use. E.g. 'left' usually means subtraction."
      }
    }
  ],
  vietnamese: [
    {
      id: "reading_main_idea",
      name: { vi: "Đọc hiểu Ý chính", en: "Reading Main Idea" },
      prerequisites: [],
      zpdLevel: 1,
      introText: {
        vi: "Ý chính là thông điệp quan trọng nhất mà tác giả muốn truyền tải, thường nằm ở đầu hoặc cuối đoạn văn.",
        en: "The main idea is the most important message the author wants to convey."
      }
    },
    {
      id: "reading_inference",
      name: { vi: "Đọc hiểu Suy luận", en: "Reading Inference" },
      prerequisites: ["reading_main_idea"],
      zpdLevel: 2,
      introText: {
        vi: "Suy luận là đoán ra những điều tác giả không nói thẳng ra, dựa trên manh mối trong bài.",
        en: "Inference is guessing what the author doesn't explicitly say based on clues."
      }
    }
  ],
  english: [
    {
      id: "eng_vocab_basic",
      name: { vi: "Từ vựng cơ bản", en: "Basic Vocabulary" },
      prerequisites: [],
      zpdLevel: 1,
      introText: {
        vi: "Học các từ vựng thường gặp trong đời sống hàng ngày.",
        en: "Learn common vocabulary used in daily life."
      }
    },
    {
      id: "eng_grammar_tense",
      name: { vi: "Ngữ pháp: Các thì", en: "Grammar: Tenses" },
      prerequisites: ["eng_vocab_basic"],
      zpdLevel: 2,
      introText: {
        vi: "Thì trong tiếng Anh cho biết thời gian diễn ra hành động (Quá khứ, Hiện tại, Tương lai).",
        en: "Tenses indicate the time of action (Past, Present, Future)."
      }
    }
  ],
  mixed: [
    {
      id: "general_knowledge",
      name: { vi: "Kiến thức chung", en: "General Knowledge" },
      prerequisites: [],
      zpdLevel: 1,
      introText: {
        vi: "Kiểm tra sự hiểu biết của con về thế giới xung quanh (Lịch sử, Địa lý, Tự nhiên).",
        en: "Test your knowledge about the world around you (History, Geography, Science)."
      }
    }
  ]
};

export const DOMAINS = [
  { id: 'math_logic', icon: '🧮', name: { vi: 'Toán & Logic', en: 'Math & Logic' } },
  { id: 'vietnamese', icon: '📖', name: { vi: 'Tiếng Việt', en: 'Vietnamese Reading & Writing' } },
  { id: 'english', icon: '🇬🇧', name: { vi: 'Tiếng Anh (Sắp ra mắt)', en: 'English (Coming Soon)' } },
  { id: 'mixed', icon: '🌍', name: { vi: 'Kiến thức chung', en: 'General Knowledge' } }
];
