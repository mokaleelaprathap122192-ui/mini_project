import { redirect } from 'next/navigation';

export default function FairnessRedirectPage() {
  redirect('/dashboard/fairness-audit');
}
