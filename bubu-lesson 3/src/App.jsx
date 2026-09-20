import LessonShell from './components/LessonShell.jsx';
import { ProgressProvider } from './hooks/useLessonProgress.jsx';
import { BankProvider } from './hooks/useBank.jsx';
import { gradedActivities } from './content/portfolioLesson.js';
import './styles/lesson.css';

/**
 * Drop-in root for the lesson.
 *
 * To mount it inside the wider Bubu app, render <PortfolioLesson /> wherever the
 * lesson library routes to. Both providers are scoped to this subtree, so they
 * will not collide with app-level state you already have.
 */
export default function PortfolioLesson() {
  return (
    <ProgressProvider gradedActivities={gradedActivities}>
      <BankProvider>
        <LessonShell />
      </BankProvider>
    </ProgressProvider>
  );
}
