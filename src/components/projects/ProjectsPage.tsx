import { PROJECTS_SEARCH_TOP_DEVELOPERS } from '../../data/topDevelopersMock'
import { ExploreNearbyRow } from './ExploreNearbyRow'
import { HotspotsSection } from './HotspotsSection'
import { ProjectsSearchHeader } from './ProjectsSearchHeader'
import { TopDevelopersSection } from './TopDevelopersSection'
import { TrendingProjectsStripSection } from './TrendingProjectsStripSection'

type ProjectsPageProps = {
  city: string
  onLocationClick: () => void
  /** Bumps when returning from SRP so the search field can remount with a fresh seed */
  searchHeaderKey: number
  searchInitialValue: string
  onBack: () => void
  onOpenSrp?: (ctx: { city: string; query?: string }) => void
}

export function ProjectsPage({
  city,
  onLocationClick,
  searchHeaderKey,
  searchInitialValue,
  onBack,
  onOpenSrp,
}: ProjectsPageProps) {
  const openSrp = (query: string) => {
    onOpenSrp?.({ city, query })
  }

  return (
    <div className="projects-shell flex min-h-dvh flex-col bg-white">
      <ProjectsSearchHeader
        key={searchHeaderKey}
        initialSearchValue={searchInitialValue}
        onBack={onBack}
        locationLabel={city}
        city={city}
        onLocationClick={onLocationClick}
        onSubmitSearch={(query) => onOpenSrp?.({ city, query })}
      />

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
        <div className="pb-2 pt-3">
          <HotspotsSection city={city} />
          <TopDevelopersSection
            city={city}
            loading={false}
            developers={PROJECTS_SEARCH_TOP_DEVELOPERS}
          />
          <TrendingProjectsStripSection city={city} onPickProject={openSrp} />
          <ExploreNearbyRow onExplore={() => openSrp('Nearby properties')} />
        </div>
      </div>
    </div>
  )
}
