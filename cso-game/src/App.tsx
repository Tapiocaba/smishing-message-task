import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './styles/global.css'
import { ResearcherScreen }    from './screens/ResearcherScreen'
import { OnboardingScreen }    from './screens/OnboardingScreen'
import { PracticeScreen }      from './screens/PracticeScreen'
import { GameScreen }          from './screens/GameScreen'
import { BlockBreak }          from './screens/BlockBreak'
import { QuestionnaireScreen } from './screens/QuestionnaireScreen'
import { SummaryScreen }       from './screens/SummaryScreen'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/researcher"    element={<ResearcherScreen />} />
        <Route path="/"              element={<OnboardingScreen />} />
        <Route path="/practice"      element={<PracticeScreen />} />
        <Route path="/game"          element={<GameScreen />} />
        <Route path="/break"         element={<BlockBreak />} />
        <Route path="/questionnaire" element={<QuestionnaireScreen />} />
        <Route path="/summary"       element={<SummaryScreen />} />
      </Routes>
    </BrowserRouter>
  )
}
