// 카테고리 → 결과물 형식 매핑 (업로드 받는 형식 + 표시 형식 공통 단일 출처)
// ⚠️ 이 파일은 타입만 의존한다 (mock-data를 import하지 않음 → 순환 의존 방지)
import type { Category, OutputFormat } from "@/lib/types";

export interface OutputSpec {
  format: OutputFormat;
  label: string; // 사람이 읽는 형식명 ("이미지 여러 장")
  short: string; // 뱃지용 짧은 라벨 ("IMG")
  accept: string; // <input accept> 값 (video는 "url")
  multiple: boolean; // 여러 파일 허용 여부
  icon: string; // 글리프
  hint: string; // 업로더 안내 문구
  example: string; // 예시 결과물
}

/** 8개 카테고리가 각각 어떤 형식의 결과물을 받고/보여주는지 */
export const OUTPUT_BY_CATEGORY: Record<Category, OutputSpec> = {
  학업: {
    format: "pdf",
    label: "PDF 문서",
    short: "PDF",
    accept: ".pdf,application/pdf",
    multiple: false,
    icon: "▤",
    hint: "발표·리포트 PDF를 올려주세요",
    example: "발표 슬라이드 PDF",
  },
  취업: {
    format: "doc",
    label: "Word 문서",
    short: "DOCX",
    accept: ".doc,.docx",
    multiple: false,
    icon: "◰",
    hint: "자기소개서 Word 파일을 올려주세요",
    example: "자소서 .docx",
  },
  창업: {
    format: "pdf",
    label: "PDF 문서",
    short: "PDF",
    accept: ".pdf,application/pdf",
    multiple: false,
    icon: "▤",
    hint: "IR 피치덱 PDF를 올려주세요",
    example: "IR Deck PDF",
  },
  디자인: {
    format: "image",
    label: "이미지",
    short: "IMG",
    accept: "image/*",
    multiple: false,
    icon: "◐",
    hint: "디자인 시안 이미지를 올려주세요",
    example: "토큰/시안 이미지",
  },
  개발: {
    format: "video",
    label: "영상 (YouTube)",
    short: "VIDEO",
    accept: "url",
    multiple: false,
    icon: "▷",
    hint: "데모 영상 YouTube 링크를 붙여넣어 주세요",
    example: "워크플로우 데모 영상",
  },
  이미지: {
    format: "images",
    label: "이미지 여러 장",
    short: "IMG",
    accept: "image/*",
    multiple: true,
    icon: "▦",
    hint: "생성 결과 이미지들을 올려주세요 (여러 장)",
    example: "제품샷 여러 컷",
  },
  글쓰기: {
    format: "doc",
    label: "Word 문서",
    short: "DOCX",
    accept: ".doc,.docx",
    multiple: false,
    icon: "◰",
    hint: "원고 Word 파일을 올려주세요",
    example: "에세이 .docx",
  },
  마케팅: {
    format: "video",
    label: "영상 (YouTube)",
    short: "VIDEO",
    accept: "url",
    multiple: false,
    icon: "▷",
    hint: "광고 영상 YouTube 링크를 붙여넣어 주세요",
    example: "광고 A/B 영상",
  },
};

export const formatLabel: Record<OutputFormat, string> = {
  image: "이미지",
  images: "이미지 여러 장",
  pdf: "PDF 문서",
  doc: "Word 문서",
  video: "영상",
};

/** 다양한 YouTube URL/ID 입력에서 11자리 영상 ID 추출 */
export function youtubeId(input: string): string | null {
  const v = input.trim();
  if (!v) return null;
  const m = v.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/))([\w-]{11})/,
  );
  if (m) return m[1];
  return /^[\w-]{11}$/.test(v) ? v : null;
}
