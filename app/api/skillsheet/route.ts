export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { Engineer } from '@/types'

type AnonLevel = 'none' | 'initials' | 'initials_no_age' | 'full'

function maskedName(engineer: Engineer, level: AnonLevel): string {
  if (level === 'none') return engineer.name
  if (engineer.initials) return engineer.initials
  const parts = engineer.name.split(/\s+/)
  return parts.map(p => p[0] + '.').join('')
}

function buildHtmlContent(
  engineer: Engineer,
  anonLevel: AnonLevel,
  selectedSkills: string[],
  excludeRate: boolean,
  excludeSales: boolean,
  excludeTopSales: boolean,
): string {
  const name = maskedName(engineer, anonLevel)
  const showAge = anonLevel !== 'initials_no_age' && anonLevel !== 'full'
  const showLocation = anonLevel !== 'full'
  const showRate = !excludeRate
  const showSales = !excludeSales
  const showTopSales = !excludeTopSales

  const highlightSkills = selectedSkills.length > 0 ? `
    <div style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:8px;padding:12px 16px;margin-bottom:20px;">
      <div style="font-size:11px;font-weight:600;color:#1D4ED8;margin-bottom:8px;">強調スキル</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;">
        ${selectedSkills.map(s => `<span style="background:#2563EB;color:#fff;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:600;">${s}</span>`).join('')}
      </div>
    </div>` : ''

  const skills = (items: {name:string;years:number}[], unit = '年') =>
    items.length === 0 ? '—' : items.map(i => `${i.name}(${i.years}${unit})`).join('、')

  const row = (label: string, value: string | null | undefined) =>
    value ? `<tr><td style="width:120px;padding:6px 8px;color:#64748B;font-size:12px;font-weight:500;white-space:nowrap;">${label}</td><td style="padding:6px 8px;font-size:13px;color:#1E293B;">${value}</td></tr>` : ''

  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: "Hiragino Kaku Gothic ProN", "Meiryo", sans-serif; font-size: 13px; color: #1E293B; background: white; padding: 32px; }
  h1 { font-size: 20px; font-weight: 700; color: #1E293B; margin-bottom: 4px; }
  h2 { font-size: 14px; font-weight: 600; color: #334155; border-bottom: 2px solid #E2E8F0; padding-bottom: 6px; margin: 20px 0 10px; }
  table { width: 100%; border-collapse: collapse; }
  td { vertical-align: top; }
  .header { border-bottom: 3px solid #2563EB; padding-bottom: 16px; margin-bottom: 20px; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
  .badge-green { background: #DCFCE7; color: #15803D; }
  .badge-blue { background: #DBEAFE; color: #1D4ED8; }
  .skill-tag { display: inline-block; background: #F1F5F9; color: #334155; padding: 2px 8px; border-radius: 4px; font-size: 12px; margin: 2px; }
  @media print { body { padding: 16px; } }
</style>
</head>
<body>
  <div class="header">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;">
      <div>
        <div style="font-size:11px;color:#94A3B8;margin-bottom:4px;">スキルシート</div>
        <h1>${name}</h1>
        <div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap;">
          ${engineer.status ? `<span class="badge badge-green">${engineer.status}</span>` : ''}
          ${engineer.work_style ? `<span class="badge badge-blue">${engineer.work_style}</span>` : ''}
        </div>
      </div>
      <div style="text-align:right;color:#94A3B8;font-size:11px;">
        作成日: ${new Date().toLocaleDateString('ja-JP')}
      </div>
    </div>
  </div>

  ${highlightSkills}

  <h2>基本情報</h2>
  <table>
    ${showAge && engineer.age ? row('年齢', `${engineer.age}歳`) : ''}
    ${showLocation && engineer.nearest_station ? row('最寄り駅/地域', engineer.nearest_station) : ''}
    ${engineer.available_from ? row('参画タイミング', engineer.available_from) : ''}
    ${showRate && engineer.monthly_rate ? row('希望単価', `${engineer.monthly_rate.toLocaleString()}円/月`) : ''}
  </table>

  <h2>スキル情報</h2>
  <table>
    ${row('言語', skills(engineer.languages))}
    ${row('フレームワーク', skills(engineer.frameworks))}
    ${row('クラウド', skills(engineer.cloud_environments))}
  </table>

  ${engineer.skill_summary ? `
  <h2>スキル概要</h2>
  <p style="font-size:13px;line-height:1.7;color:#334155;white-space:pre-wrap;">${engineer.skill_summary}</p>
  ` : ''}

  ${showTopSales || showSales ? `
  <h2>営業情報</h2>
  <table>
    ${showTopSales ? row('上位営業先', engineer.top_sales_target) : ''}
    ${row('面接担当者', engineer.interview_person)}
    ${showSales ? row('営業担当者', engineer.sales_person) : ''}
  </table>
  ` : ''}
</body>
</html>`
}

export async function POST(req: NextRequest) {
  try {
    const { engineer, format, anonLevel, selectedSkills, excludeRate, excludeSales, excludeTopSales } =
      await req.json() as {
        engineer: Engineer
        format: 'pdf' | 'excel'
        anonLevel: AnonLevel
        selectedSkills: string[]
        excludeRate: boolean
        excludeSales: boolean
        excludeTopSales: boolean
      }

    if (format === 'excel') {
      const name = maskedName(engineer, anonLevel)
      const showAge = anonLevel !== 'initials_no_age' && anonLevel !== 'full'
      const showLocation = anonLevel !== 'full'
      const showRate = !excludeRate

      const rows: string[][] = [
        ['スキルシート'],
        ['氏名', name],
        showAge && engineer.age ? ['年齢', String(engineer.age) + '歳'] : [],
        showLocation && engineer.nearest_station ? ['最寄り駅/地域', engineer.nearest_station] : [],
        engineer.available_from ? ['参画タイミング', engineer.available_from] : [],
        showRate && engineer.monthly_rate ? ['希望単価', engineer.monthly_rate.toLocaleString() + '円/月'] : [],
        [],
        ['スキル'],
        ['言語', engineer.languages.map(l => `${l.name}(${l.years}年)`).join('、') || '—'],
        ['フレームワーク', engineer.frameworks.map(f => `${f.name}(${f.years}年)`).join('、') || '—'],
        ['クラウド', engineer.cloud_environments.map(c => `${c.name}(${c.years}年)`).join('、') || '—'],
        ...(engineer.skill_summary ? [[], ['スキル概要'], [engineer.skill_summary]] : []),
        ...(selectedSkills.length > 0 ? [[], ['強調スキル', selectedSkills.join('、')]] : []),
      ].filter(r => r.length > 0)

      const csvContent = rows.map(r => r.map(c => `"${(c || '').replace(/"/g, '""')}"`).join(',')).join('\n')
      const bom = '﻿'
      const blob = new TextEncoder().encode(bom + csvContent)

      return new NextResponse(blob, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment',
        },
      })
    }

    // PDF: HTMLを返してブラウザで印刷
    const html = buildHtmlContent(engineer, anonLevel, selectedSkills, excludeRate, excludeSales, excludeTopSales)
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
