import { useSessions } from '../hooks/useSessions';
import { useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';

export default function Sidebar() {
  const { sessions, createSession, deleteSession, renameSession } = useSessions();
  const navigate = useNavigate();
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const inputRef = useRef(null);

  const handleNew = async () => {
    const session = await createSession();
    navigate(`/chat/${session.id}`);
  };

  const handleDelete = async (sessionId) => {
    try {
      await deleteSession(sessionId);
      // If deleting current active session, go to neutral chat view
      if (window.location.pathname.includes(`/chat/${sessionId}`)) {
        navigate('/chat');
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
      alert('Could not delete dialogue.');
    }
  };

  const startRename = (session) => {
    setEditingId(session.id);
    setEditTitle(session.title);
    // Focus input after render
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const saveRename = async () => {
    if (!editingId || !editTitle.trim()) {
      cancelRename();
      return;
    }

    try {
      await renameSession(editingId, editTitle.trim());
    } catch (error) {
      console.error('Rename failed:', error);
      alert('Could not rename dialogue.');
    } finally {
      setEditingId(null);
      setEditTitle('');
    }
  };

  const cancelRename = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      saveRename();
    } else if (e.key === 'Escape') {
      cancelRename();
    }
  };

  return (
    <aside className="w-80 bg-stone/30 border-r-4 border-gold flex flex-col">
      <div className="p-6 border-b-4 border-gold">
        <button
          onClick={handleNew}
          className="w-full py-3 bg-gold text-deep font-medium rounded-lg hover:bg-gold-dark transition"
        >
          New Dialogue
        </button>
      </div>

      {sessions.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <p className="text-deep/60 font-serif text-lg mb-4">No dialogues yet</p>
            <p className="text-deep/50 text-sm">Create your first conversation to begin exploring wisdom.</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-4 pb-3 border-b-2 border-gold/30">
            <h3 className="font-serif text-lg font-semibold text-deep">Your Dialogues</h3>
          </div>

          {sessions.map(session => {
            const isActive = window.location.pathname.includes(`/chat/${session.id}`);

            return (
              <div
                key={session.id}
                className={`
                  mb-3 p-4 bg-parchment rounded-lg shadow transition cursor-pointer
                  group relative border-l-4
                  ${isActive 
                    ? 'border-gold bg-gold/10 shadow-lg' 
                    : 'border-transparent hover:border-gold/50 hover:shadow-lg'
                  }
                `}
                onClick={() => navigate(`/chat/${session.id}`)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 pr-8">
                    {editingId === session.id ? (
                      <input
                        ref={inputRef}
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={saveRename}
                        onKeyDown={handleKeyDown}
                        className="w-full px-2 py-1 text-deep font-medium bg-marble border-b-2 border-gold focus:outline-none"
                      />
                    ) : (
                      <h3
                        onClick={(e) => {
                          e.stopPropagation();
                          startRename(session);
                        }}
                        className="font-medium text-deep truncate hover:text-gold-dark transition cursor-text"
                        title="Click to rename"
                      >
                        {session.title}
                      </h3>
                    )}
                    <p className="text-sm text-deep/70 mt-1">
                      {isActive ? 'Active' : `Updated: ${new Date(session.updated_at).toLocaleDateString()}`}
                    </p>
                  </div>

                  {/* Direct delete - no confirmation */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(session.id);
                    }}
                    className="p-1 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-100"
                    title="Delete dialogue"
                  >
                    <svg className="h-4 w-4 text-deep/50 hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {isActive && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gold rounded-full border-2 border-parchment animate-pulse" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
}