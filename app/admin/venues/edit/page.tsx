'use client';

import { useSearchParams } from 'next/navigation';
import VenueForm from '@/app/components/admin/venues/VenueForm';

export default function EditVenuePage() {
  const params = useSearchParams();
  const turfId = params.get('id') || undefined;
  return <VenueForm mode="edit" turfId={turfId} />;
}
