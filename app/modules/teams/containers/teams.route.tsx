import { useEffect } from 'react';
import Teams from '../components/teams';
import updateBreadcrumb from '~/core/app/updateBreadcrumb';
import type { Route } from './+types/teams.route';

export function HydrateFallback() {
  return <div>Loading...</div>;
}


export default function TeamsRoute({ loaderData }: Route.ComponentProps) {

  useEffect(() => {
    updateBreadcrumb([{ text: 'Teams' }])
  }, []);

  return (
    <Teams

    />
  );
}
