import { GeneralLedger } from '@/components/general-ledger'

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">General Ledger</h1>
      <GeneralLedger />
    </main>
  )
}

