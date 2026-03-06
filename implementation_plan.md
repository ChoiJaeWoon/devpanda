# DevForge — AI & 개발자 유틸리티 도구 사이트

AI/ML 개발자와 일반 개발자를 위한 브라우저 기반 유틸리티 도구 모음 사이트.
광고(AdSense) 기반 수익 모델, 100% 프론트엔드로 서버 비용 없이 운영.

## User Review Required

> [!IMPORTANT]
> **MVP 도구 3개로 시작합니다:**
> 1. Tensor Shape 계산기
> 2. 라벨링 포맷 변환기 (YOLO ↔ COCO ↔ VOC)
> 3. GPU 메모리 / 배치사이즈 계산기
>
> 추후 JSON 포매터, Base64 변환기 등 일반 개발 도구도 추가 예정

> [!WARNING]
> 프로젝트 디렉토리: `C:\Users\tronix\.gemini\antigravity\scratch\devforge`
> 이 경로를 워크스페이스로 설정하시는 것을 추천드립니다.

---

## Proposed Changes

### 프로젝트 초기 셋업

#### [NEW] Vite 프로젝트 초기화
- `npx create-vite@latest ./` (Vanilla JS)
- 라우팅: 해시 기반 SPA 라우터 직접 구현 (프레임워크 없이 가볍게)
- 폴더 구조:

```
devforge/
├── index.html
├── src/
│   ├── main.js          # 앱 진입점 + 라우터
│   ├── style.css         # 글로벌 스타일 + 디자인 시스템
│   ├── pages/
│   │   ├── home.js       # 홈 (도구 목록)
│   │   ├── tensor-shape.js
│   │   ├── label-converter.js
│   │   └── gpu-memory.js
│   ├── components/
│   │   ├── navbar.js     # 상단 네비게이션
│   │   ├── sidebar.js    # 도구 카테고리 사이드바
│   │   ├── footer.js
│   │   └── tool-card.js  # 홈 페이지 도구 카드
│   └── utils/
│       ├── router.js     # SPA 해시 라우터
│       └── helpers.js    # 공용 유틸리티
├── public/
│   └── favicon.svg
└── package.json
```

---

### 디자인 시스템

#### [NEW] [style.css](file:///C:/Users/tronix/.gemini/antigravity/scratch/devforge/src/style.css)

- **테마**: 라이트 모드 기본 (밝고 깔끔한 느낌)
- **색상**: 
  - 배경: `#f8fafc` (밝은 화이트 그레이)
  - 카드: `#ffffff` (순백) + 미세한 그림자
  - 사이드바/헤더: `#f1f5f9`
  - 액센트: `#4f46e5` (인디고) + `#0891b2` (시안)
  - 텍스트: `#1e293b` (메인) / `#64748b` (보조)
  - 보더: `#e2e8f0`
- **폰트**: Inter (Google Fonts)
- **특수 효과**: 부드러운 그림자 카드, 미세한 그라디언트 액센트, hover 애니메이션
- **반응형**: 모바일 ~ 데스크탑 대응

---

### MVP 도구 #1: Tensor Shape 계산기

#### [NEW] [tensor-shape.js](file:///C:/Users/tronix/.gemini/antigravity/scratch/devforge/src/pages/tensor-shape.js)

**기능:**
- 레이어를 순차적으로 추가하면 실시간으로 output shape 계산
- 지원 레이어:
  - `Conv2d` (in_ch, out_ch, kernel, stride, padding)
  - `MaxPool2d` / `AvgPool2d` (kernel, stride, padding)
  - `BatchNorm2d`
  - `Linear` (in_features, out_features)
  - `Flatten`
- 입력: 초기 input shape (예: `[1, 3, 224, 224]`)
- 출력: 각 레이어별 output shape 테이블 + 시각적 다이어그램
- 에러: shape 충돌 시 빨간색으로 경고

**공식:**
```
Conv2d output = floor((input + 2*padding - kernel) / stride) + 1
Pool output = floor((input + 2*padding - kernel) / stride) + 1
```

---

### MVP 도구 #2: 라벨링 포맷 변환기

#### [NEW] [label-converter.js](file:///C:/Users/tronix/.gemini/antigravity/scratch/devforge/src/pages/label-converter.js)

**기능:**
- 지원 포맷: YOLO ↔ COCO JSON ↔ Pascal VOC (XML)
- 파일 업로드 (드래그 앤 드롭 지원)
- 이미지 크기 입력 (YOLO는 정규화 좌표이므로 필요)
- 미리보기: 변환 전/후 좌표 비교 표시
- 일괄 변환: 여러 파일 동시 처리
- 다운로드: 변환된 파일 zip으로 다운로드

**포맷 스펙:**
| 포맷 | 좌표 형식 |
|------|------|
| YOLO | `class x_center y_center width height` (0~1 정규화) |
| COCO | `[x_min, y_min, width, height]` (픽셀) |
| VOC | `<xmin> <ymin> <xmax> <ymax>` (XML, 픽셀) |

---

### MVP 도구 #3: GPU 메모리 계산기

#### [NEW] [gpu-memory.js](file:///C:/Users/tronix/.gemini/antigravity/scratch/devforge/src/pages/gpu-memory.js)

**기능:**
- 모델 파라미터 수 입력 (또는 유명 모델 프리셋 선택)
- 프리셋: ResNet-50, YOLOv8, GPT-2, BERT, ViT 등
- 정밀도 선택: FP32 / FP16 / INT8
- 배치사이즈 입력
- 계산 결과:
  - 모델 메모리
  - Optimizer 메모리 (Adam: 파라미터 x 3)
  - Gradient 메모리
  - 활성화 메모리 (추정)
  - **총 필요 VRAM**
- GPU 비교: 내 GPU에서 돌릴 수 있는지 시각적 표시
  - 프리셋 GPU: RTX 3060(12GB), RTX 3090(24GB), RTX 4090(24GB), A100(80GB), 내장그래픽(공유 메모리) 등

---

### 홈 페이지 & 네비게이션

#### [NEW] [home.js](file:///C:/Users/tronix/.gemini/antigravity/scratch/devforge/src/pages/home.js)
- 히어로 섹션: "DevForge" 로고 + 태그라인
- 도구 카드 그리드: 각 도구를 카드로 표시 (아이콘 + 제목 + 설명)
- 카테고리 필터: "AI/ML Tools" / "General Dev Tools" 탭

#### [NEW] [navbar.js](file:///C:/Users/tronix/.gemini/antigravity/scratch/devforge/src/components/navbar.js)
- 상단 고정 네비게이션
- 로고 + 도구 검색 + GitHub 링크

---

## Verification Plan

### 브라우저 테스트
- `npm run dev`로 로컬 서버 실행 후 브라우저로 확인
- 각 도구 페이지 접근 가능한지 확인
- Tensor Shape: `[1, 3, 224, 224]` → Conv2d(3, 64, 7, 2, 3) → 출력이 `[1, 64, 112, 112]`인지 확인
- Label Converter: YOLO 샘플 파일 업로드 → COCO 변환 결과 확인
- GPU Memory: ResNet-50 프리셋 → FP32 → 배치32 → VRAM 계산 결과 확인

### 반응형 확인
- 브라우저에서 모바일 뷰포트(375px)로 변경하여 레이아웃 확인

### 수동 검증 (사용자)
- 디자인이 마음에 드는지 확인
- 도구 사용 흐름이 직관적인지 피드백
