import React from 'react';

const Skeleton = ({ width = '100%', height = '20px', style = {} }) => {
  return (
    <div
      style={{
        width,
        height,
        backgroundColor: '#e5e7eb',
        borderRadius: '4px',
        animation: 'pulse 1.5s ease-in-out infinite',
        ...style,
      }}
    />
  );
};

export const SkeletonCard = ({ children, style = {} }) => {
  return (
    <div
      className="card"
      style={{
        padding: '20px',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const MetricsSkeleton = () => {
  return (
    <SkeletonCard style={{ marginBottom: '20px' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              padding: '15px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
            }}
          >
            <Skeleton width="60%" height="12px" style={{ marginBottom: '10px' }} />
            <Skeleton width="80%" height="28px" />
          </div>
        ))}
      </div>
    </SkeletonCard>
  );
};

export const ChartSkeleton = ({ height = 400 }) => {
  return (
    <SkeletonCard style={{ marginBottom: '20px' }}>
      <Skeleton width="200px" height="24px" style={{ marginBottom: '20px' }} />
      <Skeleton width="100%" height={`${height}px`} />
    </SkeletonCard>
  );
};

export const TableSkeleton = ({ rows = 5 }) => {
  return (
    <SkeletonCard style={{ marginBottom: '20px' }}>
      <Skeleton width="200px" height="24px" style={{ marginBottom: '20px' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px',
              backgroundColor: '#f9fafb',
              borderRadius: '6px',
            }}
          >
            <div style={{ flex: 1 }}>
              <Skeleton width="120px" height="16px" style={{ marginBottom: '8px' }} />
              <Skeleton width="80px" height="12px" />
            </div>
            <div style={{ textAlign: 'right', marginLeft: '20px' }}>
              <Skeleton width="100px" height="16px" style={{ marginBottom: '8px' }} />
              <Skeleton width="80px" height="12px" />
            </div>
            <div style={{ textAlign: 'right', marginLeft: '20px', minWidth: '100px' }}>
              <Skeleton width="80px" height="20px" />
            </div>
          </div>
        ))}
      </div>
    </SkeletonCard>
  );
};

export default Skeleton;
