import React, { Component, useEffect } from 'react';
import updateBreadcrumb from '~/modules/app/updateBreadcrumb';

export default function FeatureFlagRoute() {

  useEffect(() => {
    setTimeout(() => {
      updateBreadcrumb([{ text: 'Feature flags', link: '/featureFlags' }, { text: 'item' }])
    }, 0);
  }, []);

  return (
    <div>
      Flag
    </div>
  );
} 