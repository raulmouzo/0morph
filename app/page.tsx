import { AppMenu } from "./_components/apps-menu"
import Hero from "./_components/hero"

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center gap-10 py-10">
      <Hero />
      <AppMenu className="mx-auto w-full" />
    </div>
  )
}
