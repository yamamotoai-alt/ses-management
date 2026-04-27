export type WorkStyle = 'フルリモート' | 'ハイブリッド' | '常駐'
export type EngineerStatus = '稼働中' | '待機中'
export type ProjectStatus = '募集中' | '終了'

export interface SkillWithYears {
  name: string
  years: number
}

export interface Engineer {
  id: string
  name: string
  initials: string | null
  age: number | null
  nearest_station: string | null
  monthly_rate: number | null
  languages: SkillWithYears[]
  frameworks: SkillWithYears[]
  cloud_environments: SkillWithYears[]
  work_style: WorkStyle | null
  available_from: string | null
  skill_summary: string | null
  status: EngineerStatus
  top_sales_target: string | null
  interview_person: string | null
  sales_person: string | null
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  name: string
  introducer: string | null
  budget_min: number | null
  budget_max: number | null
  duration: string | null
  required_languages: SkillWithYears[]
  required_frameworks: SkillWithYears[]
  required_cloud: SkillWithYears[]
  work_style: WorkStyle | null
  required_experience_years: number | null
  description: string | null
  status: ProjectStatus
  created_at: string
  updated_at: string
}

export interface MatchingResult {
  id: string
  score: number
  reason: string
  engineer?: Engineer
  project?: Project
}

export const MONTHS = [
  '即日', '今月', '翌月',
  '1月', '2月', '3月', '4月', '5月', '6月',
  '7月', '8月', '9月', '10月', '11月', '12月',
]

export const CLOUD_OPTIONS = [
  'AWS', 'GCP', 'Azure', 'Oracle Cloud', 'IBM Cloud', 'その他'
]

export const LANGUAGE_OPTIONS = [
  'Java', 'Python', 'TypeScript', 'JavaScript', 'Go', 'Rust',
  'C#', 'C++', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'Scala', 'その他'
]

export const FRAMEWORK_OPTIONS = [
  'React', 'Next.js', 'Vue.js', 'Nuxt.js', 'Angular',
  'Spring Boot', 'Django', 'FastAPI', 'Laravel', 'Rails',
  'Express', 'NestJS', 'Flutter', 'その他'
]
