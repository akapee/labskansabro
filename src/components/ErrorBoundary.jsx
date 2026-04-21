import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React Error Catch:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h2 style={{ color: '#ef4444' }}>Ups! Halaman mengalami Crash (Error)</h2>
          <p>Bukan blank putih lagi, kita berhasil menangkap errornya:</p>
          <div style={{ background: '#f871711a', padding: '1rem', borderRadius: '8px', color: '#b91c1c', maxWidth: '800px', margin: '1rem auto', textAlign: 'left', overflowX: 'auto' }}>
            <strong>{this.state.error?.toString()}</strong>
            <br />
            <span style={{ fontSize: '13px', whiteSpace: 'pre-wrap' }}>
              {this.state.errorInfo?.componentStack}
            </span>
          </div>
          <button 
            onClick={() => window.location.reload()}
            style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Muat Ulang Halaman
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
