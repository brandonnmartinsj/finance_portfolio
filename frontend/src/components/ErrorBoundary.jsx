import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            textAlign: 'center',
            backgroundColor: '#fef2f2',
            borderRadius: '8px',
            border: '1px solid #fecaca',
            margin: '20px 0',
          }}
        >
          <div
            style={{
              fontSize: '48px',
              marginBottom: '20px',
            }}
          >
            ⚠️
          </div>
          <h2
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#991b1b',
              marginBottom: '10px',
            }}
          >
            Algo deu errado
          </h2>
          <p
            style={{
              color: '#7f1d1d',
              marginBottom: '20px',
              maxWidth: '600px',
            }}
          >
            {this.props.fallbackMessage ||
              'Ocorreu um erro ao carregar este componente. Tente novamente.'}
          </p>
          {this.state.error && (
            <details
              style={{
                marginBottom: '20px',
                padding: '10px',
                backgroundColor: 'white',
                borderRadius: '4px',
                maxWidth: '600px',
                textAlign: 'left',
              }}
            >
              <summary
                style={{
                  cursor: 'pointer',
                  color: '#7f1d1d',
                  fontWeight: '600',
                }}
              >
                Detalhes do erro
              </summary>
              <pre
                style={{
                  marginTop: '10px',
                  fontSize: '12px',
                  color: '#991b1b',
                  overflow: 'auto',
                }}
              >
                {this.state.error.toString()}
              </pre>
            </details>
          )}
          <button
            onClick={this.handleRetry}
            style={{
              padding: '12px 24px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = '#b91c1c')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = '#dc2626')
            }
          >
            🔄 Tentar Novamente
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
