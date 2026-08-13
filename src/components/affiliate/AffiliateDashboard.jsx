import React from 'react';
import { MultiLenderComparison } from '../loan/MultiLenderComparison';

export const AffiliateDashboard = () => {
  return (
    <div className="space-y-4 my-3 text-left">
      {/* Direct 6 Registered Partner Companies Grid */}
      <MultiLenderComparison 
        loanAmount={500000} 
        tenureMonths={36}
        onSelectOffer={(nbfc) => {
          if (nbfc.outboundUrl) window.open(nbfc.outboundUrl, '_blank');
        }}
      />
    </div>
  );
};
