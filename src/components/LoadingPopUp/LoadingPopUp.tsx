import './LoadingPopUp.scss';

interface LoadingProps{
  message : string
}

export default function LoadingPopUp({ message }: LoadingProps) {
  return (
    <aside className="loading-popup-container">
      <div className="loading-popup">
        <div className="loading-spinner">
          <img src="/blocks-wave.svg" alt="loading" />
        </div>
        <p>{message}</p>
      </div>
    </aside>
  );
}

