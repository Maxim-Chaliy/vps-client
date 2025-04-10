import React from 'react';
import { toast } from 'react-hot-toast';

const CustomToast = ({ t, message }) => (
    <div
        style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            border: '1px solid #713200',
            color: '#713200',
            backgroundColor: '#FFFAEE',
            borderRadius: '4px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        }}
    >
        <span>{message}</span>
        <button
            onClick={() => toast.dismiss(t.id)}
            style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                color: '#713200',
            }}
        >
            &times;
        </button>
    </div>
);

export default CustomToast;
