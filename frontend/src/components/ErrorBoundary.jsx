import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center space-y-6">
                    <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-4 mx-auto">
                        <AlertTriangle size={48} />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Something went wrong.</h1>
                    <p className="text-gray-500 max-w-md mx-auto">
                        We've encountered an unexpected error. Please try reloading the page.
                    </p>

                    <div className="bg-gray-50 p-6 rounded-2xl max-w-2xl w-full text-left overflow-auto border border-gray-200">
                        <p className="font-mono text-sm text-red-600 mb-2 font-bold">{this.state.error?.toString()}</p>
                        <pre className="font-mono text-xs text-gray-600 whitespace-pre-wrap">
                            {this.state.errorInfo?.componentStack}
                        </pre>
                    </div>

                    <button
                        onClick={() => window.location.reload()}
                        className="flex items-center gap-2 px-8 py-4 bg-[#123524] text-white rounded-xl hover:bg-[#0d281a] transition-all font-medium"
                    >
                        <RefreshCw size={20} />
                        Reload Application
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
