import React from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

// Last-resort safety net. Without this, any uncaught render error anywhere in the
// tree unmounts the whole app to a blank white screen with zero explanation —
// the user has no way to know the app crashed vs. is just loading forever.
// This catches that and shows an honest "something went wrong" screen with a
// reload action, instead of silence.
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled app error caught by ErrorBoundary:', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 px-6">
        <div className="max-w-sm w-full bg-white rounded-3xl p-6 border border-slate-200 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <AlertOctagon className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h1 className="text-base font-black text-[#1E293B]">Something Went Wrong</h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              Paisa in Minutes ran into an unexpected error and couldn't continue.
              Your data is safe — please reload the app to try again.
            </p>
          </div>
          <button
            type="button"
            onClick={this.handleReload}
            className="w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-black rounded-2xl shadow-md transition flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reload App</span>
          </button>
          <p className="text-[10px] text-slate-400">
            If this keeps happening, please contact support from the Help tab.
          </p>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
