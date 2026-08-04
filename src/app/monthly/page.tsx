import MonthlyView from "@/components/monthly/MonthlyView"

export default async function MonthlyPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const { month } = await searchParams
  return <MonthlyView initialMonth={month} />
}
