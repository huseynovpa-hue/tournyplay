import { RulesContent } from "@/components/RulesContent";

export default function RulesPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl font-bold">Match rules</h1>
      <p className="mt-1 text-ink-dim">
        These rules apply to every room on TournyPlay.
      </p>
      <div className="mt-8">
        <RulesContent />
      </div>
    </div>
  );
}
