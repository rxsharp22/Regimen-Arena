import { useState } from 'react'
import { getAgentProfile } from '../../data/agentProfiles'

function BadgeList({ title, items, accent = '#4a9ead' }) {
  if (!items?.length) return null
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-[#8b9cb3] font-semibold mb-2">
        {title}
      </p>
      <ul className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <li
            key={item}
            className="text-[10px] px-2 py-1 rounded border text-[#b8c5d6]"
            style={{ borderColor: `${accent}44`, backgroundColor: `${accent}10` }}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function ProfileSection({ title, children }) {
  return (
    <section>
      <p className="text-[10px] uppercase tracking-widest text-[#4a9ead] font-semibold mb-1.5">
        {title}
      </p>
      <div className="text-sm text-[#b8c5d6] leading-relaxed">{children}</div>
    </section>
  )
}

function SpriteDisplay({ profile }) {
  const [imageFailed, setImageFailed] = useState(false)
  const showImage = profile.sprite && !imageFailed
  const initials = profile.name
    .split(/[\s-]+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 3)
    .toUpperCase()

  return (
    <div className="agent-profile-sprite-panel">
      <div className="agent-profile-sprite-frame">
        {showImage ? (
          <img
            src={profile.sprite}
            alt={profile.spriteAlt}
            onError={() => setImageFailed(true)}
            className="agent-profile-sprite-image"
          />
        ) : (
          <div className="agent-profile-sprite-placeholder" aria-label={profile.spriteAlt}>
            <span className="text-2xl font-bold text-[#4a9ead] tracking-wide">{initials}</span>
            <p className="text-[9px] uppercase tracking-widest text-[#8b9cb3] mt-2">
              Sprite pending
            </p>
          </div>
        )}
      </div>
      {profile.visualRole && (
        <p className="text-[10px] text-center text-[#4a9ead]/85 mt-2 leading-snug">
          {profile.visualRole}
        </p>
      )}
    </div>
  )
}

export default function AgentProfileContent({ drugId }) {
  const profile = getAgentProfile(drugId)
  if (!profile) return null

  return (
    <div className="agent-profile-content">
      <div className="agent-profile-layout">
        <aside className="agent-profile-aside">
          <SpriteDisplay profile={profile} />
        </aside>

        <div className="agent-profile-main space-y-5">
          <header>
            <p className="text-[10px] uppercase tracking-widest text-[#4a9ead] font-semibold">
              Agent Profile
            </p>
            <h2 className="text-2xl font-bold text-[#e8edf4] mt-1">{profile.name}</h2>
            <p className="text-sm text-[#8b9cb3] mt-1">
              {profile.className} · {profile.route}
            </p>
            {profile.needsClinicalReview && (
              <p className="text-[10px] uppercase tracking-widest text-[#c9a227] mt-2">
                Clinical review suggested
              </p>
            )}
          </header>

          <ProfileSection title="Mechanism">
            <p>{profile.mechanism}</p>
          </ProfileSection>

          <ProfileSection title="Visual metaphor">
            <p>{profile.visualMetaphor}</p>
          </ProfileSection>

          <ProfileSection title="Clinical role">
            <p>{profile.clinicalRole}</p>
          </ProfileSection>

          <BadgeList title="Spectrum summary" items={profile.spectrumSummary} />

          <BadgeList
            title="Monitoring"
            items={profile.monitoring}
            accent="#d8a23d"
          />

          <ProfileSection title="Key limitations">
            <ul className="space-y-1.5 list-none">
              {profile.keyLimitations.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-[#c45c5c] shrink-0" aria-hidden>
                    •
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </ProfileSection>

          {profile.resistanceNotes.length > 0 && (
            <ProfileSection title="Resistance notes">
              <ul className="space-y-1.5 list-none">
                {profile.resistanceNotes.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-[#8b9cb3] shrink-0" aria-hidden>
                      •
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </ProfileSection>
          )}

          <section className="rounded-lg border border-[#c9a227]/35 bg-[#c9a227]/8 px-4 py-3">
            <p className="text-[10px] uppercase tracking-widest text-[#c9a227] font-semibold mb-1.5">
              Stewardship trap
            </p>
            <p className="text-sm text-[#d4e0ef] leading-relaxed">{profile.stewardshipTrap}</p>
          </section>

          <section className="rounded-lg border border-[#4a9ead]/30 bg-[#4a9ead]/6 px-4 py-3">
            <p className="text-[10px] uppercase tracking-widest text-[#4a9ead] font-semibold mb-1.5">
              In the arena
            </p>
            <p className="text-sm text-[#b8c5d6] leading-relaxed">{profile.arenaBehavior}</p>
          </section>
        </div>
      </div>
    </div>
  )
}
