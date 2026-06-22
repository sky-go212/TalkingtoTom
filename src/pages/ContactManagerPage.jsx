import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ContactManagerPage() {
  const [contacts, setContacts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedCode, setCopiedCode] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('sky_chat_token');

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    fetchContacts();
  }, [token, navigate]);

  async function fetchContacts() {
    setLoading(true);
    try {
      const res = await fetch('/api/subserver/contacts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setContacts(data.contacts || []);
      }
    } catch (err) {
      setError('Gagal memuat kontak');
    } finally {
      setLoading(false);
    }
  }

  async function addContact() {
    if (!newContactName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/subserver/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newContactName.trim() })
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedCode(data.contactCode);
        setNewContactName('');
        fetchContacts();
      } else {
        setError('Gagal menambah kontak');
      }
    } catch (err) {
      setError('Gagal menambah kontak');
    } finally {
      setLoading(false);
    }
  }

  async function resetContactCode(contactCode) {
    setLoading(true);
    try {
      const res = await fetch(`/api/subserver/contacts/${contactCode}/reset`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedCode(data.newCode);
        fetchContacts();
      }
    } catch (err) {
      setError('Gagal reset kode');
    } finally {
      setLoading(false);
    }
  }

  async function deleteContact(contactCode) {
    if (!confirm('Hapus kontak ini? Kontak bisa dikembalikan dalam 7 hari.')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/subserver/contacts/${contactCode}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchContacts();
      }
    } catch (err) {
      setError('Gagal menghapus kontak');
    } finally {
      setLoading(false);
    }
  }

  function copyCode(code) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  }

  function shareCode(code) {
    const text = `Gabung SKY-CHAT dengan kode: ${code}`;
    if (navigator.share) {
      navigator.share({ title: 'SKY-CHAT Invitation', text });
    } else {
      copyCode(code);
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-white/10 px-4 py-3">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/group')} className="text-[#8B8B9E] hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold">Kelola Kontak</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-[#FF6B9D] to-[#FF8E53] px-4 py-1.5 rounded-full text-sm font-medium"
          >
            + Tambah
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mt-3 p-3 bg-[#FF4757]/20 border border-[#FF4757]/30 rounded-xl text-sm text-[#FF4757]">
          {error}
        </div>
      )}

      {/* Contact List */}
      <div className="p-4 space-y-3">
        {loading && contacts.length === 0 ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-2 border-[#FF6B9D] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-20 text-[#8B8B9E]">
            <p className="text-4xl mb-3">👥</p>
            <p>Belum ada kontak</p>
            <p className="text-sm mt-1">Tambah kontak untuk mulai chat</p>
          </div>
        ) : (
          contacts.map(contact => (
            <div
              key={contact.contact_code}
              className="bg-[#16161D] border border-white/5 rounded-2xl p-4 flex items-center gap-3"
            >
              {/* Avatar */}
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF6B9D] to-[#FF8E53] flex items-center justify-center text-lg font-bold">
                  {contact.name.charAt(0).toUpperCase()}
                </div>
                {contact.is_active === 1 && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#00F5A0] rounded-full border-2 border-[#16161D]" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{contact.name}</p>
                <p className="text-xs text-[#8B8B9E] font-mono tracking-wide">{contact.contact_code}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyCode(contact.contact_code)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  title="Copy kode"
                >
                  {copiedCode === contact.contact_code ? (
                    <svg className="w-4 h-4 text-[#00F5A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-[#8B8B9E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={() => shareCode(contact.contact_code)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  title="Share"
                >
                  <svg className="w-4 h-4 text-[#8B8B9E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
                <button
                  onClick={() => resetContactCode(contact.contact_code)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  title="Reset kode"
                >
                  <svg className="w-4 h-4 text-[#8B8B9E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <button
                  onClick={() => deleteContact(contact.contact_code)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-[#FF4757]/20 transition-colors"
                  title="Hapus kontak"
                >
                  <svg className="w-4 h-4 text-[#FF4757]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-[#16161D] border border-white/10 rounded-3xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Tambah Kontak</h2>

            {generatedCode ? (
              <div className="text-center py-4">
                <p className="text-[#8B8B9E] mb-2">Kode kontak baru:</p>
                <div className="bg-[#0A0A0F] border border-white/10 rounded-2xl p-4 mb-4">
                  <p className="text-2xl font-mono font-bold tracking-wider text-[#FF6B9D]">{generatedCode}</p>
                </div>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => copyCode(generatedCode)}
                    className="bg-gradient-to-r from-[#FF6B9D] to-[#FF8E53] px-6 py-2 rounded-full font-medium"
                  >
                    {copiedCode === generatedCode ? '✓ Tersalin' : 'Salin Kode'}
                  </button>
                  <button
                    onClick={() => shareCode(generatedCode)}
                    className="bg-white/10 px-6 py-2 rounded-full font-medium"
                  >
                    Share
                  </button>
                </div>
                <button
                  onClick={() => { setShowAddModal(false); setGeneratedCode(''); setNewContactName(''); }}
                  className="mt-4 text-[#8B8B9E] text-sm"
                >
                  Tutup
                </button>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  placeholder="Nama kontak"
                  className="w-full bg-[#0A0A0F] border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-[#8B8B9E] focus:outline-none focus:border-[#FF6B9D]/50"
                  maxLength={50}
                />
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => { setShowAddModal(false); setNewContactName(''); }}
                    className="flex-1 py-3 rounded-2xl bg-white/5 text-[#8B8B9E] font-medium"
                  >
                    Batal
                  </button>
                  <button
                    onClick={addContact}
                    disabled={!newContactName.trim() || loading}
                    className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#FF6B9D] to-[#FF8E53] font-medium disabled:opacity-50"
                  >
                    {loading ? '...' : 'Simpan'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
