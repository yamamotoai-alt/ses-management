'use client'

import { Download } from 'lucide-react'
import { Engineer, Project } from '@/types'

function escapeCsv(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return ''
  const str = String(val)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function skillsToString(skills: { name: string; years: number }[]): string {
  return skills.map(s => `${s.name}(${s.years}年)`).join(' / ')
}

export function ExportEngineersButton({ engineers }: { engineers: Engineer[] }) {
  function handleExport() {
    const headers = [
      '氏名', 'イニシャル', '年齢', '最寄り駅/地域', '単価(円/月)', 'ステータス', '稼働形態',
      '参画タイミング', '言語スキル', 'フレームワーク', 'クラウド環境',
      'スキル概要', '上位営業先', '面接担当者', '営業担当者', '登録日',
    ]

    const rows = engineers.map(e => [
      e.name,
      e.initials,
      e.age,
      e.nearest_station,
      e.monthly_rate,
      e.status,
      e.work_style,
      e.available_from,
      skillsToString(e.languages),
      skillsToString(e.frameworks),
      skillsToString(e.cloud_environments),
      e.skill_summary,
      e.top_sales_target,
      e.interview_person,
      e.sales_person,
      new Date(e.created_at).toLocaleDateString('ja-JP'),
    ])

    const csv = [headers, ...rows]
      .map(row => row.map(escapeCsv).join(','))
      .join('\n')

    download('﻿' + csv, `エンジニア一覧_${today()}.csv`)
  }

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 border border-slate-300 hover:border-slate-400 text-slate-600 hover:text-slate-800 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors bg-white"
    >
      <Download className="w-4 h-4" /> CSV出力
    </button>
  )
}

export function ExportProjectsButton({ projects }: { projects: Project[] }) {
  function handleExport() {
    const headers = [
      '案件名', '紹介者', '予算下限(円/月)', '予算上限(円/月)', '期間',
      '稼働形態', '必要経験年数(年以上)', '必須言語', '必須フレームワーク',
      'クラウド環境', '案件概要', 'ステータス', '登録日',
    ]

    const rows = projects.map(p => [
      p.name,
      p.introducer,
      p.budget_min,
      p.budget_max,
      p.duration,
      p.work_style,
      p.required_experience_years,
      skillsToString(p.required_languages),
      skillsToString(p.required_frameworks),
      skillsToString(p.required_cloud),
      p.description,
      p.status,
      new Date(p.created_at).toLocaleDateString('ja-JP'),
    ])

    const csv = [headers, ...rows]
      .map(row => row.map(escapeCsv).join(','))
      .join('\n')

    download('﻿' + csv, `案件一覧_${today()}.csv`)
  }

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 border border-slate-300 hover:border-slate-400 text-slate-600 hover:text-slate-800 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors bg-white"
    >
      <Download className="w-4 h-4" /> CSV出力
    </button>
  )
}

function today(): string {
  return new Date().toISOString().slice(0, 10).replace(/-/g, '')
}

function download(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
