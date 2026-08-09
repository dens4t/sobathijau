import { Component, ReactNode } from 'react';

interface State {
  error: Error | null;
}

export class AppErrorBoundary extends Component<{ children: ReactNode }, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error): void {
    console.error('App crash:', error);
  }

  override render(): ReactNode {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950 p-6">
          <div className="text-center space-y-3 max-w-md">
            <h2 className="text-lg font-extrabold text-[#1B4332] dark:text-emerald-400">Terjadi kendala teknis</h2>
            <p className="text-xs text-stone-500 font-mono break-all">{this.state.error.message}</p>
            <button
              onClick={() => location.reload()}
              className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-500 transition"
            >
              Muat Ulang Halaman
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
