import { createFileRoute } from '@tanstack/react-router'
import { CVPage } from '../components/pages/cv'

export const Route = createFileRoute('/cv')({
  component: CVPage,
})
