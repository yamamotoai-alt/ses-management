import { Engineer, Project } from '@/types'

export function matchedProjectsIntroEmail(engineerName: string, projects: Project[]): string {
  const cards = projects.map(p => {
    const price = (p.engineer_price_min || p.engineer_price_max)
      ? `${p.engineer_price_min?.toLocaleString() ?? '?'}〜${p.engineer_price_max?.toLocaleString() ?? '?'}円/月`
      : (p.budget_min || p.budget_max)
        ? `${p.budget_min?.toLocaleString() ?? '?'}〜${p.budget_max?.toLocaleString() ?? '?'}円/月`
        : '未設定'
    return `
    <div style="margin-bottom:16px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
      <div style="background:#1e40af;color:#fff;padding:10px 16px;font-weight:bold;font-size:14px;">${p.name}</div>
      <table style="width:100%;border-collapse:collapse;">
        ${p.work_style ? `<tr><td style="padding:8px 16px;border-bottom:1px solid #f1f5f9;color:#64748b;width:38%;font-size:13px;">稼働形態</td><td style="padding:8px 16px;border-bottom:1px solid #f1f5f9;font-size:13px;">${p.work_style}</td></tr>` : ''}
        ${p.work_location ? `<tr><td style="padding:8px 16px;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:13px;">勤務場所</td><td style="padding:8px 16px;border-bottom:1px solid #f1f5f9;font-size:13px;">${p.work_location}</td></tr>` : ''}
        ${p.duration ? `<tr><td style="padding:8px 16px;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:13px;">期間</td><td style="padding:8px 16px;border-bottom:1px solid #f1f5f9;font-size:13px;">${p.duration}</td></tr>` : ''}
        <tr><td style="padding:8px 16px;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:13px;">提示単価</td><td style="padding:8px 16px;border-bottom:1px solid #f1f5f9;font-size:13px;">${price}</td></tr>
        ${p.interview_count ? `<tr><td style="padding:8px 16px;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:13px;">面談回数</td><td style="padding:8px 16px;border-bottom:1px solid #f1f5f9;font-size:13px;">${p.interview_count}</td></tr>` : ''}
      </table>
      ${p.required_requirements ? `<div style="padding:12px 16px;border-top:1px solid #f1f5f9;"><p style="margin:0 0 4px;font-size:12px;font-weight:bold;color:#1e40af;">必須要件</p><p style="margin:0;font-size:13px;white-space:pre-wrap;">${p.required_requirements}</p></div>` : ''}
    </div>`
  }).join('')

  return `
<div style="font-family:sans-serif;max-width:640px;margin:0 auto;color:#1e293b;">
  <div style="background:#1e40af;padding:24px 32px;border-radius:8px 8px 0 0;">
    <h1 style="color:#fff;margin:0;font-size:20px;">案件のご紹介</h1>
  </div>
  <div style="background:#f8fafc;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;">
    <p style="margin:0 0 24px;">いつもお世話になっております。<br>Nexus Advisorsです。<br>${engineerName} 様に以下の案件をご紹介いたします。</p>
    ${cards}
    <p style="margin:32px 0 0;font-size:13px;color:#94a3b8;">ご興味がございましたら、お気軽にご連絡ください。<br>Nexus Advisors｜contact@nexusadvisors.co.jp</p>
  </div>
</div>`
}

