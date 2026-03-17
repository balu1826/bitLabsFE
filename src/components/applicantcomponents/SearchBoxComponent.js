import React from 'react';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune'; 


export const SearchBoxComponent = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{ position: 'relative', width: '50%' }}>
        <div
          style={{
            position: 'absolute',
            left: '8px', 
            transform: 'translateY(-50%)', 
            color: '#888',
          }}
        >
          <SearchIcon />
        </div>
        <input
          type="text"
          placeholder="Search for jobs..."
          style={{
            width: 'calc(100% - 32px)', 
            padding: '8px 32px 8px 32px', 
            border: '1px solid #ccc', 
            borderRadius: '20px',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: '8px', 
            top: '50%',
            transform: 'translateY(-50%)', 
            cursor: 'pointer',
            color: '#888', 
          }}
        >
          <TuneIcon />
        </div>
      </div>
    </div>
  );
};

