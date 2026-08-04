import WeeklyView from "@/components/weekly/WeeklyView"

export default async function WeeklyPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>
}) {
  const { week } = await searchParams
  return <WeeklyView initialWeek={week} />
}
