import { redirect } from 'next/navigation';

export default function VenuesPage() {
  redirect('/admin/venues/list');
}
