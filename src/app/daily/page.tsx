import DailyView from "@/components/daily/DailyView"

export default async function DailyPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const { date } = await searchParams
  return <DailyView initialDate={date} />
}
