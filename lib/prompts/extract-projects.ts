export const EXTRACT_PROJECTS_PROMPT = `以下のテキストには、1件または複数件の開発案件情報が含まれています。
すべての案件を配列として抽出し、JSONで返してください。

各案件から以下の項目を抽出してください:
- name: 案件名（文字列、不明なら "案件" + 連番）
- budget_min: 予算下限（円/月の整数、不明なら null）
- budget_max: 予算上限（円/月の整数、不明なら null）
- duration: 期間（文字列、例: "3ヶ月〜"、不明なら null）
- work_style: 稼働形態（"フルリモート"/"ハイブリッド"/"常駐"のいずれか、不明なら null）
- work_location: 勤務場所（文字列、不明なら null）
- work_hours: 勤務時間（文字列、不明なら null）
- interview_count: 面談回数（文字列、不明なら null）
- commercial_flow: 商流（文字列、不明なら null）
- required_experience_years: 必要経験年数（数値、不明なら null）
- description: 案件概要（文字列）
- required_languages: 必須言語 [{"name": "Java", "years": 3}]
- required_frameworks: 必須FW [{"name": "Spring Boot", "years": 2}]
- required_cloud: クラウド [{"name": "AWS", "years": 1}]

レスポンス形式（JSONのみ、説明文なし）:
{
  "projects": [
    { ... },
    { ... }
  ]
}`
