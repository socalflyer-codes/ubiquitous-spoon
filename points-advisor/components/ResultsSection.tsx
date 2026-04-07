interface Props {
  heading: string
  children: React.ReactNode
}

export default function ResultsSection({ heading, children }: Props) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-3">
        {heading}
      </h2>
      {children}
    </section>
  )
}
