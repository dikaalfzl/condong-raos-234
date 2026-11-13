import { useState } from 'react';
import { FiEdit2, FiTrash2, FiUpload } from 'react-icons/fi';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';

export default function MenuTab({ menus, onRefresh, uploadImageToBucket }) {
  const { showToast } = useAuth();
  const [editingMenu, setEditingMenu] = useState(null);
  const [menuForm, setMenuForm] = useState({
    name: '',
    category: 'makanan',
    price: '',
    description: '',
    image_url: '',
    popular: false,
    is_available: true,
  });
  const [menuFile, setMenuFile] = useState(null);
  const [savingMenu, setSavingMenu] = useState(false);

  const handleSaveMenu = async (e) => {
    e.preventDefault();
    setSavingMenu(true);
    try {
      let finalImg = menuForm.image_url;
      if (menuFile) {
        finalImg = await uploadImageToBucket(menuFile, 'menu');
      }

      const numericPrice = Number(String(menuForm.price).replace(/[^0-9]/g, '')) || 0;
      const payload = {
        name: menuForm.name.trim(),
        category: menuForm.category,
        price: menuForm.price.trim(),
        price_numeric: numericPrice,
        description: menuForm.description.trim(),
        image_url: finalImg || '/menu_bakso.webp',
        popular: menuForm.popular,
        is_available: menuForm.is_available,
      };

      if (editingMenu) {
        const { error } = await supabase.from('menus').update(payload).eq('id', editingMenu.id);
        if (error) throw error;
        showToast('Menu berhasil diperbarui!', 'success');
      } else {
        const { error } = await supabase.from('menus').insert(payload);
        if (error) throw error;
        showToast('Menu baru berhasil ditambahkan!', 'success');
      }

      setEditingMenu(null);
      setMenuFile(null);
      setMenuForm({
        name: '',
        category: 'makanan',
        price: '',
        description: '',
        image_url: '',
        popular: false,
        is_available: true,
      });
      onRefresh();
    } catch (err) {
      showToast(`Gagal menyimpan menu: ${err.message}`, 'error');
    } finally {
      setSavingMenu(false);
    }
  };

  const handleDeleteMenu = async (id) => {
    if (!window.confirm('Hapus menu ini secara permanen?')) return;
    const { error } = await supabase.from('menus').delete().eq('id', id);
    if (!error) {
      showToast('Menu dihapus.', 'info');
      onRefresh();
    }
  };

  return (
    <div className="admin-split-grid">
      <form onSubmit={handleSaveMenu} className="admin-form-card">
        <h3>{editingMenu ? `Edit Menu: ${editingMenu.name}` : '➕ Tambah Menu Baru'}</h3>

        <label>Nama Menu</label>
        <input
          type="text"
          value={menuForm.name}
          onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
          placeholder="Contoh: Bakso Urat Spesial"
          required
        />

        <div className="admin-2col">
          <div>
            <label>Kategori</label>
            <select
              value={menuForm.category}
              onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value })}
            >
              <option value="makanan">Makanan</option>
              <option value="minuman">Minuman</option>
              <option value="pelengkap">Pelengkap</option>
            </select>
          </div>
          <div>
            <label>Harga (Teks)</label>
            <input
              type="text"
              value={menuForm.price}
              onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })}
              placeholder="Rp 16.000"
              required
            />
          </div>
        </div>

        <label>Deskripsi Menu</label>
        <textarea
          rows={3}
          value={menuForm.description}
          onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
          required
        />

        <label>Foto Menu (Upload File atau URL)</label>
        <input
          type="text"
          value={menuForm.image_url}
          onChange={(e) => setMenuForm({ ...menuForm, image_url: e.target.value })}
          placeholder="/menu_bakso.webp atau unggah file di bawah"
        />
        <label className="admin-upload-box">
          <FiUpload />
          <span>{menuFile ? menuFile.name : 'Pilih File Foto dari HP / Laptop'}</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setMenuFile(e.target.files?.[0] || null)}
            style={{ display: 'none' }}
          />
        </label>

        <div className="admin-checkbox-row">
          <label>
            <input
              type="checkbox"
              checked={menuForm.popular}
              onChange={(e) => setMenuForm({ ...menuForm, popular: e.target.checked })}
            />
            Tandai Menu Populer
          </label>
          <label>
            <input
              type="checkbox"
              checked={menuForm.is_available}
              onChange={(e) => setMenuForm({ ...menuForm, is_available: e.target.checked })}
            />
            Stok Tersedia
          </label>
        </div>

        <div className="admin-action-btns-row">
          <button
            type="submit"
            disabled={savingMenu}
            className="admin-save-btn btn-sweep-red-to-white"
          >
            <span>
              {savingMenu ? 'Menyimpan...' : editingMenu ? 'Simpan Perubahan' : 'Tambah Menu'}
            </span>
          </button>
          {editingMenu && (
            <button
              type="button"
              onClick={() => {
                setEditingMenu(null);
                setMenuForm({
                  name: '',
                  category: 'makanan',
                  price: '',
                  description: '',
                  image_url: '',
                  popular: false,
                  is_available: true,
                });
              }}
              className="admin-cancel-btn"
            >
              Batal
            </button>
          )}
        </div>
      </form>

      <div className="admin-list-card">
        <h3>Daftar Menu Saat Ini ({menus.length})</h3>
        <div className="admin-items-list">
          {menus.map((m) => (
            <div key={m.id} className="admin-list-row">
              <img src={m.image_url} alt={m.name} className="admin-row-thumb" />
              <div className="admin-row-info">
                <strong>{m.name}</strong>
                <span>
                  {m.price} • {m.category.toUpperCase()} •{' '}
                  {m.is_available !== false ? '✅ Tersedia' : '❌ Habis'}
                </span>
              </div>
              <div className="admin-row-actions">
                <button
                  type="button"
                  onClick={() => {
                    setEditingMenu(m);
                    setMenuForm({
                      name: m.name,
                      category: m.category || 'makanan',
                      price: m.price,
                      description: m.description,
                      image_url: m.image_url,
                      popular: Boolean(m.popular),
                      is_available: m.is_available !== false,
                    });
                  }}
                  className="act-edit"
                >
                  <FiEdit2 />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteMenu(m.id)}
                  className="act-del"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}