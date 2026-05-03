export type WorkStyle = 'フルリモート' | 'ハイブリッド' | '常駐'
export type EngineerStatus = '稼働中' | '待機中' | '別企業で稼働'
export type ProjectStatus = '募集中' | '終了' | 'draft'
export type ProposalStatus = '提案準備' | '提案中' | '面談調整中' | '面談済' | '結果待ち' | '受注' | '稼働開始' | '終了予定' | '終了'
export type RenewalDecision = 'pending' | 'will_renew' | 'will_end' | 'decided_unknown'

export interface SkillWithYears {
  name: string
  years: number
}

export interface Engineer {
  id: string
  name: string
  initials: string | null
  title: string | null
  age: number | null
  nearest_station: string | null
  monthly_rate: number | null
  client_rate: number | null
  languages: SkillWithYears[]
  frameworks: SkillWithYears[]
  cloud_environments: SkillWithYears[]
  db_skills: SkillWithYears[]
  os_environments: SkillWithYears[]
  tools: SkillWithYears[]
  other_skills: SkillWithYears[]
  work_style: WorkStyle | null
  available_from: string | null
  skill_summary: string | null
  status: EngineerStatus
  email: string | null
  phone: string | null
  nationality: string | null
  desired_project: string | null
  inflow_source: string | null
  working_hours: string | null
  personality: string | null
  notes: string | null
  skill_sheet_real_path: string | null
  skill_sheet_initials_path: string | null
  resume_real_path: string | null
  top_sales_target: string | null
  interview_person: string | null
  sales_person: string | null
  username: string | null
  interviewed: boolean
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  name: string
  introducer: string | null
  budget_min: number | null
  budget_max: number | null
  budget_skill_based: boolean
  engineer_price_min: number | null
  engineer_price_max: number | null
  duration: string | null
  required_languages: SkillWithYears[]
  required_frameworks: SkillWithYears[]
  required_cloud: SkillWithYears[]
  optional_languages: SkillWithYears[]
  optional_frameworks: SkillWithYears[]
  optional_cloud: SkillWithYears[]
  work_style: WorkStyle | null
  work_location: string | null
  work_hours: string | null
  interview_count: string | null
  commercial_flow: string | null
  required_experience_years: number | null
  required_requirements: string | null
  preferred_requirements: string | null
  description: string | null
  project_content: string | null
  project_notes: string | null
  status: ProjectStatus
  source: string | null
  raw_source_text: string | null
  created_at: string
  updated_at: string
}

export interface Proposal {
  id: string
  engineer_id: string
  project_id: string
  status: ProposalStatus
  channel: string
  partner_company_name: string | null
  partner_contact_name: string | null
  partner_contact_email: string | null
  next_action_at: string | null
  next_action_note: string | null
  contract_start_date: string | null
  contract_end_date: string | null
  auto_renew: boolean
  renewal_decision: RenewalDecision
  created_at: string
  updated_at: string
  engineers?: Engineer
  projects?: Project
}

export interface MonthlyBilling {
  id: string
  proposal_id: string
  year_month: string
  worked_hours: number | null
  lower_hours: number
  upper_hours: number
  over_unit_price: number | null
  under_unit_price: number | null
  billed_amount: number | null
  paid_amount: number | null
  status: string
  created_at: string
  updated_at: string
  proposals?: Proposal
}

export type PartnerType = '人員出し' | '案件出し' | '両方'

export interface PartnerCompany {
  id: string
  company_name: string
  contact_person: string | null
  email: string | null
  phone: string | null
  contact_method: string | null
  partner_type: PartnerType | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface DistributionChain {
  id: string
  project_id: string
  layer_order: number
  company_name: string
  unit_price_lower: number | null
  unit_price_upper: number | null
  is_self: boolean
}

export interface DailyMatch {
  id: string
  run_date: string
  engineer_id: string
  project_id: string
  score: number
  reasons_json: string[]
  mismatches_json: string[]
  dismissed: boolean
  created_at: string
  engineers?: Engineer
  projects?: Project
}

export interface MatchingResult {
  id: string
  score: number
  reason: string
  engineer?: Engineer
  project?: Project
}

export const PROPOSAL_STATUSES: ProposalStatus[] = [
  '提案準備', '提案中', '面談調整中', '面談済', '結果待ち', '受注', '稼働開始', '終了予定', '終了'
]

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
