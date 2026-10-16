import React from 'react';

export default function LoadingButton({ 
    loading, 
    children, 
    disabled, 
    className = '', 
    ...props 
}) {
    return (
        <button 
            className={`button ${className} ${loading ? 'is-loading' : ''}`} 
            disabled={loading || disabled} 
            {...props}
        >
            {loading && (
                <div className="button-waves-container">
                    <span className="button-wave-dot"></span>
                    <span className="button-wave-dot"></span>
                    <span className="button-wave-dot"></span>
                </div>
            )}
            
            <span className="button-text" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {children}
            </span>
        </button>
    );
}