export function matchedEngineersIntroEmail(engineers: Engineer[], projectName: string, useInitials: boolean): string {
  const cards = engineers.map(e => {
    const displayName = useInitials && e.initials ? e.initials : e.name
    const skills = [
      ...e.languages.map(l => `${l.name}(${l.years}年)`),
      ...e.frameworks.map(f => `${f.name}(${f.years}年)`),
      ...e.cloud_environments.map(c => `${c.name}(${c.years}年)`),
    ].join('、') || '未設定'
    return `
    <div style="margin-bottom:16px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
      <div style="background:#1e40af;color:#fff;padding:10px 16px;font-weight:bold;font-size:14px;">${displayName}</div>
      <table style="width:100%;border-collapse:collapse;">
        ${e.age ? `<tr><td style="padding:8px 16px;border-bottom:1px solid #f1f5f9;color:#64748b;width:38%;font-size:13px;">年齢</td><td style="padding:8px 16px;border-bottom:1px solid #f1f5f9;font-size:13px;">${e.age}歳</td></tr>` : ''}
        ${e.work_style ? `<tr><td style="padding:8px 16px;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:13px;">稼働形態</td><td style="padding:8px 16px;border-bottom:1px solid #f1f5f9;font-size:13px;">${e.work_style}</td></tr>` : ''}
        ${e.available_from ? `<tr><td style="padding:8px 16px;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:13px;">参画タイミング</td><td style="padding:8px 16px;border-bottom:1px solid #f1f5f9;font-size:13px;">${e.available_from}</td></tr>` : ''}
        ${e.monthly_rate ? `<tr><td style="padding:8px 16px;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:13px;">希望単価</td><td style="padding:8px 16px;border-bottom:1px solid #f1f5f9;font-size:13px;">${e.monthly_rate.toLocaleString()}円/月</td></tr>` : ''}
        <tr><td style="padding:8px 16px;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:13px;">スキル</td><td style="padding:8px 16px;border-bottom:1px solid #f1f5f9;font-size:13px;">${skills}</td></tr>
      </table>
      ${e.skill_summary ? `<div style="padding:12px 16px;border-top:1px solid #f1f5f9;"><p style="margin:0 0 4px;font-size:12px;font-weight:bold;color:#1e40af;">エンジニア概要</p><p style="margin:0;font-size:13px;white-space:pre-wrap;">${e.skill_summary}</p></div>` : ''}
    </div>`
  }).join('')

  return `
<div style="font-family:sans-serif;max-width:640px;margin:0 auto;color:#1e293b;">
  <div style="background:#1e40af;padding:24px 32px;border-radius:8px 8px 0 0;">
    <h1 style="color:#fff;margin:0;font-size:20px;">エンジニアのご紹介</h1>
  </div>
  <div style="background:#f8fafc;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;">
    <p style="margin:0 0 24px;">いつもお世話になっております。<br>Nexus Advisorsです。<br>「${projectName}」にマッチしたエンジニアをご紹介いたします。</p>
    ${cards}
    <p style="margin:32px 0 0;font-size:13px;color:#94a3b8;">ご興味がございましたら、お気軽にご連絡ください。<br>Nexus Advisors｜contact@nexusadvisors.co.jp</p>
  </div>
</div>`
}

