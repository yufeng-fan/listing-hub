import { Suspense } from "react";
import SearchClient from "./SearchClient";

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading search...</div>}>
      <SearchClient />
    </Suspense>
  );
}
