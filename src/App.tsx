import { useEffect, useState } from 'react'
import {
  MobileAppShell,
  MobileOnlyMessage,
} from './components/MobileOnlyGate'
import { useIsMobileLayout } from './hooks/useIsMobileLayout'
import { BottomNav } from './components/home/BottomNav'
import { CategoryNav } from './components/home/CategoryNav'
import { HomeProjectsDiscoverPanel } from './components/home/HomeProjectsDiscoverPanel'
import { HomeHeader } from './components/home/HomeHeader'
import {
  ExploreLocalityLink,
  SearchSection,
} from './components/home/SearchSection'
import { RecommendationsSection } from './components/home/RecommendationsSection'
import { CityPickerSheet } from './components/projects/CityPickerSheet'
import { ProjectsPage } from './components/projects/ProjectsPage'
import { SrpPage } from './components/srp/SrpPage'
import {
  HOME_USER,
  recentSearches,
  recommendations,
} from './data/homeMock'
import {
  readStoredAppJourney,
  writeStoredAppJourney,
  type Screen,
} from './persist/journeySession'

function initialFromSession() {
  const s = readStoredAppJourney()
  if (!s) {
    return {
      screen: 'home' as Screen,
      flowCity: 'Gurgaon',
      srpQuery: '',
      projectsSearchKey: 0,
      projectsSearchSeed: '',
      homeCategoryId: 'buy',
    }
  }
  return {
    screen: s.screen,
    flowCity: s.flowCity,
    srpQuery: s.srpQuery,
    projectsSearchKey: s.projectsSearchKey,
    projectsSearchSeed: s.projectsSearchSeed,
    homeCategoryId: s.homeCategoryId,
  }
}

const init = initialFromSession()

export default function App() {
  const isMobileLayout = useIsMobileLayout()

  const [screen, setScreen] = useState<Screen>(init.screen)
  const [flowCity, setFlowCity] = useState(init.flowCity)
  const [srpQuery, setSrpQuery] = useState(init.srpQuery)
  const [cityPickerOpen, setCityPickerOpen] = useState(false)
  const [projectsSearchKey, setProjectsSearchKey] = useState(init.projectsSearchKey)
  const [projectsSearchSeed, setProjectsSearchSeed] = useState(init.projectsSearchSeed)
  /** Home category strip: only `project` swaps feed below recent searches */
  const [homeCategoryId, setHomeCategoryId] = useState(init.homeCategoryId)

  useEffect(() => {
    writeStoredAppJourney({
      v: 1,
      screen,
      flowCity,
      srpQuery,
      homeCategoryId,
      projectsSearchKey,
      projectsSearchSeed,
    })
  }, [
    screen,
    flowCity,
    srpQuery,
    homeCategoryId,
    projectsSearchKey,
    projectsSearchSeed,
  ])

  const homeProjectsDiscover = homeCategoryId === 'project'

  const openProjectSearchFromHome = () => {
    setProjectsSearchSeed('')
    setProjectsSearchKey((k) => k + 1)
    setScreen('projects')
  }

  if (!isMobileLayout) {
    return <MobileOnlyMessage />
  }

  return (
    <>
      <MobileAppShell>
        {screen === 'home' ? (
          <>
            <div className="bg-gradient-to-b from-[#EEF2F6] to-[#F6F8FB]">
              <HomeHeader userName={HOME_USER.name} />
              <CategoryNav
                activeId={homeCategoryId}
                onCategoryPress={(id) => {
                  setHomeCategoryId(id === 'project' ? 'project' : 'buy')
                }}
              />
            </div>

            <SearchSection
              city={flowCity}
              recent={recentSearches}
              onOpenProjectSearch={
                homeProjectsDiscover ? openProjectSearchFromHome : undefined
              }
            />

            {homeProjectsDiscover ? (
              <HomeProjectsDiscoverPanel
                key={homeCategoryId}
                city={flowCity}
                onOpenSrp={({ city: nextCity, query }) => {
                  setFlowCity(nextCity)
                  setSrpQuery(query ?? '')
                  setScreen('srp')
                }}
              />
            ) : (
              <>
                <ExploreLocalityLink />
                <RecommendationsSection
                  city={HOME_USER.city}
                  items={recommendations}
                />
              </>
            )}

            <BottomNav />
          </>
        ) : screen === 'projects' ? (
          <ProjectsPage
            city={flowCity}
            onLocationClick={() => setCityPickerOpen(true)}
            searchHeaderKey={projectsSearchKey}
            searchInitialValue={projectsSearchSeed}
            onBack={() => setScreen('home')}
            onOpenSrp={({ city: nextCity, query }) => {
              setFlowCity(nextCity)
              setSrpQuery(query ?? '')
              setScreen('srp')
            }}
          />
        ) : (
          <SrpPage
            key={`${flowCity}-${srpQuery}`}
            city={flowCity}
            initialQuery={srpQuery}
            onBack={() => setScreen('projects')}
            onOpenProjectSearch={(q) => {
              setProjectsSearchSeed(q)
              setProjectsSearchKey((k) => k + 1)
              setScreen('projects')
            }}
          />
        )}
      </MobileAppShell>

      <CityPickerSheet
        open={cityPickerOpen}
        onClose={() => setCityPickerOpen(false)}
        selectedCity={flowCity}
        onSelectCity={(next) => {
          setFlowCity(next)
          setCityPickerOpen(false)
        }}
      />

    </>
  )
}
