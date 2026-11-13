import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { containsBadWord } from '../utils/badWords';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // State Status Operasional Toko & Banner Pengumuman
  const [storeStatus, setStoreStatus] = useState({
    is_open: true,
    announcement_active: false,
    announcement_text: '',
    updated_at: new Date().toISOString(),
  });

  // State Notifikasi (Toast Feedback)
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast((prev) => (prev ? null : prev));
    }, 3800);
  }, []);

  const fetchProfile = useCallback(async (userId) => {
    if (!supabase || !userId) {
      setProfile(null);
      return null;
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
      return data;
    } catch (err) {
      console.error('Gagal memuat profil:', err.message);
      return null;
    }
  }, []);

  const fetchStoreStatus = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (!error && data) {
        setStoreStatus(data);
      }
    } catch (err) {
      console.error('Gagal memuat pengaturan toko:', err.message);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setAuthLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id).finally(() => setAuthLoading(false));
      } else {
        setAuthLoading(false);
      }
    });

    fetchStoreStatus();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          await fetchProfile(currentUser.id);
        } else {
          setProfile(null);
        }
      }
    );

    const statusChannel = supabase
      .channel('public:store_settings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'store_settings', filter: 'id=eq.1' },
        (payload) => {
          if (payload.new) {
            setStoreStatus(payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      authListener.subscription.unsubscribe();
      supabase.removeChannel(statusChannel);
    };
  }, [fetchProfile, fetchStoreStatus]);

  // Fungsi Ubah Pengaturan Toko (Status Buka/Tutup & Banner Pengumuman)
  const updateStoreSettings = async (updates, successMessage = 'Pengaturan toko berhasil disimpan!') => {
    if (!supabase || profile?.role !== 'admin') {
      showToast('Akses ditolak. Hanya admin yang dapat mengubah pengaturan toko.', 'error');
      return { error: new Error('Unauthorized') };
    }

    const payload = {
      id: 1,
      is_open: updates.is_open ?? storeStatus.is_open,
      announcement_active: updates.announcement_active ?? storeStatus.announcement_active,
      announcement_text: updates.announcement_text ?? storeStatus.announcement_text,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    };

    const { data, error } = await supabase
      .from('store_settings')
      .upsert(payload)
      .select()
      .single();

    if (error) {
      showToast(`Gagal menyimpan pengaturan: ${error.message}`, 'error');
      return { error };
    }

    setStoreStatus(data);
    showToast(successMessage, 'success');
    return { data };
  };

  const updateStoreStatus = async (isOpen) => {
    return updateStoreSettings(
      { is_open: isOpen },
      `Status toko berhasil diubah menjadi ${isOpen ? 'BUKA' : 'TUTUP'}!`
    );
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    showToast('Anda telah berhasil keluar.', 'info');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin: profile?.role === 'admin',
        authLoading,
        storeStatus,
        updateStoreStatus,
        updateStoreSettings,
        refreshProfile: () => user && fetchProfile(user.id),
        signOut,
        toast,
        showToast,
        isSupabaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);