export function projectIntroEmail(project: Project): string {
  const budget = (project.budget_min || project.budget_max)
    ? `${project.budget_min?.toLocaleString() ?? '?'}〜${project.budget_max?.toLocaleString() ?? '?'}円/月`
    : '未設定'
  const engineerPrice = (project.engineer_price_min || project.engineer_price_max)
    ? `${project.engineer_price_min?.toLocaleString() ?? '?'}〜${project.engineer_price_max?.toLocaleString() ?? '?'}円/月`
    : '未設定'

  return `
<div style="font-family: sans-serif; max-width: 640px; margin: 0 auto; color: #1e293b;">
  <div style="background: #1e40af; padding: 24px 32px; border-radius: 8px 8px 0 0;">
    <h1 style="color: #fff; margin: 0; font-size: 20px;">案件のご紹介</h1>
  </div>
  <div style="background: #f8fafc; padding: 32px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="margin: 0 0 24px;">いつもお世話になっております。<br>Nexus Advisorsです。<br>下記案件についてご紹介させてください。</p>

    <table style="width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <tr><td colspan="2" style="background: #1e40af; color: #fff; padding: 12px 16px; font-weight: bold; font-size: 15px;">${project.name}</td></tr>
      ${project.status ? `<tr><td style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9; color: #64748b; width: 40%;">ステータス</td><td style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9;">${project.status}</td></tr>` : ''}
      ${project.work_style ? `<tr><td style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9; color: #64748b;">稼働形態</td><td style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9;">${project.work_style}</td></tr>` : ''}
      ${project.work_location ? `<tr><td style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9; color: #64748b;">勤務場所</td><td style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9;">${project.work_location}</td></tr>` : ''}
      ${project.duration ? `<tr><td style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9; color: #64748b;">期間</td><td style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9;">${project.duration}</td></tr>` : ''}
      <tr><td style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9; color: #64748b;">予算</td><td style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9;">${budget}</td></tr>
      <tr><td style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9; color: #64748b;">提示単価</td><td style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9;">${engineerPrice}</td></tr>
      ${project.required_experience_years ? `<tr><td style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9; color: #64748b;">必要経験</td><td style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9;">${project.required_experience_years}年以上</td></tr>` : ''}
      ${project.interview_count ? `<tr><td style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9; color: #64748b;">面談回数</td><td style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9;">${project.interview_count}</td></tr>` : ''}
      ${project.commercial_flow ? `<tr><td style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9; color: #64748b;">商流</td><td style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9;">${project.commercial_flow}</td></tr>` : ''}
    </table>

    ${project.required_requirements ? `
    <div style="margin-top: 20px; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
      <p style="margin: 0 0 8px; font-weight: bold; color: #1e40af;">必須要件</p>
      <p style="margin: 0; white-space: pre-wrap; font-size: 14px;">${project.required_requirements}</p>
    </div>` : ''}

    ${project.preferred_requirements ? `
    <div style="margin-top: 12px; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
      <p style="margin: 0 0 8px; font-weight: bold; color: #1e40af;">歓迎要件</p>
      <p style="margin: 0; white-space: pre-wrap; font-size: 14px;">${project.preferred_requirements}</p>
    </div>` : ''}

    ${project.description ? `
    <div style="margin-top: 12px; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
      <p style="margin: 0 0 8px; font-weight: bold; color: #1e40af;">案件概要</p>
      <p style="margin: 0; white-space: pre-wrap; font-size: 14px;">${project.description}</p>
    </div>` : ''}

    ${project.project_content ? `
    <div style="margin-top: 12px; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
      <p style="margin: 0 0 8px; font-weight: bold; color: #1e40af;">案件内容</p>
      <p style="margin: 0; white-space: pre-wrap; font-size: 14px;">${project.project_content}</p>
    </div>` : ''}

    <p style="margin: 32px 0 0; font-size: 13px; color: #94a3b8;">ご興味がございましたら、お気軽にご連絡ください。<br>Nexus Advisors｜contact@nexusadvisors.co.jp</p>
  </div>
</div>`
}

export function engineerIntroEmail(engineer: Engineer, useInitials: boolean): string {
  const displayName = useInitials && engineer.initials ? engineer.initials : engineer.name
  const skills = [
    ...engineer.languages.map(l => `${l.name}(${l.years}年)`),
    ...engineer.frameworks.map(f => `${f.name}(${f.years}年)`),
    ...engineer.cloud_environments.map(c => `${c.name}(${c.years}年)`),
  ].join('、') || '未設定'

  return `
<div style="font-family: sans-serif; max-width: 640px; margin: 0 auto; color: #1e293b;">
  <div style="background: #1e40af; padding: 24px 32px; border-radius: 8px 8px 0 0;">
    <h1 style="color: #fff; margin: 0; font-size: 20px;">エンジニアのご紹介</h1>
  </div>
  <div style="background: #f8fafc; padding: 32px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="margin: 0 0 24px;">いつもお世話になっております。<br>Nexus Advisorsです。<br>下記エンジニアについてご紹介させてください。</p>

    <table style="width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <tr><td colspan="2" style="background: #1e40af; color: #fff; padding: 12px 16px; font-weight: bold; font-size: 15px;">${displayName}</td></tr>
      ${engineer.age ? `<tr><td style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9; color: #64748b; width: 40%;">年齢</td><td style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9;">${engineer.age}歳</td></tr>` : ''}
      ${engineer.nearest_station ? `<tr><td style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9; color: #64748b;">居住地域</td><td style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9;">${engineer.nearest_station}</td></tr>` : ''}
      ${engineer.monthly_rate ? `<tr><td style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9; color: #64748b;">希望単価</td><td style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9;">${engineer.monthly_rate.toLocaleString()}円/月</td></tr>` : ''}
      ${engineer.work_style ? `<tr><td style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9; color: #64748b;">稼働形態</td><td style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9;">${engineer.work_style}</td></tr>` : ''}
      ${engineer.working_hours ? `<tr><td style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9; color: #64748b;">稼働時間</td><td style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9;">${engineer.working_hours}</td></tr>` : ''}
      ${engineer.available_from ? `<tr><td style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9; color: #64748b;">参画タイミング</td><td style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9;">${engineer.available_from}</td></tr>` : ''}
      <tr><td style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9; color: #64748b;">スキル</td><td style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9;">${skills}</td></tr>
      ${engineer.desired_project ? `<tr><td style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9; color: #64748b;">希望案件</td><td style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9;">${engineer.desired_project}</td></tr>` : ''}
    </table>

    ${engineer.skill_summary ? `
    <div style="margin-top: 20px; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
      <p style="margin: 0 0 8px; font-weight: bold; color: #1e40af;">エンジニア概要</p>
      <p style="margin: 0; white-space: pre-wrap; font-size: 14px;">${engineer.skill_summary}</p>
    </div>` : ''}

    <p style="margin: 32px 0 0; font-size: 13px; color: #94a3b8;">ご興味がございましたら、お気軽にご連絡ください。<br>Nexus Advisors｜contact@nexusadvisors.co.jp</p>
  </div>
</div>`
}
